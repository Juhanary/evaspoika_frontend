import { useMemo } from 'react';
import { BatchLog } from '@/src/features/batchEvents/domain/types';
import { CHANGE_CODES, SALE_CODES } from '@/src/features/batchEvents/domain/eventLabels';
import { useBatchLog } from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { BatchState, resolveBatchState } from '@/src/features/batches/domain/batchState';
import { formatDateFi } from '@/src/shared/utils/date';

// Erän tapahtumalokin yhteinen malli. Sekä modaali että oma näyttö lukevat
// tämän, joten erän otsikko, tuote ja tila ratkaistaan kaikkialla samoin.

export type BatchModalTarget = {
  batchId: number;
  // Kutsuja voi antaa tietämänsä perustiedot, jotta otsikko näkyy heti ennen
  // kuin tapahtumat ehtivät latautua. Kaikki kentät täydentyvät hakutuloksesta.
  batchLabel?: string;
  productName?: string;
  currentWeight?: number | null;
  deletedAt?: string | null;
};

export type BatchEventTab = 'ALL' | 'SALE' | 'WEIGHING' | 'CHANGE';

export const BATCH_EVENT_TABS: { key: BatchEventTab; label: string }[] = [
  { key: 'ALL', label: 'Kaikki' },
  { key: 'SALE', label: 'Myynti' },
  { key: 'WEIGHING', label: 'Punnitus' },
  { key: 'CHANGE', label: 'Muutokset' },
];

export const UNKNOWN_PRODUCT_LABEL = 'Tuntematon tuote';

export const matchesBatchEventTab = (event: BatchLog, tab: BatchEventTab) => {
  if (tab === 'ALL') return true;
  if (tab === 'SALE') return SALE_CODES.has(event.event_code);
  if (tab === 'WEIGHING') return event.event_code === 'WEIGHING';
  return CHANGE_CODES.has(event.event_code);
};

const sortNewestFirst = (left: BatchLog, right: BatchLog) => {
  const leftTime = left.event_date ? Date.parse(left.event_date) : NaN;
  const rightTime = right.event_date ? Date.parse(right.event_date) : NaN;

  if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
    return rightTime - leftTime;
  }
  if (Number.isFinite(leftTime)) return -1;
  if (Number.isFinite(rightTime)) return 1;
  return right.id - left.id;
};

// Erän elinkaaren luvut yhtenä rivinä listan yläpuolelle. Ilman näitä sama
// tieto piti laskea päässä kymmenistä punnitusriveistä.
export type BatchEventSummary = {
  weighed: number;
  sold: number;
  returned: number;
  adjusted: number;
  boxCount: number;
  remaining: number | null;
};

const buildSummary = (events: BatchLog[], currentWeight: number | null): BatchEventSummary => {
  const summary: BatchEventSummary = {
    weighed: 0,
    sold: 0,
    returned: 0,
    adjusted: 0,
    boxCount: 0,
    remaining: currentWeight,
  };

  for (const event of events) {
    const change = Number(event.weight_change) || 0;

    if (event.event_code === 'WEIGHING' || event.event_code === 'CREATE') {
      summary.weighed += change;
      summary.boxCount += 1;
    } else if (event.event_code === 'SALE') {
      summary.sold += Math.abs(change);
    } else if (event.event_code === 'RETURN') {
      summary.returned += change;
    } else if (CHANGE_CODES.has(event.event_code)) {
      summary.adjusted += change;
    }
  }

  // Erän nykypaino puuttuu vain jos hakutulos ei sisältänyt erää lainkaan.
  // Uusimman tapahtuman juokseva saldo on silloin paras arvio.
  if (summary.remaining === null) {
    const withTotal = events.find((event) => typeof event.total_weight === 'number');
    summary.remaining = withTotal?.total_weight ?? null;
  }

  return summary;
};

// Lista on ryhmitelty päivän mukaan, jotta päivämäärää ei toisteta joka rivillä.
// Saman päivän peräkkäiset punnitukset niputetaan yhdeksi riviksi: yhden erän
// punnitukset tulevat vaa'alta sekuntien välein, ja kymmenen identtistä korttia
// peräkkäin hukuttaa alleen myynnit ja korjaukset — ne ovat se tieto jota
// erän tapahtumista oikeasti haetaan. Nippu aukeaa napautuksella.
export const WEIGHING_GROUP_MIN = 3;

export type BatchEventRow =
  | { kind: 'event'; key: string; event: BatchLog }
  | {
      kind: 'weighings';
      key: string;
      events: BatchLog[];
      totalChange: number;
      startDate?: string | null;
      endDate?: string | null;
    };

export type BatchEventDay = {
  key: string;
  label: string;
  rows: BatchEventRow[];
  eventCount: number;
};

const dayKeyOf = (event: BatchLog) => {
  if (!event.event_date) return 'tuntematon';
  const parsed = new Date(event.event_date);
  if (Number.isNaN(parsed.getTime())) return 'tuntematon';
  return `${parsed.getFullYear()}-${parsed.getMonth() + 1}-${parsed.getDate()}`;
};

// events on uusin ensin, joten nipun ensimmäinen alkio on myöhäisin tapahtuma.
const toWeighingRow = (events: BatchLog[]): BatchEventRow => ({
  kind: 'weighings',
  key: `w-${events[0].id}-${events.length}`,
  events,
  totalChange: events.reduce((sum, event) => sum + (Number(event.weight_change) || 0), 0),
  startDate: events[events.length - 1].event_date,
  endDate: events[0].event_date,
});

export const buildEventDays = (events: BatchLog[], collapseWeighings: boolean): BatchEventDay[] => {
  const days: BatchEventDay[] = [];
  let current: BatchEventDay | null = null;
  let pendingWeighings: BatchLog[] = [];

  const flushWeighings = () => {
    if (!current || !pendingWeighings.length) {
      pendingWeighings = [];
      return;
    }

    if (pendingWeighings.length >= WEIGHING_GROUP_MIN) {
      current.rows.push(toWeighingRow(pendingWeighings));
    } else {
      for (const event of pendingWeighings) {
        current.rows.push({ kind: 'event', key: String(event.id), event });
      }
    }

    pendingWeighings = [];
  };

  for (const event of events) {
    const key = dayKeyOf(event);

    if (!current || current.key !== key) {
      flushWeighings();
      current = {
        key,
        label: formatDateFi(event.event_date) ?? 'Päiväämätön',
        rows: [],
        eventCount: 0,
      };
      days.push(current);
    }

    current.eventCount += 1;

    if (collapseWeighings && event.event_code === 'WEIGHING') {
      pendingWeighings.push(event);
      continue;
    }

    flushWeighings();
    current.rows.push({ kind: 'event', key: String(event.id), event });
  }

  flushWeighings();

  return days;
};

export type BatchEventLog = {
  events: BatchLog[];
  isLoading: boolean;
  state: BatchState;
  batchLabel: string;
  productName: string;
  productionDate: string | null;
  deletedAt: string | null;
  summary: BatchEventSummary;
  tabCounts: Record<BatchEventTab, number>;
};

export function useBatchEventLog(target: BatchModalTarget | null): BatchEventLog {
  const { data, isLoading } = useBatchLog(target?.batchId);

  return useMemo(() => {
    const events = [...(data ?? [])].sort(sortNewestFirst);
    const batchFromEvents = events.find((event) => event.Batch)?.Batch ?? null;

    const batchNumber = batchFromEvents?.batch_number?.trim();
    const productionDate = formatDateFi(batchFromEvents?.production_date);

    const batchLabel =
      target?.batchLabel ||
      (batchNumber ? `Erä ${batchNumber}` : productionDate ? `Erä ${productionDate}` : 'Erä');

    const productName =
      events.map((event) => event.Batch?.Product?.name?.trim()).find(Boolean) ||
      target?.productName ||
      UNKNOWN_PRODUCT_LABEL;

    const currentWeight = batchFromEvents?.current_weight ?? target?.currentWeight ?? null;

    const state = resolveBatchState({
      currentWeight,
      deletedAt: target?.deletedAt ?? null,
      hasDeleteEvent: events.some((event) => event.event_code === 'DELETE'),
    });

    return {
      events,
      isLoading,
      state,
      batchLabel,
      productName,
      productionDate,
      deletedAt: target?.deletedAt ?? null,
      summary: buildSummary(events, currentWeight),
      tabCounts: {
        ALL: events.length,
        SALE: events.filter((event) => matchesBatchEventTab(event, 'SALE')).length,
        WEIGHING: events.filter((event) => matchesBatchEventTab(event, 'WEIGHING')).length,
        CHANGE: events.filter((event) => matchesBatchEventTab(event, 'CHANGE')).length,
      },
    };
  }, [data, isLoading, target]);
}

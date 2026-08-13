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

export type BatchEventLog = {
  events: BatchLog[];
  isLoading: boolean;
  state: BatchState;
  batchLabel: string;
  productName: string;
  deletedAt: string | null;
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

    const state = resolveBatchState({
      currentWeight: batchFromEvents?.current_weight ?? target?.currentWeight ?? null,
      deletedAt: target?.deletedAt ?? null,
      hasDeleteEvent: events.some((event) => event.event_code === 'DELETE'),
    });

    return {
      events,
      isLoading,
      state,
      batchLabel,
      productName,
      deletedAt: target?.deletedAt ?? null,
      tabCounts: {
        ALL: events.length,
        SALE: events.filter((event) => matchesBatchEventTab(event, 'SALE')).length,
        WEIGHING: events.filter((event) => matchesBatchEventTab(event, 'WEIGHING')).length,
        CHANGE: events.filter((event) => matchesBatchEventTab(event, 'CHANGE')).length,
      },
    };
  }, [data, isLoading, target]);
}

import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { BatchLog } from '@/src/features/batchEvents/domain/types';
import { eventLabel } from '@/src/features/batchEvents/domain/eventLabels';
import { useBatchEvents } from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { Batch } from '@/src/features/batches/domain/types';
import {
  BATCH_STATE_LABELS,
  BatchState,
  resolveBatchState,
} from '@/src/features/batches/domain/batchState';
import {
  useBatches,
  useDeletedBatches,
} from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { screen } from '@/src/shared/styles/components';
import { logStyles as styles } from '@/src/shared/styles/logs';
import { formatDateFi } from '@/src/shared/utils/date';
import type { BatchModalTarget } from './batchEventLog';

const UNKNOWN_PRODUCT_LABEL = 'Tuntematon tuote';

// Sivun koko. Aiemmin haettiin kiinteä 500 riviä ilman sivutusta, jolloin
// vanhempi historia katosi hiljaa heti kun rivejä kertyi enemmän.
const PAGE_SIZE = 100;

type RangeKey = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: 'TODAY', label: 'Tänään', days: 0 },
  { key: 'WEEK', label: '7 pv', days: 7 },
  { key: 'MONTH', label: '30 pv', days: 30 },
  { key: 'ALL', label: 'Kaikki', days: null },
];

const rangeStartIso = (days: number | null) => {
  if (days === null) return undefined;

  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(
    start.getDate(),
  ).padStart(2, '0')}`;
};

type BatchGroup = {
  batchId: number;
  batchLabel: string;
  productName: string;
  lastEventLabel: string;
  lastEventDate?: string | null;
  lastOrderLabel: string;
  eventCount: number;
  state: BatchState;
  deletedAt?: string | null;
  currentWeight?: number | null;
};

const batchLabelFrom = (batchNumber?: string | null, productionDate?: string | null) => {
  const trimmed = batchNumber?.trim();
  if (trimmed) return `Erä ${trimmed}`;

  const formatted = formatDateFi(productionDate);
  if (formatted) return `Erä ${formatted}`;

  return 'Erä';
};

const orderLabelFrom = (event: BatchLog) => {
  const order = event.OrderLine?.Order;
  if (!order) return '';

  return [formatDateFi(order.order_date), order.Customer?.name].filter(Boolean).join(' · ');
};

export function BatchLogTab({
  search,
  onOpenBatch,
}: {
  search: string;
  onOpenBatch: (target: BatchModalTarget) => void;
}) {
  const [range, setRange] = useState<RangeKey>('MONTH');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const activeRange = RANGES.find((item) => item.key === range) ?? RANGES[2];
  const trimmedSearch = search.trim();

  const queryParams = useMemo(
    () => ({
      search: trimmedSearch || undefined,
      from: rangeStartIso(activeRange.days),
      limit,
      offset: 0,
    }),
    [activeRange.days, limit, trimmedSearch],
  );

  const { data: events, isLoading, error } = useBatchEvents(queryParams);
  const { data: batches } = useBatches();
  const { data: deletedBatches } = useDeletedBatches();
  const { data: products } = useProducts();

  const productNameById = useMemo(() => {
    const byId = new Map<number, string>();
    (products ?? []).forEach((product) => byId.set(product.id, product.name));
    return byId;
  }, [products]);

  const batchById = useMemo(() => {
    const byId = new Map<number, Batch>();

    [...(batches ?? []), ...(deletedBatches ?? [])].forEach((batch) => {
      if (!batch?.id) return;
      const existing = byId.get(batch.id);
      // Poistettu versio voittaa: se kertoo erän lopullisen tilan.
      if (!existing || (!existing.deleted_at && batch.deleted_at)) {
        byId.set(batch.id, batch);
      }
    });

    return byId;
  }, [batches, deletedBatches]);

  const groups = useMemo(() => {
    const byBatchId = new Map<number, BatchGroup>();
    const deleteEventBatchIds = new Set<number>();

    // BATCH_LOG.BatchId on NOT NULL, joten ryhmittely onnistuu aina sillä.
    (events ?? []).forEach((event) => {
      const batchId = event.BatchId ?? event.Batch?.id ?? null;
      if (!batchId) return;

      if (event.event_code === 'DELETE') {
        deleteEventBatchIds.add(batchId);
      }

      const existing = byBatchId.get(batchId);
      const eventTime = event.event_date ? Date.parse(event.event_date) : 0;

      if (!existing) {
        byBatchId.set(batchId, {
          batchId,
          batchLabel: batchLabelFrom(event.Batch?.batch_number, event.Batch?.production_date),
          productName: event.Batch?.Product?.name?.trim() || UNKNOWN_PRODUCT_LABEL,
          lastEventLabel: eventLabel(event.event_code),
          lastEventDate: event.event_date,
          lastOrderLabel: orderLabelFrom(event),
          eventCount: 1,
          state: 'ACTIVE',
          currentWeight: event.Batch?.current_weight ?? null,
        });
        return;
      }

      existing.eventCount += 1;

      if (existing.productName === UNKNOWN_PRODUCT_LABEL && event.Batch?.Product?.name) {
        existing.productName = event.Batch.Product.name;
      }

      const latestTime = existing.lastEventDate ? Date.parse(existing.lastEventDate) : 0;
      if (eventTime >= latestTime) {
        existing.lastEventLabel = eventLabel(event.event_code);
        existing.lastEventDate = event.event_date;
        existing.lastOrderLabel = orderLabelFrom(event) || existing.lastOrderLabel;
      }
    });

    // Erät joilla ei ole tapahtumia valitulla aikavälillä näytetään vain kun
    // hakua ei ole rajattu — muuten ne ohittaisivat käyttäjän suodattimen.
    if (!trimmedSearch && activeRange.days === null) {
      batchById.forEach((batch) => {
        if (byBatchId.has(batch.id)) return;

        byBatchId.set(batch.id, {
          batchId: batch.id,
          batchLabel: batchLabelFrom(batch.batch_number, batch.production_date),
          productName:
            (batch.ProductId ? productNameById.get(batch.ProductId) : null) ??
            UNKNOWN_PRODUCT_LABEL,
          lastEventLabel: 'Ei tapahtumia',
          lastEventDate: batch.deleted_at ?? batch.production_date ?? null,
          lastOrderLabel: '',
          eventCount: 0,
          state: 'ACTIVE',
          currentWeight: batch.current_weight,
        });
      });
    }

    // Tila ratkaistaan vasta kun kaikki tapahtumat on käyty läpi, jotta
    // DELETE-tapahtuma ehtii vaikuttaa.
    byBatchId.forEach((group) => {
      const batch = batchById.get(group.batchId);

      group.deletedAt = batch?.deleted_at ?? null;
      group.currentWeight = batch?.current_weight ?? group.currentWeight ?? null;
      group.state = resolveBatchState({
        currentWeight: group.currentWeight,
        deletedAt: group.deletedAt,
        hasDeleteEvent: deleteEventBatchIds.has(group.batchId),
      });

      if (group.productName === UNKNOWN_PRODUCT_LABEL && batch?.ProductId) {
        group.productName = productNameById.get(batch.ProductId) ?? UNKNOWN_PRODUCT_LABEL;
      }
    });

    return Array.from(byBatchId.values()).sort((left, right) => {
      const leftTime = left.lastEventDate ? Date.parse(left.lastEventDate) : 0;
      const rightTime = right.lastEventDate ? Date.parse(right.lastEventDate) : 0;
      return rightTime - leftTime || left.batchLabel.localeCompare(right.batchLabel, 'fi');
    });
  }, [activeRange.days, batchById, events, productNameById, trimmedSearch]);

  // Palvelin palautti täyden sivullisen ⇒ rivejä on todennäköisesti lisää.
  const canLoadMore = (events?.length ?? 0) >= limit;

  const handleRangeChange = (key: RangeKey) => {
    setRange(key);
    setLimit(PAGE_SIZE);
  };

  return (
    <>
      <View style={styles.filterRow}>
        {RANGES.map((item) => {
          const isActive = range === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() => handleRangeChange(item.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.resultSummary}>
        {groups.length} erää · {events?.length ?? 0} tapahtumaa
      </Text>

      {error ? (
        <Text style={screen.muted}>Virhe ladattaessa lokia.</Text>
      ) : (
        <FlatList
          contentContainerStyle={!groups.length ? styles.emptyListContent : undefined}
          data={groups}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item) => String(item.batchId)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={screen.muted}>
              {isLoading
                ? 'Ladataan...'
                : trimmedSearch
                  ? 'Hakua vastaavia eriä ei löytynyt.'
                  : 'Ei tapahtumia valitulla aikavälillä.'}
            </Text>
          }
          ListFooterComponent={
            canLoadMore ? (
              <Pressable
                onPress={() => setLimit((current) => current + PAGE_SIZE)}
                style={({ pressed }) => [styles.loadMoreButton, pressed && styles.pressed]}
              >
                <Text style={styles.loadMoreText}>Näytä lisää</Text>
              </Pressable>
            ) : null
          }
          renderItem={({ item, index }) => {
            const isDeleted = item.state === 'DELETED';
            const isEmptied = item.state === 'EMPTIED';

            return (
              <Pressable
                onPress={() =>
                  onOpenBatch({
                    batchId: item.batchId,
                    batchLabel: item.batchLabel,
                    productName: item.productName,
                    currentWeight: item.currentWeight,
                    deletedAt: item.deletedAt,
                  })
                }
                style={({ pressed }) => [
                  styles.logItem,
                  isDeleted && styles.logItemDeleted,
                  isEmptied && styles.logItemEmptied,
                  index === groups.length - 1 && styles.logItemLast,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.logItemContent}>
                  <Text
                    numberOfLines={1}
                    style={[styles.logItemTitle, isDeleted && styles.logItemTitleDeleted]}
                  >
                    {item.batchLabel}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.logItemSummary, isDeleted && styles.logItemSummaryDeleted]}
                  >
                    {[item.productName, item.lastEventLabel, item.lastOrderLabel]
                      .filter(Boolean)
                      .join(' / ')}
                  </Text>
                  <View style={styles.logItemFooter}>
                    <Text
                      style={[
                        styles.logItemDescription,
                        isDeleted && styles.logItemDescriptionDeleted,
                      ]}
                    >
                      {item.eventCount === 1 ? '1 tapahtuma' : `${item.eventCount} tapahtumaa`}
                      {item.lastEventDate ? `  ·  ${formatDateFi(item.lastEventDate) ?? ''}` : ''}
                    </Text>
                    <StateBadge state={item.state} />
                  </View>
                </View>
              </Pressable>
            );
          }}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}
    </>
  );
}

// Kolme tilaa yhden "Poistettu"-merkin sijaan: normaalisti loppuun myyty erä ei
// enää näytä virheeltä.
export function StateBadge({ state }: { state: BatchState }) {
  if (state === 'ACTIVE') {
    return (
      <View style={styles.stateBadgeActive}>
        <Text style={styles.stateBadgeActiveText}>{BATCH_STATE_LABELS.ACTIVE}</Text>
      </View>
    );
  }

  if (state === 'EMPTIED') {
    return (
      <View style={styles.stateBadgeEmptied}>
        <Text style={styles.stateBadgeEmptiedText}>{BATCH_STATE_LABELS.EMPTIED}</Text>
      </View>
    );
  }

  return (
    <View style={styles.deletedBadge}>
      <Text style={styles.deletedBadgeText}>{BATCH_STATE_LABELS.DELETED}</Text>
    </View>
  );
}

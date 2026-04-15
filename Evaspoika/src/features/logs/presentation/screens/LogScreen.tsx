import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Batch } from '@/src/features/batches/domain/types';
import {
  useBatches,
  useDeletedBatches,
} from '@/src/features/batches/presentation/hooks/useBatches';
import { BatchLog } from '@/src/features/batchEvents/domain/types';
import {
  useBatchEvents,
  useBatchLog,
} from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { colors } from '@/src/shared/constants/colors';
import { screen } from '@/src/shared/styles/screen';
import { logModalStyles as modalStyles, logStyles as styles } from '@/src/shared/styles/logs';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import {
  type ScreenLayoutLeftAction,
  ScreenLayout,
} from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { GRAMS_PER_KG } from '@/src/shared/utils/weight';

type ModalTab = 'ALL' | 'SALE' | 'WEIGHING' | 'INVENTORY';

type BatchGroup = {
  batchKey: string;
  batchId: number | null;
  batchNumber: string | null;
  productName: string;
  batchLabel: string;
  orderLabel: string;
  lastEventLabel: string;
  lastEventDate?: string | null;
  deletedAt?: string | null;
  eventCount: number;
  events: BatchLog[];
  isDeleted: boolean;
};

const UNKNOWN_PRODUCT_LABEL = 'Tuntematon tuote';

const EVENT_META: Record<
  string,
  {
    label: string;
    topic: string;
  }
> = {
  CREATE: { label: 'Uusi erä luotu', topic: 'BATCH' },
  WEIGHING: { label: 'Punnitus', topic: 'WEIGHING' },
  SALE: { label: 'Myynti', topic: 'SALE' },
  INVENTORY: { label: 'Manuaalinen korjaus', topic: 'INVENTORY' },
  DELETE: { label: 'Erä poistettu', topic: 'BATCH' },
};

const EVENT_LABELS: Record<string, string> = {
  CREATE: 'Luotu',
  WEIGHING: 'Punnitus',
  SALE: 'Myynti',
  INVENTORY: 'Muutoksen kirjaus',
  DELETE: 'Poistettu',
};

const MODAL_TABS: {
  key: ModalTab;
  label: string;
}[] = [
  { key: 'ALL', label: 'Kaikki' },
  { key: 'SALE', label: 'Myynti' },
  { key: 'WEIGHING', label: 'Punnitus' },
  { key: 'INVENTORY', label: 'Muutokset' },
];

const getEventMeta = (eventCode: string) =>
  EVENT_META[eventCode] ?? { label: eventCode, topic: 'OTHER' as const };

const formatDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('fi-FI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString('fi-FI', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatWeightChange = (grams: number) => {
  if (!Number.isFinite(grams)) {
    return null;
  }

  const kg = grams / GRAMS_PER_KG;
  const prefix = kg > 0 ? '+' : '';

  return `${prefix}${kg.toLocaleString('fi-FI', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} kg`;
};

const sortEventsNewest = (left: BatchLog, right: BatchLog) => {
  const leftTime = left.event_date ? Date.parse(left.event_date) : NaN;
  const rightTime = right.event_date ? Date.parse(right.event_date) : NaN;

  if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
    return rightTime - leftTime;
  }

  if (Number.isFinite(leftTime)) {
    return -1;
  }

  if (Number.isFinite(rightTime)) {
    return 1;
  }

  return right.id - left.id;
};

const getResolvedBatchId = (event: BatchLog) => {
  const candidate = event.BatchId ?? event.Batch?.id ?? null;
  return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : null;
};

const getBatchGroupKey = (event: BatchLog) => {
  const batchId = getResolvedBatchId(event);

  if (batchId) {
    return `id:${batchId}`;
  }

  const batchNumber = event.Batch?.batch_number?.trim();

  if (batchNumber) {
    return `number:${batchNumber.toLowerCase()}`;
  }

  const productionDate = event.Batch?.production_date?.trim();

  if (productionDate) {
    return `date:${productionDate}`;
  }

  return `event:${event.id}`;
};

const getProductName = (event: BatchLog) => {
  const productName = event.Batch?.Product?.name?.trim();
  return productName || UNKNOWN_PRODUCT_LABEL;
};

const getEventImpliesDeleted = (event: BatchLog) =>
  event.event_code === 'DELETE' || (event.Batch?.current_weight ?? 1) === 0;

const getProductNameFromBatch = (
  batch: Pick<Batch, 'ProductId'>,
  productNameById: Map<number, string>,
) => {
  if (!batch.ProductId) {
    return UNKNOWN_PRODUCT_LABEL;
  }

  return productNameById.get(batch.ProductId) ?? UNKNOWN_PRODUCT_LABEL;
};

const getBatchLabel = (event: BatchLog) => {
  const batchNumber = event.Batch?.batch_number?.trim();

  if (batchNumber) {
    return `Erä ${batchNumber}`;
  }

  const productionDate = formatDate(event.Batch?.production_date);

  if (productionDate) {
    return `Erä ${productionDate}`;
  }

  return 'Erä';
};

const getBatchLabelFromBatch = (batch: Pick<Batch, 'batch_number' | 'production_date'>) => {
  const batchNumber = batch.batch_number?.trim();

  if (batchNumber) {
    return `Erä ${batchNumber}`;
  }

  const productionDate = formatDate(batch.production_date);

  if (productionDate) {
    return `Erä ${productionDate}`;
  }

  return 'Erä';
};

const getOrderLabel = (event: BatchLog) =>
  event.OrderLine?.OrderId ? `Tilaus ${event.OrderLine.OrderId}` : '';

const mergeEvents = (primary: BatchLog[], secondary: BatchLog[]) => {
  const merged = new Map<number, BatchLog>();

  [...primary, ...secondary].forEach((event) => {
    merged.set(event.id, event);
  });

  return Array.from(merged.values()).sort(sortEventsNewest);
};

type LogScreenProps = {
  leftAction?: ScreenLayoutLeftAction;
};

export default function LogScreen({ leftAction = 'home' }: LogScreenProps) {
  const [query, setQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<BatchGroup | null>(null);
  const [modalTab, setModalTab] = useState<ModalTab>('ALL');
  const deferredQuery = useDeferredValue(query);
  const { data: batches } = useBatches();
  const { data: deletedBatches } = useDeletedBatches();
  const { data: products } = useProducts();

  const batchEventQueryParams = useMemo(
    () => ({
      search: deferredQuery,
      limit: 500,
      offset: 0,
    }),
    [deferredQuery],
  );

  const { data: events, isLoading, error } = useBatchEvents(batchEventQueryParams);
  const {
    data: selectedBatchDetails,
    isLoading: isSelectedBatchLoading,
  } = useBatchLog(selectedBatch?.batchId ?? undefined);

  const productNameById = useMemo(() => {
    const byId = new Map<number, string>();

    (products ?? []).forEach((product) => {
      byId.set(product.id, product.name);
    });

    return byId;
  }, [products]);

  const allKnownBatches = useMemo(() => {
    const byId = new Map<number, Batch>();

    [...(batches ?? []), ...(deletedBatches ?? [])].forEach((batch) => {
      if (!batch?.id) {
        return;
      }

      const existing = byId.get(batch.id);

      if (!existing || (!existing.deleted_at && batch.deleted_at)) {
        byId.set(batch.id, batch);
      }
    });

    return Array.from(byId.values());
  }, [batches, deletedBatches]);

  const deletedBatchMap = useMemo(() => {
    const byId = new Map<number, Batch>();

    allKnownBatches.forEach((batch) => {
      if (batch.deleted_at) {
        byId.set(batch.id, batch);
      }
    });

    return byId;
  }, [allKnownBatches]);

  const batchGroups = useMemo(() => {
    const groups = new Map<string, BatchGroup>();

    (events ?? []).forEach((event) => {
      const batchKey = getBatchGroupKey(event);
      const batchId = getResolvedBatchId(event);
      const deletedBatch = batchId ? deletedBatchMap.get(batchId) : undefined;
      const eventImpliesDeleted = getEventImpliesDeleted(event);
      const batchLabel = getBatchLabel(event);
      const productName = getProductName(event);
      const orderLabel = getOrderLabel(event);
      const summary = groups.get(batchKey);

      if (!summary) {
        groups.set(batchKey, {
          batchKey,
          batchId,
          batchNumber: event.Batch?.batch_number ?? null,
          productName,
          batchLabel,
          orderLabel,
          lastEventLabel: getEventMeta(event.event_code).label,
          lastEventDate: event.event_date,
          deletedAt: deletedBatch?.deleted_at ?? (eventImpliesDeleted ? event.event_date : null),
          eventCount: 1,
          events: [event],
          isDeleted: Boolean(deletedBatch) || eventImpliesDeleted,
        });
        return;
      }

      summary.events.push(event);
      summary.eventCount += 1;

      if (summary.productName === UNKNOWN_PRODUCT_LABEL && productName !== UNKNOWN_PRODUCT_LABEL) {
        summary.productName = productName;
      }

      if (!summary.batchNumber && event.Batch?.batch_number) {
        summary.batchNumber = event.Batch.batch_number;
      }

      if (!summary.isDeleted && deletedBatch) {
        summary.isDeleted = true;
        summary.deletedAt = deletedBatch.deleted_at ?? null;
      }

      if (!summary.isDeleted && eventImpliesDeleted) {
        summary.isDeleted = true;
        summary.deletedAt = summary.deletedAt ?? event.event_date ?? null;
      }

      const currentLatest = summary.lastEventDate ? Date.parse(summary.lastEventDate) : 0;
      const eventTime = event.event_date ? Date.parse(event.event_date) : 0;

      if (eventTime >= currentLatest) {
        summary.lastEventLabel = getEventMeta(event.event_code).label;
        summary.lastEventDate = event.event_date;
        summary.orderLabel = orderLabel || summary.orderLabel;
      }
    });

    allKnownBatches.forEach((batch) => {
      const batchKey = `id:${batch.id}`;

      if (groups.has(batchKey)) {
        const existing = groups.get(batchKey);

        if (!existing) {
          return;
        }

        if (
          existing.productName === UNKNOWN_PRODUCT_LABEL &&
          batch.ProductId &&
          productNameById.has(batch.ProductId)
        ) {
          existing.productName = getProductNameFromBatch(batch, productNameById);
        }

        if (!existing.isDeleted && batch.deleted_at) {
          existing.isDeleted = true;
          existing.deletedAt = batch.deleted_at;
        }

        return;
      }

      if (!deferredQuery.trim()) {
        groups.set(batchKey, {
          batchKey,
          batchId: batch.id,
          batchNumber: batch.batch_number ?? null,
          productName: getProductNameFromBatch(batch, productNameById),
          batchLabel: getBatchLabelFromBatch(batch),
          orderLabel: '',
          lastEventLabel: batch.deleted_at ? 'Erä poistettu' : 'Ei tapahtumia',
          lastEventDate: batch.deleted_at ?? batch.production_date ?? null,
          deletedAt: batch.deleted_at ?? null,
          eventCount: 0,
          events: [],
          isDeleted: Boolean(batch.deleted_at),
        });
      }
    });

    return Array.from(groups.values()).sort((left, right) => {
      const leftTime = left.lastEventDate ? Date.parse(left.lastEventDate) : 0;
      const rightTime = right.lastEventDate ? Date.parse(right.lastEventDate) : 0;
      return rightTime - leftTime || left.batchLabel.localeCompare(right.batchLabel, 'fi');
    });
  }, [allKnownBatches, deferredQuery, deletedBatchMap, events, productNameById]);

  const resultCount = batchGroups.length;

  const selectedBatchEvents = useMemo(() => {
    if (!selectedBatch) {
      return [];
    }

    return mergeEvents(selectedBatch.events, selectedBatchDetails ?? []);
  }, [selectedBatch, selectedBatchDetails]);

  const selectedBatchProductName = useMemo(() => {
    const productNameFromEvents = selectedBatchEvents
      .map(getProductName)
      .find((name) => name !== UNKNOWN_PRODUCT_LABEL);

    if (productNameFromEvents) {
      return productNameFromEvents;
    }

    return selectedBatch?.productName ?? UNKNOWN_PRODUCT_LABEL;
  }, [selectedBatch, selectedBatchEvents]);

  const visibleModalEvents = useMemo(() => {
    if (modalTab === 'ALL') {
      return selectedBatchEvents;
    }

    return selectedBatchEvents.filter((event) => event.event_code === modalTab);
  }, [modalTab, selectedBatchEvents]);

  const modalTabCounts = useMemo<Record<ModalTab, number>>(
    () => ({
      ALL: selectedBatchEvents.length,
      SALE: selectedBatchEvents.filter((event) => event.event_code === 'SALE').length,
      WEIGHING: selectedBatchEvents.filter((event) => event.event_code === 'WEIGHING').length,
      INVENTORY: selectedBatchEvents.filter((event) => event.event_code === 'INVENTORY').length,
    }),
    [selectedBatchEvents],
  );

  return (
    <>
      <ScreenLayout
        headerSearch={{
          value: query,
          onChangeText: setQuery,
          placeholder: 'Hae tuotetta, erää, tilausta tai tapahtumaa...',
        }}
        leftAction={leftAction}
        title="LOKI"
      >
        <View style={screen.inner}>
          <Text style={screen.sectionTitle}>LOKI</Text>
          <View style={screen.divider} />

          <Text style={styles.resultSummary}>{resultCount} erää</Text>

          {isLoading ? (
            <Text style={screen.muted}>Ladataan...</Text>
          ) : error ? (
            <Text style={screen.muted}>Virhe ladattaessa lokia.</Text>
          ) : (
            <FlatList
              contentContainerStyle={!batchGroups.length ? styles.emptyListContent : undefined}
              data={batchGroups}
              keyExtractor={(item) => item.batchKey}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={screen.muted}>
                  {query.trim()
                    ? 'Hakua vastaavia eriä ei löytynyt.'
                    : 'Lokitapahtumia ei ole.'}
                </Text>
              }
              renderItem={({ item, index }) => {
                const badgeText =
                  item.eventCount > 1
                    ? `${item.eventCount} tapahtumaa`
                    : item.eventCount === 1
                      ? '1 tapahtuma'
                      : item.isDeleted
                        ? 'Poistettu erä'
                        : 'Ei tapahtumia';

                return (
                  <Pressable
                    onPress={() => {
                      setSelectedBatch(item);
                      setModalTab('ALL');
                    }}
                    style={({ pressed }) => [
                      styles.logItem,
                      item.isDeleted && styles.logItemDeleted,
                      index === batchGroups.length - 1 && styles.logItemLast,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.logItemContent}>
                      <Text
                        numberOfLines={1}
                        style={[styles.logItemTitle, item.isDeleted && styles.logItemTitleDeleted]}
                      >
                        {item.batchLabel}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.logItemSummary,
                          item.isDeleted && styles.logItemSummaryDeleted,
                        ]}
                      >
                        {[item.productName, item.lastEventLabel, item.orderLabel]
                          .filter(Boolean)
                          .join(' / ')}
                      </Text>
                      <View style={styles.logItemFooter}>
                        <Text
                          style={[
                            styles.logItemDescription,
                            item.isDeleted && styles.logItemDescriptionDeleted,
                          ]}
                        >
                          {badgeText}
                        </Text>
                        {item.isDeleted ? (
                          <View style={styles.deletedBadge}>
                            <Text style={styles.deletedBadgeText}>Poistettu</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          )}
        </View>
      </ScreenLayout>

      <Modal
        animationType="fade"
        transparent
        visible={selectedBatch !== null}
        onRequestClose={() => setSelectedBatch(null)}
      >
        {selectedBatch ? (
          <BatchEventsModalContent
            activeTab={modalTab}
            batchLabel={selectedBatch.batchLabel}
            deletedAt={selectedBatch.deletedAt ?? null}
            events={visibleModalEvents}
            isDeleted={selectedBatch.isDeleted}
            isLoading={Boolean(selectedBatch.batchId) && isSelectedBatchLoading}
            onClose={() => setSelectedBatch(null)}
            onTabChange={setModalTab}
            productName={selectedBatchProductName}
            tabCounts={modalTabCounts}
          />
        ) : null}
      </Modal>
    </>
  );
}

const BatchEventsModalContent = ({
  activeTab,
  batchLabel,
  deletedAt,
  events,
  isDeleted,
  isLoading,
  onClose,
  onTabChange,
  productName,
  tabCounts,
}: {
  activeTab: ModalTab;
  batchLabel: string;
  deletedAt?: string | null;
  events: BatchLog[];
  isDeleted: boolean;
  isLoading: boolean;
  onClose: () => void;
  onTabChange: (tab: ModalTab) => void;
  productName: string;
  tabCounts: Record<ModalTab, number>;
}) => {
  const renderEventItem = ({ item }: { item: BatchLog }) => {
    const label = EVENT_LABELS[item.event_code] ?? item.event_code;
    const dateLabel = formatDate(item.event_date) ?? '-';
    const timeLabel = formatTime(item.event_date);
    const orderLabel = getOrderLabel(item);
    const weightLabel = formatWeightChange(item.weight_change) ?? '0 kg';

    return (
      <View style={modalStyles.eventItem}>
        <Text style={modalStyles.eventTitle}>{label}</Text>
        {item.description ? (
          <Text style={modalStyles.eventSubtitle}>{item.description}</Text>
        ) : null}
        <Text style={modalStyles.eventSubtitle}>
          Päivämäärä: {dateLabel}
          {timeLabel ? ` klo ${timeLabel}` : ''}
        </Text>
        {orderLabel ? <Text style={modalStyles.eventSubtitle}>{orderLabel}</Text> : null}
        <Text style={modalStyles.eventSubtitle}>Muutos: {weightLabel}</Text>
      </View>
    );
  };

  return (
    <View style={modalStyles.overlay}>
      <Pressable onPress={onClose} style={modalStyles.backdrop} />

      <GlassCard
        blurRadius={24}
        style={[modalStyles.card, isDeleted && modalStyles.cardDeleted]}
      >
        <View style={modalStyles.header}>
          <Ionicons
            color={colors.white}
            name={isDeleted ? 'archive-outline' : 'time-outline'}
            size={26}
          />

          <View style={modalStyles.headerTextWrap}>
            <Text numberOfLines={1} style={modalStyles.title}>
              {batchLabel}
            </Text>
            <Text numberOfLines={1} style={modalStyles.subtitle}>
              Tuote: {productName}
            </Text>
            {isDeleted ? (
              <View style={modalStyles.deletedHeaderBadge}>
                <Text style={modalStyles.deletedHeaderBadgeText}>
                  Poistettu {formatDate(deletedAt) ?? ''}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable hitSlop={12} onPress={onClose}>
            <Ionicons color={colors.white} name="close" size={26} />
          </Pressable>
        </View>

        <View style={modalStyles.divider} />

        <View style={modalStyles.metaRow}>
          <Text style={modalStyles.metaText}>
            Tapahtumia: {tabCounts[activeTab]} / {tabCounts.ALL}
          </Text>
          {isLoading ? (
            <Text style={modalStyles.metaSubtle}>Päivitetään...</Text>
          ) : null}
        </View>

        <View style={modalStyles.tabRow}>
          {MODAL_TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => onTabChange(tab.key)}
                style={({ pressed }) => [
                  modalStyles.tabButton,
                  isActive && modalStyles.tabButtonActive,
                  pressed && modalStyles.tabButtonPressed,
                ]}
              >
                <Text
                  style={[
                    modalStyles.tabButtonText,
                    isActive && modalStyles.tabButtonTextActive,
                  ]}
                >
                  {tab.label} ({tabCounts[tab.key]})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          contentContainerStyle={modalStyles.listContent}
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => String(item.id)}
          style={modalStyles.list}
          ListEmptyComponent={
            isLoading ? (
              <Text style={modalStyles.emptyText}>Ladataan...</Text>
            ) : (
              <Text style={modalStyles.emptyText}>Ei tapahtumia.</Text>
            )
          }
          showsVerticalScrollIndicator={false}
        />
      </GlassCard>
    </View>
  );
};


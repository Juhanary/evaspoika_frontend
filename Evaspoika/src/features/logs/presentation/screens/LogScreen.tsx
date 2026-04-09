import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BatchLog } from '@/src/features/batchEvents/domain/types';
import { useBatchEvents } from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { colors } from '@/src/shared/constants/colors';
import { GRAMS_PER_KG } from '@/src/shared/utils/weight';
import { spacing } from '@/src/shared/constants/spacing';
import { screen } from '@/src/shared/styles/screen';
import {
  type ScreenLayoutLeftAction,
  ScreenLayout,
} from '@/src/shared/ui/ScreenLayout/ScreenLayout';

type LogTopic = 'ALL' | 'BATCH' | 'WEIGHING' | 'SALE' | 'INVENTORY' | 'OTHER';

type LogSection = {
  title: string;
  data: BatchLog[];
};

const EVENT_META: Record<
  string,
  {
    label: string;
    topic: Exclude<LogTopic, 'ALL'>;
  }
> = {
  CREATE: { label: 'Uusi er\u00E4 luotu', topic: 'BATCH' },
  WEIGHING: { label: 'Punnitus ', topic: 'WEIGHING' },
  SALE: { label: 'Myynti ', topic: 'SALE' },
  INVENTORY: { label: 'Manuaalinen korjaus ', topic: 'INVENTORY' },
  DELETE: { label: 'Er\u00E4 poistettu', topic: 'BATCH' },
};

const TOPIC_LABELS: Record<LogTopic, string> = {
  ALL: 'Kaikki',
  BATCH: 'Er\u00E4t',
  WEIGHING: 'Punnitukset',
  SALE: 'Myynnit',
  INVENTORY: 'Manuaaliset korjaukset',
  OTHER: 'Muut',
};

const TOPIC_ORDER: LogTopic[] = [
  'ALL',
  'BATCH',
  'WEIGHING',
  'SALE',
  'INVENTORY',
  'OTHER',
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
  if (!Number.isFinite(grams) || grams === 0) {
    return null;
  }

  const kg = grams / GRAMS_PER_KG;
  const prefix = kg > 0 ? '+' : '';

  return `${prefix}${kg.toLocaleString('fi-FI', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} kg`;
};

const sortNewest = (a: BatchLog, b: BatchLog) => {
  const aTime = a.event_date ? Date.parse(a.event_date) : 0;
  const bTime = b.event_date ? Date.parse(b.event_date) : 0;

  return bTime - aTime || b.id - a.id;
};

const getProductName = (event: BatchLog) => event.Batch?.Product?.name ?? 'Tuote';

const getBatchLabel = (event: BatchLog) => {
  const batchNumber = event.Batch?.batch_number?.trim();

  if (batchNumber) {
    return `Er\u00E4 ${batchNumber}`;
  }

  const productionDate = formatDate(event.Batch?.production_date);

  if (productionDate) {
    return `Er\u00E4 ${productionDate}`;
  }

  return 'Er\u00E4';
};

type LogScreenProps = {
  leftAction?: ScreenLayoutLeftAction;
};

export default function LogScreen({ leftAction = 'home' }: LogScreenProps) {
  const { data: events, isLoading, error } = useBatchEvents();
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<LogTopic>('ALL');
  const deferredQuery = useDeferredValue(query);

  const availableTopics = useMemo<LogTopic[]>(() => {
    const foundTopics = new Set<LogTopic>(['ALL']);

    (events ?? []).forEach((event) => {
      foundTopics.add(getEventMeta(event.event_code).topic);
    });

    return TOPIC_ORDER.filter((topic) => foundTopics.has(topic));
  }, [events]);

  const sections = useMemo<LogSection[]>(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const byDate = new Map<string, BatchLog[]>();

    [...(events ?? [])]
      .sort(sortNewest)
      .filter((event) => {
        const eventMeta = getEventMeta(event.event_code);

        if (activeTopic !== 'ALL' && eventMeta.topic !== activeTopic) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const searchableValues = [
          getProductName(event),
          eventMeta.label,
          TOPIC_LABELS[eventMeta.topic],
          event.description ?? '',
          getBatchLabel(event),
          formatDate(event.event_date) ?? '',
          formatTime(event.event_date) ?? '',
        ];

        return searchableValues.some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      })
      .forEach((event) => {
        const dateLabel = formatDate(event.event_date) ?? 'Ei p\u00E4iv\u00E4m\u00E4\u00E4r\u00E4\u00E4';

        if (!byDate.has(dateLabel)) {
          byDate.set(dateLabel, []);
        }

        byDate.get(dateLabel)?.push(event);
      });

    return Array.from(byDate.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [activeTopic, deferredQuery, events]);

  const resultCount = useMemo(
    () => sections.reduce((total, section) => total + section.data.length, 0),
    [sections],
  );

  const activeTitle =
    activeTopic === 'ALL' ? 'LOKI' : TOPIC_LABELS[activeTopic].toUpperCase();

  return (
    <ScreenLayout
      headerSearch={{
        value: query,
        onChangeText: setQuery,
        placeholder: 'Hae tuotetta, tapahtumaa tai p\u00E4iv\u00E4\u00E4...',
      }}
      leftAction={leftAction}
      title="LOKI"
    >
      <View style={screen.inner}>
        <Text style={screen.sectionTitle}>{activeTitle}</Text>
        <View style={screen.divider} />

        <View style={styles.topicRow}>
          {availableTopics.map((topic) => {
            const isActive = topic === activeTopic;

            return (
              <Pressable
                key={topic}
                accessibilityRole="button"
                onPress={() => setActiveTopic(topic)}
                style={({ pressed }) => [
                  styles.topicChip,
                  isActive && styles.topicChipActive,
                  pressed && styles.topicChipPressed,
                ]}
              >
                <Text
                  style={[
                    styles.topicChipText,
                    isActive && styles.topicChipTextActive,
                  ]}
                >
                  {TOPIC_LABELS[topic]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.resultSummary}>
          {resultCount} tapahtumaa / {TOPIC_LABELS[activeTopic]}
        </Text>

        {isLoading ? (
          <Text style={screen.muted}>Ladataan...</Text>
        ) : error ? (
          <Text style={screen.muted}>Virhe ladattaessa lokia.</Text>
        ) : (
          <SectionList
            contentContainerStyle={!sections.length ? styles.emptyListContent : undefined}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={screen.muted}>
                {query.trim()
                  ? 'Hakua vastaavia tapahtumia ei l\u00F6ytynyt.'
                  : 'Lokitapahtumia ei ole.'}
              </Text>
            }
            renderItem={({ item, index, section }) => {
              const eventMeta = getEventMeta(item.event_code);
              const batchLabel = getBatchLabel(item);
              const timeLabel = formatTime(item.event_date);
              const weightLabel = formatWeightChange(item.weight_change);
              const description = item.description?.trim();

              return (
                <View
                  style={[
                    styles.logItem,
                    index === section.data.length - 1 && styles.logItemLast,
                  ]}
                >
                  <View style={styles.logItemContent}>
                    <Text numberOfLines={1} style={styles.logItemTitle}>
                      {getProductName(item)}
                    </Text>
                    <Text style={styles.logItemSummary}>
                      {[eventMeta.label, batchLabel].filter(Boolean).join(' / ')}
                    </Text>
                    {description ? (
                      <Text style={styles.logItemDescription}>{description}</Text>
                    ) : null}
                  </View>

                  <View style={styles.logItemMeta}>
                    {timeLabel ? (
                      <Text style={styles.logItemTime}>{timeLabel}</Text>
                    ) : null}
                    {weightLabel ? (
                      <Text style={styles.logItemWeight}>{weightLabel}</Text>
                    ) : null}
                  </View>
                </View>
              );
            }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={screen.logDateHeader}>{title}</Text>
              </View>
            )}
            sections={sections}
            SectionSeparatorComponent={() => <View style={screen.logGroupDivider} />}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            style={styles.list}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  topicChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topicChipActive: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(255,255,255,0.92)',
  },
  topicChipPressed: {
    opacity: 0.74,
  },
  topicChipText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: colors.textOnDark,
  },
  topicChipTextActive: {
    color: colors.textDark,
  },
  resultSummary: {
    marginBottom: spacing.md,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
  },
  list: {
    flex: 1,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  logItemLast: {
    borderBottomWidth: 0,
    paddingBottom: spacing.lg,
  },
  logItemContent: {
    flex: 1,
    gap: 4,
  },
  logItemTitle: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 22,
    color: colors.textOnDark,
  },
  logItemSummary: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.84)',
  },
  logItemDescription: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.58)',
  },
  logItemMeta: {
    minWidth: 74,
    alignItems: 'flex-end',
    gap: 4,
    paddingTop: 2,
  },
  logItemTime: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: colors.textOnDark,
  },
  logItemWeight: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});

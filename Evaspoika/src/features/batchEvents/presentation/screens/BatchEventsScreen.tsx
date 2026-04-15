import React, { useMemo, useState } from 'react';
import { FlatList, Text, View, Pressable } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { components } from '@/src/shared/styles/components';
import { colors } from '@/src/shared/constants/colors';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { formatDateDisplayFromIso } from '@/src/shared/utils/date';
import { useBatchEvents } from '../hooks/useBatchEvents';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { BatchLog } from '../../domain/types';
import { formatKg } from '@/src/shared/utils/weight';

const EVENT_LABELS: Record<string, string> = {
  CREATE: 'Luotu',
  WEIGHING: 'Punnitus',
  SALE: 'Myynti',
  INVENTORY: 'Muutoksen kirjaus',
  DELETE: 'Poistettu',
};

const TABS: Array<{
  key: 'ALL' | 'SALE' | 'WEIGHING' | 'INVENTORY';
  label: string;
}> = [
  { key: 'ALL', label: 'Kaikki' },
  { key: 'SALE', label: 'Myynti' },
  { key: 'WEIGHING', label: 'Punnitus' },
  { key: 'INVENTORY', label: 'Muutokset' },
];

type Props = {
  batchId?: number;
  batchNumber?: string;
};

export default function BatchEventsScreen({ batchId, batchNumber }: Props) {
  const { data: events, isLoading, error } = useBatchEvents();
  const { data: batches } = useBatches();
  const [activeTab, setActiveTab] = useState<'ALL' | 'SALE' | 'WEIGHING' | 'INVENTORY'>('ALL');

  const batch = useMemo(
    () => (batches ?? []).find((item) => item.id === batchId) ?? null,
    [batches, batchId]
  );

  const batchEvents = useMemo(() => {
    const all = events ?? [];
    return (batchId ? all.filter((e) => e.BatchId === batchId) : all).sort((a, b) => {
      const da = a.event_date ? Date.parse(a.event_date) : NaN;
      const db = b.event_date ? Date.parse(b.event_date) : NaN;
      if (isFinite(da) && isFinite(db)) return db - da;
      if (isFinite(da)) return -1;
      if (isFinite(db)) return 1;
      return b.id - a.id;
    });
  }, [events, batchId]);

  const visibleEvents = useMemo(() => {
    if (activeTab === 'ALL') return batchEvents;
    return batchEvents.filter((event) => event.event_code === activeTab);
  }, [activeTab, batchEvents]);

  const renderItem = ({ item }: { item: BatchLog }) => {
    const label = EVENT_LABELS[item.event_code] ?? item.event_code;
    const dateLabel = formatDateDisplayFromIso(item.event_date) || '-';
    return (
      <View style={layout.listItem}>
        <Text style={layout.listItemTitle}>{label}</Text>
        {item.description ? (
          <Text style={layout.listItemSubtitle}>{item.description}</Text>
        ) : null}
        <Text style={layout.listItemSubtitle}>Päivämäärä: {dateLabel}</Text>
        <Text style={layout.listItemSubtitle}>
          Muutos: {item.weight_change >= 0 ? '+' : ''}{formatKg(item.weight_change)} kg
        </Text>
      </View>
    );
  };

  const headerTitle = batchNumber
    ? `ERÄ ${batchNumber.toUpperCase()}`
    : batchId
      ? `ERÄ #${batchId}`
      : 'TAPAHTUMAT';

  return (
    <ScreenLayout leftAction="back" title={headerTitle}>
      {isLoading ? (
        <View style={[layout.screen, layout.center]}>
          <Text>Ladataan tapahtumia...</Text>
        </View>
      ) : error ? (
        <View style={[layout.screen, layout.center]}>
          <Text>Virhe: {error instanceof Error ? error.message : 'Tuntematon'}</Text>
        </View>
      ) : (
        <View style={layout.screen}>
          {batch && (
            <View style={layout.section}>
              <Text style={components.metaLabel}>
                Tuote: {batchEvents[0]?.Batch?.Product?.name ?? 'Tuntematon'}
              </Text>
              <View style={components.tabRow}>
                {TABS.map((tab) => (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={({ pressed }) => [
                      components.tabButton,
                      activeTab === tab.key && components.tabButtonActive,
                      pressed && components.tabButtonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        components.tabText,
                        activeTab === tab.key && components.tabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          <FlatList
            data={visibleEvents}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            style={components.flex1}
            ListEmptyComponent={<Text style={components.textEmpty}>Ei tapahtumia.</Text>}
          />
        </View>
      )}
    </ScreenLayout>
  );
}

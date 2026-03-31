import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useBatchEvents } from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { screen } from '@/src/shared/styles/screen';
import { BatchLog } from '@/src/features/batchEvents/domain/types';

const EVENT_LABELS: Record<string, string> = {
  CREATE: 'Uusi erä luotu',
  WEIGHING: 'Punnitus tehty',
  SALE: 'Myynti tehty',
  ADJUSTMENT: 'Korjaus tehty',
  INVENTORY: 'Inventaario tehty',
  DELETE: 'Erä poistettu',
};

type DateGroup = { date: string; items: BatchLog[] };

export default function LogScreen() {
  const { data: events, isLoading, error } = useBatchEvents();

  const groups = useMemo<DateGroup[]>(() => {
    const map = new Map<string, BatchLog[]>();
    (events ?? []).forEach((e) => {
      const ev = e as BatchLog;
      const dateStr = ev.event_date
        ? new Date(ev.event_date).toLocaleDateString('fi-FI', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '-';
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push(ev);
    });
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [events]);

  return (
    <ScreenLayout title="LOKI">
      <View style={screen.inner}>
        <Text style={screen.sectionTitle}>ILMOITUKSET</Text>
        <View style={screen.divider} />
        {isLoading ? (
          <Text style={screen.muted}>Ladataan...</Text>
        ) : error ? (
          <Text style={screen.muted}>Virhe ladattaessa lokia.</Text>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(g) => g.date}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            ItemSeparatorComponent={() => <View style={screen.logGroupDivider} />}
            ListEmptyComponent={<Text style={screen.muted}>Ei ilmoituksia.</Text>}
            renderItem={({ item }) => (
              <View style={screen.logGroup}>
                <Text style={screen.logDateHeader}>{item.date}</Text>
                {item.items.map((ev) => (
                  <View key={ev.id} style={screen.logEntry}>
                    <Text style={screen.logEntryText}>
                      Tuote: {ev.Batch?.Product?.name ?? `Erä #${ev.BatchId}`}
                    </Text>
                    <Text style={screen.logEntryText}>
                      Ilmoitus: {EVENT_LABELS[ev.event_code] ?? ev.event_code}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

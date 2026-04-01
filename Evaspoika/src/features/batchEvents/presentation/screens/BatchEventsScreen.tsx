import React, { useMemo, useState } from 'react';
import { Alert, Button, FlatList, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { components } from '@/src/shared/styles/components';
import { colors } from '@/src/shared/constants/colors';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { formatDateDisplayFromIso } from '@/src/shared/utils/date';
import { useBatchEvents } from '../hooks/useBatchEvents';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { updateBatch } from '@/src/features/batches/infrastructure/batchesApi';
import { BatchLog } from '../../domain/types';
import { formatKg, parseWeightToGrams } from '@/src/shared/utils/weight';

const EVENT_LABELS: Record<string, string> = {
  CREATE: 'Luotu',
  WEIGHING: 'Punnitus',
  SALE: 'Myynti',
  ADJUSTMENT: 'Korjaus',
  INVENTORY: 'Inventaario',
};

type Props = {
  batchId?: number;
  batchNumber?: string;
};

export default function BatchEventsScreen({ batchId, batchNumber }: Props) {
  const queryClient = useQueryClient();
  const { data: events, isLoading, error } = useBatchEvents();
  const { data: batches } = useBatches();
  const [adjustmentKg, setAdjustmentKg] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');

  const batch = useMemo(
    () => (batches ?? []).find((item) => item.id === batchId) ?? null,
    [batches, batchId]
  );

  const filteredEvents = useMemo(() => {
    const all = events ?? [];
    const list = batchId ? all.filter((e) => e.BatchId === batchId) : all;
    return [...list].sort((a, b) => {
      const da = a.event_date ? Date.parse(a.event_date) : NaN;
      const db = b.event_date ? Date.parse(b.event_date) : NaN;
      if (isFinite(da) && isFinite(db)) return db - da;
      if (isFinite(da)) return -1;
      if (isFinite(db)) return 1;
      return b.id - a.id;
    });
  }, [events, batchId]);

  const updateMutation = useMutation({
    mutationFn: (input: { current_weight: number; eventCode: string; eventDescription: string }) => {
      if (!batchId) throw new Error('Erän tunniste puuttuu');
      return updateBatch(batchId, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['batches'] }),
        queryClient.invalidateQueries({ queryKey: ['batchEvents'] }),
      ]);
    },
  });

  const handleAdjustment = async () => {
    if (!batchId || !batch) {
      Alert.alert('Virhe', 'Erää ei löydy.');
      return;
    }
    const deltaGrams = parseWeightToGrams(adjustmentKg);
    if (!Number.isFinite(deltaGrams) || deltaGrams === 0) {
      Alert.alert('Virheellinen paino', 'Syötä nollasta poikkeava muutos kilogrammoissa.');
      return;
    }
    if (!adjustmentNote.trim()) {
      Alert.alert('Selitys puuttuu', 'Käsimuokkaukselle on annettava selitys.');
      return;
    }
    const newWeight = batch.current_weight + deltaGrams;
    if (newWeight < 0) {
      Alert.alert('Virheellinen paino', 'Erän paino ei voi olla negatiivinen.');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        current_weight: newWeight,
        eventCode: 'INVENTORY',
        eventDescription: adjustmentNote.trim(),
      });
      setAdjustmentKg('');
      setAdjustmentNote('');
      Alert.alert('Tallennettu', 'Erän paino päivitetty.');
    } catch (err) {
      Alert.alert('Virhe', err instanceof Error ? err.message : 'Tuntematon virhe');
    }
  };

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
                Nykyinen paino: {formatKg(batch.current_weight)} kg
              </Text>
              <TextInput
                placeholder="Muutos kg:ssa (miinus = vähennys)"
                value={adjustmentKg}
                onChangeText={setAdjustmentKg}
                style={components.input}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Selitys muutokselle (pakollinen)"
                value={adjustmentNote}
                onChangeText={setAdjustmentNote}
                style={components.input}
              />
              <Button
                title={updateMutation.isPending ? 'Tallennetaan...' : 'Tallenna muutos'}
                onPress={handleAdjustment}
                color={colors.purple}
                disabled={updateMutation.isPending}
              />
            </View>
          )}
          <FlatList
            data={filteredEvents}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            style={components.listFlex}
            ListEmptyComponent={<Text style={components.emptyText}>Ei tapahtumia.</Text>}
          />
        </View>
      )}
    </ScreenLayout>
  );
}

import React, { useMemo, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { formatDateDisplayFromIso } from '@/src/shared/utils/date';
import { useBatchEvents } from '../hooks/useBatchEvents';
import { useEventTypes } from '../hooks/useEventTypes';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { updateBatch } from '@/src/features/batches/infrastructure/batchesApi';
import { BatchEvent, EventType } from '../../domain/types';
import { formatKg, parseWeightToGrams } from '@/src/shared/utils/weight';

type BatchEventsScreenProps = {
  batchId?: number;
  batchNumber?: string;
};

export default function BatchEventsScreen({ batchId, batchNumber }: BatchEventsScreenProps) {
  const queryClient = useQueryClient();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useBatchEvents();
  const { data: eventTypes, isLoading: typesLoading, error: typesError } = useEventTypes();
  const { data: batches } = useBatches();
  const [adjustmentKg, setAdjustmentKg] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');

  const eventTypeById = useMemo(() => {
    const map = new Map<number, EventType>();
    (eventTypes ?? []).forEach((type) => {
      map.set(type.id, type);
    });
    return map;
  }, [eventTypes]);

  const batch = useMemo(
    () => (batches ?? []).find((item) => item.id === batchId) ?? null,
    [batches, batchId]
  );

  const filteredEvents = useMemo(() => {
    if (!batchId) {
      return events ?? [];
    }

    return (events ?? []).filter((event) => event.BatchId === batchId);
  }, [events, batchId]);

  const sortedEvents = useMemo(() => {
    const items = filteredEvents ?? [];
    return [...items].sort((a, b) => {
      const dateA = a.event_date ? Date.parse(a.event_date) : Number.NaN;
      const dateB = b.event_date ? Date.parse(b.event_date) : Number.NaN;
      if (Number.isFinite(dateA) && Number.isFinite(dateB)) {
        return dateB - dateA;
      }
      if (Number.isFinite(dateA)) {
        return -1;
      }
      if (Number.isFinite(dateB)) {
        return 1;
      }
      return b.id - a.id;
    });
  }, [filteredEvents]);

  const updateMutation = useMutation({
    mutationFn: (input: { current_weight: number; eventCode: string; eventDescription?: string }) => {
      if (!batchId) {
        throw new Error('Missing batch id');
      }
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
      Alert.alert('Missing batch', 'Batch not found.');
      return;
    }

    const deltaGrams = parseWeightToGrams(adjustmentKg);
    if (!Number.isFinite(deltaGrams) || deltaGrams === 0) {
      Alert.alert('Invalid weight', 'Enter a non-zero adjustment in kg.');
      return;
    }

    const newWeight = batch.current_weight + deltaGrams;
    if (newWeight < 0) {
      Alert.alert('Invalid weight', 'Batch weight cannot be negative.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        current_weight: newWeight,
        eventCode: 'INVENTORY',
        eventDescription: adjustmentNote.trim() || 'Manual adjustment',
      });
      setAdjustmentKg('');
      setAdjustmentNote('');
      Alert.alert('Batch updated', 'Batch weight updated.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Update failed', message);
    }
  };

  if (eventsLoading || typesLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading events...</Text>
      </View>
    );
  }

  if (eventsError || typesError) {
    const error = eventsError ?? typesError;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load events: {message}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: BatchEvent }) => {
    const eventType = eventTypeById.get(item.EventTypeId);
    const eventTypeLabel = eventType?.description ?? eventType?.code ?? `Type #${item.EventTypeId}`;
    const eventDateLabel = formatDateDisplayFromIso(item.event_date) || '-';

    return (
      <View style={layout.listItem}>
        <Text style={layout.listItemTitle}>{eventTypeLabel}</Text>
        <Text style={layout.listItemSubtitle}>Date: {eventDateLabel}</Text>
        <Text style={layout.listItemSubtitle}>
          Added: {formatKg(item.weight_change ?? 0)} kg
        </Text>
      </View>
    );
  };

  const title = batchNumber
    
    ? `Erä ${batchNumber}`
    : batchId
      ? `Erä #${batchId}`
      : 'Batch Events';

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>{title}</Text>
      {batch && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Current weight: {formatKg(batch.current_weight)} kg</Text>
          <TextInput
            placeholder="Adjustment (kg, use - for loss)"
            value={adjustmentKg}
            onChangeText={setAdjustmentKg}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Reason"
            value={adjustmentNote}
            onChangeText={setAdjustmentNote}
            style={styles.input}
          />
          <Button
            title={updateMutation.isPending ? 'Saving...' : 'Save adjustment'}
            onPress={handleAdjustment}
            color="#841584"
            accessibilityLabel="Save batch adjustment"
            disabled={updateMutation.isPending}
          />
        </View>
      )}
      <FlatList
        data={sortedEvents}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  subtitle: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
});

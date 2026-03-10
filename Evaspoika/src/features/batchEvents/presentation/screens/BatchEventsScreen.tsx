import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { formatDateDisplayFromIso } from '@/src/shared/utils/date';
import { useBatchEvents } from '../hooks/useBatchEvents';
import { useEventTypes } from '../hooks/useEventTypes';
import { BatchEvent, EventType } from '../../domain/types';
import { formatKg } from '@/src/shared/utils/weight';

type BatchEventsScreenProps = {
  batchId?: number;
  batchNumber?: string;
  
};

export default function BatchEventsScreen({ batchId, batchNumber }: BatchEventsScreenProps) {
  const { data: events, isLoading: eventsLoading, error: eventsError } = useBatchEvents();
  const { data: eventTypes, isLoading: typesLoading, error: typesError } = useEventTypes();

  const eventTypeById = useMemo(() => {
    const map = new Map<number, EventType>();
    (eventTypes ?? []).forEach((type) => {
      map.set(type.id, type);
    });
    return map;
  }, [eventTypes]);

  const filteredEvents = useMemo(() => {
    if (!batchId) {
      return events ?? [];
    }

    return (events ?? []).filter((event) => event.BatchId === batchId);
  }, [events, batchId]);

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
          Lisätty: {formatKg(item.weight_change ?? 0)} kg
        </Text>
      </View>
    );
  };

  const title = batchNumber
    ? `Batch ${batchNumber}`
    : batchId
      ? `Batch #${batchId}`
      : 'Batch Events';

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>{title}</Text>
      <FlatList
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />
    </View>
  );
}

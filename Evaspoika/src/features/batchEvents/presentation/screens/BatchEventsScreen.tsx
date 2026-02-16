import React from 'react';
import { FlatList, Text, View, Alert } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { useBatchEvents } from '../hooks/useBatchEvents';
import { BatchEvent } from '../../domain/types';




function renderItem({ item }: { item: BatchEvent }) {
  return (
    <View style={layout.listItem}>
      <Text style={layout.listItemTitle}>Event #{item.id}</Text>
      <Text style={layout.listItemSubtitle}>Change: {item.weight_change ?? 0}</Text>
    </View>
  );
}

export default function BatchEventsScreen() {
  const { data, isLoading, error } = useBatchEvents();

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading events...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load events: {message}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Batch Events</Text>
      <FlatList data={data ?? []} renderItem={renderItem} keyExtractor={(item) => String(item.id)} />
    </View>
  );
}

import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { useBatches } from '../hooks/useBatches';
import { Batch } from '../../domain/types';

function renderItem({ item }: { item: Batch }) {
  return (
    <View style={layout.listItem}>
      <Text style={layout.listItemTitle}>Batch: {item.batch_number}</Text>
      <Text style={layout.listItemSubtitle}>Current weight: {item.current_weight}</Text>
    </View>
  );
}

export default function BatchListScreen() {
  const { data, isLoading, error } = useBatches();

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading batches...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load batches: {message}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Batches</Text>
      <FlatList data={data ?? []} renderItem={renderItem} keyExtractor={(item) => String(item.id)} />
    </View>
  );
}

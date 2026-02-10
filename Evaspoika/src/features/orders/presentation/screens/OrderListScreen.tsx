import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../../domain/types';

function renderItem({ item }: { item: Order }) {
  return (
    <View style={layout.listItem}>
      <Text style={layout.listItemTitle}>Order #{item.id}</Text>
      <Text style={layout.listItemSubtitle}>Status: {item.status ?? 'n/a'}</Text>
    </View>
  );
}

export default function OrderListScreen() {
  const { data, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load orders: {message}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Orders</Text>
      <FlatList data={data ?? []} renderItem={renderItem} keyExtractor={(item) => String(item.id)} />
    </View>
  );
}

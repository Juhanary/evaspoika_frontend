import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { useCustomers } from '../hooks/useCustomers';
import { Customer } from '../../domain/types';

function renderItem({ item }: { item: Customer }) {
  return (
    <View style={layout.listItem}>
      <Text style={layout.listItemTitle}>{item.name}</Text>
      <Text style={layout.listItemSubtitle}>{item.email ?? 'No email'}</Text>
    </View>
  );
}

export default function CustomerListScreen() {
  const { data, isLoading, error } = useCustomers();

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading customers...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load customers: {message}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Customers</Text>
      <FlatList data={data ?? []} renderItem={renderItem} keyExtractor={(item) => String(item.id)} />
    </View>
  );
}

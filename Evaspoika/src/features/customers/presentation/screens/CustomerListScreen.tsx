import React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { components } from '@/src/shared/styles/components';
import { useCustomers } from '../hooks/useCustomers';
import { useRefreshAll } from '@/src/shared/hooks/useRefreshAll';
import { Customer } from '../../domain/types';

function renderItem({ item }: { item: Customer }) {
  return (
    <View style={layout.listItem}>
      <Text style={layout.listItemTitle}>{item.name}</Text>
      <Text style={layout.listItemSubtitle}>
        {item.netvisor_code ? `Koodi: ${item.netvisor_code}` : 'Ei Netvisor-koodia'}
        {item.email ? `  ·  ${item.email}` : ''}
      </Text>
    </View>
  );
}

export default function CustomerListScreen() {
  const { data, isLoading, error } = useCustomers();
  const { refreshing, onRefresh } = useRefreshAll();

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Ladataan asiakkaita...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Virhe: {message}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Asiakkaat</Text>
      <FlatList
        data={data ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={components.emptyText}>Ei asiakkaita.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { Customer } from '../../domain/types';
import { useCustomers } from '../hooks/useCustomers';
import { useRefreshAll } from '@/src/shared/hooks/useRefreshAll';
import { components } from '@/src/shared/styles/components';
import { layout } from '@/src/shared/styles/layout';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';

function renderItem({ item }: { item: Customer }) {
  return (
    <View style={layout.listItem}>
      <Text style={layout.listItemTitle}>{item.name}</Text>
      <Text style={layout.listItemSubtitle}>
        {item.netvisor_code ? `Koodi: ${item.netvisor_code}` : 'Ei Netvisor-koodia'}
        {item.email ? ` · ${item.email}` : ''}
      </Text>
    </View>
  );
}

export default function CustomerListScreen() {
  const { data, isLoading, error } = useCustomers();
  const { refreshing, onRefresh } = useRefreshAll();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return (data ?? []).filter((customer) =>
      !normalizedQuery ||
      customer.name.toLowerCase().includes(normalizedQuery) ||
      (customer.netvisor_code ?? '').toLowerCase().includes(normalizedQuery) ||
      (customer.email ?? '').toLowerCase().includes(normalizedQuery),
    );
  }, [data, query]);

  return (
    <ScreenLayout
      headerSearch={{
        value: query,
        onChangeText: setQuery,
        placeholder: 'Hae asiakasta...',
      }}
      leftAction="back"
      title="ASIAKKAAT"
    >
      {isLoading ? (
        <View style={[layout.screen, layout.center]}>
          <Text>Ladataan asiakkaita...</Text>
        </View>
      ) : error ? (
        <View style={[layout.screen, layout.center]}>
          <Text>Virhe: {error instanceof Error ? error.message : 'Unknown error'}</Text>
        </View>
      ) : (
        <View style={layout.screen}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={<Text style={components.textEmpty}>Ei asiakkaita.</Text>}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={renderItem}
          />
        </View>
      )}
    </ScreenLayout>
  );
}

import React, { useState } from 'react';
import { Button, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';

export type CustomerListItem = {
  id: number;
  name: string;
  email?: string | null;
};

type Props = {
  customers?: CustomerListItem[] | null;
  isLoading: boolean;
  error?: unknown;
  onSelect: (customer: CustomerListItem) => void;
  title?: string;
  getSubtitle?: (customer: CustomerListItem) => string;
  emptyText?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  emptyActionDisabled?: boolean;
};

const defaultSubtitle = (customer: CustomerListItem) => {
  if (customer.email) {
    return customer.email;
  }
  return `Customer ID: ${customer.id}`;
};

export function CustomerList({
  customers,
  isLoading,
  error,
  onSelect,
  title = 'Select customer',
  getSubtitle = defaultSubtitle,
  emptyText,
  emptyActionLabel,
  onEmptyAction,
  emptyActionDisabled,
}: Props) {
  const [query, setQuery] = useState('');

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

  const q = query.trim().toLowerCase();
  const items = (customers ?? []).filter(
    (c) => !q || c.name.toLowerCase().includes(q)
  );

  const renderCustomerItem = ({ item }: { item: CustomerListItem }) => (
    <Pressable
      onPress={() => onSelect(item)}
      style={({ pressed }) => [layout.listItem, pressed && styles.listItemPressed]}
      accessibilityRole="button"
    >
      <Text style={layout.listItemTitle}>{item.name}</Text>
      <Text style={layout.listItemSubtitle}>{getSubtitle(item)}</Text>
    </Pressable>
  );

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>{title}</Text>
      <SearchInput value={query} onChangeText={setQuery} placeholder="Hae asiakasta..." />
      <FlatList
        data={items}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          emptyText || emptyActionLabel ? (
            <View style={styles.emptyContainer}>
              {emptyText ? <Text style={styles.emptyText}>{emptyText}</Text> : null}
              {emptyActionLabel ? (
                <Button
                  title={emptyActionLabel}
                  onPress={onEmptyAction}
                  disabled={emptyActionDisabled}
                  color="#841584"
                />
              ) : null}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listItemPressed: {
    opacity: 0.7,
  },
  emptyContainer: {
    marginTop: 12,
  },
  emptyText: {
    marginBottom: 8,
  },
});

import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { layout } from '@/src/shared/styles/layout';

export type ProductListItem = {
  id: number;
  name: string;
  price_per_kg?: number;
};

type Props = {
  products?: ProductListItem[] | null;
  isLoading: boolean;
  error?: unknown;
  onSelect: (product: ProductListItem) => void;
  title?: string;
  getSubtitle?: (product: ProductListItem) => string;
  emptyText?: string;
};

const defaultSubtitle = (product: ProductListItem) => {
  if (typeof product.price_per_kg === 'number') {
    return `Price: ${product.price_per_kg}`;
  }
  return `Product ID: ${product.id}`;
};

export function ProductList({
  products,
  isLoading,
  error,
  onSelect,
  title = 'Select product',
  getSubtitle = defaultSubtitle,
  emptyText,
}: Props) {
  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load products: {message}</Text>
      </View>
    );
  }

  const items = products ?? [];

  const renderProductItem = ({ item }: { item: ProductListItem }) => (
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
      <FlatList
        data={items}
        renderItem={renderProductItem}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          emptyText ? <Text style={styles.emptyText}>{emptyText}</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listItemPressed: {
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 12,
  },
});

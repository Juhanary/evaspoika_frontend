import React from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useRefreshAll } from '@/src/shared/hooks/useRefreshAll';
import { layout } from '@/src/shared/styles/layout';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../../domain/types';
import { routes } from '@/src/shared/navigation/routes';

export default function ProductListScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useProducts();
  const { refreshing, onRefresh } = useRefreshAll();

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

  const renderItem = ({ item }: { item: Product }) => (
    <Pressable
      onPress={() => router.push(routes.inventoryProduct(item.id))}
      style={({ pressed }) => [layout.listItem, pressed && layout.listItemPressed]}
      accessibilityRole="button"
    >
      <Text style={layout.listItemTitle}>{item.name}</Text>
      <Text style={layout.listItemSubtitle}>Price: {item.price_per_kg}</Text>
    </Pressable>
  );

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Valitse tuotekategoria</Text>
      <FlatList
        data={data ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

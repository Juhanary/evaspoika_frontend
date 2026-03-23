import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { layout } from '@/src/shared/styles/layout';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../../domain/types';

export default function ProductListScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useProducts();

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
      onPress={() =>
        router.push({
          pathname: '/batches/[productId]',
          params: { productId: String(item.id) },
        })
      }
      style={({ pressed }) => [layout.listItem, pressed && styles.listItemPressed]}
      accessibilityRole="button"
    >
      <Text style={layout.listItemTitle}>{item.name}</Text>
      <Text style={layout.listItemSubtitle}>Price: {item.price_per_kg}</Text>
    </Pressable>
  );

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Valitse tuotekategoria</Text>
      <View style={styles.form} />
      <FlatList data={data ?? []} renderItem={renderItem} keyExtractor={(item) => String(item.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: 16,
  },
  listItemPressed: {
    opacity: 0.7,
  },
});

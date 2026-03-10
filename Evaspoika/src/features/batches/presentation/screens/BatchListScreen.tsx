import React, { useMemo } from 'react';
import { Button, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { layout } from '@/src/shared/styles/layout';
import { useBatches } from '../hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { Batch } from '../../domain/types';
import { Product } from '@/src/features/products/domain/types';
import { formatKg } from '@/src/shared/utils/weight';

type BatchListScreenProps = {
  productId?: number;
};

export default function BatchListScreen({ productId }: BatchListScreenProps) {
  const router = useRouter();
  const { data: batches, isLoading: batchesLoading, error: batchesError } = useBatches();
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();

  const selectedProduct = useMemo(
    () => (products ?? []).find((product) => product.id === productId) ?? null,
    [products, productId]
  );

  const filteredBatches = useMemo(() => {
    if (!productId) {
      return [];
    }

    return (batches ?? []).filter((batch) => batch.ProductId === productId);
  }, [batches, productId]);

  if (!productId) {
    if (productsLoading) {
      return (
        <View style={[layout.screen, layout.center]}>
          <Text>Loading products...</Text>
        </View>
      );
    }

    if (productsError) {
      const message = productsError instanceof Error ? productsError.message : 'Unknown error';
      return (
        <View style={[layout.screen, layout.center]}>
          <Text>Failed to load products: {message}</Text>
        </View>
      );
    }

    const renderProductItem = ({ item }: { item: Product }) => (
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
        <Text style={layout.listItemSubtitle}>Product ID: {item.id}</Text>
      </Pressable>
    );

    return (
      <View style={layout.screen}>
        <Text style={layout.title}>Select product</Text>
        <FlatList
          data={products ?? []}
          renderItem={renderProductItem}
          keyExtractor={(item) => String(item.id)}
        />
      </View>
    );
  }

  if (batchesLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading batches...</Text>
      </View>
    );
  }

  if (batchesError) {
    const message = batchesError instanceof Error ? batchesError.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load batches: {message}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Batch }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/batch-events/[batchId]',
          params: { batchId: String(item.id), batchNumber: item.batch_number },
        })
      }
      style={({ pressed }) => [layout.listItem, pressed && styles.listItemPressed]}
      accessibilityRole="button"
    >
      <Text style={layout.listItemTitle}>Batch: {item.batch_number}</Text>
      <Text style={layout.listItemSubtitle}>
        Current weight: {formatKg(item.current_weight)} kg
      </Text>
    </Pressable>
  );

  const totalWeight = filteredBatches.reduce((sum, batch) => sum + batch.current_weight, 0);

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>{selectedProduct?.name ?? `Product #${productId}`}</Text>
      <Button title="Change product" onPress={() => router.push('/batches')} color="#841584" />
      <FlatList
        data={filteredBatches}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />
      <Text style={layout.title}>Painoa yhteensä: {formatKg(totalWeight)} kg</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listItemPressed: {
    opacity: 0.7,
  },
});

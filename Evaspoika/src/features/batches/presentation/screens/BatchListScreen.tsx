import React, { useMemo, useState } from 'react';
import { Button, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';
import { useRouter } from 'expo-router';
import { useRefreshAll } from '@/src/shared/hooks/useRefreshAll';
import { layout } from '@/src/shared/styles/layout';
import { colors } from '@/src/shared/constants/colors';
import { ProductList } from '@/src/shared/ui/ProductList/ProductList';
import { useBatches } from '../hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { Batch } from '../../domain/types';
import { formatKg } from '@/src/shared/utils/weight';
import { routes } from '@/src/shared/navigation/routes';

type BatchListScreenProps = {
  productId?: number;
};

export default function BatchListScreen({ productId }: BatchListScreenProps) {
  const router = useRouter();
  const { refreshing, onRefresh } = useRefreshAll();
  const { data: batches, isLoading: batchesLoading, error: batchesError } = useBatches();
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const [query, setQuery] = useState('');

  const selectedProduct = useMemo(
    () => (products ?? []).find((product) => product.id === productId) ?? null,
    [products, productId]
  );

  const filteredBatches = useMemo(() => {
    if (!productId) {
      return [];
    }
    const q = query.trim().toLowerCase();
    return (batches ?? []).filter(
      (batch) => batch.ProductId === productId &&
        (!q || String(batch.batch_number).toLowerCase().includes(q))
    );
  }, [batches, productId, query]);

  if (!productId) {
    return (
      <ProductList
        products={products ?? []}
        isLoading={productsLoading}
        error={productsError}
        onSelect={(product) => router.push(routes.inventoryProduct(product.id))}
        getSubtitle={(product) => `Product ID: ${product.id}`}
      />
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
      onPress={() => router.push(routes.inventoryBatch(item.id, item.batch_number))}
      style={({ pressed }) => [layout.listItem, pressed && layout.listItemPressed]}
      accessibilityRole="button"
    >
      <Text style={layout.listItemTitle}>Erä: {item.batch_number}</Text>
      <Text style={layout.listItemSubtitle}>
        Current weight: {formatKg(item.current_weight)} kg
      </Text>
    </Pressable>
  );

  const totalWeight = filteredBatches.reduce((sum, batch) => sum + batch.current_weight, 0);

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>{selectedProduct?.name ?? `Product #${productId}`}</Text>
      <Button title="Change product" onPress={() => router.push(routes.inventory)} color={colors.purple} />
      <SearchInput value={query} onChangeText={setQuery} placeholder="Hae erää..." />
      <FlatList
        data={filteredBatches}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <Text style={layout.title}>Painoa yhteensä: {formatKg(totalWeight)} kg</Text>
    </View>
  );
}

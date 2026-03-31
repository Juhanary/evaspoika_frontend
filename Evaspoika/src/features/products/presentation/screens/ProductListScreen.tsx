import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { routes } from '@/src/shared/navigation/routes';
import { components } from '@/src/shared/styles/components';
import { screen } from '@/src/shared/styles/screen';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { formatKg } from '@/src/shared/utils/weight';
import { Product } from '../../domain/types';
import { useProducts } from '../hooks/useProducts';

type ProductRow = {
  product: Product;
  batchCount: number;
  totalWeight: number;
};

export default function ProductListScreen() {
  const router = useRouter();
  const { data: products, isLoading } = useProducts();
  const { data: batches } = useBatches();
  const [query, setQuery] = useState('');

  const rows = useMemo<ProductRow[]>(() => {
    const weightMap = new Map<number, { count: number; weight: number }>();

    (batches ?? []).forEach((batch) => {
      if (!batch.deleted_at && batch.ProductId) {
        const existing = weightMap.get(batch.ProductId) ?? { count: 0, weight: 0 };
        weightMap.set(batch.ProductId, {
          count: existing.count + 1,
          weight: existing.weight + (batch.current_weight ?? 0),
        });
      }
    });

    const normalizedQuery = query.trim().toLowerCase();

    return (products ?? [])
      .filter(
        (product) =>
          !normalizedQuery || product.name.toLowerCase().includes(normalizedQuery),
      )
      .map((product) => ({
        product,
        batchCount: weightMap.get(product.id)?.count ?? 0,
        totalWeight: weightMap.get(product.id)?.weight ?? 0,
      }));
  }, [batches, products, query]);

  return (
    <ScreenLayout
      headerSearch={{
        value: query,
        onChangeText: setQuery,
        placeholder: 'Hae tuotetta...',
      }}
      title="VARASTO"
    >
      <View style={screen.innerSm}>
        <View style={screen.columnHeaderRow}>
          <Text style={screen.columnHeaderText}>KG / Laatikkoa</Text>
        </View>

        {isLoading ? (
          <Text style={screen.muted}>Ladataan...</Text>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 8 }}
            data={rows}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            keyExtractor={(row) => String(row.product.id)}
            ListEmptyComponent={<Text style={screen.muted}>Ei tuotteita.</Text>}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(routes.inventoryProduct(item.product.id))}
                style={({ pressed }) => [components.invPillRow, pressed && screen.pressed]}
              >
                <View style={components.invPillLeft}>
                  <Text numberOfLines={1} style={components.invPillLeftText}>
                    {item.product.name}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="rgba(0,0,0,0.45)" />
                </View>
                <View style={components.invPillRight}>
                  <Text style={components.invPillWeight}>
                    {formatKg(item.totalWeight)} kg
                  </Text>
                  <View style={components.invPillDivider} />
                  <Text style={components.invPillCount}>{item.batchCount}</Text>
                </View>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

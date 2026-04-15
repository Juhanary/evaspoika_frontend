import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { Batch } from '@/src/features/batches/domain/types';
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
  const { data: products, isLoading, error: productsError } = useProducts();
  const { data: batches, error: batchesError } = useBatches();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const rows = useMemo<ProductRow[]>(() => {
    const weightMap = new Map<number, { count: number; weight: number }>();

    (batches ?? []).forEach((batch) => {
      if (!batch.deleted_at && batch.ProductId && (batch.current_weight ?? 0) > 0) {
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

  const batchesByProduct = useMemo(() => {
    const map = new Map<number, Batch[]>();

    (batches ?? [])
      .filter((b) => !b.deleted_at && b.ProductId)
      .forEach((b) => {
        const list = map.get(b.ProductId!) ?? [];
        list.push(b);
        map.set(b.ProductId!, list);
      });

    return map;
  }, [batches]);

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
          <Text style={screen.columnHeaderText}>KG / Eriä</Text>
        </View>

        {productsError ? (
          <Text style={screen.muted}>Virhe: {String(productsError)}</Text>
        ) : batchesError ? (
          <Text style={screen.muted}>Virhe: {String(batchesError)}</Text>
        ) : isLoading ? (
          <Text style={screen.muted}>Ladataan...</Text>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 8 }}
            data={rows}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            keyExtractor={(row) => String(row.product.id)}
            ListEmptyComponent={<Text style={screen.muted}>Ei tuotteita.</Text>}
            renderItem={({ item }) => {
              const isExpanded = expandedId === item.product.id;
              const productBatches = batchesByProduct.get(item.product.id) ?? [];

              return (
                <View style={components.invPillRow}>
                  <View style={{ flex: 1 }}>
                    <Pressable
                      onPress={() =>
                        setExpandedId((prev) =>
                          prev === item.product.id ? null : item.product.id,
                        )
                      }
                      style={({ pressed }) => [
                        components.invPillLeft,
                        isExpanded && components.invPillLeftExpanded,
                        pressed && screen.pressed,
                      ]}
                    >
                      <Text numberOfLines={1} style={components.invPillLeftText}>
                        {item.product.name}
                      </Text>
                      <Ionicons
                        color="rgba(0,0,0,0.45)"
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                      />
                    </Pressable>

                    {isExpanded ? (
                      <View style={components.invDropdown}>
                        {productBatches.length === 0 ? (
                          <Text style={components.invDropdownLabel}>Ei eriä.</Text>
                        ) : (
                          <ScrollView
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={false}
                            style={{ maxHeight: 200 }}
                          >
                            {productBatches.map((batch) => (
                              <View key={batch.id}>
                                <View style={components.invDropdownRow}>
                                  <Text style={components.invDropdownLabel}>
                                    {batch.batch_number}
                                  </Text>
                                  <Text style={components.invDropdownWeight}>
                                    {formatKg(batch.current_weight)} kg
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        )}
                        <View style={components.invDropdownRow}>
                        

<View style={{ flex: 1 }} />
  <Text style={components.invDropdownLabelYhteensa}>Yhteensä</Text>
                          <Text style={components.invDropdownWeight}>
                            {formatKg(item.totalWeight)} kg
                          </Text>
                        </View>
                                                                       <View style={components.invDropdownDivider} />

                        <Pressable
                          onPress={() => router.push(routes.inventoryProduct(item.product.id))}
                          style={({ pressed }) => [
                            components.invDropdownBtn,
                            pressed && screen.pressed,
                          ]}
                        >
                          <Text style={components.invDropdownBtnText}>MUOKKAA ERIÄ</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>

                  <View style={components.invPillRight}>
                    <Text style={components.invPillWeight}>
                      {formatKg(item.totalWeight)} kg
                    </Text>
                    <View style={components.invPillDivider} />
                      <Text style={components.invPillCount}>{item.batchCount}</Text>
                    </View>
                  </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

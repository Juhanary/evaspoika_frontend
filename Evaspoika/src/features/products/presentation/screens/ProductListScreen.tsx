import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { Batch } from '@/src/features/batches/domain/types';
import { fetchBatchEvents } from '@/src/features/batchEvents/infrastructure/batchEventsApi';
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
  boxCount: number;
};

export default function ProductListScreen() {
  const router = useRouter();
  const { data: products, isLoading, error: productsError } = useProducts();
  const { data: batches, error: batchesError } = useBatches();
  const { data: batchEvents } = useQuery({
    queryKey: ['batchEvents', 'inventory'],
    queryFn: () => fetchBatchEvents({ types: 'WEIGHING,CREATE', limit: 9999 }),
  });
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const boxesByBatchId = useMemo(() => {
    const map = new Map<number, number>();
    (batchEvents ?? []).forEach((event) => {
      map.set(event.BatchId, (map.get(event.BatchId) ?? 0) + 1);
    });
    return map;
  }, [batchEvents]);

  const rows = useMemo<ProductRow[]>(() => {
    const weightMap = new Map<number, { count: number; weight: number }>();
    const boxMap = new Map<number, number>();

    (batches ?? []).forEach((batch) => {
      if (!batch.deleted_at && batch.ProductId && (batch.current_weight ?? 0) > 0) {
        const existing = weightMap.get(batch.ProductId) ?? { count: 0, weight: 0 };
        weightMap.set(batch.ProductId, {
          count: existing.count + 1,
          weight: existing.weight + (batch.current_weight ?? 0),
        });
      }
      if (batch.ProductId) {
        boxMap.set(batch.ProductId, (boxMap.get(batch.ProductId) ?? 0) + (boxesByBatchId.get(batch.id) ?? 0));
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
        boxCount: boxMap.get(product.id) ?? 0,
      }));
  }, [batches, boxesByBatchId, products, query]);

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
          <Text style={screen.columnHeaderText}>Paino / Laatikoita</Text>
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
                      <Text numberOfLines={1} style={[components.invPillLeftText, { flex: 1 }]}>
                        {item.product.name}
                      </Text>
                      {!item.product.netvisor_key ? (
                        <Ionicons
                          color="rgba(255,165,0,0.85)"
                          name="cloud-offline-outline"
                          size={16}
                          style={{ marginRight: 4 }}
                        />
                      ) : null}
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
                            {productBatches.map((batch) => {
                              const batchBoxCount = boxesByBatchId.get(batch.id) ?? 0;
                              return (
                                <View key={batch.id}>
                                  <View style={components.invDropdownRow}>
                                    <Text style={[components.invDropdownLabel, { flex: 1 }]}>
                                      {batch.batch_number}
                                    </Text>
                                    <Text style={[components.invDropdownLabel, { minWidth: 48, textAlign: 'right' }]}>
                                      {batchBoxCount} laatikkoa
                                    </Text>
                                    <Text style={[components.invDropdownWeight, { minWidth: 80, textAlign: 'right' }]}>
                                      {formatKg(batch.current_weight)} kg
                                    </Text>
                                  </View>
                                </View>
                              );
                            })}
                          </ScrollView>
                        )}
                        <View style={components.invDropdownDivider} />
                        <View style={[components.invDropdownRow, { gap: 6 }]}>
                          <Text style={[components.invDropdownLabelYhteensa, { flex: 1 }]}>Yhteensä</Text>
                                <Text style={[components.invDropdownLabel, { minWidth: 48, textAlign: 'right', fontSize: 20 }]}>
                            {item.batchCount} erää
                          </Text>
                          <Text style={[components.invDropdownLabel, { minWidth: 48, textAlign: 'right', fontSize: 20 }]}>
                            {item.boxCount} laatikkoa
                          </Text>
                          <Text style={[components.invDropdownWeight, { minWidth: 80, textAlign: 'right', fontSize: 20 }]}>
                            {formatKg(item.totalWeight)} kg
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => router.push(routes.inventoryProduct(item.product.id))}
                          style={({ pressed }) => [
                            components.invDropdownBtn,
                            pressed && screen.pressed,
                          ]}
                        >
                          <Text style={components.invDropdownBtnText}>MUOKKAA ERIÄ</Text>
                        </Pressable>
                        {!item.product.netvisor_key ? (
                          <Text style={{
                            textAlign: 'center',
                            fontSize: 11,
                            color: 'rgba(200,120,0,0.9)',
                            marginTop: 6,
                            fontFamily: 'Montserrat_400Regular',
                          }}>
                            Ei vahvistettu Netvisorissa
                          </Text>
                        ) : null}
                      </View>
                    ) : null}
                  </View>

                  <View style={components.invPillRight}>
                    <Text style={components.invPillWeight}>
                      {formatKg(item.totalWeight)} kg
                    </Text>
                    <View style={components.invPillDivider} />
                    <Text style={components.invPillCount}>{item.boxCount}</Text>
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

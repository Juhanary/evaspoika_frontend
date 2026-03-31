import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { deleteBatch } from '../../infrastructure/batchesApi';
import { Batch } from '../../domain/types';
import { useBatches } from '../hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { colors } from '@/src/shared/constants/colors';
import { routes } from '@/src/shared/navigation/routes';
import { components } from '@/src/shared/styles/components';
import { layout } from '@/src/shared/styles/layout';
import { type AppHeaderAction } from '@/src/shared/ui/AppHeader/AppHeader';
import { ProductList } from '@/src/shared/ui/ProductList/ProductList';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { formatKg } from '@/src/shared/utils/weight';

type BatchListScreenProps = {
  productId?: number;
};

const toFinnishDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
};

const isOld = (value?: string | null) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return Date.now() - date.getTime() > 365 * 24 * 60 * 60 * 1000;
};

export default function BatchListScreen({ productId }: BatchListScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: batches, isLoading: batchesLoading, error: batchesError } = useBatches();
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const [collapsed, setCollapsed] = useState(false);
  const [productQuery, setProductQuery] = useState('');

  const selectedProduct = useMemo(
    () => (products ?? []).find((product) => product.id === productId) ?? null,
    [products, productId],
  );

  const filteredBatches = useMemo(() => {
    if (!productId) {
      return [];
    }

    return (batches ?? []).filter(
      (batch) => batch.ProductId === productId && !batch.deleted_at,
    );
  }, [batches, productId]);

  const totalWeight = filteredBatches.reduce(
    (sum, batch) => sum + batch.current_weight,
    0,
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBatch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['batches'] }),
  });

  const handleDelete = (batch: Batch) => {
    const label = toFinnishDate(batch.production_date) ?? batch.batch_number;

    Alert.alert(
      'Poista erä',
      `Poistetaanko koko erä ${label}?`,
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(batch.id),
        },
      ],
    );
  };

  const headerTitle = selectedProduct
    ? selectedProduct.name.toUpperCase()
    : productId
      ? `TUOTE #${productId}`
      : 'VARASTO';

  const headerSearch = !productId
    ? {
        value: productQuery,
        onChangeText: setProductQuery,
        placeholder: 'Hae tuotetta...',
      }
    : undefined;

  const rightActions: AppHeaderAction[] = productId
    ? [
        {
          icon: collapsed ? 'chevron-down' : 'chevron-up',
          onPress: () => setCollapsed((current) => !current),
          accessibilityLabel: collapsed ? 'Avaa lista' : 'Piilota lista',
        },
      ]
    : [];

  return (
    <ScreenLayout
      headerSearch={headerSearch}
      rightActions={rightActions}
      title={headerTitle}
    >
      {!productId ? (
        <ProductList
          emptyText="Ei tuotteita."
          error={productsError}
          getSubtitle={(product) => `Tuote #${product.id}`}
          isLoading={productsLoading}
          onQueryChange={setProductQuery}
          onSelect={(product) => router.push(routes.inventoryProduct(product.id))}
          products={products ?? []}
          query={productQuery}
          showSearchInput={false}
        />
      ) : batchesLoading ? (
        <View style={[layout.screen, layout.center]}>
          <Text>Ladataan eriä...</Text>
        </View>
      ) : batchesError ? (
        <View style={[layout.screen, layout.center]}>
          <Text>Virhe: {batchesError instanceof Error ? batchesError.message : 'Tuntematon'}</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {!collapsed ? (
            <>
              <Text style={components.blColHeader}>Erä</Text>
              <FlatList
                data={filteredBatches}
                keyExtractor={(batch) => String(batch.id)}
                ListEmptyComponent={<Text style={components.blEmpty}>Ei eriä.</Text>}
                renderItem={({ item }) => {
                  const dateLabel = toFinnishDate(item.production_date) ?? item.batch_number;
                  const old = isOld(item.production_date);

                  return (
                    <View style={components.blRow}>
                      <Text style={components.blDateText}>{dateLabel}</Text>
                      {old ? (
                        <Ionicons
                          color="#E57C00"
                          name="warning-outline"
                          size={16}
                          style={components.blWarnIcon}
                        />
                      ) : null}
                      <View style={components.blBtnGroup}>
                        <TouchableOpacity
                          disabled={deleteMutation.isPending}
                          onPress={() => handleDelete(item)}
                          style={components.blCircleBtn}
                        >
                          <Ionicons name="trash-outline" size={40} color={colors.textOnDark} />
                        </TouchableOpacity>
                        <Pressable style={components.blCircleBtn}>
                          <Ionicons name="add" size={40} color={colors.textOnDark} />
                        </Pressable>
                        <Pressable style={components.blCircleBtn}>
                          <Ionicons name="remove" size={40} color={colors.textOnDark} />
                        </Pressable>
                      </View>
                      <Text style={components.blWeightText}>
                        {formatKg(item.current_weight)} kg
                      </Text>
                    </View>
                  );
                }}
                style={components.listFlex}
              />
            </>
          ) : (
            <View style={[layout.screen, layout.center]}>
              <Text style={components.emptyText}>Lista piilotettu.</Text>
            </View>
          )}

          <View style={components.blFooter}>
            <TouchableOpacity
              onPress={() => router.push(routes.inventory)}
              style={components.blValmisBtn}
            >
              <Text style={components.blValmisBtnText}>Valmis</Text>
            </TouchableOpacity>
            <Text style={components.blTotalText}>
              YHTEENSÄ{'  '}
              {formatKg(totalWeight)} kg
            </Text>
          </View>
        </View>
      )}
    </ScreenLayout>
  );
}

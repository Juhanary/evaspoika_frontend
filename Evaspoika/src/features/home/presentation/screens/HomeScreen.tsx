import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomButton } from '@/src/shared/ui/Button/CustomButton';
import { layout } from '@/src/shared/styles/layout';
import { OrderList } from '@/src/shared/ui/OrderList/OrderList';
import { useOrders } from '@/src/features/orders/presentation/hooks/useOrders';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { Batch } from '@/src/features/batches/domain/types';
import { formatKg } from '@/src/shared/utils/weight';
import { formatDateDisplayFromIso } from '@/src/shared/utils/date';

const RECENT_LIMIT = 5;

const CLOSED_ORDER_STATUSES = new Set([
  'closed',
  'delivered',
  'completed',
  'cancelled',
  'canceled',
  'invoiced',
]);

const normalizeStatus = (value?: string | null) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const isClosedOrder = (order: { status?: string | null; netvisor_status?: string | null }) => {
  const status = normalizeStatus(order.status);
  const netvisorStatus = normalizeStatus(order.netvisor_status);
  return CLOSED_ORDER_STATUSES.has(status) || CLOSED_ORDER_STATUSES.has(netvisorStatus);
};

const parseDateValue = (value?: string | null) => {
  if (!value) {
    return Number.NaN;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
};

export default function HomeScreen() {
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useOrders();
  const { data: batches, isLoading: batchesLoading, error: batchesError } = useBatches();
  const { data: products } = useProducts();

  const recentOrders = useMemo(() => {
    const items = (orders ?? []).filter(
      (order) => !order.deleted_at && !isClosedOrder(order)
    );
    return [...items]
      .sort((a, b) => {
        const dateA = parseDateValue(a.order_date);
        const dateB = parseDateValue(b.order_date);
        if (Number.isFinite(dateA) && Number.isFinite(dateB)) {
          return dateB - dateA;
        }
        if (Number.isFinite(dateA)) {
          return -1;
        }
        if (Number.isFinite(dateB)) {
          return 1;
        }
        return b.id - a.id;
      })
      .slice(0, RECENT_LIMIT);
  }, [orders]);

  const recentBatches = useMemo(() => {
    const items = batches ?? [];
    return [...items]
      .sort((a, b) => {
        const dateA = parseDateValue(a.production_date);
        const dateB = parseDateValue(b.production_date);
        if (Number.isFinite(dateA) && Number.isFinite(dateB)) {
          return dateB - dateA;
        }
        if (Number.isFinite(dateA)) {
          return -1;
        }
        if (Number.isFinite(dateB)) {
          return 1;
        }
        return b.id - a.id;
      })
      .slice(0, RECENT_LIMIT);
  }, [batches]);

  const productNameById = useMemo(() => {
    const map = new Map<number, string>();
    (products ?? []).forEach((product) => {
      map.set(product.id, product.name);
    });
    return map;
  }, [products]);

  const renderBatchItem = (item: Batch) => {
    const dateLabel = item.production_date
      ? formatDateDisplayFromIso(item.production_date)
      : null;
    const weightLabel = `${formatKg(item.current_weight)} kg`;
    const subtitle = dateLabel ? `${dateLabel} - ${weightLabel}` : weightLabel;
    const productLabel = item.ProductId
      ? productNameById.get(item.ProductId) ?? `Product #${item.ProductId}`
      : 'Product';
    const title = `${productLabel} - Era ${item.batch_number}`;

    return (
      <Pressable
        key={item.id}
        onPress={() =>
          router.push({
            pathname: '/batch-events/[batchId]',
            params: { batchId: String(item.id), batchNumber: item.batch_number },
          })
        }
        style={({ pressed }) => [layout.listItem, pressed && styles.listItemPressed]}
        accessibilityRole="button"
      >
        <Text style={layout.listItemTitle}>{title}</Text>
        <Text style={layout.listItemSubtitle}>{subtitle}</Text>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={layout.screen}>
      <View style={layout.section}>
        <Text style={layout.title}>Warehouse Dashboard</Text>
        <Text>Choose a section to get started.</Text>
      </View>

      <CustomButton label="Varasto" onPress={() => router.push('/products')} />
      <CustomButton label="Asiakkaat" onPress={() => router.push('/customers')} />
      <CustomButton
        label="Luo tilaus"
        onPress={() =>
          router.push({
            pathname: '/orders',
            params: { mode: 'create' },
          })
        }
      />

      <View style={layout.section}>
        <OrderList
          orders={recentOrders}
          isLoading={ordersLoading}
          error={ordersError}
          title="Auki olevat tilaukset"
          emptyText="Ei auki olevia tilauksia."
          onSelect={(order) =>
            router.push({
              pathname: '/orders/[orderId]',
              params: { orderId: String(order.id) },
            })
          }
        />
      </View>

      <View style={layout.section}>
        <Text style={layout.title}>Viimeisimmat erat</Text>
        {batchesLoading ? (
          <Text>Loading batches...</Text>
        ) : batchesError ? (
          <Text>
            Failed to load batches:{' '}
            {batchesError instanceof Error ? batchesError.message : 'Unknown error'}
          </Text>
        ) : recentBatches.length === 0 ? (
          <Text style={styles.emptyText}>Ei eria.</Text>
        ) : (
          recentBatches.map(renderBatchItem)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    marginTop: 8,
  },
  listItemPressed: {
    opacity: 0.7,
  },
});

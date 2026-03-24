import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';
import { colors } from '@/src/shared/constants/colors';
import { typography } from '@/src/shared/constants/typography';
import { router } from 'expo-router';
import { useRefreshAll } from '@/src/shared/hooks/useRefreshAll';
import { CustomButton } from '@/src/shared/ui/Button/CustomButton';
import { layout } from '@/src/shared/styles/layout';
import { OrderList, type OrderListItem } from '@/src/shared/ui/OrderList/OrderList';
import { useOrders } from '@/src/features/orders/presentation/hooks/useOrders';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { Batch } from '@/src/features/batches/domain/types';
import { formatKg } from '@/src/shared/utils/weight';
import { formatDateDisplayFromIso } from '@/src/shared/utils/date';
import { spacing } from '@/src/shared/constants/spacing';
import { routes } from '@/src/shared/navigation/routes';

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
  const { data: customers } = useCustomers();
  const { refreshing, onRefresh } = useRefreshAll();
  const [query, setQuery] = useState('');

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

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedProducts = (products ?? []).filter(
      (p) => p.name.toLowerCase().includes(q) || (p.ean ?? '').toLowerCase().includes(q)
    );
    const matchedCustomers = (customers ?? []).filter(
      (c) => c.name.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q) || (c.netvisor_code ?? '').toLowerCase().includes(q)
    );
    const matchedBatches = (batches ?? []).filter(
      (b) => b.batch_number.toLowerCase().includes(q)
    );
    const matchedOrders = (orders ?? []).filter(
      (o) => !o.deleted_at && (String(o.id).includes(q) || (o.order_date ?? '').includes(q))
    );

    return { matchedProducts, matchedCustomers, matchedBatches, matchedOrders };
  }, [query, products, customers, batches, orders]);

  const customerNameById = useMemo(() => {
    const map = new Map<number, string>();
    (customers ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  const getOrderTitle = (order: OrderListItem) => {
    const customerName = order.customer_id ? customerNameById.get(order.customer_id) : null;
    const dateStr = order.order_date
      ? new Date(order.order_date).toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : `#${order.id}`;
    return customerName ? `${customerName} — ${dateStr}` : dateStr;
  };

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
        onPress={() => router.push(routes.inventoryBatch(item.id, item.batch_number))}
        style={({ pressed }) => [layout.listItem, pressed && layout.listItemPressed]}
        accessibilityRole="button"
      >
        <Text style={layout.listItemTitle}>{title}</Text>
        <Text style={layout.listItemSubtitle}>{subtitle}</Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={layout.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={layout.section}>
        <Text style={layout.title}>Warehouse Dashboard</Text>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Hae tuotetta, asiakasta, erää tai tilausta..." />
      </View>

      {searchResults ? (
        <>
          <Text style={styles.sectionLabel}>Tuotteet ({searchResults.matchedProducts.length})</Text>
          {searchResults.matchedProducts.length === 0 ? (
            <Text style={styles.emptyText}>Ei tuloksia.</Text>
          ) : searchResults.matchedProducts.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push(routes.inventoryProduct(p.id))}
              style={({ pressed }) => [layout.listItem, pressed && layout.listItemPressed]}
              accessibilityRole="button"
            >
              <Text style={layout.listItemTitle}>{p.name}</Text>
              {p.ean ? <Text style={layout.listItemSubtitle}>EAN: {p.ean}</Text> : null}
            </Pressable>
          ))}

          <Text style={styles.sectionLabel}>Asiakkaat ({searchResults.matchedCustomers.length})</Text>
          {searchResults.matchedCustomers.length === 0 ? (
            <Text style={styles.emptyText}>Ei tuloksia.</Text>
          ) : searchResults.matchedCustomers.map((c) => (
            <View key={c.id} style={layout.listItem}>
              <Text style={layout.listItemTitle}>{c.name}</Text>
              {c.email ? <Text style={layout.listItemSubtitle}>{c.email}</Text> : null}
            </View>
          ))}

          <Text style={styles.sectionLabel}>Erät ({searchResults.matchedBatches.length})</Text>
          {searchResults.matchedBatches.length === 0 ? (
            <Text style={styles.emptyText}>Ei tuloksia.</Text>
          ) : searchResults.matchedBatches.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => router.push(routes.inventoryBatch(b.id, b.batch_number))}
              style={({ pressed }) => [layout.listItem, pressed && layout.listItemPressed]}
              accessibilityRole="button"
            >
              <Text style={layout.listItemTitle}>Erä: {b.batch_number}</Text>
              <Text style={layout.listItemSubtitle}>{formatKg(b.current_weight)} kg</Text>
            </Pressable>
          ))}

          <Text style={styles.sectionLabel}>Tilaukset ({searchResults.matchedOrders.length})</Text>
          {searchResults.matchedOrders.length === 0 ? (
            <Text style={styles.emptyText}>Ei tuloksia.</Text>
          ) : searchResults.matchedOrders.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => router.push(routes.orderDetail(o.id))}
              style={({ pressed }) => [layout.listItem, pressed && layout.listItemPressed]}
              accessibilityRole="button"
            >
              <Text style={layout.listItemTitle}>{getOrderTitle(o)}</Text>
              <Text style={layout.listItemSubtitle}>#{o.id}{o.status ? ` · ${o.status}` : ''}</Text>
            </Pressable>
          ))}
        </>
      ) : (
        <>
          <CustomButton label="Punnitus" onPress={() => router.push(routes.weighing)} />
          <CustomButton label="Varasto" onPress={() => router.push(routes.inventory)} />
          <CustomButton label="Asiakkaat" onPress={() => router.push(routes.moreCustomers)} />
          <CustomButton label="Tapahtumaloki" onPress={() => router.push(routes.moreLogs)} />
          <CustomButton label="Luo tilaus" onPress={() => router.push(routes.orders)} />

          <View style={layout.section}>
            <OrderList
              orders={recentOrders}
              isLoading={ordersLoading}
              error={ordersError}
              title="Auki olevat tilaukset"
              emptyText="Ei auki olevia tilauksia."
              getTitle={getOrderTitle}
              onSelect={(order) => router.push(routes.orderDetail(order.id))}
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
              <Text style={{ marginTop: spacing.sm }}>Ei eria.</Text>
            ) : (
              recentBatches.map(renderBatchItem)
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.muted,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.muted,
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
});

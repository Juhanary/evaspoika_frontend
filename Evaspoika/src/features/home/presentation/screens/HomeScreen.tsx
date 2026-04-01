import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { fetchOrderLines } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { useOrders } from '@/src/features/orders/presentation/hooks/useOrders';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { useRefreshAll } from '@/src/shared/hooks/useRefreshAll';
import { routes } from '@/src/shared/navigation/routes';
import { dark } from '@/src/shared/styles/dark';
import { homeStyles } from '@/src/shared/styles/home';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import { GlassNavButton } from '@/src/shared/ui/GlassNavButton/GlassNavButton';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { buildOrderLineSummary } from '@/src/shared/utils/orderSummary';
import { formatKg } from '@/src/shared/utils/weight';

const LOGO = require('@/src/assets/images/Logo.png');

const CLOSED_STATUSES = new Set([
  'closed',
  'delivered',
  'completed',
  'cancelled',
  'canceled',
  'invoiced',
]);

const normalizeStatus = (value?: string | null) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const isClosedOrder = (order: {
  status?: string | null;
  netvisor_status?: string | null;
}) =>
  CLOSED_STATUSES.has(normalizeStatus(order.status)) ||
  CLOSED_STATUSES.has(normalizeStatus(order.netvisor_status));

const parseDateValue = (value?: string | null) => {
  if (!value) {
    return NaN;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const formatOrderDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('fi-FI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function HomeScreen() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: batches } = useBatches();
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const { refreshing, onRefresh } = useRefreshAll();
  const [query, setQuery] = useState('');

  const recentOrders = useMemo(() => {
    return (orders ?? [])
      .filter((order) => !order.deleted_at && !isClosedOrder(order))
      .sort((a, b) => {
        const leftDate = parseDateValue(a.order_date);
        const rightDate = parseDateValue(b.order_date);

        if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) {
          return rightDate - leftDate;
        }

        if (Number.isFinite(leftDate)) {
          return -1;
        }

        if (Number.isFinite(rightDate)) {
          return 1;
        }

        return b.id - a.id;
      })
      .slice(0, 3);
  }, [orders]);

  const customerNameById = useMemo(() => {
    const map = new Map<number, string>();

    (customers ?? []).forEach((customer) => {
      map.set(customer.id, customer.name);
    });

    return map;
  }, [customers]);

  const orderLineQueries = useQueries({
    queries: recentOrders.map((order) => ({
      queryKey: ['orderLines', order.id],
      queryFn: () => fetchOrderLines(order.id),
    })),
  });

  const orderLineSummaries = useMemo(() => {
    const map = new Map<number, string>();

    recentOrders.forEach((order, index) => {
      const query = orderLineQueries[index];

      if (!query || query.isPending || query.isLoading) {
        map.set(order.id, 'Ladataan tuotteita...');
        return;
      }

      if (query.error) {
        map.set(order.id, 'Tuotteita ei voitu ladata.');
        return;
      }

      map.set(order.id, buildOrderLineSummary(query.data));
    });

    return map;
  }, [orderLineQueries, recentOrders]);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return null;
    }

    return {
      products: (products ?? []).filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedQuery) ||
          (product.ean ?? '').toLowerCase().includes(normalizedQuery),
      ),
      customers: (customers ?? []).filter(
        (customer) =>
          customer.name.toLowerCase().includes(normalizedQuery) ||
          (customer.email ?? '').toLowerCase().includes(normalizedQuery) ||
          (customer.netvisor_code ?? '').toLowerCase().includes(normalizedQuery),
      ),
      batches: (batches ?? []).filter((batch) =>
        batch.batch_number.toLowerCase().includes(normalizedQuery),
      ),
      orders: (orders ?? []).filter(
        (order) =>
          !order.deleted_at &&
          (String(order.id).includes(normalizedQuery) ||
            (order.order_date ?? '').includes(normalizedQuery)),
      ),
    };
  }, [batches, customers, orders, products, query]);

  return (
    <ScreenLayout
      headerSearch={{
        value: query,
        onChangeText: setQuery,
        placeholder: 'Hae...',
      }}
      leftAction="none"
      wrapInCard={false}
    >
      <ScrollView
        contentContainerStyle={homeStyles.outerScrollContent}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
            tintColor="#F0F0F0"
          />
        }
        showsVerticalScrollIndicator={false}
        style={homeStyles.outerScroll}
      >
        <GlassCard blurRadius={18} style={homeStyles.card}>
          {searchResults ? (
            <View style={homeStyles.searchResultsPadding}>
              <SearchSection
                empty={searchResults.products.length === 0}
                label={`Tuotteet (${searchResults.products.length})`}
              >
                {searchResults.products.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => router.push(routes.inventoryProduct(product.id))}
                    style={({ pressed }) => [dark.row, pressed && dark.pressed]}
                  >
                    <Text style={dark.rowTitle}>{product.name}</Text>
                    {product.ean ? <Text style={dark.rowSub}>EAN: {product.ean}</Text> : null}
                  </Pressable>
                ))}
              </SearchSection>

              <SearchSection
                empty={searchResults.customers.length === 0}
                label={`Asiakkaat (${searchResults.customers.length})`}
              >
                {searchResults.customers.map((customer) => (
                  <View key={customer.id} style={dark.row}>
                    <Text style={dark.rowTitle}>{customer.name}</Text>
                    {customer.email ? <Text style={dark.rowSub}>{customer.email}</Text> : null}
                  </View>
                ))}
              </SearchSection>

              <SearchSection
                empty={searchResults.batches.length === 0}
                label={`Erät (${searchResults.batches.length})`}
              >
                {searchResults.batches.map((batch) => (
                  <Pressable
                    key={batch.id}
                    onPress={() =>
                      router.push(routes.inventoryBatch(batch.id, batch.batch_number))
                    }
                    style={({ pressed }) => [dark.row, pressed && dark.pressed]}
                  >
                    <Text style={dark.rowTitle}>Erä: {batch.batch_number}</Text>
                    <Text style={dark.rowSub}>{formatKg(batch.current_weight)} kg</Text>
                  </Pressable>
                ))}
              </SearchSection>

              <SearchSection
                empty={searchResults.orders.length === 0}
                label={`Tilaukset (${searchResults.orders.length})`}
              >
                {searchResults.orders.map((order) => (
                  <Pressable
                    key={order.id}
                    onPress={() => router.push(routes.orderDetail(order.id))}
                    style={({ pressed }) => [dark.row, pressed && dark.pressed]}
                  >
                    <Text style={dark.rowTitle}>
                      {order.customer_id
                        ? (customerNameById.get(order.customer_id) ?? 'Tilaus')
                        : 'Tilaus'}
                    </Text>
                    <Text style={dark.rowSub}>
                      {[formatOrderDate(order.order_date), order.status]
                        .filter(Boolean)
                        .join(' / ') || 'Tilaus'}
                    </Text>
                  </Pressable>
                ))}
              </SearchSection>
            </View>
          ) : (
            <>
              <View style={homeStyles.logoSection}>
                <Image resizeMode="contain" source={LOGO} style={homeStyles.logo} />
                <Text style={homeStyles.logoSubtitle}>KOTI</Text>
              </View>

              <View style={homeStyles.topArea}>
                <View style={homeStyles.btnGroup}>
                  <GlassNavButton label="TILAUS" onPress={() => router.push(routes.orders)} />
                  <GlassNavButton label="VARASTO" onPress={() => router.push(routes.inventory)} />
                  <GlassNavButton label="LOKI" onPress={() => router.push(routes.logs)} />
                </View>
              </View>
            </>
          )}
        </GlassCard>

        {!searchResults && (ordersLoading || recentOrders.length > 0) ? (
          <GlassCard blurRadius={18} style={homeStyles.ordersCard}>
            <View style={homeStyles.ordersSection}>
              <Text style={homeStyles.ordersSectionLabel}>Avoimet tilaukset</Text>
              <View style={homeStyles.ordersSectionDivider} />

              {ordersLoading ? (
                <Text style={dark.muted}>Ladataan...</Text>
              ) : (
                recentOrders.map((order, index) => {
                  const customerName = order.customer_id
                    ? customerNameById.get(order.customer_id)
                    : null;
                  const dateLabel = formatOrderDate(order.order_date) ?? '';
                  const orderSummary = orderLineSummaries.get(order.id);

                  return (
                    <React.Fragment key={order.id}>
                      <Pressable
                        onPress={() => router.push(routes.orderDetail(order.id))}
                        style={({ pressed }) => [
                          homeStyles.ordersRow,
                          pressed && dark.pressed,
                        ]}
                      >
                        <View style={homeStyles.ordersRowBody}>
                          <Text numberOfLines={1} style={homeStyles.ordersRowName}>
                            {customerName ?? 'Tilaus'}
                          </Text>
                          <Text numberOfLines={2} style={homeStyles.ordersRowSummary}>
                            {orderSummary ?? 'Ladataan tuotteita...'}
                          </Text>
                        </View>
                        <Text style={homeStyles.ordersRowDate}>{dateLabel}</Text>
                      </Pressable>

                      {index < recentOrders.length - 1 ? (
                        <View style={homeStyles.ordersRowDivider} />
                      ) : null}
                    </React.Fragment>
                  );
                })
              )}
            </View>
          </GlassCard>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}

function SearchSection({
  label,
  empty,
  children,
}: {
  label: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <Text style={dark.sectionLabel}>{label}</Text>
      {empty ? <Text style={dark.muted}>Ei tuloksia.</Text> : children}
    </>
  );
}

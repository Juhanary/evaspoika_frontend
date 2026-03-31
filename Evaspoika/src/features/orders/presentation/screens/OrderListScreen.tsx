import React, { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { fetchOrderLines } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { screen } from '@/src/shared/styles/screen';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { useOrders } from '@/src/features/orders/presentation/hooks/useOrders';
import { routes } from '@/src/shared/navigation/routes';
import { Order } from '@/src/features/orders/domain/types';
import { buildOrderLineSummary } from '@/src/shared/utils/orderSummary';

const CLOSED = new Set(['closed', 'delivered', 'completed', 'cancelled', 'canceled', 'invoiced']);

const isOpen = (o: Order) =>
  !o.deleted_at &&
  !CLOSED.has((o.status ?? '').toLowerCase()) &&
  !CLOSED.has((o.netvisor_status ?? '').toLowerCase());

const sortNewest = (a: Order, b: Order) => {
  const da = a.order_date ? Date.parse(a.order_date) : 0;
  const db = b.order_date ? Date.parse(b.order_date) : 0;
  return db - da || b.id - a.id;
};

type OrderRow = {
  order: Order;
  customerName: string;
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

export default function OrderScreen() {
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  const rows = useMemo<OrderRow[]>(() => {
    const customerNameById = new Map<number, string>();

    (customers ?? [])
      .filter((customer) => !customer.deleted_at)
      .forEach((customer) => {
        customerNameById.set(customer.id, customer.name);
      });

    return (orders ?? [])
      .filter(isOpen)
      .sort(sortNewest)
      .map((order) => {
        const customerId = Number(order.customer_id ?? order.CustomerId);

        return {
          order,
          customerName:
            customerNameById.get(customerId) ?? `Tilaus #${order.id}`,
        };
      });
  }, [customers, orders]);

  const orderLineQueries = useQueries({
    queries: rows.map(({ order }) => ({
      queryKey: ['orderLines', order.id],
      queryFn: () => fetchOrderLines(order.id),
    })),
  });

  const orderSummaryById = useMemo(() => {
    const map = new Map<number, string>();

    rows.forEach((row, index) => {
      const query = orderLineQueries[index];

      if (!query || query.isPending || query.isLoading) {
        map.set(row.order.id, 'Ladataan tuotteita...');
        return;
      }

      if (query.error) {
        map.set(row.order.id, 'Tuotteita ei voitu ladata.');
        return;
      }

      map.set(row.order.id, buildOrderLineSummary(query.data));
    });

    return map;
  }, [orderLineQueries, rows]);

  const isLoading = customersLoading || ordersLoading;

  return (
    <ScreenLayout title="TILAUKSET">
      <View style={screen.inner}>
        <Text style={screen.sectionTitle}>AVOIMET TILAUKSET</Text>
        <View style={screen.divider} />
        {isLoading ? (
          <Text style={screen.muted}>Ladataan...</Text>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => String(row.order.id)}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            ListEmptyComponent={<Text style={screen.muted}>Ei avoimia tilauksia.</Text>}
            ItemSeparatorComponent={() => <View style={screen.rowDivider} />}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [screen.listRow, pressed && screen.pressed]}
                onPress={() => router.push(routes.orderDetail(item.order.id))}
              >
                <View style={screen.listRowContent}>
                  <Text numberOfLines={1} style={screen.listRowName}>
                    {item.customerName}
                  </Text>
                  <Text numberOfLines={2} style={screen.listRowSummary}>
                    {orderSummaryById.get(item.order.id) ?? 'Ei tuotteita vielä.'}
                  </Text>
                </View>
                <View style={screen.listRowMeta}>
                  <Text style={screen.listRowMetaPrimary}>
                    {formatOrderDate(item.order.order_date) ?? `#${item.order.id}`}
                  </Text>
                  <Text style={screen.listRowMetaSecondary}>#{item.order.id}</Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

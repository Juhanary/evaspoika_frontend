import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { fetchOrderLines } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { screen } from '@/src/shared/styles/screen';
import { orderStyles } from '@/src/shared/styles/orders';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { useOrders } from '@/src/features/orders/presentation/hooks/useOrders';
import { clearAndSyncOrdersFromNetvisor, syncOrdersFromNetvisor } from '@/src/features/orders/infrastructure/ordersApi';
import { ApiError } from '@/src/infrastructure/api/error';
import { routes } from '@/src/shared/navigation/routes';
import { Order } from '@/src/features/orders/domain/types';
import { buildOrderLineSummary } from '@/src/shared/utils/orderSummary';
import { Button } from '@/src/shared/ui/Button/ActionButton';

const CLOSED = new Set(['closed', 'delivered', 'completed', 'cancelled', 'canceled', 'invoiced']);

const isOpen = (o: Order) =>
  !o.deleted_at &&
  !CLOSED.has((o.status ?? '').toLowerCase()) &&
  !CLOSED.has((o.netvisor_status ?? '').toLowerCase());

const isPast = (o: Order) =>
  !o.deleted_at &&
  (CLOSED.has((o.status ?? '').toLowerCase()) ||
    CLOSED.has((o.netvisor_status ?? '').toLowerCase()));

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
  const queryClient = useQueryClient();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const [showPastOrders, setShowPastOrders] = useState(false);
  const [query, setQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  const syncingRef = useRef(false);

  const runSync = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      await syncOrdersFromNetvisor();
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch {
      // silent background sync — only show errors on manual press
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  };

  const handleSyncFromNetvisor = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      await syncOrdersFromNetvisor();
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err) {
      const msg = (() => {
        if (err instanceof ApiError) {
          const p = err.payload as Record<string, unknown> | null;
          return String(p?.details ?? p?.error ?? err.message);
        }
        return err instanceof Error ? err.message : 'Synkronointi epäonnistui';
      })();
      Alert.alert('Synkronointi epäonnistui', msg);
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  };

  useEffect(() => {
    const initialSync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      setSyncing(true);
      try {
        await clearAndSyncOrdersFromNetvisor();
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
      } catch {
        // silent
      } finally {
        syncingRef.current = false;
        setSyncing(false);
      }
    };

    initialSync();
    const interval = setInterval(runSync, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo<OrderRow[]>(() => {
    const customerNameById = new Map<number, string>();
    const normalizedQuery = query.trim().toLowerCase();

    (customers ?? [])
      .filter((customer) => !customer.deleted_at)
      .forEach((customer) => {
        customerNameById.set(customer.id, customer.name);
      });

    return (orders ?? [])
      .filter((order) => (showPastOrders ? isPast(order) : isOpen(order)))
      .sort(sortNewest)
      .map((order) => {
        const customerId = Number(order.customer_id ?? order.CustomerId);

        return {
          order,
          customerName: customerNameById.get(customerId) ?? 'Tilaus',
        };
      })
      .filter(({ order, customerName }) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          customerName,
          String(order.id),
          order.order_date ?? '',
          formatOrderDate(order.order_date) ?? '',
          order.status ?? '',
          order.netvisor_status ?? '',
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      });
  }, [customers, orders, query, showPastOrders]);

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
    <ScreenLayout
      headerSearch={{
        value: query,
        onChangeText: setQuery,
        placeholder: showPastOrders
          ? 'Hae menneit\u00E4 tilauksia...'
          : 'Hae avoimia tilauksia...',
      }}
      title="TILAUKSET"
    >
      <View style={screen.inner}>
        <View style={orderStyles.actions}>
          <Button
            label="Uusi tilaus"
            onPress={() => router.push(routes.newOrder)}
            style={orderStyles.actionButton}
            textStyle={orderStyles.actionButtonText}
            variant="glassNav"
          />
          <Button
            label={
              showPastOrders
                ? 'Näytä avoimet tilaukset'
                : 'Näytä menneet tilaukset'
            }
            onPress={() => setShowPastOrders((current) => !current)}
            style={orderStyles.actionButton}
            textStyle={orderStyles.actionButtonText}
            variant="glassNav"
          />
          <Button
            label={syncing ? 'Haetaan Netvisorista...' : 'Päivitä nyt'}
            onPress={handleSyncFromNetvisor}
            style={orderStyles.actionButton}
            textStyle={orderStyles.actionButtonText}
            variant="glassNav"
          />
        </View>

        <Text style={screen.sectionTitle}>
          {showPastOrders ? 'MENNEET TILAUKSET' : 'AVOIMET TILAUKSET'}
        </Text>
        <View style={screen.divider} />
        {isLoading ? (
          <Text style={screen.muted}>Ladataan...</Text>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(row) => String(row.order.id)}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <Text style={screen.muted}>
                {showPastOrders ? 'Ei menneit\u00E4 tilauksia.' : 'Ei avoimia tilauksia.'}
              </Text>
            }
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
                    {formatOrderDate(item.order.order_date) ?? ''}
                  </Text>
                  <Text style={screen.listRowMetaSecondary}>
                    {[
                      item.order.status ?? item.order.netvisor_status,
                    ]
                      .filter(Boolean)
                      .join(' / ')}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </ScreenLayout>
  );
}


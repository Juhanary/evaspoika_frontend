import React, { useMemo, useState } from 'react';
import {
  Alert, Button, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { layout } from '@/src/shared/styles/layout';
import { components } from '@/src/shared/styles/components';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { useOrders } from '@/src/features/orders/presentation/hooks/useOrders';
import { CustomerList } from '@/src/shared/ui/CustomerList/CustomerList';
import { createOrder } from '../../infrastructure/ordersApi';
import { Customer } from '@/src/features/customers/domain/types';
import { Order } from '@/src/features/orders/domain/types';
import { routes } from '@/src/shared/navigation/routes';

const getTodayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const CLOSED = new Set(['closed','delivered','completed','cancelled','canceled','invoiced']);
const isClosed = (o: Order) =>
  CLOSED.has((o.status ?? '').toLowerCase()) || CLOSED.has((o.netvisor_status ?? '').toLowerCase());

const sortNewest = (a: Order, b: Order) => {
  const da = a.order_date ? Date.parse(a.order_date) : 0;
  const db = b.order_date ? Date.parse(b.order_date) : 0;
  return db - da || b.id - a.id;
};

const toFinnishDate = (s: string) =>
  new Date(s).toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function OrderScreen() {
  const queryClient = useQueryClient();
  const { data: customers, isLoading: customersLoading, error: customersError } = useCustomers();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [query, setQuery] = useState('');
  const createMutation = useMutation({ mutationFn: createOrder });

  const filtered = useMemo(() => {
    if (!selectedCustomer) return [];
    const q = query.trim().toLowerCase();
    return (orders ?? []).filter(
      (o) => !o.deleted_at &&
        Number(o.customer_id ?? (o as any).CustomerId) === selectedCustomer.id &&
        (!q || String(o.id).includes(q) || (o.order_date ?? '').includes(q))
    );
  }, [orders, selectedCustomer, query]);

  const open = useMemo(() => filtered.filter((o) => !isClosed(o)).sort(sortNewest), [filtered]);
  const closed = useMemo(() => filtered.filter(isClosed).sort(sortNewest), [filtered]);

  if (!selectedCustomer) {
    return (
      <CustomerList
        customers={customers ?? []}
        isLoading={customersLoading}
        error={customersError}
        onSelect={(c: Customer) => setSelectedCustomer(c)}
        title="Valitse asiakas"
        emptyText="Ei asiakkaita."
      />
    );
  }

  const customerName = selectedCustomer.name;

  const handleCreate = async () => {
    try {
      const order = await createMutation.mutateAsync({
        customer_id: selectedCustomer.id,
        order_date: getTodayDateString(),
      });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push(routes.orderScan(order.id));
    } catch (err) {
      Alert.alert('Virhe', err instanceof Error ? err.message : 'Tilauksen luonti epäonnistui');
    }
  };

  const renderOrder = (o: Order) => {
    const dateStr = o.order_date ? toFinnishDate(o.order_date) : `#${o.id}`;
    const nvStatus = (o.netvisor_status ?? '').trim();
    return (
      <Pressable
        key={o.id}
        onPress={() => router.push(routes.orderDetail(o.id))}
        style={({ pressed }) => [styles.orderRow, pressed && layout.pressed]}
      >
        <Text style={styles.orderRowTitle}>{customerName} — {dateStr}</Text>
        <Text style={styles.orderRowSub}>
          #{o.id}{o.status ? ` · ${o.status}` : ''} · {nvStatus || 'Odottaa laskutusta'}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Tilaukset</Text>
      <Text style={styles.customerName}>{customerName}</Text>

      <View style={styles.btnRow}>
        <Button title="Vaihda asiakas" onPress={() => setSelectedCustomer(null)} color={colors.purple} />
      </View>
      <SearchInput value={query} onChangeText={setQuery} placeholder="Hae tilausta..." />
      <View style={styles.btnRow}>
        <Button
          title={createMutation.isPending ? 'Luodaan...' : 'Luo tilaus'}
          onPress={handleCreate}
          color={colors.success}
          disabled={createMutation.isPending}
        />
      </View>

      <ScrollView style={styles.list}>
        <Text style={components.sectionHeader}>Auki olevat tilaukset</Text>
        {ordersLoading
          ? <Text style={components.mutedText}>Ladataan...</Text>
          : open.length === 0
            ? <Text style={components.mutedText}>Ei auki olevia tilauksia.</Text>
            : open.map(renderOrder)}

        <Text style={components.sectionHeader}>Vanhat tilaukset</Text>
        {!ordersLoading && (closed.length === 0
          ? <Text style={components.mutedText}>Ei vanhoja tilauksia.</Text>
          : closed.map(renderOrder))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  customerName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  btnRow: { marginBottom: spacing.sm },
  list: { flex: 1 },
  orderRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.surfaceMid,
  },
  orderRowTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  orderRowSub: {
    fontSize: typography.sizes.md,
    color: colors.muted,
    marginTop: spacing.xs / 2,
  },
});

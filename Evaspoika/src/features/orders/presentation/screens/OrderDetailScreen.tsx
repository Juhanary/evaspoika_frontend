import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { useOrders } from '../hooks/useOrders';
import { updateOrder } from '../../infrastructure/ordersApi';
import { CreateOrderInput } from '../../domain/types';

type Props = {
  orderId?: number;
};

export default function OrderDetailScreen({ orderId }: Props) {
  const { data: orders, isLoading, error } = useOrders();
  const queryClient = useQueryClient();
  const [orderDate, setOrderDate] = useState('');
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');

  const order = useMemo(
    () => (orders ?? []).find((item) => item.id === orderId) ?? null,
    [orders, orderId]
  );

  useEffect(() => {
    if (!order) {
      return;
    }

    setOrderDate(order.order_date ?? '');
    setStatus(order.status ?? '');
    const rawCustomerId = order.customer_id ?? order.CustomerId ?? null;
    setCustomerId(rawCustomerId != null ? String(rawCustomerId) : '');
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: (input: Partial<CreateOrderInput>) => {
      if (!orderId) {
        throw new Error('Missing order id');
      }
      return updateOrder(orderId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleSave = async () => {
    if (!orderId || !order) {
      return;
    }

    const trimmedStatus = status.trim();
    const trimmedDate = orderDate.trim();
    const trimmedCustomer = customerId.trim();

    let parsedCustomerId: number | null = null;
    if (trimmedCustomer) {
      const parsed = Number(trimmedCustomer);
      if (!Number.isFinite(parsed)) {
        Alert.alert('Invalid customer id', 'Customer id must be a number.');
        return;
      }
      parsedCustomerId = parsed;
    }

    try {
      await updateMutation.mutateAsync({
        status: trimmedStatus || null,
        order_date: trimmedDate || null,
        customer_id: parsedCustomerId,
      });
      Alert.alert('Order updated', `Order #${orderId} was updated.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Update failed', message);
    }
  };

  if (!orderId) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading order...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load order: {message}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Order #{order.id}</Text>
      <View style={styles.form}>
        <TextInput
          placeholder="Order date (YYYY-MM-DD)"
          value={orderDate}
          onChangeText={setOrderDate}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Status"
          value={status}
          onChangeText={setStatus}
          style={styles.input}
        />
        <TextInput
          placeholder="Customer ID"
          value={customerId}
          onChangeText={setCustomerId}
          style={styles.input}
          keyboardType="numeric"
        />
        <Button
          title={updateMutation.isPending ? 'Saving...' : 'Save changes'}
          onPress={handleSave}
          color="#841584"
          accessibilityLabel="Save order"
          disabled={updateMutation.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
});

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { ApiError } from '@/src/infrastructure/api/error';
import { useOrders } from '../hooks/useOrders';
import { updateOrder } from '../../infrastructure/ordersApi';
import { CreateOrderInput } from '../../domain/types';

type Props = {
  orderId?: number;
};

const getErrorMessage = (err: unknown) => {
  if (err instanceof ApiError) {
    const payload = err.payload;
    if (payload && typeof payload === 'object' && 'error' in payload) {
      const typedPayload = payload as { error?: unknown; details?: unknown };
      const maybeError = typedPayload.error;
      const errorMessage =
        typeof maybeError === 'string' ? maybeError : JSON.stringify(maybeError);
      if (typeof typedPayload.details === 'string' && typedPayload.details.trim()) {
        return `${errorMessage}: ${typedPayload.details}`;
      }
      return errorMessage;
    }
    if (typeof payload === 'string') {
      return payload;
    }
    return err.message;
  }

  return err instanceof Error ? err.message : 'Unknown error';
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
      Alert.alert('Update failed', getErrorMessage(err));
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
      <View style={styles.netvisorBlock}>
        <View style={styles.netvisorRow}>
          <Text style={styles.netvisorLabel}>Netvisor ID</Text>
          <Text style={styles.netvisorValue}>{order.netvisor_invoice_id ?? '-'}</Text>
        </View>
        <View style={styles.netvisorRow}>
          <Text style={styles.netvisorLabel}>Netvisor</Text>
          <Text style={styles.netvisorValue}>
            {order.netvisor_status && order.netvisor_status.trim()
              ? order.netvisor_status
              : '-'}
          </Text>
        </View>
      </View>
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
  netvisorBlock: {
    marginTop: 8,
    marginBottom: 8,
  },
  netvisorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  netvisorLabel: {
    fontWeight: '600',
  },
  netvisorValue: {
    color: '#4B5563',
  },
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

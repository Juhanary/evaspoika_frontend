import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { ApiError } from '@/src/infrastructure/api/error';
import { useNetvisorOrder, useOrder } from '../hooks/useOrders';
import { updateOrder } from '../../infrastructure/ordersApi';
import { CreateOrderInput } from '../../domain/types';
import { fetchOrderLines } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { formatKg } from '@/src/shared/utils/weight';

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
  const { data: order, isLoading, error } = useOrder(orderId);
  const queryClient = useQueryClient();
  const [orderDate, setOrderDate] = useState('');
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');

  const netvisorOrderId =
    order?.netvisor_invoice_id && order.netvisor_invoice_id.trim().length > 0
      ? order.netvisor_invoice_id.trim()
      : undefined;

  const {
    data: netvisorOrder,
    isLoading: isNetvisorOrderLoading,
    error: netvisorOrderError,
  } = useNetvisorOrder(netvisorOrderId);

  const { data: orderLines } = useQuery({
    queryKey: ['orderLines', orderId],
    queryFn: () => fetchOrderLines(orderId!),
    enabled: !!orderId,
  });

  const netvisorPayloadText = useMemo(
    () => (netvisorOrder ? JSON.stringify(netvisorOrder.response, null, 2) : null),
    [netvisorOrder]
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['netvisor', 'orders'] }),
      ]);
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

  const netvisorErrorMessage =
    netvisorOrderError instanceof Error ? netvisorOrderError.message : 'Unknown error';

  return (
    <ScrollView style={layout.screen} contentContainerStyle={styles.content}>
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

      <View style={styles.netvisorSection}>
        <Text style={styles.sectionTitle}>Netvisor order details</Text>
        {!netvisorOrderId ? (
          <Text style={styles.helperText}>Order has not been linked to Netvisor yet.</Text>
        ) : null}
        {netvisorOrderId && isNetvisorOrderLoading ? (
          <Text style={styles.helperText}>Loading Netvisor order...</Text>
        ) : null}
        {netvisorOrderId && netvisorOrderError ? (
          <Text style={styles.errorText}>Failed to load Netvisor order: {netvisorErrorMessage}</Text>
        ) : null}
        {netvisorOrder ? (
          <View style={styles.netvisorDetailsCard}>
            <View style={styles.netvisorRow}>
              <Text style={styles.netvisorLabel}>Request ID</Text>
              <Text style={styles.netvisorValue}>{netvisorOrder.requestId ?? '-'}</Text>
            </View>
            <View style={styles.netvisorRow}>
              <Text style={styles.netvisorLabel}>Transaction</Text>
              <Text style={styles.netvisorValue}>{netvisorOrder.transactionId ?? '-'}</Text>
            </View>
            {netvisorPayloadText ? (
              <View style={styles.payloadBox}>
                <Text selectable style={styles.payloadText}>
                  {netvisorPayloadText}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {orderLines && orderLines.length > 0 && (
        <View style={styles.linesSection}>
          <Text style={styles.sectionTitle}>Tilausrivit</Text>
          {orderLines.map((line) => (
            <View key={line.id} style={styles.lineCard}>
              <Text style={styles.lineProduct}>
                {line.Batch?.Product?.name ?? `Tuote #${line.BatchId}`}
              </Text>
              <Text style={styles.lineBatch}>Erä: {line.Batch?.batch_number ?? '-'}</Text>
              <Text style={styles.lineDetail}>
                Paino: {formatKg(line.sold_weight)} kg
                {line.price_per_gram != null
                  ? `  |  Hinta: ${(line.price_per_gram * 1000).toFixed(2)} €/kg`
                  : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
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
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  netvisorSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helperText: {
    color: '#4B5563',
  },
  errorText: {
    color: '#B91C1C',
  },
  netvisorDetailsCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginTop: 8,
  },
  payloadBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  payloadText: {
    color: '#F9FAFB',
    fontSize: 12,
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
  linesSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  lineCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
  },
  lineProduct: {
    fontWeight: '600',
    marginBottom: 2,
  },
  lineBatch: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 2,
  },
  lineDetail: {
    color: '#374151',
    fontSize: 13,
  },
});

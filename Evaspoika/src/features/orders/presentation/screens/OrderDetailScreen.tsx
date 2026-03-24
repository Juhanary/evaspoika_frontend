import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { components } from '@/src/shared/styles/components';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { ApiError } from '@/src/infrastructure/api/error';
import { useNetvisorOrder, useOrder } from '../hooks/useOrders';
import { updateOrder } from '../../infrastructure/ordersApi';
import { CreateOrderInput } from '../../domain/types';
import { fetchOrderLines } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { formatKg } from '@/src/shared/utils/weight';
import { routes } from '@/src/shared/navigation/routes';

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
  const router = useRouter();
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
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => router.push(routes.orderScan(orderId))}
      >
        <Text style={styles.scanBtnText}>Skannaa laatikoita</Text>
      </TouchableOpacity>

      <View style={styles.metaBlock}>
        <View style={components.metaRow}>
          <Text style={components.metaLabel}>Netvisor ID</Text>
          <Text style={components.metaValue}>{order.netvisor_invoice_id ?? '-'}</Text>
        </View>
        <View style={components.metaRow}>
          <Text style={components.metaLabel}>Netvisor</Text>
          <Text style={components.metaValue}>
            {order.netvisor_status && order.netvisor_status.trim()
              ? order.netvisor_status
              : '-'}
          </Text>
        </View>
      </View>

      <View style={styles.netvisorSection}>
        <Text style={components.sectionHeader}>Netvisor order details</Text>
        {!netvisorOrderId ? (
          <Text style={components.helperText}>Order has not been linked to Netvisor yet.</Text>
        ) : null}
        {netvisorOrderId && isNetvisorOrderLoading ? (
          <Text style={components.helperText}>Loading Netvisor order...</Text>
        ) : null}
        {netvisorOrderId && netvisorOrderError ? (
          <Text style={components.errorText}>Failed to load Netvisor order: {netvisorErrorMessage}</Text>
        ) : null}
        {netvisorOrder ? (
          <View style={components.cardWhite}>
            <View style={components.metaRow}>
              <Text style={components.metaLabel}>Request ID</Text>
              <Text style={components.metaValue}>{netvisorOrder.requestId ?? '-'}</Text>
            </View>
            <View style={components.metaRow}>
              <Text style={components.metaLabel}>Transaction</Text>
              <Text style={components.metaValue}>{netvisorOrder.transactionId ?? '-'}</Text>
            </View>
            {netvisorPayloadText ? (
              <View style={components.codeBlock}>
                <Text selectable style={components.codeText}>
                  {netvisorPayloadText}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {orderLines && orderLines.length > 0 && (
        <View style={styles.linesSection}>
          <Text style={components.sectionHeader}>Tilausrivit</Text>
          {orderLines.map((line) => (
            <View key={line.id} style={components.card}>
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
          style={components.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Status"
          value={status}
          onChangeText={setStatus}
          style={components.input}
        />
        <TextInput
          placeholder="Customer ID"
          value={customerId}
          onChangeText={setCustomerId}
          style={components.input}
          keyboardType="numeric"
        />
        <Button
          title={updateMutation.isPending ? 'Saving...' : 'Save changes'}
          onPress={handleSave}
          color={colors.purple}
          accessibilityLabel="Save order"
          disabled={updateMutation.isPending}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  metaBlock: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  netvisorSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  linesSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  form: {
    marginTop: spacing.md,
  },
  scanBtn: {
    backgroundColor: colors.success,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  scanBtnText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  lineProduct: {
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs / 2,
  },
  lineBatch: {
    color: colors.muted,
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs / 2,
  },
  lineDetail: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
});

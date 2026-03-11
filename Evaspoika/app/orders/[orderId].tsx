import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import OrderDetailScreen from '@/src/features/orders/presentation/screens/OrderDetailScreen';

export default function OrderDetailRoute() {
  const params = useLocalSearchParams();
  const rawOrderId = params.orderId;
  const orderIdValue = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const parsedOrderId = orderIdValue ? Number(orderIdValue) : NaN;
  const orderId = Number.isFinite(parsedOrderId) ? parsedOrderId : undefined;

  return <OrderDetailScreen orderId={orderId} />;
}

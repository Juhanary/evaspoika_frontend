import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import OrderDetailScreen from '@/src/features/orders/presentation/screens/OrderDetailScreen';
import { getNumberParam } from '@/src/shared/navigation/params';

export default function OrderDetailRoute() {
  const params = useLocalSearchParams();
  const orderId = getNumberParam(params.orderId);

  return <OrderDetailScreen orderId={orderId} />;
}

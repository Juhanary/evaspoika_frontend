import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BatchListScreen from '@/src/features/batches/presentation/screens/BatchListScreen';

export default function BatchesByProductRoute() {
  const params = useLocalSearchParams();
  const rawProductId = params.productId;
  const productIdValue = Array.isArray(rawProductId) ? rawProductId[0] : rawProductId;
  const parsedProductId = productIdValue ? Number(productIdValue) : NaN;
  const productId = Number.isFinite(parsedProductId) ? parsedProductId : undefined;

  return <BatchListScreen productId={productId} />;
}

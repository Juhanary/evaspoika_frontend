import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BatchListScreen from '@/src/features/batches/presentation/screens/BatchListScreen';
import { getNumberParam } from '@/src/shared/navigation/params';

export default function InventoryProductRoute() {
  const params = useLocalSearchParams();
  const productId = getNumberParam(params.productId);

  return <BatchListScreen productId={productId} />;
}

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BatchLogScreen from '@/src/features/logs/presentation/screens/BatchLogScreen';
import { getNumberParam, getSingleParam } from '@/src/shared/navigation/params';

export default function InventoryBatchRoute() {
  const params = useLocalSearchParams();
  const batchId = getNumberParam(params.batchId);
  const batchNumber = getSingleParam(params.batchNumber);

  return <BatchLogScreen batchId={batchId} batchNumber={batchNumber} />;
}

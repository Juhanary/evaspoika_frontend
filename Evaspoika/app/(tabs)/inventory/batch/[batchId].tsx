import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BatchEventsScreen from '@/src/features/batchEvents/presentation/screens/BatchEventsScreen';
import { getNumberParam, getSingleParam } from '@/src/shared/navigation/params';

export default function InventoryBatchRoute() {
  const params = useLocalSearchParams();
  const batchId = getNumberParam(params.batchId);
  const batchNumber = getSingleParam(params.batchNumber);

  return <BatchEventsScreen batchId={batchId} batchNumber={batchNumber} />;
}

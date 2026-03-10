import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BatchEventsScreen from '@/src/features/batchEvents/presentation/screens/BatchEventsScreen';

export default function BatchEventsByBatchRoute() {
  const params = useLocalSearchParams();
  const rawBatchId = params.batchId;
  const batchIdValue = Array.isArray(rawBatchId) ? rawBatchId[0] : rawBatchId;
  const parsedBatchId = batchIdValue ? Number(batchIdValue) : NaN;
  const batchId = Number.isFinite(parsedBatchId) ? parsedBatchId : undefined;
  const batchNumberParam = params.batchNumber;
  const batchNumber = Array.isArray(batchNumberParam) ? batchNumberParam[0] : batchNumberParam;

  return <BatchEventsScreen batchId={batchId} batchNumber={batchNumber} />;
}

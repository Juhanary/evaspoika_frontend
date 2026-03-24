import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ScanScreen from '@/src/features/scan/presentation/screens/ScanScreen';
import { getNumberParam } from '@/src/shared/navigation/params';

export default function ScanRoute() {
  const params = useLocalSearchParams();
  const orderId = getNumberParam(params.orderId);

  if (!orderId) {
    return null;
  }

  return <ScanScreen orderId={orderId} />;
}

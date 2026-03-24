import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import VirtualScannerScreen from '@/src/features/scan/presentation/screens/VirtualScannerScreen';
import { getNumberParam } from '@/src/shared/navigation/params';

export default function VirtualScannerRoute() {
  const params = useLocalSearchParams();
  const orderId = getNumberParam(params.orderId);

  if (!orderId) {
    return null;
  }

  return <VirtualScannerScreen orderId={orderId} />;
}

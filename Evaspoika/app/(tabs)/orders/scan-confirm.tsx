import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ScanConfirmScreen from '@/src/features/scan/presentation/screens/ScanConfirmScreen';
import { getNumberParam } from '@/src/shared/navigation/params';

export default function ScanConfirmRoute() {
  const params = useLocalSearchParams();
  const orderId = getNumberParam(params.orderId);

  if (!orderId) {
    return null;
  }

  return <ScanConfirmScreen orderId={orderId} />;
}

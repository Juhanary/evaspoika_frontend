import React from 'react';
import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Orders' }} />
      <Stack.Screen name="[orderId]" options={{ title: 'Order' }} />
      <Stack.Screen name="scan" options={{ title: 'Skannaa' }} />
      <Stack.Screen name="scan-confirm" options={{ title: 'Vahvista tilaus' }} />
      <Stack.Screen name="virtual-scanner" options={{ title: 'Virtuaaliskanneri' }} />
    </Stack>
  );
}

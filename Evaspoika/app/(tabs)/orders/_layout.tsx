import React from 'react';
import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ headerShown: false }} />
      <Stack.Screen name="[orderId]" options={{ headerShown: false }} />
    </Stack>
  );
}

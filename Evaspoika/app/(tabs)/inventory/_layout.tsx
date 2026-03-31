import React from 'react';
import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[productId]" options={{ headerShown: false }} />
      <Stack.Screen name="batch/[batchId]" options={{ headerShown: false }} />
    </Stack>
  );
}

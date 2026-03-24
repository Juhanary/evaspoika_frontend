import React from 'react';
import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Inventory' }} />
      <Stack.Screen name="[productId]" options={{ title: 'Batches' }} />
      <Stack.Screen name="batch/[batchId]" options={{ title: 'Batch Events' }} />
    </Stack>
  );
}

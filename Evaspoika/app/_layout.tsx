import React from 'react';
import { Stack } from 'expo-router';
import { QueryProvider } from '@/src/providers/QueryProvider';

export default function Layout() {
  return (
    <QueryProvider>
      <Stack screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="products/index" options={{ title: 'Products' }} />
        <Stack.Screen name="batches/index" options={{ title: 'Batches' }} />
        <Stack.Screen name="batches/[productId]" options={{ title: 'Batches' }} />
        <Stack.Screen name="batch-events/index" options={{ title: 'Batch Events' }} />
        <Stack.Screen name="batch-events/[batchId]" options={{ title: 'Baaaaatch Events' }} />
        <Stack.Screen name="orders/index" options={{ title: 'Orders' }} />
        <Stack.Screen name="customers/index" options={{ title: 'Customers' }} />
      </Stack>
    </QueryProvider>
  );
}
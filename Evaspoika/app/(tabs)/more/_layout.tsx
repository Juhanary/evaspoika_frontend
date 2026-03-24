import React from 'react';
import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'More' }} />
      <Stack.Screen name="customers" options={{ title: 'Customers' }} />
      <Stack.Screen name="logs" options={{ title: 'Tapahtumaloki' }} />
    </Stack>
  );
}

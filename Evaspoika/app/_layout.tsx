import React from 'react';
import { Stack } from 'expo-router';
import { QueryProvider } from '@/src/providers/QueryProvider';

export default function Layout() {
  return (
    <QueryProvider>
      <Stack screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modals/modal"
          options={{
            presentation: 'modal',
            title: 'Modal',
          }}
        />
      </Stack>
    </QueryProvider>
  );
}

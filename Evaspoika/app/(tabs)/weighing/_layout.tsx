import React from 'react';
import { Stack } from 'expo-router';

export default function WeighingLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Punnitus' }} />
    </Stack>
  );
}

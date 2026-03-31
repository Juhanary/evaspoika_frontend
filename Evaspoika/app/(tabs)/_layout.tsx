import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" options={{ headerShown: false, href: null }} />
      <Tabs.Screen name="orders" options={{ headerShown: false }} />
      <Tabs.Screen name="inventory" options={{ headerShown: false }} />
      <Tabs.Screen name="weighing" options={{ headerShown: false, href: null }} />
      <Tabs.Screen name="more" options={{ headerShown: false, href: null }} />
      <Tabs.Screen name="logs" options={{ headerShown: false, title: 'Loki' }} />
    </Tabs>
  );
}

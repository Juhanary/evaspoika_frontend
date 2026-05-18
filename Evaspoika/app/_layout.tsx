import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '@/src/providers/QueryProvider';
import { ErrorBoundary } from '@/src/shared/ui/ErrorBoundary/ErrorBoundary';
import {
  useFonts,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { loadSettings } from '@/src/config/settingsStore';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    loadSettings().finally(() => setSettingsLoaded(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && settingsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, settingsLoaded]);

  if ((!fontsLoaded && !fontError) || !settingsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryProvider>
        <ErrorBoundary>
          <Stack screenOptions={{ headerTitleAlign: 'center' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ErrorBoundary>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

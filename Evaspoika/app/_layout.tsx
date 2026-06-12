import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ScreenOrientation from 'expo-screen-orientation';
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

SplashScreen.preventAutoHideAsync();
ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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

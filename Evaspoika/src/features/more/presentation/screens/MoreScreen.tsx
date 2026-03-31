import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { routes } from '@/src/shared/navigation/routes';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { homeStyles } from '@/src/shared/styles/home';
import { GlassNavButton } from '@/src/shared/ui/GlassNavButton/GlassNavButton';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <ScreenLayout title="LISÄÄ">
      <View style={homeStyles.topArea}>
        <View style={homeStyles.btnGroup}>
          <GlassNavButton
            label="ASIAKKAAT"
            onPress={() => router.push(routes.moreCustomers)}
          />
          <GlassNavButton
            label="TAPAHTUMAT"
            onPress={() => router.push(routes.moreLogs)}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

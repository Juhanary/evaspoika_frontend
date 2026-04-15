import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { routes } from '@/src/shared/navigation/routes';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { homeStyles } from '@/src/shared/styles/home';
import { Button } from '@/src/shared/ui/Button/ActionButton';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <ScreenLayout title="LISÄÄ">
      <View style={homeStyles.topArea}>
        <View style={homeStyles.btnGroup}>
          <Button
            label="ASIAKKAAT"
            onPress={() => router.push(routes.moreCustomers)}
            variant="glassNav"
          />
          <Button
            label="TAPAHTUMAT"
            onPress={() => router.push(routes.moreLogs)}
            variant="glassNav"
          />
        </View>
      </View>
    </ScreenLayout>
  );
}

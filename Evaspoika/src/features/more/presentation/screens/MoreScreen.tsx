import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { layout } from '@/src/shared/styles/layout';
import { CustomButton } from '@/src/shared/ui/Button/CustomButton';
import { routes } from '@/src/shared/navigation/routes';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>More</Text>
      <Text>Secondary tools and directories.</Text>

      <View style={layout.section} />

      <CustomButton label="Customers" onPress={() => router.push(routes.moreCustomers)} />
      <CustomButton label="Event log" onPress={() => router.push(routes.moreLogs)} />
    </View>
  );
}

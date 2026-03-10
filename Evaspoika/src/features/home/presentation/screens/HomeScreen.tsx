import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomButton } from '@/src/shared/ui/Button/CustomButton';
import { layout } from '@/src/shared/styles/layout';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={layout.screen}>
      <View style={layout.section}>
        <Text style={layout.title}>Warehouse Dashboard</Text>
        <Text>Choose a section to get started.</Text>
      </View>

      <CustomButton label="Tuotteet" onPress={() => router.push('/products')} />
      <CustomButton label="Orders" onPress={() => router.push('/orders')} />
    </ScrollView>
  );
}
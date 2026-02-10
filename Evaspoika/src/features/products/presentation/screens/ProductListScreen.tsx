import React, { useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../../domain/types';
import { createProduct } from '../../infrastructure/productsApi';

function renderItem({ item }: { item: Product }) {
  return (
    <View style={layout.listItem}>
      <Text style={layout.listItemTitle}>{item.name}</Text>
      <Text style={layout.listItemSubtitle}>Price: {item.price_per_kg}</Text>
    </View>
  );
}

export default function ProductListScreen() {
  const { data, isLoading, error } = useProducts();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [ean, setEan] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleAddNew = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Puuttuvat tiedot', 'Tuotteen nimi on pakollinen.');
      return;
    }
    const parsedPrice = Number(pricePerKg);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      Alert.alert('Virheellinen hinta', 'Anna hinta kilogrammaa kohden numerona.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: trimmedName,
        ean: ean.trim() || null,
        price_per_kg: Math.round(parsedPrice),
      });
      setName('');
      setEan('');
      setPricePerKg('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Tuotteen lisäys epäonnistui', message);
    }
  };

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load products: {message}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Products</Text>
      <View style={styles.form}>
        <TextInput
          placeholder="Tuotteen nimi"
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="sentences"
          autoCorrect
        />
        <TextInput
          placeholder="EAN (valinnainen)"
          value={ean}
          onChangeText={setEan}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Hinta / kg"
          value={pricePerKg}
          onChangeText={setPricePerKg}
          style={styles.input}
          keyboardType="numeric"
        />
        <Button
          onPress={handleAddNew}
          title={createMutation.isPending ? 'Lisätään...' : 'Lisää tuote'}
          color="#841584"
          accessibilityLabel="Lisää uusi tuote"
          disabled={createMutation.isPending}
        />
      </View>
     
      <FlatList data={data ?? []} renderItem={renderItem} keyExtractor={(item) => String(item.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
});

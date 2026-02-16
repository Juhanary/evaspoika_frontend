import React, { useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { useBatches } from '../hooks/useBatches';
import { Batch } from '../../domain/types';
import { createBatch } from '../../infrastructure/batchesApi';

function renderItem({ item }: { item: Batch }) {
  return (
    <View style={layout.listItem}>
      <Text style={layout.listItemTitle}>Batch: {item.batch_number}</Text>
      <Text style={layout.listItemSubtitle}>Current weight: {item.current_weight}</Text>
    </View>
  );
}

export default function BatchListScreen() {
  const { data, isLoading, error } = useBatches();
  const queryClient = useQueryClient();
  const [batchNumber, setBatchNumber] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [bestBefore, setBestBefore] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [productId, setProductId] = useState('');
  const createMutation = useMutation({
    mutationFn: createBatch,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  const handleAddNew = async () => {
    const trimmedBatchNumber = batchNumber.trim();
    if (!trimmedBatchNumber) {
      Alert.alert('Missing data', 'Batch number is required.');
      return;
    }

    const parsedProductId = Number(productId);
    if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
      Alert.alert('Invalid product', 'Product ID must be a positive integer.');
      return;
    }

    const parsedInitialWeight = Number(initialWeight);
    if (!Number.isFinite(parsedInitialWeight) || parsedInitialWeight < 0) {
      Alert.alert('Invalid weight', 'Initial weight must be a non-negative number.');
      return;
    }

    const trimmedCurrentWeight = currentWeight.trim();
    const parsedCurrentWeight =
      trimmedCurrentWeight.length === 0 ? parsedInitialWeight : Number(trimmedCurrentWeight);
    if (!Number.isFinite(parsedCurrentWeight) || parsedCurrentWeight < 0) {
      Alert.alert('Invalid weight', 'Current weight must be a non-negative number.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        batch_number: trimmedBatchNumber,
        production_date: productionDate.trim() || null,
        best_before: bestBefore.trim() || null,
        initial_weight: parsedInitialWeight,
        current_weight: parsedCurrentWeight,
        ProductId: parsedProductId,
      });
      setBatchNumber('');
      setProductionDate('');
      setBestBefore('');
      setInitialWeight('');
      setCurrentWeight('');
      setProductId('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Failed to add batch', message);
    }
  };

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading batches...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load batches: {message}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      <Text style={layout.title}>Batches</Text>
      <View style={styles.form}>
        <TextInput
          placeholder="Batch number"
          value={batchNumber}
          onChangeText={setBatchNumber}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Product ID"
          value={productId}
          onChangeText={setProductId}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Production date (YYYY-MM-DD)"
          value={productionDate}
          onChangeText={setProductionDate}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Best before (YYYY-MM-DD)"
          value={bestBefore}
          onChangeText={setBestBefore}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Initial weight"
          value={initialWeight}
          onChangeText={setInitialWeight}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Current weight (optional)"
          value={currentWeight}
          onChangeText={setCurrentWeight}
          style={styles.input}
          keyboardType="numeric"
        />
        <Button
          onPress={handleAddNew}
          title={createMutation.isPending ? 'Adding...' : 'Add batch'}
          color="#841584"
          accessibilityLabel="Add new batch"
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

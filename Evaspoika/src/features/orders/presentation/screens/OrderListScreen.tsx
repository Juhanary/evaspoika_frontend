import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { layout } from '@/src/shared/styles/layout';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { ApiError } from '@/src/infrastructure/api/error';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { Batch } from '@/src/features/batches/domain/types';
import { ProductList } from '@/src/shared/ui/ProductList/ProductList';
import { BatchCard, BatchSelection } from '@/src/shared/ui/BatchCard/BatchCard';
import {
  formatKg,
  GRAMS_PER_KG,
  parseWeightToGrams,
  MIN_REMAINING_GRAMS
} from '@/src/shared/utils/weight';
import { createOrder } from '../../infrastructure/ordersApi';
import { createOrderLine } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { CreateOrderLineInput } from '@/src/features/orderLines/domain/types';

type AllocationMode = 'manual' | 'auto';

type OrderLineDraft = Omit<CreateOrderLineInput, 'orderId'>;


const getErrorMessage = (err: unknown) => {
  if (err instanceof ApiError) {
    const payload = err.payload;
    if (payload && typeof payload === 'object' && 'error' in payload) {
      const maybeError = (payload as { error?: unknown }).error;
      if (typeof maybeError === 'string') {
        return maybeError;
      }
      return JSON.stringify(maybeError);
    }
    if (typeof payload === 'string') {
      return payload;
    }
    return err.message;
  }

  return err instanceof Error ? err.message : 'Unknown error';
};

const sortBatchesByOldest = (a: Batch, b: Batch) => {
  const dateA = a.production_date ? Date.parse(a.production_date) : Number.NaN;
  const dateB = b.production_date ? Date.parse(b.production_date) : Number.NaN;
  if (Number.isFinite(dateA) && Number.isFinite(dateB)) {
    return dateA - dateB;
  }
  if (Number.isFinite(dateA)) {
    return -1;
  }
  if (Number.isFinite(dateB)) {
    return 1;
  }
  return a.id - b.id;
};

type AutoAllocation = {
  allocations: { batchId: number; sold_weight: number }[];
  error?: string;
};

const buildAutoAllocation = (totalGrams: number, candidates: Batch[]): AutoAllocation => {
  if (!Number.isFinite(totalGrams) || totalGrams <= 0) {
    return { allocations: [], error: 'Invalid total weight.' };
  }

  const availableTotal = candidates.reduce(
    (sum, batch) => sum + Math.max(0, Number(batch.current_weight) || 0),
    0
  );
  if (totalGrams > availableTotal) {
    return {
      allocations: [],
      error: `Ei tarpeeksi varastossa. ${formatKg(availableTotal)} kg.`,
    };
  }

  const sortedCandidates = [...candidates].sort(sortBatchesByOldest);
  let remaining = totalGrams;
  const allocations: { batchId: number; sold_weight: number }[] = [];

  for (const batch of sortedCandidates) {
    if (remaining <= 0) {
      break;
    }
    const availableWeight = Math.max(0, Number(batch.current_weight) || 0);
    if (availableWeight <= 0) {
      continue;
    }

    if (remaining >= availableWeight) {
      allocations.push({ batchId: batch.id, sold_weight: availableWeight });
      remaining -= availableWeight;
      continue;
    }

    const leftover = availableWeight - remaining;
    if (leftover > 0 && leftover < MIN_REMAINING_GRAMS) {
      return {
        allocations: [],
        error: `Automaatti jättää alle 500g erään. ${batch.batch_number}. Muuta manutaalisesti`,
      };
    }

    allocations.push({ batchId: batch.id, sold_weight: remaining });
    remaining = 0;
  }

  if (allocations.length === 0) {
    return { allocations: [], error: 'Unable to allocate weight across batches.' };
  }

  return { allocations };
};

export default function OrderScreen() {
  const queryClient = useQueryClient();
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const { data: batches, isLoading: batchesLoading, error: batchesError } = useBatches();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [allocationMode, setAllocationMode] = useState<AllocationMode>('manual');
  const [totalWeight, setTotalWeight] = useState('');
  const [batchSelections, setBatchSelections] = useState<Record<number, BatchSelection>>({});
  const [autoAllocationError, setAutoAllocationError] = useState<string | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
  });

  const createOrderLineMutation = useMutation({
    mutationFn: createOrderLine,
  });

  const isSubmitting = createOrderMutation.isPending || createOrderLineMutation.isPending;

  useEffect(() => {
    setBatchSelections({});
    setTotalWeight('');
    setAutoAllocationError(null);
  }, [selectedProductId]);

  const selectedProduct = useMemo(
    () => (products ?? []).find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const productBatches = useMemo(() => {
    if (!selectedProductId) {
      return [];
    }

    return (batches ?? []).filter((batch) => batch.ProductId === selectedProductId);
  }, [batches, selectedProductId]);

  const availableTotal = useMemo(
    () =>
      productBatches.reduce((sum, batch) => {
        const weight = Number(batch.current_weight);
        return Number.isFinite(weight) ? sum + weight : sum;
      }, 0),
    [productBatches]
  );

  const selectedBatches = useMemo(
    () => productBatches.filter((batch) => batchSelections[batch.id]?.selected),
    [productBatches, batchSelections]
  );

  const selectedTotal = useMemo(
    () =>
      selectedBatches.reduce((sum, batch) => {
        const rawWeight = batchSelections[batch.id]?.weight ?? '';
        const parsedWeight = parseWeightToGrams(rawWeight);
        return Number.isFinite(parsedWeight) ? sum + parsedWeight : sum;
      }, 0),
    [selectedBatches, batchSelections]
  );

  const selectedBatchIdsKey = useMemo(() => {
    if (selectedBatches.length === 0) {
      return '';
    }
    return selectedBatches.map((batch) => batch.id).join(',');
  }, [selectedBatches]);

  const toggleBatchSelection = (batchId: number) => {
    setBatchSelections((prev) => {
      const current = prev[batchId];
      return {
        ...prev,
        [batchId]: {
          selected: !(current?.selected ?? false),
          weight: current?.weight ?? '',
        },
      };
    });
  };

  const updateBatchWeight = (batchId: number, value: string) => {
    setBatchSelections((prev) => ({
      ...prev,
      [batchId]: {
        selected: true,
        weight: value,
      },
    }));
    if (allocationMode === 'auto') {
      setAutoAllocationError(null);
    }
  };

  useEffect(() => {
    if (allocationMode !== 'auto') {
      setAutoAllocationError(null);
      return;
    }

    const parsedTotal = parseWeightToGrams(totalWeight);
    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
      setAutoAllocationError(null);
      return;
    }

    const selectedIds = selectedBatchIdsKey
      ? selectedBatchIdsKey.split(',').map((id) => Number(id)).filter(Number.isFinite)
      : [];
    const selectedSet = new Set(selectedIds);
    const candidates =
      selectedIds.length > 0
        ? productBatches.filter((batch) => selectedSet.has(batch.id))
        : productBatches;

    if (candidates.length === 0) {
      setAutoAllocationError('No batches available for allocation.');
      return;
    }

    const { allocations, error } = buildAutoAllocation(parsedTotal, candidates);
    if (error) {
      setAutoAllocationError(error);
      return;
    }

    setAutoAllocationError(null);
    const allocationById = new Map<number, number>(
      allocations.map((allocation) => [allocation.batchId, allocation.sold_weight])
    );
    const selectOnlyUsed = selectedIds.length === 0;

    setBatchSelections((prev) => {
      const next = { ...prev };
      for (const batch of candidates) {
        const allocated = allocationById.get(batch.id);
        if (allocated && allocated > 0) {
          next[batch.id] = { selected: true, weight: formatKg(allocated) };
          continue;
        }

        if (selectOnlyUsed) {
          next[batch.id] = { selected: false, weight: '' };
        } else if (next[batch.id]?.selected) {
          next[batch.id] = { selected: true, weight: '' };
        }
      }
      return next;
    });
  }, [allocationMode, totalWeight, selectedBatchIdsKey, productBatches]);

  const handleCreateOrder = async () => {
    if (!selectedProduct) {
      Alert.alert('Missing product', 'Select a product before creating an order.');
      return;
    }

    const pricePerKg = Number(selectedProduct.price_per_kg);
    if (!Number.isFinite(pricePerKg) || pricePerKg < 0) {
      Alert.alert('Invalid price', 'Product price must be a non-negative number.');
      return;
    }
    const pricePerGram = pricePerKg / GRAMS_PER_KG;

    if (productBatches.length === 0) {
      Alert.alert('No batches', 'This product does not have any batches.');
      return;
    }

    if (selectedBatches.length === 0) {
      if (allocationMode === 'auto' && autoAllocationError) {
        Alert.alert('Auto allocation error', `${autoAllocationError} Adjust manually.`);
        return;
      }
      Alert.alert('Select batches', 'Choose at least one batch to create an order line.');
      return;
    }

    const lines: OrderLineDraft[] = [];
    for (const batch of selectedBatches) {
      const rawWeight = batchSelections[batch.id]?.weight ?? '';
      const parsedWeight = parseWeightToGrams(rawWeight);
      if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
        Alert.alert('Invalid weight', `Enter a valid weight for batch ${batch.batch_number}.`);
        return;
      }
      if (parsedWeight > batch.current_weight) {
        Alert.alert(
          'Not enough stock',
          `Batch ${batch.batch_number} has only ${formatKg(batch.current_weight)} kg available.`
        );
        return;
      }

      lines.push({
        batchId: batch.id,
        sold_weight: parsedWeight,
        price_per_gram: pricePerGram,
      });
    }

    try {
      const order = await createOrderMutation.mutateAsync({});
      for (const line of lines) {
        await createOrderLineMutation.mutateAsync({ ...line, orderId: order.id });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['batches'] }),
      ]);

      Alert.alert('Order created', `Order #${order.id} was created.`);
      setBatchSelections({});
      setTotalWeight('');
      setAllocationMode('manual');
    } catch (err) {
      Alert.alert('Failed to create order', getErrorMessage(err));
    }
  };

  if (!selectedProductId) {
    return (
      <ProductList
        products={products ?? []}
        isLoading={productsLoading}
        error={productsError}
        onSelect={(product) => setSelectedProductId(product.id)}
      />
    );
  }

  if (!selectedProduct) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Selected product not found.</Text>
      </View>
    );
  }

  if (batchesLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Loading batches...</Text>
      </View>
    );
  }

  if (batchesError) {
    const message = batchesError instanceof Error ? batchesError.message : 'Unknown error';
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Failed to load batches: {message}</Text>
      </View>
    );
  }

  const renderBatchItem = ({ item }: { item: Batch }) => (
    <BatchCard
      batch={item}
      selection={batchSelections[item.id]}
      onToggle={toggleBatchSelection}
      onWeightChange={updateBatchWeight}
      isSubmitting={isSubmitting}
    />
  );

  const listHeader = (
    <View>
      <Text style={layout.title}>Create order</Text>
      <Text style={styles.subtitle}>
        Product: {selectedProduct.name} | Price: {selectedProduct.price_per_kg} / kg
      </Text>
      <View style={styles.buttonRow}>
        <Button title="Change product" onPress={() => setSelectedProductId(null)} color="#841584" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Allocation mode</Text>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setAllocationMode('manual')}
            style={[
              styles.toggleButton,
              styles.toggleButtonLeft,
              allocationMode === 'manual' && styles.toggleButtonActive,
            ]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.toggleButtonText,
                allocationMode === 'manual' && styles.toggleButtonTextActive,
              ]}
            >
              Manual batches
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAllocationMode('auto')}
            style={[
              styles.toggleButton,
              allocationMode === 'auto' && styles.toggleButtonActive,
            ]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.toggleButtonText,
                allocationMode === 'auto' && styles.toggleButtonTextActive,
              ]}
            >
              Total weight
            </Text>
          </Pressable>
        </View>

        {allocationMode === 'auto' && (
          <TextInput
            placeholder="Total weight (kg)"
            value={totalWeight}
            onChangeText={setTotalWeight}
            style={styles.totalInput}
            keyboardType="numeric"
            editable={!isSubmitting}
          />
        )}

        <Text style={styles.helperText}>
          Available across batches: {formatKg(availableTotal)} kg
        </Text>
        {allocationMode === 'auto' && autoAllocationError && (
          <Text style={styles.errorText}>{autoAllocationError}</Text>
        )}
        {allocationMode === 'auto' && (
          <Text style={styles.helperText}>
            If no batches are selected, all batches will be used.
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Batches</Text>
    </View>
  );

  const listFooter = (
    <View style={styles.footer}>
      {selectedBatches.length > 0 && (
        <Text style={styles.helperText}>Selected total: {formatKg(selectedTotal)} kg</Text>
      )}
      <Button
        title={isSubmitting ? 'Creating order...' : 'Create order'}
        onPress={handleCreateOrder}
        color="#841584"
        accessibilityLabel="Create order"
        disabled={isSubmitting || productBatches.length === 0}
      />
    </View>
  );

  return (
    <View style={layout.screen}>
      <FlatList
        data={productBatches}
        renderItem={renderBatchItem}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={<Text style={styles.emptyText}>No batches available.</Text>}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  toggleButtonLeft: {
    marginRight: spacing.sm,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  helperText: {
    color: colors.muted,
    fontSize: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  buttonRow: {
    marginBottom: spacing.md,
  },
  totalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.sm,
    backgroundColor: '#fff',
  },
  footer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  emptyText: {
    color: colors.muted,
    marginBottom: spacing.md,
  },
});

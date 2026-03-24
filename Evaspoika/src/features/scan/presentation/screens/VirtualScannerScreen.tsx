import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { fetchBoxes } from '../../infrastructure/scanApi';
import { scanStore } from '../../scanStore';
import { ScanPreviewItem, VirtualBox } from '../../domain/types';
import { formatKg } from '@/src/shared/utils/weight';
import { routes } from '@/src/shared/navigation/routes';

type Props = { orderId: number };

export default function VirtualScannerScreen({ orderId }: Props) {
  const router = useRouter();
  const { data: boxes, isLoading, error } = useQuery({
    queryKey: ['scan-boxes'],
    queryFn: fetchBoxes,
  });
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleBox = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDone = () => {
    if (!boxes) return;
    const selectedBoxes = boxes.filter(b => selected.has(b.id));

    // Group by batch
    const byBatch = new Map<number, VirtualBox[]>();
    for (const box of selectedBoxes) {
      const arr = byBatch.get(box.BatchId) ?? [];
      arr.push(box);
      byBatch.set(box.BatchId, arr);
    }

    const items: ScanPreviewItem[] = Array.from(byBatch.entries()).map(([batchId, bxs]) => {
      const b = bxs[0].Batch;
      return {
        batchId,
        batchNumber: b.batch_number,
        productName: b.Product.name,
        pricePerKg: b.Product.price_per_kg,
        boxes: bxs.map(bx => ({ id: bx.id, weight: bx.weight })),
        totalWeight: bxs.reduce((s, bx) => s + bx.weight, 0),
      };
    });

    scanStore.set(orderId, items);
    router.push(routes.orderScanConfirm(orderId));
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Virhe: {error instanceof Error ? error.message : 'Tuntematon'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Valitse laatikot</Text>
      <Text style={styles.hint}>Napauta laatikoita lisätäksesi tilaukseen ({selected.size} valittu)</Text>

      <FlatList
        data={boxes ?? []}
        keyExtractor={item => String(item.id)}
        style={styles.list}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggleBox(item.id)}
            >
              <View style={styles.cardRow}>
                <View style={styles.cardLeft}>
                  <Text style={styles.productName}>{item.Batch.Product.name}</Text>
                  <Text style={styles.batchText}>Erä {item.Batch.batch_number}</Text>
                  <Text style={styles.weightText}>{formatKg(item.weight)} kg</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Ei laatikoita varastossa.</Text>}
      />

      <TouchableOpacity
        style={[styles.doneBtn, selected.size === 0 && styles.disabled]}
        onPress={handleDone}
        disabled={selected.size === 0}
      >
        <Text style={styles.doneBtnText}>Vahvista ({selected.size} kpl) →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  hint: { color: '#6B7280', fontSize: 13, marginBottom: 12 },
  list: { flex: 1 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardLeft: { flex: 1 },
  productName: { fontWeight: '600', fontSize: 15 },
  batchText: { color: '#6B7280', fontSize: 13 },
  weightText: { color: '#374151', fontSize: 14, marginTop: 2 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
  checkmark: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 32 },
  doneBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  errorText: { color: '#B91C1C' },
});

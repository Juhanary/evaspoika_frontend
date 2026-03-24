import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { scanStore } from '../../scanStore';
import { confirmScan } from '../../infrastructure/scanApi';
import { ScanPreviewItem } from '../../domain/types';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { formatKg } from '@/src/shared/utils/weight';
import { layout } from '@/src/shared/styles/layout';
import { components } from '@/src/shared/styles/components';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { routes } from '@/src/shared/navigation/routes';

type Props = { orderId: number };

type LineState = ScanPreviewItem & {
  selectedBatchId: number;
  selectedBatchNumber: string;
  weightKg: string;
};

const gramsToKgStr = (g: number) => (g / 1000).toFixed(3);
const kgStrToGrams = (s: string) => Math.round(parseFloat(s.replace(',', '.')) * 1000);

export default function ScanConfirmScreen({ orderId }: Props) {
  const router = useRouter();
  const { data: allBatches } = useBatches();
  const [lines, setLines] = useState<LineState[]>(() =>
    scanStore.getItems().map((item) => ({
      ...item,
      selectedBatchId: item.batchId,
      selectedBatchNumber: item.batchNumber,
      weightKg: gramsToKgStr(item.totalWeight),
    }))
  );
  const [loading, setLoading] = useState(false);
  const [batchPickerFor, setBatchPickerFor] = useState<number | null>(null);

  const updateWeight = (index: number, value: string) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, weightKg: value } : l)));
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const pickBatch = (index: number, batchId: number, batchNumber: string) => {
    setLines((prev) =>
      prev.map((l, i) =>
        i === index
          ? { ...l, selectedBatchId: batchId, selectedBatchNumber: batchNumber }
          : l
      )
    );
    setBatchPickerFor(null);
  };

  const batchesForPicker = useMemo(() => {
    if (batchPickerFor == null || !allBatches) return [];
    const productId = lines[batchPickerFor]?.productId;
    return allBatches.filter(
      (b) => b.ProductId === productId && !b.deleted_at && b.current_weight > 0
    );
  }, [batchPickerFor, allBatches, lines]);

  const handleConfirm = async () => {
    if (lines.length === 0) {
      Alert.alert('Tyhjä', 'Ei rivejä vahvistettavaksi.');
      return;
    }
    for (const line of lines) {
      const g = kgStrToGrams(line.weightKg);
      if (!isFinite(g) || g <= 0) {
        Alert.alert('Virheellinen paino', `Tarkista paino: ${line.productName}`);
        return;
      }
    }
    setLoading(true);
    try {
      const confirmLines = lines.map((line) => {
        const soldWeight = kgStrToGrams(line.weightKg);
        const boxIds = line.selectedBatchId === line.batchId
          ? line.boxes.map((b) => b.id)
          : [];
        return {
          batchId: line.selectedBatchId,
          boxIds,
          soldWeight,
          pricePerGram: Math.round(line.pricePerKg),
        };
      });
      await confirmScan(orderId, confirmLines);
      scanStore.clear();
      Alert.alert('Valmis', `${confirmLines.length} rivi lisätty tilaukseen.`, [
        { text: 'OK', onPress: () => router.push(routes.orderDetail(orderId)) },
      ]);
    } catch (err) {
      Alert.alert('Virhe', err instanceof Error ? err.message : 'Vahvistus epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const totalWeight = lines.reduce((s, l) => {
    const g = kgStrToGrams(l.weightKg);
    return s + (isFinite(g) ? g : 0);
  }, 0);

  return (
    <View style={layout.screen}>
      <Text style={layout.screenTitle}>Vahvista tilaus #{orderId}</Text>

      <FlatList
        data={lines}
        keyExtractor={(_, i) => String(i)}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <View style={components.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.productName}>{item.productName}</Text>
              <TouchableOpacity onPress={() => removeLine(index)}>
                <Text style={components.dangerText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.batchRow}
              onPress={() => setBatchPickerFor(index)}
            >
              <Text style={styles.batchLabel}>Erä: </Text>
              <Text style={styles.batchValue}>{item.selectedBatchNumber}</Text>
              <Text style={styles.batchChange}> (vaihda ▾)</Text>
            </TouchableOpacity>

            <View style={styles.weightRow}>
              <Text style={styles.weightLabel}>Paino (kg):</Text>
              <TextInput
                style={styles.weightInput}
                value={item.weightKg}
                onChangeText={(v) => updateWeight(index, v)}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>

            <Text style={styles.priceText}>
              {(item.pricePerKg / 1000).toFixed(2)} €/kg · {item.boxes.length} ltk
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={components.emptyText}>Ei rivejä.</Text>}
      />

      <View style={components.footer}>
        <Text style={styles.total}>Yhteensä: {formatKg(totalWeight)} kg</Text>
        <TouchableOpacity
          style={[components.confirmBtn, (loading || lines.length === 0) && layout.disabled]}
          onPress={handleConfirm}
          disabled={loading || lines.length === 0}
        >
          <Text style={components.confirmBtnText}>
            {loading ? 'Tallennetaan...' : 'Tallenna tilaus'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={batchPickerFor != null}
        transparent
        animationType="slide"
        onRequestClose={() => setBatchPickerFor(null)}
      >
        <View style={components.modalOverlay}>
          <View style={components.modalCard}>
            <Text style={components.modalTitle}>Valitse erä</Text>
            {batchesForPicker.length === 0 ? (
              <Text style={components.modalEmpty}>Ei saatavilla olevia eriä.</Text>
            ) : (
              batchesForPicker.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={components.modalRow}
                  onPress={() => pickBatch(batchPickerFor!, b.id, b.batch_number)}
                >
                  <Text style={components.modalRowText}>
                    Erä {b.batch_number} — {formatKg(b.current_weight)} kg jäljellä
                  </Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={components.modalCancelBtn}
              onPress={() => setBatchPickerFor(null)}
            >
              <Text style={components.modalCancelText}>Peruuta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  productName: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
    flex: 1,
  },
  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  batchLabel: {
    color: colors.muted,
    fontSize: typography.sizes.md,
  },
  batchValue: {
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.md,
  },
  batchChange: {
    color: colors.primary,
    fontSize: typography.sizes.md,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  weightLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    marginRight: spacing.sm,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    fontSize: typography.sizes.xl,
    minWidth: 90,
    backgroundColor: colors.white,
  },
  priceText: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
  },
  total: {
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.sm + 2,
  },
});

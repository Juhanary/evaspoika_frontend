import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRefreshAll } from '@/src/shared/hooks/useRefreshAll';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { useBatchEvents } from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { submitWeighing } from '../../infrastructure/weighingApi';
import { layout } from '@/src/shared/styles/layout';
import { components } from '@/src/shared/styles/components';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { Product } from '@/src/features/products/domain/types';
import { BatchLog } from '@/src/features/batchEvents/domain/types';
import { formatKg } from '@/src/shared/utils/weight';

const EVENT_LABELS: Record<string, string> = {
  CREATE: 'Luotu',
  WEIGHING: 'Punnitus',
  SALE: 'Myynti',
  ADJUSTMENT: 'Korjaus',
  INVENTORY: 'Inventaario',
  DELETE: 'Poistettu',
};

const today = () => new Date().toISOString().slice(0, 10);

const generateEan = () => Math.floor(10000 + Math.random() * 90000).toString();

type WeighingMode =
  | { type: 'idle' }
  | { type: 'existing'; product: Product }
  | { type: 'new' };

export default function WeighingScreen() {
  const { data: products } = useProducts();
  const { data: batches } = useBatches();
  const { data: events } = useBatchEvents();

  const [mode, setMode] = useState<WeighingMode>({ type: 'idle' });
  const [ean, setEan] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const { refreshing, onRefresh, withRefresh } = useRefreshAll();
  const weightRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const selectProduct = useCallback((product: Product) => {
    setMode({ type: 'existing', product });
    setEan(product.ean ?? '');
    setWeightInput('');
    setTimeout(() => weightRef.current?.focus(), 100);
  }, []);

  const startNewProduct = useCallback(() => {
    setMode({ type: 'new' });
    setEan(generateEan());
    setNewName('');
    setNewPrice('');
    setWeightInput('');
    setTimeout(() => nameRef.current?.focus(), 100);
  }, []);

  const handleReset = useCallback(() => {
    setMode({ type: 'idle' });
    setEan('');
    setNewName('');
    setNewPrice('');
    setWeightInput('');
  }, []);

  const activeProduct = mode.type === 'existing' ? mode.product : null;

  const currentBatch = useMemo(() => {
    if (!activeProduct?.id) return null;
    const t = today();
    return (
      (batches ?? []).find(
        (b) => b.ProductId === activeProduct.id && b.production_date === t && !b.deleted_at
      ) ?? null
    );
  }, [batches, activeProduct]);

  const allProductBatches = useMemo(() => {
    if (!activeProduct?.id) return [];
    return (batches ?? []).filter(
      (b) => b.ProductId === activeProduct.id && !b.deleted_at
    );
  }, [batches, activeProduct]);

  const recentEvents = useMemo(() => {
    if (!allProductBatches.length || !events) return [];
    const batchIds = new Set(allProductBatches.map((b) => b.id));
    return events.filter((e) => batchIds.has(e.BatchId)).slice(0, 30);
  }, [events, allProductBatches]);

  const handleWeigh = () => {
    const eanTrimmed = ean.trim();
    if (!eanTrimmed) {
      Alert.alert('Virhe', 'EAN-koodi puuttuu');
      return;
    }
    if (mode.type === 'new' && !newName.trim()) {
      Alert.alert('Virhe', 'Syötä tuotteen nimi');
      return;
    }
    const weightKg = parseFloat(weightInput.replace(',', '.'));
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      Alert.alert('Virhe', 'Syötä kelvollinen paino (kg)');
      return;
    }

    const name = activeProduct?.name ?? newName.trim();
    const price =
      activeProduct?.price_per_kg ?? (parseFloat(newPrice.replace(',', '.')) || 0);

    withRefresh(async () => {
      const result = await submitWeighing({ ean: eanTrimmed, name, pricePerKg: price, weightKg });
      handleReset();
      const msg = result.productCreated
        ? `Uusi tuote ja erä luotu.\nLisätään Netvisoriin...\nPaino: ${formatKg(result.current_weight)} kg`
        : result.action === 'created'
          ? `Uusi erä luotu. Paino: ${formatKg(result.current_weight)} kg`
          : `Erä päivitetty. Kokonaispaino: ${formatKg(result.current_weight)} kg`;
      Alert.alert('Punnitus tallennettu', msg);
    }).catch((err) => {
      Alert.alert('Virhe', err instanceof Error ? err.message : 'Punnitus epäonnistui');
    });
  };

  const renderEvent = ({ item }: { item: BatchLog }) => {
    const label = EVENT_LABELS[item.event_code] ?? item.event_code;
    const dateStr = item.event_date
      ? new Date(item.event_date).toLocaleString('fi-FI', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';
    const sign = item.weight_change >= 0 ? '+' : '';
    return (
      <View style={styles.eventRow}>
        <View style={styles.eventLeft}>
          <Text style={styles.eventCode}>{label}</Text>
          {item.description ? <Text style={styles.eventDesc}>{item.description}</Text> : null}
        </View>
        <View style={styles.eventRight}>
          <Text style={styles.eventWeight}>{sign}{formatKg(item.weight_change)} kg</Text>
          <Text style={styles.eventDate}>{dateStr}</Text>
        </View>
      </View>
    );
  };

  // Tuotelista — kun ei ole valintaa
  if (mode.type === 'idle') {
    return (
      <View style={layout.screen}>
        <Text style={layout.screenTitle}>Punnitus</Text>
        <FlatList
          data={products?.filter((p) => !p.deleted_at) ?? []}
          keyExtractor={(p) => String(p.id)}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <TouchableOpacity style={styles.newProductRow} onPress={startNewProduct}>
              <Text style={styles.newProductRowText}>+ Uusi tuote</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productRow} onPress={() => selectProduct(item)}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.ean ? <Text style={styles.productEan}>{item.ean}</Text> : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={components.emptyText}>Ei tuotteita.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    );
  }

  // Punnituskaavake — olemassa oleva tai uusi tuote
  return (
    <View style={layout.screen}>
      <Text style={layout.screenTitle}>Punnitus</Text>

      {/* Tuotetiedot */}
      <View style={mode.type === 'existing' ? components.cardSuccess : styles.newCard}>
        <View style={styles.cardHeader}>
          {mode.type === 'existing' ? (
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}>{activeProduct!.name}</Text>
              {currentBatch ? (
                <Text style={styles.batchStatus}>
                  Tämän päivän erä {currentBatch.batch_number}: {formatKg(currentBatch.current_weight)} kg
                </Text>
              ) : (
                <Text style={styles.batchStatus}>Uusi erä luodaan tänään</Text>
              )}
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <TextInput
                ref={nameRef}
                style={styles.nameInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Tuotteen nimi *"
                returnKeyType="next"
                onSubmitEditing={() => weightRef.current?.focus()}
              />
              <TextInput
                style={styles.priceInput}
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="Hinta (€/kg)"
                keyboardType="decimal-pad"
                returnKeyType="next"
                onSubmitEditing={() => weightRef.current?.focus()}
              />
            </View>
          )}
          <TouchableOpacity onPress={handleReset} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Vaihda</Text>
          </TouchableOpacity>
        </View>

        {/* EAN — auto-täytetty tai auto-generoitu */}
        <View style={styles.eanRow}>
          <Text style={styles.eanLabel}>EAN</Text>
          <TextInput
            style={styles.eanInput}
            value={ean}
            onChangeText={setEan}
            keyboardType="numeric"
            returnKeyType="next"
            onSubmitEditing={() => weightRef.current?.focus()}
          />
        </View>
      </View>

      {/* Erät */}
      {allProductBatches.length > 0 && (
        <View style={styles.batchesRow}>
          {allProductBatches.map((b) => (
            <View key={b.id} style={styles.batchChip}>
              <Text style={styles.batchChipText}>
                {b.batch_number}: {formatKg(b.current_weight)} kg
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Paino + nappi */}
      <View style={styles.weightRow}>
        <TextInput
          ref={weightRef}
          style={styles.weightInput}
          value={weightInput}
          onChangeText={setWeightInput}
          onSubmitEditing={handleWeigh}
          placeholder="Paino (kg)"
          keyboardType="decimal-pad"
          selectTextOnFocus
          returnKeyType="done"
          autoFocus={mode.type === 'existing'}
        />
        <TouchableOpacity
          style={[styles.weighBtn, (refreshing || !weightInput) && layout.disabled]}
          onPress={handleWeigh}
          disabled={refreshing || !weightInput}
        >
          <Text style={styles.weighBtnText}>{refreshing ? '...' : 'Punnitse'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tapahtumat */}
      {recentEvents.length > 0 && (
        <>
          <Text style={styles.eventsTitle}>Tapahtumat</Text>
          <FlatList
            data={recentEvents}
            keyExtractor={(e) => String(e.id)}
            renderItem={renderEvent}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  productRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.surfaceMid,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textDark,
    flex: 1,
  },
  productEan: {
    fontSize: typography.sizes.md,
    color: colors.muted,
  },
  newProductRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.surfaceMid,
  },
  newProductRowText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },

  newCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMid,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  selectedName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.successDark,
  },
  batchStatus: {
    fontSize: typography.sizes.md,
    color: colors.successMid,
    marginTop: spacing.xs / 2,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.sm,
    fontSize: typography.sizes.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.xs,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.sm,
    fontSize: typography.sizes.base,
    backgroundColor: colors.white,
  },
  changeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMid,
  },
  changeBtnText: {
    color: colors.muted,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.md,
  },
  eanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eanLabel: {
    fontSize: typography.sizes.md,
    color: colors.muted,
    width: 40,
  },
  eanInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.xs + 2,
    fontSize: typography.sizes.md,
    backgroundColor: colors.white,
    color: colors.textSecondary,
  },

  batchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  batchChip: {
    backgroundColor: colors.surfaceMid,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  batchChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes['3xl'],
    backgroundColor: colors.white,
  },
  weighBtn: {
    backgroundColor: colors.success,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  weighBtnText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xl,
  },

  eventsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  eventLeft: { flex: 1 },
  eventCode: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textDark,
  },
  eventDesc: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: spacing.xs / 2,
  },
  eventRight: { alignItems: 'flex-end' },
  eventWeight: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  eventDate: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs / 2,
  },
});

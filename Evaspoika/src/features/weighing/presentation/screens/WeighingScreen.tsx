import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
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
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
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
    setEan(generateEan());
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
      <View style={components.eventRow}>
        <View style={components.eventLeft}>
          <Text style={components.eventCode}>{label}</Text>
          {item.description ? <Text style={components.eventDesc}>{item.description}</Text> : null}
        </View>
        <View style={components.eventRight}>
          <Text style={components.eventWeight}>{sign}{formatKg(item.weight_change)} kg</Text>
          <Text style={components.eventDate}>{dateStr}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout title="PUNNITUS">

      {/* Tuotelista — kun ei ole valintaa */}
      {mode.type === 'idle' ? (
        <View style={layout.screen}>
          <FlatList
            data={products?.filter((p) => !p.deleted_at) ?? []}
            keyExtractor={(p) => String(p.id)}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <TouchableOpacity style={components.newProductRow} onPress={startNewProduct}>
                <Text style={components.newProductRowText}>+ Uusi tuote</Text>
              </TouchableOpacity>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={components.productRow} onPress={() => selectProduct(item)}>
                <Text style={components.productName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={components.textEmpty}>Ei tuotteita.</Text>}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </View>
      ) : (

      /* Punnituskaavake — olemassa oleva tai uusi tuote */
      <View style={layout.screen}>

      {/* Tuotetiedot */}
      <View style={mode.type === 'existing' ? components.cardSuccess : components.weighingCard}>
        <View style={components.cardHeader}>
          {mode.type === 'existing' ? (
            <View style={{ flex: 1 }}>
              <Text style={components.selectedName}>{activeProduct!.name}</Text>
              {currentBatch ? (
                <Text style={components.batchStatus}>
                  Tämän päivän erä {currentBatch.batch_number}: {formatKg(currentBatch.current_weight)} kg
                </Text>
              ) : (
                <Text style={components.batchStatus}>Uusi erä luodaan tänään</Text>
              )}
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <TextInput
                ref={nameRef}
                style={components.nameInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Tuotteen nimi *"
                returnKeyType="next"
                onSubmitEditing={() => weightRef.current?.focus()}
              />
              <TextInput
                style={components.priceInput}
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="Hinta (€/kg)"
                keyboardType="decimal-pad"
                returnKeyType="next"
                onSubmitEditing={() => weightRef.current?.focus()}
              />
            </View>
          )}
          <TouchableOpacity onPress={handleReset} style={components.changeBtn}>
            <Text style={components.changeBtnText}>Vaihda</Text>
          </TouchableOpacity>
        </View>

        {/* EAN — auto-täytetty tai auto-generoitu */}
        <View style={components.eanRow}>
          <Text style={components.eanLabel}>EAN</Text>
          <TextInput
            style={components.eanInput}
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
        <View style={components.batchesRow}>
          {allProductBatches.map((b) => (
            <View key={b.id} style={components.batchChip}>
              <Text style={components.batchChipText}>
                {b.batch_number}: {formatKg(b.current_weight)} kg
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Paino + nappi */}
      <View style={components.weightRow}>
        <TextInput
          ref={weightRef}
          style={components.weightInput}
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
          style={[components.weighBtn, (refreshing || !weightInput) && layout.disabled]}
          onPress={handleWeigh}
          disabled={refreshing || !weightInput}
        >
          <Text style={components.weighBtnText}>{refreshing ? '...' : 'Punnitse'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tapahtumat */}
      {recentEvents.length > 0 && (
        <>
          <Text style={components.eventsTitle}>Tapahtumat</Text>
          <FlatList
            data={recentEvents}
            keyExtractor={(e) => String(e.id)}
            renderItem={renderEvent}
            style={components.flex1}
          />
        </>
      )}
    </View>
    )}
    </ScreenLayout>
  );
}

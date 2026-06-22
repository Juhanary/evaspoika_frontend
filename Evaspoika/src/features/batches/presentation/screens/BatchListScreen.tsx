import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { updateBatch, deleteBatch } from '../../infrastructure/batchesApi';
import { Batch } from '../../domain/types';
import { useBatches, useDeletedBatches } from '../hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { colors } from '@/src/shared/constants/colors';
import { routes } from '@/src/shared/navigation/routes';
import { components } from '@/src/shared/styles/components';
import { batchStyles } from '@/src/shared/styles/batches';
import { screen } from '@/src/shared/styles/screen';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { type AppHeaderAction } from '@/src/shared/ui/AppHeader/AppHeader';
import { ProductList } from '@/src/shared/ui/ProductList/ProductList';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { formatKg, parseWeightToGrams } from '@/src/shared/utils/weight';

type BatchListScreenProps = {
  productId?: number;
};

type AdjustState = { batchId: number; mode: 'add' | 'sub' } | null;

const toFinnishDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
};


export default function BatchListScreen({ productId }: BatchListScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: batches, isLoading: batchesLoading, error: batchesError } = useBatches();
  const { data: deletedBatches } = useDeletedBatches();
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const [collapsed, setCollapsed] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [productQuery, setProductQuery] = useState('');

  const [adjusting, setAdjusting] = useState<AdjustState>(null);
  const [adjKg, setAdjKg] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjSaving, setAdjSaving] = useState(false);
  const adjKgRef = useRef<TextInput>(null);

  const selectedProduct = useMemo(
    () => (products ?? []).find((product) => product.id === productId) ?? null,
    [products, productId],
  );

  const filteredBatches = useMemo(() => {
    if (!productId) return [];
    return (batches ?? []).filter(
      (batch) => batch.ProductId === productId && !batch.deleted_at,
    );
  }, [batches, productId]);

  const archivedBatches = useMemo(() => {
    if (!productId) return [];
    return (deletedBatches ?? []).filter(
      (batch) => batch.ProductId === productId,
    );
  }, [deletedBatches, productId]);

  const totalWeight = filteredBatches.reduce((sum, batch) => sum + batch.current_weight, 0);

  const handleDelete = (batch: Batch) => {
    const label = toFinnishDate(batch.production_date) ?? batch.batch_number;
    Alert.alert('Poista erä', `Poistetaanko koko erä ${label}?`, [
      { text: 'Peruuta', style: 'cancel' },
      {
        text: 'Poista',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBatch(batch.id);
            await queryClient.invalidateQueries({ queryKey: ['batches'] });
          } catch (e) {
            Alert.alert('Virhe', e instanceof Error ? e.message : 'Poisto epäonnistui');
          }
        },
      },
    ]);
  };

  const openAdjust = (batchId: number, mode: 'add' | 'sub') => {
    setAdjKg('');
    setAdjReason('');
    setAdjusting({ batchId, mode });
    setTimeout(() => adjKgRef.current?.focus(), 100);
  };

  const closeAdjust = () => {
    setAdjusting(null);
    setAdjKg('');
    setAdjReason('');
  };

  const handleAdjustSave = async () => {
    if (!adjusting) return;

    const deltaGrams = parseWeightToGrams(adjKg);

    if (!Number.isFinite(deltaGrams) || deltaGrams <= 0) {
      Alert.alert('Virheellinen paino', 'Syötä positiivinen paino kilogrammoissa.');
      return;
    }

    if (!adjReason.trim()) {
      Alert.alert('Syy puuttuu', 'Kirjoita syy painon muutokselle.');
      return;
    }

    const batch = (batches ?? []).find((b) => b.id === adjusting.batchId);

    if (!batch) {
      Alert.alert('Virhe', 'Erää ei löydy.');
      return;
    }

    const delta = adjusting.mode === 'add' ? deltaGrams : -deltaGrams;
    const newWeight = batch.current_weight + delta;

    if (newWeight < 0) {
      Alert.alert('Virheellinen paino', 'Erän paino ei voi olla negatiivinen.');
      return;
    }

    setAdjSaving(true);

    try {
      await updateBatch(adjusting.batchId, {
        current_weight: newWeight,
        eventCode: 'INVENTORY',
        eventDescription: adjReason.trim(),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['batches'] }),
        queryClient.invalidateQueries({ queryKey: ['batchEvents'] }),
      ]);
      closeAdjust();
    } catch (e) {
      Alert.alert('Virhe', e instanceof Error ? e.message : 'Tallennus epäonnistui');
    } finally {
      setAdjSaving(false);
    }
  };

  const headerTitle = selectedProduct
    ? selectedProduct.name.toUpperCase()
    : productId
      ? `TUOTE #${productId}`
      : 'VARASTO';

  const headerSearch = !productId
    ? { value: productQuery, onChangeText: setProductQuery, placeholder: 'Hae tuotetta...' }
    : undefined;



  const adjustBatch = adjusting
    ? (batches ?? []).find((b) => b.id === adjusting.batchId) ?? null
    : null;

  return (
    <ScreenLayout
      headerSearch={headerSearch}
      //leftAction="back"
   
      title={headerTitle}
    >
      {!productId ? (
        <ProductList
          emptyText="Ei tuotteita."
          error={productsError}
          getSubtitle={(product) => `Tuote #${product.id}`}
          isLoading={productsLoading}
          onQueryChange={setProductQuery}
          onSelect={(product) => router.push(routes.inventoryProduct(product.id))}
          products={products ?? []}
          query={productQuery}
          showSearchInput={false}
        />
      ) : batchesLoading ? (
        <View style={[{ flex: 1 }, screen.centered]}>
          <Text style={screen.muted}>Ladataan eriä...</Text>
        </View>
      ) : batchesError ? (
        <View style={[{ flex: 1 }, screen.centered]}>
          <Text style={screen.muted}>
            Virhe: {batchesError instanceof Error ? batchesError.message : 'Tuntematon'}
          </Text>
        </View>
      ) : (
        <View style={components.flex1}>
         
            
              <Text style={batchStyles.blColHeader}>Erä</Text>
              <FlatList
                data={filteredBatches}
                keyExtractor={(batch) => String(batch.id)}
                ListEmptyComponent={<Text style={batchStyles.blEmpty}>Ei eriä.</Text>}
                ListFooterComponent={
                  filteredBatches.length > 0 ? (
                    <View style={batchStyles.blTotalRow}>
                      <Text style={batchStyles.blTotalLabel}>YHTEENSÄ</Text>
                      <Text style={batchStyles.blTotalValue}>{formatKg(totalWeight)} kg</Text>
                    </View>
                  ) : null
                }
                renderItem={({ item }) => {
                  const dateLabel = toFinnishDate(item.production_date) ?? item.batch_number;
                  const daysLeft = item.days_until_expiry ?? null;
                  const expiring = daysLeft !== null && daysLeft <= 100;

                  return (
                    <View style={batchStyles.blRow}>
                      <Text style={batchStyles.blDateText}>{dateLabel}</Text>
                      {expiring ? (
                        <Ionicons
                          color={daysLeft <= 50 ? colors.danger50pvonWhite : colors.danger100pvonWhite}
                          name="warning-outline"
                          size={50}
                          style={batchStyles.blWarnIcon}
                        />
                      ) : null}
                      <View style={batchStyles.blBtnGroup}>
                        <TouchableOpacity
                          onPress={() => handleDelete(item)}
                          style={batchStyles.blAdjBtn}
                        >
                          <Ionicons color={colors.textOnDark} name="trash-outline" size={26} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => openAdjust(item.id, 'add')}
                          style={batchStyles.blAdjBtn}
                        >
                          <Ionicons color={colors.textOnDark} name="add" size={26} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => openAdjust(item.id, 'sub')}
                          style={batchStyles.blAdjBtn}
                        >
                          <Ionicons color={colors.textOnDark} name="remove" size={26} />
                        </TouchableOpacity>
                      </View>
                      <Text style={batchStyles.blWeightText}>
                        {formatKg(item.current_weight)} kg
                      </Text>
                    </View>
                  );
                }}
                style={components.flex1}
              />
            
         

     

          <View style={batchStyles.blFooter}>
            <TouchableOpacity
              onPress={() => router.push(routes.inventory)}
              style={batchStyles.blValmisBtn}
            >
              <Text style={batchStyles.blValmisBtnText}>Valmis</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Painon muokkaus -modaali */}
      <AppModal
        animationType="slide"
        onClose={closeAdjust}
        visible={adjusting !== null}
      >
        <View style={batchStyles.blAdjOverlay}>
          <View style={batchStyles.blAdjCard}>
            <Text style={batchStyles.blAdjTitle}>
              {adjusting?.mode === 'add' ? 'Lisää painoa' : 'Vähennä painoa'}
            </Text>

            {adjustBatch ? (
              <Text style={batchStyles.blAdjCurrentWeight}>
                Nykyinen paino: {formatKg(adjustBatch.current_weight)} kg
              </Text>
            ) : null}

            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setAdjKg}
              placeholder="Paino kg (esim. 1.500)"
              placeholderTextColor="rgba(0,0,0,0.35)"
              ref={adjKgRef}
              style={batchStyles.blAdjInput}
              value={adjKg}
            />

            <TextInput
              onChangeText={setAdjReason}
              placeholder="Syy muutokselle (pakollinen)"
              placeholderTextColor="rgba(0,0,0,0.35)"
              style={batchStyles.blAdjInput}
              value={adjReason}
            />

            <View style={batchStyles.blAdjBtnRow}>
              <Pressable
                onPress={closeAdjust}
                style={({ pressed }) => [batchStyles.blAdjCancelBtn, pressed && screen.pressed]}
              >
                <Text style={batchStyles.blAdjCancelBtnText}>Peruuta</Text>
              </Pressable>
              <Pressable
                disabled={adjSaving}
                onPress={handleAdjustSave}
                style={({ pressed }) => [
                  batchStyles.blAdjSaveBtn,
                  (pressed || adjSaving) && screen.pressed,
                ]}
              >
                <Text style={batchStyles.blAdjSaveBtnText}>
                  {adjusting?.mode === 'add' ? 'Lisää' : 'Vähennä'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </AppModal>
    </ScreenLayout>
  );
}

import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
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
import { spacing } from '@/src/shared/constants/spacing';
import { routes } from '@/src/shared/navigation/routes';
import { components } from '@/src/shared/styles/components';
import { batchStyles } from '@/src/shared/styles/batches';
import { screen } from '@/src/shared/styles/screen';
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

const isOld = (value?: string | null) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const nineMonthsAgo = new Date();
  nineMonthsAgo.setMonth(nineMonthsAgo.getMonth() - 9);
  return date < nineMonthsAgo;
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

  const rightActions: AppHeaderAction[] = productId
    ? [
        {
          icon: collapsed ? 'chevron-down' : 'chevron-up',
          onPress: () => setCollapsed((c) => !c),
          accessibilityLabel: collapsed ? 'Avaa lista' : 'Piilota lista',
        },
      ]
    : [];

  const adjustBatch = adjusting
    ? (batches ?? []).find((b) => b.id === adjusting.batchId) ?? null
    : null;

  return (
    <ScreenLayout
      headerSearch={headerSearch}
      leftAction="back"
      rightActions={rightActions}
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
        <View style={{ flex: 1 }}>
          {!collapsed ? (
            <>
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
                  const old = isOld(item.production_date);

                  return (
                    <View style={batchStyles.blRow}>
                      <Text style={batchStyles.blDateText}>{dateLabel}</Text>
                      {old ? (
                        <Ionicons
                          color="#E57C00"
                          name="warning-outline"
                          size={16}
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
            </>
          ) : (
            <View style={[{ flex: 1 }, screen.centered]}>
              <Text style={screen.muted}>Lista piilotettu.</Text>
            </View>
          )}

          {archivedBatches.length > 0 ? (
            <View>
              <TouchableOpacity
                onPress={() => setShowArchive((v) => !v)}
                style={batchStyles.blArchiveHeader}
              >
                <Text style={batchStyles.blArchiveHeaderText}>
                  Arkisto ({archivedBatches.length})
                </Text>
                <Ionicons
                  color="rgba(255,255,255,0.5)"
                  name={showArchive ? 'chevron-up' : 'chevron-down'}
                  size={18}
                />
              </TouchableOpacity>

              {showArchive ? archivedBatches.map((batch) => {
                const dateLabel = toFinnishDate(batch.production_date) ?? batch.batch_number;
                const deletedLabel = toFinnishDate(batch.deleted_at);
                return (
                  <TouchableOpacity
                    key={batch.id}
                    onPress={() => router.push(routes.inventoryBatch(batch.id, batch.batch_number))}
                    style={batchStyles.blArchiveRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={batchStyles.blArchiveLabel}>{dateLabel}</Text>
                      {deletedLabel ? (
                        <Text style={batchStyles.blArchiveSub}>Poistettu {deletedLabel}</Text>
                      ) : null}
                    </View>
                    <Text style={batchStyles.blArchiveWeight}>
                      {formatKg(batch.initial_weight)} kg
                    </Text>
                    <Ionicons color="rgba(255,255,255,0.35)" name="chevron-forward" size={16} />
                  </TouchableOpacity>
                );
              }) : null}
            </View>
          ) : null}

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
      <Modal
        animationType="slide"
        onRequestClose={closeAdjust}
        transparent
        visible={adjusting !== null}
      >
        <View style={adjStyles.overlay}>
          <View style={adjStyles.card}>
            <Text style={adjStyles.title}>
              {adjusting?.mode === 'add' ? 'Lisää painoa' : 'Vähennä painoa'}
            </Text>

            {adjustBatch ? (
              <Text style={adjStyles.currentWeight}>
                Nykyinen paino: {formatKg(adjustBatch.current_weight)} kg
              </Text>
            ) : null}

            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setAdjKg}
              placeholder="Paino kg (esim. 1.500)"
              placeholderTextColor="rgba(0,0,0,0.35)"
              ref={adjKgRef}
              style={adjStyles.input}
              value={adjKg}
            />

            <TextInput
              onChangeText={setAdjReason}
              placeholder="Syy muutokselle (pakollinen)"
              placeholderTextColor="rgba(0,0,0,0.35)"
              style={adjStyles.input}
              value={adjReason}
            />

            <View style={adjStyles.btnRow}>
              <Pressable
                onPress={closeAdjust}
                style={({ pressed }) => [adjStyles.cancelBtn, pressed && screen.pressed]}
              >
                <Text style={adjStyles.cancelBtnText}>Peruuta</Text>
              </Pressable>
              <Pressable
                disabled={adjSaving}
                onPress={handleAdjustSave}
                style={({ pressed }) => [
                  adjStyles.saveBtn,
                  (pressed || adjSaving) && screen.pressed,
                ]}
              >
                <Text style={adjStyles.saveBtnText}>
                  {adjusting?.mode === 'add' ? 'Lisää' : 'Vähennä'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const adjStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,},
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    color: 'rgba(0,0,0,0.82)',
    marginBottom: 4,
  },
  currentWeight: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    color: 'rgba(0,0,0,0.5)',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
    backgroundColor: '#F5F5F5',
  },
  btnRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.18)',
  },
  cancelBtnText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 17,
    color: 'rgba(0,0,0,0.6)',
  },
  saveBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center' as const,
    backgroundColor: '#39F56A',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
  },
  saveBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: 'rgba(0,0,0,0.82)',
  },
};

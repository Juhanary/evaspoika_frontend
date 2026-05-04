import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { useOrder } from '../hooks/useOrders';
import { fetchOrderLines, createOrderLine, deleteOrderLine } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { deleteOrder } from '@/src/features/orders/infrastructure/ordersApi';
import { fetchBoxByEan } from '@/src/features/boxes/infrastructure/boxesApi';
import { OrderLine } from '@/src/features/orderLines/domain/types';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { colors } from '@/src/shared/constants/colors';
import { formatKg } from '@/src/shared/utils/weight';
import { ApiError } from '@/src/infrastructure/api/error';
import { components } from '@/src/shared/styles/components';
import { orderStyles } from '@/src/shared/styles/orders';
import { screen } from '@/src/shared/styles/screen';

type Props = { orderId?: number };

type BoxLineState = {
  id: string;
  ean: string;
  productId: number | null;
  productName: string;
  weightKg: string;
  weightEdited: boolean;
  selectedBatchId: number | null;
  selectedBatchNumber: string | null;
  pricePerKg: number;
};

type BatchPickerOption = {
  batchId: number;
  batchNumber: string;
  productId: number;
  productName: string;
  pricePerKg: number;
  productionDate?: string | null;
  currentWeight: number;
};

type ProductBatchSummary = {
  batchKey: string;
  batchLabel: string;
  totalWeight: number;
  lines: OrderLine[];
};

type ProductLineGroup = {
  productKey: string;
  productName: string;
  totalWeight: number;
  batches: ProductBatchSummary[];
};


const kgStrToGrams = (value: string) =>
  Math.round(parseFloat(value.replace(',', '.')) * 1000);


const toFinnishDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString('fi-FI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function OrderDetailScreen({ orderId }: Props) {
  const queryClient = useQueryClient();
  const { data: order, isLoading, error } = useOrder(orderId);
  const { data: orderLines } = useQuery({
    queryKey: ['orderLines', orderId],
    queryFn: () => fetchOrderLines(orderId!),
    enabled: !!orderId,
  });
  const { data: customers } = useCustomers();
  const { data: batches } = useBatches();
  const { data: products } = useProducts();

  const [showScanModal, setShowScanModal] = useState(false);
  const [showVirtualScanModal, setShowVirtualScanModal] = useState(false);
  const [eanInput, setEanInput] = useState('');
  const [scannedBoxes, setScannedBoxes] = useState<BoxLineState[]>([]);
  const [batchPickerFor, setBatchPickerFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [deletingLineId, setDeletingLineId] = useState<number | null>(null);
  const [virtualProductId, setVirtualProductId] = useState<number | null>(null);
  const [virtualBatchId, setVirtualBatchId] = useState<number | null>(null);
  const [virtualWeight, setVirtualWeight] = useState('');
  const eanRef = useRef<TextInput>(null);
  const nextScannedRowId = useRef(1);

  const customerName = useMemo(() => {
    if (!order || !customers) return null;

    const customerId = order.customer_id ?? (order as { CustomerId?: number | null }).CustomerId;
    return customers.find((customer) => customer.id === customerId)?.name ?? null;
  }, [order, customers]);

  const activeLines = useMemo<OrderLine[]>(
    () => (orderLines ?? []).filter((line) => !line.deleted_at),
    [orderLines],
  );

  const groupedLines = useMemo<ProductLineGroup[]>(() => {
    const groups = new Map<
      string,
      ProductLineGroup & { batchMap: Map<string, ProductBatchSummary> }
    >();

    activeLines.forEach((line) => {
      const productId = line.Batch?.Product?.id ?? line.BatchId ?? line.id;
      const productKey = String(productId);
      const productName = line.Batch?.Product?.name ?? 'Tuote / erä';
      const batchKey = String(line.BatchId ?? line.id);
      const batchLabel = line.Batch?.batch_number ?? '-';
      const soldWeight = line.sold_weight ?? 0;

      const group =
        groups.get(productKey) ??
        {
          productKey,
          productName,
          totalWeight: 0,
          batches: [],
          batchMap: new Map<string, ProductBatchSummary>(),
        };

      const batchSummary =
        group.batchMap.get(batchKey) ??
        {
          batchKey,
          batchLabel,
          totalWeight: 0,
          lines: [] as OrderLine[],
        };

      batchSummary.totalWeight += soldWeight;
      batchSummary.lines.push(line);
      group.batchMap.set(batchKey, batchSummary);
      group.totalWeight += soldWeight;
      groups.set(productKey, group);
    });

    return [...groups.values()]
      .map(({ batchMap, ...group }) => ({
        ...group,
        batches: [...batchMap.values()].sort((left, right) =>
          left.batchLabel.localeCompare(right.batchLabel, 'fi', { sensitivity: 'base' }),
        ),
      }))
      .sort((left, right) =>
        left.productName.localeCompare(right.productName, 'fi', { sensitivity: 'base' }),
      );
  }, [activeLines]);

  const batchPickerRow = useMemo(
    () => scannedBoxes.find((box) => box.id === batchPickerFor) ?? null,
    [batchPickerFor, scannedBoxes],
  );

  const batchPickerOptions = useMemo<BatchPickerOption[]>(() => {
    if (!batchPickerRow) return [];

    const activeBatches = (batches ?? []).filter(
      (b) => !b.deleted_at && (b.current_weight ?? 0) > 0,
    );
    const filtered =
      batchPickerRow.productId !== null
        ? activeBatches.filter((b) => b.ProductId === batchPickerRow.productId)
        : activeBatches;

    return filtered
      .map((batch) => {
        const product = (products ?? []).find((p) => p.id === batch.ProductId);
        return {
          batchId: batch.id,
          batchNumber: batch.batch_number,
          productId: batch.ProductId ?? 0,
          productName: product?.name ?? 'Tuntematon',
          pricePerKg: product?.price_per_kg ?? 0,
          productionDate: batch.production_date,
          currentWeight: batch.current_weight ?? 0,
        };
      })
      .sort((left, right) => {
        const leftDate = left.productionDate ? Date.parse(left.productionDate) : Number.NaN;
        const rightDate = right.productionDate ? Date.parse(right.productionDate) : Number.NaN;

        if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) {
          return leftDate - rightDate;
        }

        if (Number.isFinite(leftDate)) return -1;
        if (Number.isFinite(rightDate)) return 1;

        return left.batchNumber.localeCompare(right.batchNumber, 'fi', { sensitivity: 'base' });
      });
  }, [batchPickerRow, batches, products]);

  const scanTotalWeight = useMemo(
    () =>
      scannedBoxes.reduce((sum, box) => {
        const weightGrams = kgStrToGrams(box.weightKg);
        return sum + (Number.isFinite(weightGrams) ? weightGrams : 0);
      }, 0),
    [scannedBoxes],
  );

  const handleEanChange = (value: string) => {
    setEanInput(value.replace(/\s+/g, ''));
  };

  const handleScan = async (ean: string) => {
    const normalizedEan = ean.replace(/\s+/g, '').trim();
    if (!normalizedEan) return;

    setEanInput('');

    try {
      const box = await fetchBoxByEan(normalizedEan);
      const product = (products ?? []).find((p) => p.id === box.ProductId);
      setScannedBoxes((previous) => [
        ...previous,
        {
          id: String(nextScannedRowId.current++),
          ean: normalizedEan,
          productId: box.ProductId,
          productName: box.productName,
          weightKg: box.weight_kg.toFixed(3),
          weightEdited: false,
          selectedBatchId: box.BatchId,
          selectedBatchNumber: box.batch_number,
          pricePerKg: product?.price_per_kg ?? 0,
        },
      ]);
    } catch {
      Alert.alert('Boksia ei löydy', `Koodilla "${normalizedEan}" ei löydy varastosta bokseja.`);
    }

    setTimeout(() => eanRef.current?.focus(), 50);
  };

  const handleSelectBatch = (option: BatchPickerOption) => {
    if (!batchPickerRow) {
      return;
    }

    setScannedBoxes((previous) =>
      previous.map((box) =>
        box.id === batchPickerRow.id
          ? {
              ...box,
              productId: box.productId ?? option.productId,
              productName: box.productId === null ? option.productName : box.productName,
              pricePerKg: box.productId === null ? option.pricePerKg : box.pricePerKg,
              selectedBatchId: option.batchId,
              selectedBatchNumber: option.batchNumber,
            }
          : box,
      ),
    );
    setBatchPickerFor(null);
  };

  const handleRemoveScannedRow = (rowId: string) => {
    setScannedBoxes((previous) => previous.filter((box) => box.id !== rowId));

    if (batchPickerFor === rowId) {
      setBatchPickerFor(null);
    }
  };

  const handleSave = async () => {
    if (scannedBoxes.length === 0) {
      Alert.alert('Tyhj\u00E4', 'Ei laatikoita tallennettavaksi.');
      return;
    }

    for (const box of scannedBoxes) {
      if (!box.selectedBatchId) {
        Alert.alert('Er\u00E4 puuttuu', `Valitse er\u00E4 tuotteelle ${box.productName}.`);
        return;
      }

      const soldWeight = kgStrToGrams(box.weightKg);

      if (!Number.isFinite(soldWeight) || soldWeight <= 0) {
        Alert.alert('Virheellinen paino', `Tarkista paino: ${box.productName}`);
        return;
      }

    }

    setSaving(true);

    try {
      await Promise.all(
        scannedBoxes.map((box) =>
          createOrderLine({
            orderId: orderId!,
            batchId: box.selectedBatchId!,
            sold_weight: kgStrToGrams(box.weightKg),
            price_per_gram: Math.round(box.pricePerKg),
          }),
        ),
      );

      await queryClient.invalidateQueries({
        queryKey: ['orderLines', orderId],
        exact: true,
      });

      setBatchPickerFor(null);
      setEanInput('');
      setScannedBoxes([]);
      setShowScanModal(false);
      Alert.alert('Tallennettu', 'Skannaukset tallennettu tilaukseen onnistuneesti.');
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.status === 502) {
        setShowScanModal(false);
        setScannedBoxes([]);
        setEanInput('');
        await queryClient.invalidateQueries({ queryKey: ['orderLines', orderId], exact: true });
        const p = saveError.payload as Record<string, unknown> | null;
        const details = String(p?.details ?? p?.error ?? '');
        Alert.alert(
          'Tilausrivit lisätty',
          `Rivit lisätty onnistuneesti, mutta Netvisor-synkronointi epäonnistui${details ? `:\n${details}` : '.'}\n\nVoit yrittää lähettää tilauksen "Lähetä tilaus"-napista.`,
        );
      } else {
        const errMessage = (() => {
          if (saveError instanceof ApiError) {
            const p = saveError.payload as Record<string, unknown> | null;
            return String(p?.details ?? p?.error ?? saveError.message);
          }
          return saveError instanceof Error ? saveError.message : 'Tallennus epäonnistui';
        })();
        Alert.alert('Virhe', errMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = () => {
    Alert.alert(
      'Poista tilaus',
      'Haluatko varmasti poistaa tämän tilauksen? Tätä toimintoa ei voi peruuttaa.',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: async () => {
            setDeletingOrder(true);
            try {
              await deleteOrder(orderId!);
              await queryClient.invalidateQueries({ queryKey: ['orders'] });
              router.back();
              Alert.alert('Tilaus poistettu', 'Tilaus on poistettu onnistuneesti.');
            } catch (deleteError) {
              const errMessage = (() => {
                if (deleteError instanceof ApiError) {
                  const p = deleteError.payload as Record<string, unknown> | null;
                  return String(p?.details ?? p?.error ?? deleteError.message);
                }
                return deleteError instanceof Error ? deleteError.message : 'Poisto epäonnistui';
              })();
              Alert.alert('Poisto epäonnistui', errMessage);
            } finally {
              setDeletingOrder(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteLine = (lineId: number) => {
    Alert.alert(
      'Poista tilausrivi',
      'Haluatko varmasti poistaa tämän tilausrivin? Erän paino palautetaan.',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: async () => {
            setDeletingLineId(lineId);
            try {
              await deleteOrderLine(lineId);
              await queryClient.invalidateQueries({ queryKey: ['orderLines', orderId], exact: true });
            } catch (err) {
              const errMessage = (() => {
                if (err instanceof ApiError) {
                  const p = err.payload as Record<string, unknown> | null;
                  return String(p?.error ?? err.message);
                }
                return err instanceof Error ? err.message : 'Poisto epäonnistui';
              })();
              Alert.alert('Poisto epäonnistui', errMessage);
            } finally {
              setDeletingLineId(null);
            }
          },
        },
      ],
    );
  };

  const handleAddVirtualBox = async () => {
    if (!virtualProductId || !virtualBatchId || !virtualWeight) {
      Alert.alert('Virhe', 'Valitse tuote, erä ja paino.');
      return;
    }

    const weightGrams = kgStrToGrams(virtualWeight);
    if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
      Alert.alert('Virheellinen paino', 'Tarkista paino.');
      return;
    }

    const product = products?.find(p => p.id === virtualProductId);
    const batch = batches?.find(b => b.id === virtualBatchId);

    if (!product || !batch) {
      Alert.alert('Virhe', 'Tuotetta tai erää ei löydy.');
      return;
    }

    setSaving(true);
    try {
      await createOrderLine({
        orderId: orderId!,
        batchId: virtualBatchId,
        sold_weight: weightGrams,
        price_per_gram: Math.round(product.price_per_kg),
      });

      await queryClient.invalidateQueries({ queryKey: ['orderLines', orderId], exact: true });
      setShowVirtualScanModal(false);
      setVirtualProductId(null);
      setVirtualBatchId(null);
      setVirtualWeight('');
      Alert.alert('Laatiko lisätty', 'Laatiko on lisätty tilaukseen onnistuneesti.');
    } catch (error) {
      const errMessage = (() => {
        if (error instanceof ApiError) {
          const p = error.payload as Record<string, unknown> | null;
          return String(p?.details ?? p?.error ?? error.message);
        }
        return error instanceof Error ? error.message : 'Lisäys epäonnistui';
      })();
      Alert.alert('Virhe', errMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!orderId || (!isLoading && (error || !order))) {
    return (
      <ScreenLayout leftAction="back" title="TILAUS">
        <View style={screen.centered}>
          <Text style={screen.muted}>Tilausta ei löydy.</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (isLoading) {
    return (
      <ScreenLayout leftAction="back" title="TILAUS">
        <View style={screen.centered}>
          <Text style={screen.muted}>Ladataan...</Text>
        </View>
      </ScreenLayout>
    );
  }

  const dateLabel = toFinnishDate(order?.order_date);

  return (
    <ScreenLayout leftAction="back" title="TILAUS">
      <ScrollView
        contentContainerStyle={orderStyles.odScrollContent}
        showsVerticalScrollIndicator={false}
        style={orderStyles.odScroll}
      >
        <View style={orderStyles.odCustomerPill}>
          <Text numberOfLines={1} style={orderStyles.odCustomerPillText}>
            {customerName ?? 'Tilaus'}
          </Text>
          {dateLabel ? <Text style={orderStyles.odDateText}>{dateLabel}</Text> : null}
        </View>

        {groupedLines.length === 0 ? (
          <Text style={orderStyles.odTableEmptyText}>Ei tilausrivejä vielä.</Text>
        ) : (
          groupedLines.map((group) => (
            <View key={group.productKey} style={orderStyles.odProductCard}>
              <View style={orderStyles.odProductCardHeader}>
                <Text numberOfLines={1} style={orderStyles.odProductCardName}>
                  {group.productName}
                </Text>
              </View>

              {group.batches.map((batch, batchIndex) => (
                <View key={batch.batchKey}>
                  <Text style={orderStyles.odBatchSubLabel}>{batch.batchLabel}</Text>
                  {batch.lines.map((line) => (
                    <View key={line.id} style={orderStyles.odLineRow}>
                      <Text style={orderStyles.odLineWeight}>{formatKg(line.sold_weight)} kg</Text>
                      <TouchableOpacity
                        disabled={deletingLineId === line.id}
                        onPress={() => handleDeleteLine(line.id)}
                        style={orderStyles.odLineDeleteBtn}
                      >
                        <Ionicons
                          color={deletingLineId === line.id ? 'rgba(220,50,50,0.3)' : 'rgba(220,50,50,0.72)'}
                          name="trash-outline"
                          size={20}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {batchIndex < group.batches.length - 1 ? (
                    <View style={orderStyles.odTableRowDivider} />
                  ) : null}
                </View>
              ))}

              <View style={orderStyles.odProductCardTotalDivider} />
              <View style={orderStyles.odProductCardTotalRow}>
                <Text style={orderStyles.odProductCardTotalLabel}>YHTEENSÄ</Text>
                <Text style={orderStyles.odProductCardTotalWeight}>
                  {formatKg(group.totalWeight)} kg
                </Text>
              </View>
            </View>
          ))
        )}

        <Pressable
          onPress={() => setShowScanModal(true)}
          style={({ pressed }) => [orderStyles.odSkannaaBtn, pressed && screen.pressed]}
        >
          <Text style={orderStyles.odVirtualScanBtnText}>SKANNAA</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowVirtualScanModal(true)}
          style={({ pressed }) => [orderStyles.odVirtualScanBtn, pressed && screen.pressed]}
        >
          <Text style={orderStyles.odVirtualScanBtnText}>LISÄÄ LAATIKKO</Text>
        </Pressable>
      </ScrollView>

      <View style={orderStyles.odFooter}>
        <View style={orderStyles.odFooterButtons}>
          <Pressable
            disabled={deletingOrder}
            onPress={handleDeleteOrder}
            style={({ pressed }) => [
              orderStyles.odDeleteBtn,
              (pressed || deletingOrder) && screen.pressed,
            ]}
          >
            <Text style={orderStyles.odDeleteBtnText}>
              {deletingOrder ? 'POISTETAAN...' : 'POISTA TILAUS'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowScanModal(false)}
        transparent
        visible={showScanModal}
      >
        <SafeAreaView style={orderStyles.smOverlay}>
          <View style={orderStyles.smShell}>
            <View style={orderStyles.smTopRow}>
              <View style={orderStyles.smCustomerPill}>
                <Text numberOfLines={1} style={orderStyles.smCustomerPillText}>
                  {customerName ?? 'Tilaus'}
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Sulje"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => setShowScanModal(false)}
              >
                <Ionicons color={colors.textOnDark} name="close" size={28} />
              </Pressable>
            </View>

            <View style={orderStyles.smPanel}>
              <View style={orderStyles.smScanFieldRow}>
                <TextInput
                  autoFocus
                  keyboardType="numeric"
                  onChangeText={handleEanChange}
                  onSubmitEditing={() => handleScan(eanInput)}
                  placeholder="ALOITA SKANNAAMINEN..."
                  placeholderTextColor="rgba(0,0,0,0.32)"
                  ref={eanRef}
                  returnKeyType="done"
                  style={orderStyles.smScanFieldInput}
                  value={eanInput}
                />
                <Ionicons color="rgba(0,0,0,0.42)" name="barcode-outline" size={28} />
              </View>

              <View style={orderStyles.smTableHeader}>
                <View style={orderStyles.smDeleteCell} />
                <Text style={[orderStyles.smTableHeaderText, orderStyles.smProductCell]}>
                  TUOTE
                </Text>
                <Text style={[orderStyles.smTableHeaderText, orderStyles.smBatchCell]}>ERÄ</Text>
                <Text style={[orderStyles.smTableHeaderText, orderStyles.smWeightCell]}>PAINO</Text>
              </View>

              <FlatList
                data={scannedBoxes}
                ItemSeparatorComponent={() => <View style={orderStyles.smTableDivider} />}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <Text style={orderStyles.smScanEmpty}>
                    Skannaa viivakoodeja, valitse erä jokaiselle riville ja tarkista painot.
                  </Text>
                }
                renderItem={({ item }) => (
                  <View style={orderStyles.smTableRow}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      disabled={saving}
                      onPress={() => handleRemoveScannedRow(item.id)}
                      style={orderStyles.smDeleteCell}
                    >
                      <Ionicons color="rgba(0,0,0,0.54)" name="close" size={22} />
                    </TouchableOpacity>

                    <Text
                      numberOfLines={1}
                      style={[orderStyles.smTableRowText, orderStyles.smProductCell]}
                    >
                      {item.productName}
                    </Text>

                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={() => setBatchPickerFor(item.id)}
                      style={[orderStyles.smBatchCell, orderStyles.smBatchSelectBtn]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          orderStyles.smBatchSelectText,
                          !item.selectedBatchNumber && orderStyles.smBatchSelectPlaceholder,
                        ]}
                      >
                        {item.selectedBatchNumber ?? 'VALITSE'}
                      </Text>
                      <Ionicons color="rgba(0,0,0,0.7)" name="chevron-down" size={16} />
                    </TouchableOpacity>

                    <TextInput
                      keyboardType="decimal-pad"
                      onChangeText={(value) =>
                        setScannedBoxes((previous) =>
                          previous.map((box) =>
                            box.id === item.id
                              ? { ...box, weightKg: value, weightEdited: true }
                              : box,
                          ),
                        )
                      }
                      selectTextOnFocus
                      style={orderStyles.smWeightInput}
                      value={item.weightKg}
                    />
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                style={orderStyles.smTableList}
              />

              <View style={orderStyles.smFooterRow}>
                <Text style={orderStyles.smScanTotal}>Yhteensä {formatKg(scanTotalWeight)} kg</Text>

                <TouchableOpacity
                  disabled={saving || scannedBoxes.length === 0}
                  onPress={handleSave}
                  style={[
                    orderStyles.smSavePill,
                    (saving || scannedBoxes.length === 0) && orderStyles.smSaveBtnDisabled,
                  ]}
                >
                  <Text style={orderStyles.smSavePillText}>
                    {saving ? 'Tallennetaan...' : 'TALLENNA'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>

        <Modal
          animationType="slide"
          onRequestClose={() => setBatchPickerFor(null)}
          transparent
          visible={batchPickerFor != null}
        >
          <View style={components.modalOverlay}>
            <View style={components.modalCard}>
              <Text style={components.modalTitle}>Valitse erä</Text>

              {batchPickerOptions.length === 0 ? (
                <Text style={components.modalEmpty}>Ei vapaita laatikoita tälle tuotteelle.</Text>
              ) : (
                batchPickerOptions.map((option) => (
                  <TouchableOpacity
                    key={option.batchId}
                    onPress={() => handleSelectBatch(option)}
                    style={components.modalRow}
                  >
                    {batchPickerRow?.productId === null ? (
                      <Text style={components.modalRowText}>{option.batchNumber} \u2014 {option.productName}</Text>
                    ) : (
                      <Text style={components.modalRowText}>{option.batchNumber}</Text>
                    )}
                    <Text style={components.modalRowSubText}>
                      {(toFinnishDate(option.productionDate) ?? 'Ei p\u00E4iv\u00E4yst\u00E4') +
                        ` / ${formatKg(option.currentWeight)} kg`}
                    </Text>
                  </TouchableOpacity>
                ))
              )}

              <TouchableOpacity
                onPress={() => setBatchPickerFor(null)}
                style={components.buttonModalCancel}
              >
                <Text style={components.buttonTextModalCancel}>Peruuta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowVirtualScanModal(false)}
        transparent
        visible={showVirtualScanModal}
      >
        <SafeAreaView style={orderStyles.smOverlay}>
          <View style={orderStyles.smShell}>
            <View style={orderStyles.smTopRow}>
              <View style={orderStyles.smCustomerPill}>
                <Text numberOfLines={1} style={orderStyles.smCustomerPillText}>
                  {customerName ?? 'Tilaus'}
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Sulje"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => setShowVirtualScanModal(false)}
              >
                <Ionicons color={colors.textOnDark} name="close" size={28} />
              </Pressable>
            </View>

            <View style={orderStyles.smPanel}>
              <Text style={orderStyles.smVirtualTitle}>Lisää laatikko tilaukseen</Text>

              <ScrollView
                contentContainerStyle={orderStyles.smVirtualScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={orderStyles.smVirtualScroll}
              >
                <View style={orderStyles.smVirtualField}>
                  <Text style={orderStyles.smVirtualFieldLabel}>Tuote</Text>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={orderStyles.smVirtualPicker}
                  >
                    {products?.map((product) => (
                      <Pressable
                        key={product.id}
                        onPress={() => setVirtualProductId(product.id)}
                        style={[
                          orderStyles.smVirtualPickerOption,
                          virtualProductId === product.id && orderStyles.smVirtualPickerSelected,
                        ]}
                      >
                        <Text style={orderStyles.smVirtualPickerText}>{product.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {virtualProductId && (
                  <View style={orderStyles.smVirtualField}>
                    <Text style={orderStyles.smVirtualFieldLabel}>Erä</Text>
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      style={orderStyles.smVirtualPicker}
                    >
                      {batches
                        ?.filter((batch) => batch.ProductId === virtualProductId && !batch.deleted_at)
                        .map((batch) => (
                          <Pressable
                            key={batch.id}
                            onPress={() => setVirtualBatchId(batch.id)}
                            style={[
                              orderStyles.smVirtualPickerOption,
                              virtualBatchId === batch.id && orderStyles.smVirtualPickerSelected,
                            ]}
                          >
                            <Text style={orderStyles.smVirtualPickerText}>{batch.batch_number}</Text>
                            <Text style={orderStyles.smVirtualPickerSubText}>
                              {formatKg(batch.current_weight)} kg jäljellä
                            </Text>
                          </Pressable>
                        ))}
                    </ScrollView>
                  </View>
                )}

                <View style={orderStyles.smVirtualField}>
                  <Text style={orderStyles.smVirtualFieldLabel}>Paino (kg)</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setVirtualWeight}
                    placeholder="0.000"
                    style={orderStyles.smVirtualWeightInput}
                    value={virtualWeight}
                  />
                </View>
              </ScrollView>

              <View style={orderStyles.smFooterRow}>
                <TouchableOpacity
                  disabled={saving || !virtualProductId || !virtualBatchId || !virtualWeight}
                  onPress={handleAddVirtualBox}
                  style={[
                    orderStyles.smSavePill,
                    (saving || !virtualProductId || !virtualBatchId || !virtualWeight) && orderStyles.smSaveBtnDisabled,
                  ]}
                >
                  <Text style={orderStyles.smSavePillText}>
                    {saving ? 'Lisätään...' : 'LISÄÄ'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </ScreenLayout>
  );
}

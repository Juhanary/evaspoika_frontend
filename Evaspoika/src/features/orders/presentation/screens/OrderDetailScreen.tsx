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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { useOrder } from '../hooks/useOrders';
import { fetchOrderLines } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { updateOrder } from '@/src/features/orders/infrastructure/ordersApi';
import { OrderLine } from '@/src/features/orderLines/domain/types';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { confirmScan, fetchScanBoxes } from '@/src/features/scan/infrastructure/scanApi';
import { ScanInventoryBox } from '@/src/features/scan/domain/types';
import { colors } from '@/src/shared/constants/colors';
import { formatKg } from '@/src/shared/utils/weight';
import { ApiError } from '@/src/infrastructure/api/error';
import { components } from '@/src/shared/styles/components';
import { orderStyles } from '@/src/shared/styles/orders';
import { screen } from '@/src/shared/styles/screen';

type Props = { orderId?: number };

type BoxLineState = {
  id: string;
  productId: number;
  productName: string;
  weightKg: string;
  weightEdited: boolean;
  selectedBatchId: number | null;
  selectedBatchNumber: string | null;
  assignedBoxId: number | null;
  assignedBoxWeightKg: number | null;
  pricePerKg: number;
};

type BatchPickerOption = {
  batchId: number;
  batchNumber: string;
  productionDate?: string | null;
  currentWeight: number;
  availableCount: number;
  nextBox: ScanInventoryBox | null;
};

type ProductBatchSummary = {
  batchKey: string;
  batchLabel: string;
  totalWeight: number;
};

type ProductLineGroup = {
  productKey: string;
  productName: string;
  totalWeight: number;
  batches: ProductBatchSummary[];
};

const gramsToKgStr = (grams: number) => (grams / 1000).toFixed(3);

const kgStrToGrams = (value: string) =>
  Math.round(parseFloat(value.replace(',', '.')) * 1000);

const getUsedAssignedBoxIds = (rows: BoxLineState[], excludeRowId?: string) =>
  new Set(
    rows
      .filter((box) => box.id !== excludeRowId && box.assignedBoxId != null)
      .map((box) => box.assignedBoxId as number),
  );

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

  const [showScanModal, setShowScanModal] = useState(false);
  const [eanInput, setEanInput] = useState('');
  const [scannedBoxes, setScannedBoxes] = useState<BoxLineState[]>([]);
  const [batchPickerFor, setBatchPickerFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sendingOrder, setSendingOrder] = useState(false);
  const eanRef = useRef<TextInput>(null);
  const nextScannedRowId = useRef(1);

  const { data: scanBoxes, isLoading: scanBoxesLoading } = useQuery({
    queryKey: ['scanBoxes'],
    queryFn: fetchScanBoxes,
    enabled: showScanModal,
  });

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
        };

      batchSummary.totalWeight += soldWeight;
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

  const boxesByProductId = useMemo(() => {
    const grouped = new Map<number, ScanInventoryBox[]>();

    (scanBoxes ?? []).forEach((box) => {
      const productId = box.Batch?.Product?.id;

      if (!productId || !box.Batch?.Product) {
        return;
      }

      const existing = grouped.get(productId) ?? [];
      existing.push(box);
      grouped.set(productId, existing);
    });

    return grouped;
  }, [scanBoxes]);

  const boxesByEan = useMemo(() => {
    const grouped = new Map<string, ScanInventoryBox[]>();

    (scanBoxes ?? []).forEach((box) => {
      const ean = box.Batch?.Product?.ean?.trim();

      if (!ean || !box.Batch?.Product) {
        return;
      }

      const existing = grouped.get(ean) ?? [];
      existing.push(box);
      grouped.set(ean, existing);
    });

    return grouped;
  }, [scanBoxes]);

  const findNextAvailableBox = (
    productId: number,
    batchId: number,
    excludeRowId?: string,
  ) => {
    const usedIds = getUsedAssignedBoxIds(scannedBoxes, excludeRowId);

    return (
      (boxesByProductId.get(productId) ?? []).find(
        (box) => box.Batch?.id === batchId && !usedIds.has(box.id),
      ) ?? null
    );
  };

  const batchPickerRow = useMemo(
    () => scannedBoxes.find((box) => box.id === batchPickerFor) ?? null,
    [batchPickerFor, scannedBoxes],
  );

  const batchPickerOptions = useMemo<BatchPickerOption[]>(() => {
    if (!batchPickerRow) {
      return [];
    }

    const optionsByBatchId = new Map<number, BatchPickerOption>();
    const usedIds = getUsedAssignedBoxIds(scannedBoxes, batchPickerRow.id);

    (boxesByProductId.get(batchPickerRow.productId) ?? []).forEach((box) => {
      const batch = box.Batch;

      if (!batch) {
        return;
      }

      const existing =
        optionsByBatchId.get(batch.id) ??
        {
          batchId: batch.id,
          batchNumber: batch.batch_number,
          productionDate: batch.production_date,
          currentWeight: batch.current_weight,
          availableCount: 0,
          nextBox: null,
        };

      if (!usedIds.has(box.id)) {
        existing.availableCount += 1;
        if (!existing.nextBox) {
          existing.nextBox = box;
        }
      }

      optionsByBatchId.set(batch.id, existing);
    });

    return [...optionsByBatchId.values()]
      .filter((option) => option.nextBox != null && option.availableCount > 0)
      .sort((left, right) => {
        const leftDate = left.productionDate ? Date.parse(left.productionDate) : Number.NaN;
        const rightDate = right.productionDate ? Date.parse(right.productionDate) : Number.NaN;

        if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) {
          return leftDate - rightDate;
        }

        if (Number.isFinite(leftDate)) {
          return -1;
        }

        if (Number.isFinite(rightDate)) {
          return 1;
        }

        return left.batchNumber.localeCompare(right.batchNumber, 'fi', {
          sensitivity: 'base',
        });
      });
  }, [batchPickerRow, boxesByProductId, scannedBoxes]);

  const scanTotalWeight = useMemo(
    () =>
      scannedBoxes.reduce((sum, box) => {
        const weightGrams = kgStrToGrams(box.weightKg);
        return sum + (Number.isFinite(weightGrams) ? weightGrams : 0);
      }, 0),
    [scannedBoxes],
  );

  const handleEanChange = (value: string) => {
    const normalizedValue = value.replace(/\s+/g, '');
    setEanInput(normalizedValue);

    if (normalizedValue.length === 13) {
      handleScan(normalizedValue);
    }
  };

  const handleScan = (ean: string) => {
    const normalizedEan = ean.replace(/\s+/g, '');

    if (!/^\d{13}$/.test(normalizedEan)) {
      Alert.alert('Virheellinen koodi', 'EAN-13 on 13-numeroinen.');
      setEanInput('');
      return;
    }

    if (scanBoxesLoading || !scanBoxes) {
      Alert.alert('Odota hetki', 'Laatikkotietoja ladataan viel\u00E4.');
      setEanInput('');
      return;
    }

    const matchingBoxes = boxesByEan.get(normalizedEan) ?? [];
    const product = matchingBoxes[0]?.Batch?.Product;

    if (!product || matchingBoxes.length === 0) {
      Alert.alert('Tuotetta ei l\u00F6ydy', 'Skannatulle koodille ei l\u00F6ytynyt varastossa olevaa laatikkoa.');
      setEanInput('');
      return;
    }

    const usedCount = scannedBoxes.filter((box) => box.productId === product.id).length;
    const suggestedBox = matchingBoxes[usedCount];

    if (!suggestedBox) {
      Alert.alert(
        'Ei riitt\u00E4v\u00E4sti laatikoita',
        `${product.name}: kaikki varastossa olevat laatikot on jo skannattu t\u00E4h\u00E4n tilaukseen.`,
      );
      setEanInput('');
      return;
    }

    setScannedBoxes((previous) => [
      ...previous,
      {
        id: String(nextScannedRowId.current++),
        productId: product.id,
        productName: product.name,
        weightKg: gramsToKgStr(suggestedBox.weight),
        weightEdited: false,
        selectedBatchId: null,
        selectedBatchNumber: null,
        assignedBoxId: null,
        assignedBoxWeightKg: null,
        pricePerKg: product.price_per_kg,
      },
    ]);
    setEanInput('');
    setTimeout(() => eanRef.current?.focus(), 50);
  };

  const handleSelectBatch = (batchId: number, batchNumber: string) => {
    if (!batchPickerRow) {
      return;
    }

    const nextBox = findNextAvailableBox(batchPickerRow.productId, batchId, batchPickerRow.id);

    if (!nextBox) {
      Alert.alert(
        'Er\u00E4 ei ole saatavilla',
        'Valitusta er\u00E4st\u00E4 ei ole en\u00E4\u00E4 vapaita laatikoita t\u00E4lle riville.',
      );
      return;
    }

    setScannedBoxes((previous) =>
      previous.map((box) =>
        box.id === batchPickerRow.id
          ? {
              ...box,
              selectedBatchId: batchId,
              selectedBatchNumber: batchNumber,
              assignedBoxId: nextBox.id,
              assignedBoxWeightKg: nextBox.weight / 1000,
              weightKg: box.weightEdited ? box.weightKg : gramsToKgStr(nextBox.weight),
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
      if (!box.selectedBatchId || !box.assignedBoxId || !box.assignedBoxWeightKg) {
        Alert.alert('Er\u00E4 puuttuu', `Valitse er\u00E4 tuotteelle ${box.productName}.`);
        return;
      }

      const soldWeight = kgStrToGrams(box.weightKg);

      if (!Number.isFinite(soldWeight) || soldWeight <= 0) {
        Alert.alert('Virheellinen paino', `Tarkista paino: ${box.productName}`);
        return;
      }

      const maxWeight = Math.round(box.assignedBoxWeightKg * 1000);

      if (soldWeight > maxWeight) {
        Alert.alert(
          'Liian suuri paino',
          `${box.productName}: enint\u00E4\u00E4n ${box.assignedBoxWeightKg.toFixed(3)} kg.`,
        );
        return;
      }
    }

    setSaving(true);

    try {
      await confirmScan(
        orderId!,
        scannedBoxes.map((box) => ({
          batchId: box.selectedBatchId as number,
          boxIds: [box.assignedBoxId as number],
          soldWeight: kgStrToGrams(box.weightKg),
          pricePerGram: Math.round(box.pricePerKg),
        })),
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['orderLines', orderId],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ['scanBoxes'],
          exact: true,
        }),
      ]);

      setBatchPickerFor(null);
      setEanInput('');
      setScannedBoxes([]);
      setShowScanModal(false);
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.status === 502) {
        // Rivit luotu onnistuneesti, mutta Netvisor-synkronointi epäonnistui.
        // Suljetaan modal ja päivitetään näkymä — käyttäjä voi yrittää lähettää tilauksen myöhemmin.
        setShowScanModal(false);
        setScannedBoxes([]);
        setEanInput('');
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['orderLines', orderId], exact: true }),
          queryClient.invalidateQueries({ queryKey: ['scanBoxes'], exact: true }),
        ]);
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

  const handleSendOrder = () => {
    Alert.alert(
      'Lähetä tilaus',
      'Haluatko varmasti lähettää tämän tilauksen?',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Lähetä',
          style: 'default',
          onPress: async () => {
            setSendingOrder(true);
            try {
              await updateOrder(orderId!, { status: 'sent' });
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['orders', orderId], exact: true }),
                queryClient.invalidateQueries({ queryKey: ['orders'] }),
              ]);
              Alert.alert('Tilaus lähetetty', 'Tilaus on lähetetty Netvisoriin.');
            } catch (sendError) {
              const errMessage = (() => {
                if (sendError instanceof ApiError) {
                  const p = sendError.payload as Record<string, unknown> | null;
                  return String(p?.details ?? p?.error ?? sendError.message);
                }
                return sendError instanceof Error ? sendError.message : 'Lähetys epäonnistui';
              })();
              Alert.alert('Lähetys epäonnistui', errMessage);
            } finally {
              setSendingOrder(false);
            }
          },
        },
      ],
    );
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
        contentContainerStyle={components.odScrollContent}
        showsVerticalScrollIndicator={false}
        style={components.odScroll}
      >
        <View style={components.odCustomerPill}>
          <Text numberOfLines={1} style={components.odCustomerPillText}>
            {customerName ?? 'Tilaus'}
          </Text>
          {dateLabel ? <Text style={components.odDateText}>{dateLabel}</Text> : null}
        </View>

        {groupedLines.length === 0 ? (
          <Text style={components.odTableEmptyText}>Ei tilausrivejä vielä.</Text>
        ) : (
          groupedLines.map((group) => (
            <View key={group.productKey} style={components.odProductCard}>
              <View style={components.odProductCardHeader}>
                <Text numberOfLines={1} style={components.odProductCardName}>
                  {group.productName}
                </Text>
              </View>

              {group.batches.map((batch, batchIndex) => (
                <View key={batch.batchKey}>
                  <View style={components.odBatchRow}>
                    <Text style={components.odBatchRowLabel}>{batch.batchLabel}</Text>
                    <Text style={components.odBatchRowWeight}>
                      {formatKg(batch.totalWeight)} kg
                    </Text>
                  </View>
                  {batchIndex < group.batches.length - 1 ? (
                    <View style={components.odTableRowDivider} />
                  ) : null}
                </View>
              ))}

              <View style={components.odProductCardTotalDivider} />
              <View style={components.odProductCardTotalRow}>
                <Text style={components.odProductCardTotalLabel}>YHTEENSÄ</Text>
                <Text style={components.odProductCardTotalWeight}>
                  {formatKg(group.totalWeight)} kg
                </Text>
              </View>
            </View>
          ))
        )}

        <Pressable
          onPress={() => setShowScanModal(true)}
          style={({ pressed }) => [components.odSkannaaBtn, pressed && screen.pressed]}
        >
          <Text style={components.odSkaannaaBtnText}>SKANNAA</Text>
        </Pressable>
      </ScrollView>

      <View style={components.odFooter}>
        <Pressable
          disabled={sendingOrder}
          onPress={handleSendOrder}
          style={({ pressed }) => [
            components.odLahetaBtn,
            (pressed || sendingOrder) && screen.pressed,
          ]}
        >
          <Text style={components.odLahetaBtnText}>
            {sendingOrder ? 'LÄHETETÄÄN...' : 'LÄHETÄ TILAUS'}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowScanModal(false)}
        transparent
        visible={showScanModal}
      >
        <SafeAreaView style={components.smOverlay}>
          <View style={components.smShell}>
            <View style={components.smTopRow}>
              <View style={components.smCustomerPill}>
                <Text numberOfLines={1} style={components.smCustomerPillText}>
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

            <View style={components.smPanel}>
              <View style={components.smScanFieldRow}>
                <TextInput
                  autoFocus
                  keyboardType="numeric"
                  onChangeText={handleEanChange}
                  placeholder="ALOITA SKANNAAMINEN..."
                  placeholderTextColor="rgba(0,0,0,0.32)"
                  ref={eanRef}
                  returnKeyType="done"
                  style={components.smScanFieldInput}
                  value={eanInput}
                />
                <Ionicons color="rgba(0,0,0,0.42)" name="barcode-outline" size={28} />
              </View>

              <View style={components.smTableHeader}>
                <View style={components.smDeleteCell} />
                <Text style={[components.smTableHeaderText, components.smProductCell]}>
                  TUOTE
                </Text>
                <Text style={[components.smTableHeaderText, components.smBatchCell]}>ERÄ</Text>
                <Text style={[components.smTableHeaderText, components.smWeightCell]}>PAINO</Text>
              </View>

              {scanBoxesLoading ? (
                <Text style={components.smScanningText}>Ladataan skannattavia laatikoita...</Text>
              ) : null}

              <FlatList
                data={scannedBoxes}
                ItemSeparatorComponent={() => <View style={components.smTableDivider} />}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <Text style={components.smScanEmpty}>
                    Skannaa viivakoodeja, valitse erä jokaiselle riville ja tarkista painot.
                  </Text>
                }
                renderItem={({ item }) => (
                  <View style={components.smTableRow}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      disabled={saving}
                      onPress={() => handleRemoveScannedRow(item.id)}
                      style={components.smDeleteCell}
                    >
                      <Ionicons color="rgba(0,0,0,0.54)" name="close" size={22} />
                    </TouchableOpacity>

                    <Text
                      numberOfLines={1}
                      style={[components.smTableRowText, components.smProductCell]}
                    >
                      {item.productName}
                    </Text>

                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={() => setBatchPickerFor(item.id)}
                      style={[components.smBatchCell, components.smBatchSelectBtn]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          components.smBatchSelectText,
                          !item.selectedBatchNumber && components.smBatchSelectPlaceholder,
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
                      style={components.smWeightInput}
                      value={item.weightKg}
                    />
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                style={components.smTableList}
              />

              <View style={components.smFooterRow}>
                <Text style={components.smScanTotal}>Yhteensä {formatKg(scanTotalWeight)} kg</Text>

                <TouchableOpacity
                  disabled={saving || scannedBoxes.length === 0}
                  onPress={handleSave}
                  style={[
                    components.smSavePill,
                    (saving || scannedBoxes.length === 0) && components.smSaveBtnDisabled,
                  ]}
                >
                  <Text style={components.smSavePillText}>
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
                    onPress={() => handleSelectBatch(option.batchId, option.batchNumber)}
                    style={components.modalRow}
                  >
                    <Text style={components.modalRowText}>{option.batchNumber}</Text>
                    <Text style={components.modalRowSubText}>
                      {(toFinnishDate(option.productionDate) ?? 'Ei p\u00E4iv\u00E4yst\u00E4') +
                        ` / ${option.availableCount} laatikkoa / ${formatKg(option.currentWeight)} kg`}
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
    </ScreenLayout>
  );
}

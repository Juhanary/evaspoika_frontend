import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
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
import { OrderLine } from '@/src/features/orderLines/domain/types';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { previewScan, confirmScan } from '@/src/features/scan/infrastructure/scanApi';
import { colors } from '@/src/shared/constants/colors';
import { formatKg } from '@/src/shared/utils/weight';
import { components } from '@/src/shared/styles/components';
import { screen } from '@/src/shared/styles/screen';
import { ScreenCloseButton } from '@/src/shared/ui/ScreenCloseButton/ScreenCloseButton';

type Props = { orderId?: number };

type BoxLineState = {
  boxId: number;
  productId: number;
  productName: string;
  defaultWeightKg: number;
  selectedBatchId: number;
  selectedBatchNumber: string;
  isPartial: boolean;
  partialWeightKg: string;
  pricePerKg: number;
};

const gramsToKgStr = (g: number) => (g / 1000).toFixed(3);
const kgStrToGrams = (s: string) => Math.round(parseFloat(s.replace(',', '.')) * 1000);

const toFinnishDate = (s?: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
  const { data: allBatches } = useBatches();

  const [showScanModal, setShowScanModal] = useState(false);
  const [eanInput, setEanInput] = useState('');
  const [scannedBoxes, setScannedBoxes] = useState<BoxLineState[]>([]);
  const [batchPickerFor, setBatchPickerFor] = useState<number | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const eanRef = useRef<TextInput>(null);

  const customerName = useMemo(() => {
    if (!order || !customers) return null;
    const cid = order.customer_id ?? (order as any).CustomerId;
    return customers.find((c) => c.id === cid)?.name ?? null;
  }, [order, customers]);

  const activeLines = useMemo<OrderLine[]>(
    () => (orderLines ?? []).filter((l) => !l.deleted_at),
    [orderLines]
  );

  const totalWeight = activeLines.reduce((s, l) => s + (l.sold_weight ?? 0), 0);

  const batchesForPicker = useMemo(() => {
    if (batchPickerFor == null || !allBatches) return [];
    const productId = scannedBoxes[batchPickerFor]?.productId;
    return allBatches.filter(
      (b) => b.ProductId === productId && !b.deleted_at && b.current_weight > 0
    );
  }, [batchPickerFor, allBatches, scannedBoxes]);

  const scanTotalWeight = useMemo(
    () =>
      scannedBoxes.reduce((s, box) => {
        const g = box.isPartial
          ? kgStrToGrams(box.partialWeightKg)
          : Math.round(box.defaultWeightKg * 1000);
        return s + (isFinite(g) ? g : 0);
      }, 0),
    [scannedBoxes]
  );

  const handleEanChange = (v: string) => {
    setEanInput(v);
    if (v.trim().length === 13) handleScan(v.trim());
  };

  const handleScan = async (ean: string) => {
    if (!/^\d{13}$/.test(ean)) {
      Alert.alert('Virheellinen koodi', 'EAN-13 on 13-numeroinen.');
      setEanInput('');
      return;
    }
    setScanLoading(true);
    try {
      const preview = await previewScan([{ ean, count: 1 }]);
      const newBoxes: BoxLineState[] = preview.flatMap((item) =>
        item.boxes.map((box) => ({
          boxId: box.id,
          productId: item.productId,
          productName: item.productName,
          defaultWeightKg: box.weight / 1000,
          selectedBatchId: item.batchId,
          selectedBatchNumber: item.batchNumber,
          isPartial: false,
          partialWeightKg: gramsToKgStr(box.weight),
          pricePerKg: item.pricePerKg,
        }))
      );
      setScannedBoxes((prev) => [...prev, ...newBoxes]);
    } catch (err) {
      Alert.alert('Virhe', err instanceof Error ? err.message : 'Skannaus epäonnistui');
    } finally {
      setScanLoading(false);
      setEanInput('');
      setTimeout(() => eanRef.current?.focus(), 50);
    }
  };

  const handleSave = async () => {
    if (scannedBoxes.length === 0) {
      Alert.alert('Tyhjä', 'Ei laatikoita tallennettavaksi.');
      return;
    }
    for (const box of scannedBoxes) {
      if (box.isPartial) {
        const g = kgStrToGrams(box.partialWeightKg);
        if (!isFinite(g) || g <= 0) {
          Alert.alert('Virheellinen paino', `Tarkista paino: ${box.productName}`);
          return;
        }
        if (g > Math.round(box.defaultWeightKg * 1000)) {
          Alert.alert(
            'Liian suuri paino',
            `${box.productName}: enintään ${box.defaultWeightKg.toFixed(3)} kg.`
          );
          return;
        }
      }
    }
    setSaving(true);
    try {
      await confirmScan(
        orderId!,
        scannedBoxes.map((box) => ({
          batchId: box.selectedBatchId,
          boxIds: [box.boxId],
          soldWeight: box.isPartial
            ? kgStrToGrams(box.partialWeightKg)
            : Math.round(box.defaultWeightKg * 1000),
          pricePerGram: Math.round(box.pricePerKg),
        }))
      );
      await queryClient.invalidateQueries({
        queryKey: ['orderLines', orderId],
        exact: true,
      });
      await queryClient.refetchQueries({
        queryKey: ['orderLines', orderId],
        exact: true,
      });
      setBatchPickerFor(null);
      setEanInput('');
      setScannedBoxes([]);
      setShowScanModal(false);
    } catch (err) {
      Alert.alert('Virhe', err instanceof Error ? err.message : 'Tallennus epäonnistui');
    } finally {
      setSaving(false);
    }
  };

  if (!orderId || (!isLoading && (error || !order))) {
    return (
      <ScreenLayout title="TILAUS">
        <View style={screen.centered}>
          <Text style={screen.muted}>Tilausta ei löydy.</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (isLoading) {
    return (
      <ScreenLayout title="TILAUS">
        <View style={screen.centered}>
          <Text style={screen.muted}>Ladataan...</Text>
        </View>
      </ScreenLayout>
    );
  }

  const dateStr = toFinnishDate(order!.order_date);

  return (
    <ScreenLayout title="TILAUS">
      <ScrollView
        style={components.odScroll}
        contentContainerStyle={components.odScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer name pill */}
        <View style={components.odCustomerPill}>
          <Text style={components.odCustomerPillText} numberOfLines={1}>
            {customerName ?? `Tilaus #${order!.id}`}
          </Text>
          {dateStr ? <Text style={components.odDateText}>{dateStr}</Text> : null}
        </View>

        {/* Table section */}
        <View style={components.odTableSection}>
          {/* Column headers */}
          <View style={components.odTableHeaders}>
            <Text style={[components.odTableHeaderText, { flex: 3 }]}>TUOTE</Text>
            <Text style={[components.odTableHeaderText, { flex: 3, textAlign: 'center' }]}>ERÄ</Text>
            <Text style={[components.odTableHeaderText, { flex: 2, textAlign: 'right' }]}>PAINO</Text>
          </View>

          {/* White table background */}
          <View style={components.odTableBody}>
            {activeLines.length === 0 ? (
              <Text style={components.odTableEmptyText}>Ei tilausrivejä vielä.</Text>
            ) : (
              activeLines.map((line, i) => (
                <View key={line.id}>
                  <View style={components.odTableRow}>
                    <Text style={[components.odTableRowText, { flex: 3 }]} numberOfLines={1}>
                      {line.Batch?.Product?.name ?? `Erä #${line.BatchId}`}
                    </Text>
                    <Text style={[components.odTableRowText, { flex: 3, textAlign: 'center' }]}>
                      {line.Batch?.batch_number ?? '-'}
                    </Text>
                    <Text style={[components.odTableRowText, { flex: 2, textAlign: 'right' }]}>
                      {formatKg(line.sold_weight)} kg
                    </Text>
                  </View>
                  {i < activeLines.length - 1 && <View style={components.odTableRowDivider} />}
                </View>
              ))
            )}

            {/* Total row */}
            {totalWeight > 0 && (
              <>
                <View style={components.odTotalDivider} />
                <View style={components.odTotalRow}>
                  <Text style={components.odTotalText}>YHTEENSÄ</Text>
                  <Text style={components.odTotalWeight}>{formatKg(totalWeight)} kg</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* SKANNAA button */}
        <Pressable
          style={({ pressed }) => [components.odSkannaaBtn, pressed && screen.pressed]}
          onPress={() => setShowScanModal(true)}
        >
          <Text style={components.odSkaannaaBtnText}>SKANNAA</Text>
        </Pressable>
      </ScrollView>

      {/* Scan modal */}
      <Modal
        visible={showScanModal}
        animationType="slide"
        onRequestClose={() => setShowScanModal(false)}
      >
        <SafeAreaView style={components.smContainer}>
          <View style={components.smHeader}>
            <Text style={components.smTitle}>Skannaa laatikoita</Text>
            <ScreenCloseButton onPress={() => setShowScanModal(false)} />
          </View>

          <TextInput
            ref={eanRef}
            style={components.smEanInput}
            value={eanInput}
            onChangeText={handleEanChange}
            onSubmitEditing={() => handleScan(eanInput)}
            placeholder="Skannaa EAN-13..."
            keyboardType="numeric"
            autoFocus
            returnKeyType="done"
          />
          {scanLoading && (
            <Text style={components.smScanningText}>Haetaan tietoja...</Text>
          )}

          <FlatList
            data={scannedBoxes}
            keyExtractor={(_, i) => String(i)}
            style={components.smBoxList}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <View style={components.smBoxCard}>
                <View style={components.smBoxCardHeader}>
                  <Text style={components.smBoxProductName}>{item.productName}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setScannedBoxes((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={components.smBatchRow}
                  onPress={() => setBatchPickerFor(index)}
                >
                  <Text style={components.smBatchLabel}>Erä: </Text>
                  <Text style={components.smBatchValue}>{item.selectedBatchNumber}</Text>
                  <Text style={components.smBatchChange}> (vaihda ▾)</Text>
                </TouchableOpacity>

                <View style={components.smPartialRow}>
                  <Text style={components.smPartialLabel}>Vajaa</Text>
                  <Switch
                    value={item.isPartial}
                    onValueChange={(v) =>
                      setScannedBoxes((prev) =>
                        prev.map((b, i) =>
                          i === index ? { ...b, isPartial: v } : b
                        )
                      )
                    }
                    trackColor={{ true: colors.primary }}
                  />
                </View>

                <View style={components.smWeightRow}>
                  <Text style={components.smWeightLabel}>Paino (kg):</Text>
                  {item.isPartial ? (
                    <TextInput
                      style={components.smWeightInput}
                      value={item.partialWeightKg}
                      onChangeText={(v) =>
                        setScannedBoxes((prev) =>
                          prev.map((b, i) =>
                            i === index ? { ...b, partialWeightKg: v } : b
                          )
                        )
                      }
                      keyboardType="decimal-pad"
                      selectTextOnFocus
                    />
                  ) : (
                    <Text style={components.smWeightStatic}>
                      {item.defaultWeightKg.toFixed(3)}
                    </Text>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={components.smScanEmpty}>
                Skannaa laatikoita yläpuolella olevalla kentällä.
              </Text>
            }
          />

          <View style={components.smFooter}>
            <Text style={components.smScanTotal}>
              Yhteensä: {formatKg(scanTotalWeight)} kg
            </Text>
            <TouchableOpacity
              style={[
                components.smSaveBtn,
                (saving || scannedBoxes.length === 0) && components.smSaveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={saving || scannedBoxes.length === 0}
            >
              <Text style={components.smSaveBtnText}>
                {saving ? 'Tallennetaan...' : 'Tallenna'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Nested batch picker */}
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
                    onPress={() => {
                      setScannedBoxes((prev) =>
                        prev.map((box, i) =>
                          i === batchPickerFor
                            ? {
                                ...box,
                                selectedBatchId: b.id,
                                selectedBatchNumber: b.batch_number,
                              }
                            : box
                        )
                      );
                      setBatchPickerFor(null);
                    }}
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
      </Modal>
    </ScreenLayout>
  );
}

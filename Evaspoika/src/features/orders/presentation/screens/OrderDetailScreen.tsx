import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { Button } from '@/src/shared/ui/Button/ActionButton';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { useNetvisorOrderLines, useOrder } from '../hooks/useOrders';
import {
  completeManualOrderComposition,
} from '../../infrastructure/ordersApi';
import { ManualBoxPicker, type ManualBoxSelection } from '../components/ManualBoxPicker';
import { fetchOrderLines, createOrderLine, deleteOrderLine } from '@/src/features/orderLines/infrastructure/orderLinesApi';
import { fetchBoxByEan } from '@/src/features/boxes/infrastructure/boxesApi';
import { OrderLine } from '@/src/features/orderLines/domain/types';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { colors } from '@/src/shared/constants/colors';
import { formatKg, parseWeightToGrams } from '@/src/shared/utils/weight';
import { formatDateFi } from '@/src/shared/utils/date';
import { ApiError } from '@/src/infrastructure/api/error';
import { components, screen } from '@/src/shared/styles/components';
import { orderStyles } from '@/src/shared/styles/orders';
import type { NetvisorOrderLinePreview } from '../../domain/types';

type Props = { orderId?: number };

type BoxLineState = {
  id: string;
  ean: string;
  // Varaston laatikon id (BOX.id), ei tämän listarivin id. Kulkee tallennuksessa
  // backendille, joka luo ORDER_LINE_BOX -liitoksen jäljitystä varten.
  boxId: number | null;
  productId: number | null;
  productName: string;
  /** Rivin paino kiloina. Esitäyttyy siitä mitä laatikossa on jäljellä, ei tarrasta. */
  weightKg: string;
  /**
   * Tarran paino kiloina silloin kun se eroaa jäljellä olevasta — osittain syöty
   * laatikko. Näytetään rivillä, jottei esitäytön ja tarran ero jää huomaamatta.
   * null kun tarra vastaa sisältöä tai laatikolla ei ole tarraa.
   */
  labelWeightKg: number | null;
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

/**
 * Backend merkitsee vastaukseen netvisorResendPending, kun muutos tallentui mutta
 * sen lähetys Netvisoriin kaatui. Pelkkä 502 ei kerro tätä: rivin poisto palauttaa
 * saman statuksen myös silloin kun mitään ei poistettu.
 */
function isNetvisorResendPending(err: unknown): err is ApiError {
  if (!(err instanceof ApiError)) return false;
  const payload = err.payload as Record<string, unknown> | null;
  return payload?.netvisorResendPending === true;
}

export default function OrderDetailScreen({ orderId }: Props) {
  const queryClient = useQueryClient();
  // Tilaus mukaan, koska sen netvisor_resend_required-merkintä muuttuu jokaisessa
  // tallennuksessa — muuten "Lähettämättä"-merkki jäisi näkyviin tai puuttuisi.
  const refreshOrderAndLines = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['orderLines', orderId], exact: true }),
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
    ]);
  const { data: order, isLoading, error } = useOrder(orderId);
  const isManualComposition = order?.manual_composition_required === true;
  const { data: netvisorLines, isLoading: netvisorLinesLoading, error: netvisorLinesError } =
    useNetvisorOrderLines(orderId, isManualComposition);
  const { data: orderLines } = useQuery({
    queryKey: ['orderLines', orderId],
    queryFn: () => fetchOrderLines(orderId!),
    enabled: !!orderId,
  });
  const { data: customers } = useCustomers();
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: products, isLoading: productsLoading } = useProducts();

  const [showScanModal, setShowScanModal] = useState(false);
  const [eanInput, setEanInput] = useState('');
  const [scannedBoxes, setScannedBoxes] = useState<BoxLineState[]>([]);
  const [batchPickerFor, setBatchPickerFor] = useState<string | null>(null);
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingLineId, setDeletingLineId] = useState<number | null>(null);
  const eanRef = useRef<TextInput>(null);
  const eanValueRef = useRef('');
  const nextScannedRowId = useRef(1);
  const scanLockRef = useRef(false);

  const completeCompositionMutation = useMutation({
    mutationFn: () => completeManualOrderComposition(orderId!),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders', orderId] }),
        queryClient.invalidateQueries({ queryKey: ['orderLines', orderId] }),
      ]);
      Alert.alert('Koostumus lähetetty', 'Tilaus on päivitetty Netvisoriin.');
    },
    onError: (compositionError) => {
      const message = compositionError instanceof ApiError
        ? String((compositionError.payload as Record<string, unknown> | null)?.details ??
            (compositionError.payload as Record<string, unknown> | null)?.error ??
            compositionError.message)
        : compositionError instanceof Error
          ? compositionError.message
          : 'Netvisor-päivitys epäonnistui';
      Alert.alert(
        'Koosteen lähetys epäonnistui',
        `${message}\n\nKoostetta ei tyhjennetty. Tarkista yhteys ja yritä uudelleen.`,
      );
    },
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

  const netvisorLineProgress = useMemo(() => {
    const localByBatch = new Map<string, number>();
    activeLines.forEach((line) => {
      const batchNumber = line.Batch?.batch_number;
      if (batchNumber) {
        localByBatch.set(
          batchNumber,
          (localByBatch.get(batchNumber) ?? 0) + Number(line.sold_weight || 0),
        );
      }
    });

    const grouped = new Map<string, NetvisorOrderLinePreview>();
    (netvisorLines?.lines ?? []).forEach((line) => {
      const key = `${line.productNetvisorKey ?? line.productName ?? 'product'}|${line.batchNumber ?? 'no-batch'}`;
      const previous = grouped.get(key);
      grouped.set(key, previous
        ? { ...previous, quantityGrams: previous.quantityGrams + line.quantityGrams, quantityKg: (previous.quantityGrams + line.quantityGrams) / 1000 }
        : { ...line });
    });

    return [...grouped.values()].map((line) => ({
      line,
      addedGrams: line.batchNumber ? localByBatch.get(line.batchNumber) ?? 0 : 0,
    }));
  }, [activeLines, netvisorLines]);

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

  // Listalla jo olevat laatikot. Sama lista kelpaa sekä skannauksen poissulkuun että
  // käsivalinnan suodatukseen; muistissa siksi, ettei käsivalitsin suodata laatikoitaan
  // uudelleen joka näppäinpainalluksella ja joka erälistan pollauksella.
  const listedBoxIds = useMemo(
    () => scannedBoxes.map((row) => row.boxId).filter((id): id is number => id != null),
    [scannedBoxes],
  );

  const scanTotalWeight = useMemo(
    () =>
      scannedBoxes.reduce((sum, box) => {
        const weightGrams = parseWeightToGrams(box.weightKg);
        return sum + (Number.isFinite(weightGrams) ? weightGrams : 0);
      }, 0),
    [scannedBoxes],
  );

  const handleEanChange = (value: string) => {
    const clean = value.replace(/\s+/g, '');
    eanValueRef.current = clean;
    setEanInput(clean);
  };

  const handleScan = async (ean: string) => {
    const normalizedEan = ean.replace(/\s+/g, '').trim();
    if (!normalizedEan || scanLockRef.current) return;
    scanLockRef.current = true;
    setEanInput('');

    try {
      // Jo listalla olevat pois hausta, jotta samanpainoisista laatikoista saadaan
      // seuraava vapaa eikä aina samaa riviä. Backend kertoo 409:llä jos koodin
      // kaikki laatikot ovat jo listalla.
      const box = await fetchBoxByEan(normalizedEan, listedBoxIds);

      // Varmistus sen varalta että backend palauttaisi silti jo listalla olevan rivin.
      if (scannedBoxes.some((scanned) => scanned.boxId === box.id)) {
        Alert.alert('Jo skannattu', 'Tämä laatikko on jo tässä listassa.');
        return;
      }

      // EAN-13 muoto: tyyppi(2) + laitostunnus(4) + tuotekoodi(2) + paino(4) + tarkiste(1)
      const productCodeFromEan =
        normalizedEan.length === 13 && normalizedEan.charAt(0) === '2'
          ? Number(normalizedEan.substring(6, 8))
          : null;

      // Jos boksin tallennettu tuote ei vastaa EAN:n tuotekoodia, käytetään EAN:n tuotetta.
      const productFromDb = (products ?? []).find((p) => p.id === box.ProductId);
      const productByCode = (productCodeFromEan && productCodeFromEan > 0)
        ? (products ?? []).find((p) => p.product_code != null && p.product_code === productCodeFromEan)
        : null;

      const useOverride = productByCode != null && productByCode.id !== box.ProductId;
      const resolvedProductId   = useOverride ? productByCode!.id   : box.ProductId;
      const resolvedProductName = useOverride ? productByCode!.name : box.productName;
      const resolvedPricePerKg  = (useOverride ? productByCode!.price_per_kg : productFromDb?.price_per_kg) ?? 0;

      setScannedBoxes((previous) => [
        ...previous,
        {
          id: String(nextScannedRowId.current++),
          ean: normalizedEan,
          boxId: box.id,
          productId: resolvedProductId,
          productName: resolvedProductName,
          // Paino siitä mitä laatikossa on jäljellä, ei tarrasta: osittain syödystä
          // laatikosta lähtee asiakkaalle vain jäännös, ja tarran paino laskuttaisi
          // lihaa jota laatikossa ei ole. Tarran paino jää riville näkyviin.
          weightKg: box.remaining_weight_kg.toFixed(3),
          labelWeightKg:
            box.remaining_weight_kg !== box.weight_kg ? box.weight_kg : null,
          weightEdited: false,
          // When the product was overridden the old batch belongs to the wrong product,
          // so clear it and let the user pick a batch from the correct product.
          selectedBatchId: useOverride ? null : box.BatchId,
          selectedBatchNumber: useOverride ? null : box.batch_number,
          pricePerKg: resolvedPricePerKg,
        },
      ]);
    } catch (err) {
      // Backend erottaa toisistaan tuntemattoman koodin, jo myydyn laatikon ja
      // tilanteen jossa koodin kaikki laatikot ovat jo listalla — näytetään se syy.
      const message = err instanceof ApiError
        ? String((err.payload as Record<string, unknown> | null)?.error ?? err.message)
        : `Koodilla "${normalizedEan}" ei löydy varastosta bokseja.`;
      Alert.alert('Skannaus ei onnistunut', message);
    } finally {
      scanLockRef.current = false;
      setTimeout(() => eanRef.current?.focus(), 50);
    }
  };

  // Varastosta käsin valittu laatikko tuottaa saman rivin kuin skannaus: paino tulee
  // siitä mitä laatikossa on jäljellä, ja erä on tiedossa suoraan, joten riville ei
  // jää valittavaa. Tarraton laatikko ei tule koskaan lukijan kautta.
  const handleManualSelect = ({ box, batch, product }: ManualBoxSelection) => {
    setScannedBoxes((previous) => [
      ...previous,
      {
        id: String(nextScannedRowId.current++),
        ean: box.ean ?? '',
        boxId: box.id,
        productId: product?.id ?? batch.ProductId ?? null,
        productName: product?.name ?? 'Tuntematon',
        weightKg: (box.remaining_weight / 1000).toFixed(3),
        labelWeightKg:
          box.ean && box.remaining_weight !== box.weight ? box.weight / 1000 : null,
        weightEdited: false,
        selectedBatchId: batch.id,
        selectedBatchNumber: batch.batch_number,
        pricePerKg: product?.price_per_kg ?? 0,
      },
    ]);
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

  const handleCompleteComposition = () => {
    if (activeLines.length === 0) {
      Alert.alert('Koostumus puuttuu', 'Lisää tilaukselle vähintään yksi rivi.');
      return;
    }

    Alert.alert(
      'Viimeistele koostumus',
      'Netvisorin alkuperäiset rivit korvataan tällä koostella. Jatketaanko?',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Lähetä Netvisoriin',
          onPress: () => completeCompositionMutation.mutate(),
        },
      ],
    );
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

      const soldWeight = parseWeightToGrams(box.weightKg);

      if (!Number.isFinite(soldWeight) || soldWeight <= 0) {
        Alert.alert('Virheellinen paino', `Tarkista paino: ${box.productName}`);
        return;
      }

    }

    setSaving(true);

    try {
      // Yhdellä erällä on tilauksella vain yksi rivi, joten saman erän laatikot
      // niputetaan yhdeksi pyynnöksi. Backend yhdistäisi ne muutenkin (kasvattaisi
      // olemassa olevan rivin painoa), mutta niputus säästää turhat Netvisor-kutsut.
      //
      // Laatikoiden id:t kulkevat mukana boxIds-listana: niistä syntyy ORDER_LINE_BOX
      // -liitokset, joita reklamaation jäljitys seuraa, ja niiden avulla backend estää
      // saman laatikon lisäämisen tilaukselle kahdesti.
      const linesByBatch = new Map<
        number,
        { soldWeight: number; pricePerKg: number; boxIds: number[] }
      >();
      for (const box of scannedBoxes) {
        const batchId = box.selectedBatchId!;
        const soldWeight = parseWeightToGrams(box.weightKg);
        const existing = linesByBatch.get(batchId);

        if (existing) {
          existing.soldWeight += soldWeight;
          if (box.boxId != null) existing.boxIds.push(box.boxId);
        } else {
          linesByBatch.set(batchId, {
            soldWeight,
            pricePerKg: box.pricePerKg,
            boxIds: box.boxId != null ? [box.boxId] : [],
          });
        }
      }

      // Lähetetään rivit peräkkäin (ei Promise.all): jokainen POST /order-lines
      // synkronoi tilauksen Netvisoriin, ja ensimmäisen on ehdittävä tallentaa
      // netvisor_invoice_id ennen seuraavaa, jotta seuraavat tekevät "edit" eivätkä
      // luo uutta tilausta. Backend serialisoi tämän myös itse, mutta peräkkäin
      // lähettäminen välttää turhat rinnakkaiset edit-kutsut Netvisoriin.
      for (const [batchId, line] of linesByBatch) {
        await createOrderLine({
          orderId: orderId!,
          batchId,
          sold_weight: line.soldWeight,
          // Despite the name, ORDER_LINE.price_per_gram holds euros per kilo —
          // and it is an INTEGER column, so cents cannot survive here. The value
          // is display-only; the invoice sent to Netvisor prices every line from
          // Product.price_per_kg instead. Storing cents needs a backend column
          // change (price_per_kg_cents), not a client-side workaround.
          price_per_gram: Math.round(line.pricePerKg),
          boxIds: line.boxIds,
        });
      }

      await refreshOrderAndLines();

      setBatchPickerFor(null);
      setEanInput('');
      setScannedBoxes([]);
      setShowScanModal(false);
      Alert.alert('Tallennettu', 'Lisäys tallennettu tilaukseen onnistuneesti.');
    } catch (saveError) {
      if (
        isNetvisorResendPending(saveError) ||
        (saveError instanceof ApiError && saveError.status === 502)
      ) {
        setShowScanModal(false);
        setScannedBoxes([]);
        setEanInput('');
        await refreshOrderAndLines();
        const p = saveError.payload as Record<string, unknown> | null;
        const details = String(p?.details ?? p?.error ?? '');
        Alert.alert(
          'Tilausrivit lisätty',
          `Rivit lisätty onnistuneesti, mutta Netvisor-synkronointi epäonnistui${details ? `:\n${details}` : '.'}\n\nJärjestelmä yrittää lähetystä uudelleen automaattisesti noin 10 minuutin välein. Rivit ovat tallessa — niitä ei tarvitse lisätä uudelleen.`,
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
              await refreshOrderAndLines();
            } catch (err) {
              // Rivi poistui backendistä, vain Netvisor-lähetys jäi kesken. Aiemmin tämä
              // näkyi otsikolla "Poisto epäonnistui" ja poistettu rivi jäi listaan.
              if (isNetvisorResendPending(err)) {
                await refreshOrderAndLines();
                Alert.alert(
                  'Tilausrivi poistettu',
                  'Rivi on poistettu, mutta muutos ei vielä mennyt Netvisoriin. ' +
                    'Järjestelmä lähettää sen automaattisesti noin 10 minuutin välein.',
                );
                return;
              }
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

  const dateLabel = formatDateFi(order?.order_date);

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

        {order?.netvisor_resend_required ? (
          <View style={orderStyles.odUnsentCard}>
            <Text style={orderStyles.odUnsentTitle}>LÄHETTÄMÄTTÄ NETVISORIIN</Text>
            <Text style={orderStyles.odUnsentText}>
              Viimeisin muutos ei mennyt Netvisoriin. Rivit ovat tallessa, eikä niitä
              tarvitse lisätä uudelleen — järjestelmä lähettää ne automaattisesti noin
              10 minuutin välein.
            </Text>
          </View>
        ) : null}

        {isManualComposition ? (
          <View style={orderStyles.odNetvisorCard}>
            <View style={orderStyles.odNetvisorHeader}>
              <View style={orderStyles.odNetvisorHeaderText}>
                <Text style={orderStyles.odNetvisorTitle}>NETVISORIN TILAUS</Text>
                <Text style={orderStyles.odNetvisorHint}>
                  Lisää alla näkyvät tuotteet ja erät skannaamalla tai käsin.
                </Text>
              </View>
              <View style={orderStyles.netvisorPendingBadge}>
                <Text style={orderStyles.netvisorPendingBadgeText}>KOOSTETTAVA</Text>
              </View>
            </View>

            {netvisorLinesLoading ? (
              <Text style={orderStyles.odNetvisorMuted}>Haetaan Netvisorin rivejä...</Text>
            ) : netvisorLinesError ? (
              <Text style={orderStyles.odNetvisorError}>
                Netvisorin rivejä ei voitu hakea. Yritä päivittää näkymä.
              </Text>
            ) : netvisorLineProgress.length === 0 ? (
              <Text style={orderStyles.odNetvisorMuted}>Netvisorissa ei ole näytettäviä rivejä.</Text>
            ) : (
              netvisorLineProgress.map(({ line, addedGrams }, index) => (
                <View key={`${line.productNetvisorKey ?? line.productName ?? 'line'}-${index}`} style={orderStyles.odNetvisorLine}>
                  <View style={orderStyles.odNetvisorLineMain}>
                    <Text style={orderStyles.odNetvisorProduct}>
                      {line.productName ?? 'Tuote'}
                    </Text>
                    <Text style={orderStyles.odNetvisorBatch}>
                      Erä {line.batchNumber ?? 'ei ilmoitettu'}
                    </Text>
                  </View>
                  <Text style={orderStyles.odNetvisorWeight}>
                    {formatKg(addedGrams)} / {formatKg(line.quantityGrams)} kg
                  </Text>
                </View>
              ))
            )}

            <Text style={orderStyles.odNetvisorFooterText}>
              Koostetta ei lähetetä ennen kuin painat “Koostumus valmis”.
            </Text>
          </View>
        ) : null}

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
                        accessibilityLabel="Poista tilausrivi"
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
          <Text style={orderStyles.odVirtualScanBtnText}>LISÄÄ LAATIKKO</Text>
        </Pressable>

        {isManualComposition ? (
          <Pressable
            disabled={activeLines.length === 0 || completeCompositionMutation.isPending}
            onPress={handleCompleteComposition}
            style={({ pressed }) => [
              orderStyles.odCompleteCompositionBtn,
              (activeLines.length === 0 || completeCompositionMutation.isPending) &&
                orderStyles.odCompleteCompositionBtnDisabled,
              pressed && screen.pressed,
            ]}
          >
            <Text style={orderStyles.odCompleteCompositionText}>
              {completeCompositionMutation.isPending ? 'LÄHETETÄÄN...' : 'KOOSTUMUS VALMIS'}
            </Text>
          </Pressable>
        ) : null}

      </ScrollView>



      <AppModal animationType="fade" visible={showScanModal}>
          <View style={orderStyles.smOverlay} pointerEvents="box-none">
              <GlassCard blurRadius={24} style={orderStyles.smShell}>
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
              <TextInput
                autoFocus
                caretHidden
                keyboardType="numeric"
                onBlur={() => {
                  // Jokainen päällä avautuva modaali on lueteltava tässä: ilman sitä
                  // kenttä vetää fokuksen takaisin 80 ms:n päästä, ja modaalin omaan
                  // hakukenttään kirjoitetut merkit valuvat piilotettuun EAN-kenttään.
                  if (batchPickerFor === null && !showManualPicker && !saving) {
                    setTimeout(() => eanRef.current?.focus(), 80);
                  }
                }}
                onChangeText={handleEanChange}
                onSubmitEditing={() => handleScan(eanValueRef.current)}
                ref={eanRef}
                returnKeyType="done"
                showSoftInputOnFocus={false}
                style={orderStyles.smHiddenEanInput}
                value={eanInput}
              />
              <Pressable
                onPress={() => eanRef.current?.focus()}
                style={orderStyles.smScanStatusBar}
              >
                <Ionicons color="rgba(30, 140, 60, 0.85)" name="barcode-outline" size={24} />
                <Text style={orderStyles.smScanStatusBarText}>ALOITA SKANNAAMINEN</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Lisää laatikko varastosta ilman skannausta"
                disabled={saving}
                onPress={() => setShowManualPicker(true)}
                style={orderStyles.smManualAddBtn}
              >
                <Ionicons color={colors.iconOnLightStrong} name="cube-outline" size={20} />
                <Text style={orderStyles.smManualAddBtnText}>LISÄÄ LAATIKKO VARASTOSTA</Text>
              </Pressable>

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
                    Skannaa laatikoita tai valitse laatikko varastosta. Tarkista erä ja paino ennen tallennusta.
                  </Text>
                }
                renderItem={({ item }) => (
                  <View style={orderStyles.smTableRow}>
                    <TouchableOpacity
                      accessibilityLabel="Poista rivi"
                      accessibilityRole="button"
                      disabled={saving}
                      onPress={() => handleRemoveScannedRow(item.id)}
                      style={orderStyles.smDeleteCell}
                    >
                      <Ionicons color="rgba(0,0,0,0.54)" name="close" size={22} />
                    </TouchableOpacity>

                    <View style={orderStyles.smProductCell}>
                      <Text numberOfLines={1} style={orderStyles.smTableRowText}>
                        {item.productName}
                      </Text>
                      {/* Osittain syöty laatikko: tarra lupaa enemmän kuin laatikossa on.
                          Rivin paino on jäännös, joten ero on kerrottava — muuten
                          työntekijä luulee esitäytön olevan väärä ja korjaa sen tarran
                          mukaiseksi. */}
                      {item.labelWeightKg != null ? (
                        <Text style={orderStyles.smRowNote}>
                          tarrassa {item.labelWeightKg.toFixed(3)} kg
                        </Text>
                      ) : null}
                    </View>

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
          </GlassCard>
          </View>

        <ManualBoxPicker
          batches={batches ?? []}
          excludeBoxIds={listedBoxIds}
          onClose={() => setShowManualPicker(false)}
          onSelect={handleManualSelect}
          products={products ?? []}
          visible={showManualPicker}
        />

        <AppModal
          animationType="slide"
          onClose={() => setBatchPickerFor(null)}
          visible={batchPickerFor != null}
        >
          <View style={components.modalOverlay}>
            <View style={components.modalCard}>
              <Text style={components.modalTitle}>Valitse erä</Text>

              {productsLoading || batchesLoading ? (
                <View style={screen.centeredInline}>
                  <ActivityIndicator color={colors.muted} size="small" />
                </View>
              ) : batchPickerOptions.length === 0 ? (
                <Text style={components.modalEmpty}>Ei vapaita laatikoita tälle tuotteelle.</Text>
              ) : (
                <ScrollView style={orderStyles.batchPickerScroll} showsVerticalScrollIndicator={false}>
                  {batchPickerOptions.map((option) => (
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
                        {(formatDateFi(option.productionDate) ?? 'Ei p\u00E4iv\u00E4yst\u00E4') +
                          ` / ${formatKg(option.currentWeight)} kg`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Button
                label="Peruuta"
                onPress={() => setBatchPickerFor(null)}
                variant="cancel"
              />
            </View>
          </View>
        </AppModal>
      </AppModal>

    </ScreenLayout>
  );
}

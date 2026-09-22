import React, { useMemo, useRef, useState } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Product } from '@/src/features/products/domain/types';
import { submitWeighing } from '@/src/features/weighing/infrastructure/weighingApi';
import { colors } from '@/src/shared/constants/colors';
import { components } from '@/src/shared/styles/components';
import { batchStyles, orderStyles } from '@/src/shared/styles/orders';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { Button } from '@/src/shared/ui/Button/ActionButton';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import {
  formatDateDisplay,
  formatDateIso,
  parseFinnishDateStrict,
} from '@/src/shared/utils/date';
import { formatKg, parseWeightToGrams } from '@/src/shared/utils/weight';
import { fetchDeletedBatches } from '../../infrastructure/batchesApi';
import { Batch } from '../../domain/types';
import { useBatches } from '../hooks/useBatches';

/**
 * Uusi erä käsin, ilman vaakaa.
 *
 * Tarpeen kun vaaka on rikki tai tavara on tehty ennen kuin se ehti järjestelmään.
 * Laatikot lisätään yksi kerrallaan, joten erässä voi olla 1–x laatikkoa; jokainen
 * rivi on oma laatikkonsa omalla painollaan. Tarran koodin voi kirjoittaa riville,
 * mutta sen voi myös jättää tyhjäksi: silloin laatikko jää kokonaan ilman koodia
 * (noEan), koska keksitty koodi lupaisi tarran jota laatikon kyljessä ei ole. Tarraton
 * laatikko lisätään tilaukselle käsin varastosta valitsemalla, ei skannaamalla.
 *
 * Tallennus kulkee punnitusreitin kautta (POST /weighing) eikä POST /batches:n:
 * vain se luo erän, laatikon ja lokirivin samassa transaktiossa. Pelkkä erä ilman
 * laatikoita näyttäisi varastossa "0 laatikkoa, 50 kg", ja POST /boxes taas loisi
 * laatikon päivittämättä erän painoa — kumpikin ajaisi painon ja laatikkomäärän
 * erilleen, mitä koko laatikkokirjanpito on rakennettu estämään.
 *
 * Tuote valitaan aina listasta: tuotteet tulevat Netvisorista, eikä niitä luoda täällä.
 */

type BoxDraft = {
  id: string;
  /** Käyttäjän kirjoittama paino kiloina, esim. "10,5". */
  weightKg: string;
  /** Tarran koodi jos sellainen on — tyhjä jättää laatikon kokonaan ilman koodia. */
  ean: string;
};

type AddBatchModalProps = {
  onClose: () => void;
  products: Product[];
};

export const AddBatchModal = ({ onClose, products }: AddBatchModalProps) => {
  const queryClient = useQueryClient();
  const { data: batches } = useBatches();

  const [productId, setProductId] = useState<number | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productQuery, setProductQuery] = useState('');

  const [dateInput, setDateInput] = useState(formatDateDisplay(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const [bestBeforeInput, setBestBeforeInput] = useState('');
  const [showBestBeforePicker, setShowBestBeforePicker] = useState(false);
  const [pickerBestBeforeDate, setPickerBestBeforeDate] = useState(new Date());

  const [boxes, setBoxes] = useState<BoxDraft[]>([{ id: '1', weightKg: '', ean: '' }]);
  const [saving, setSaving] = useState(false);
  const [checkingDeleted, setCheckingDeleted] = useState(false);
  const nextId = useRef(2);

  const product = useMemo(
    () => products.find((item) => item.id === productId) ?? null,
    [products, productId],
  );

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter((item) => item.name.toLowerCase().includes(query));
  }, [products, productQuery]);

  // Erä jolle laatikot tosiasiassa menevät, jos tuotteella on jo erä tälle päivälle.
  // Näytetään kentän alla heti eikä vasta tallennuksessa: "uusi erä" ei silloin ole
  // uusi erä, ja parasta ennen -päivä jää olemassa olevan erän mukaiseksi.
  const existingBatch = useMemo(() => {
    if (!product) return null;
    const parsed = parseFinnishDateStrict(dateInput);
    if (!parsed) return null;

    const isoDate = formatDateIso(parsed);
    return (
      (batches ?? []).find(
        (batch) =>
          batch.ProductId === product.id &&
          batch.production_date === isoDate &&
          !batch.deleted_at,
      ) ?? null
    );
  }, [batches, dateInput, product]);

  const totalGrams = useMemo(
    () =>
      boxes.reduce((sum, box) => {
        const grams = parseWeightToGrams(box.weightKg);
        return Number.isFinite(grams) && grams > 0 ? sum + grams : sum;
      }, 0),
    [boxes],
  );

  const openDatePicker = () => {
    const parsed = parseFinnishDateStrict(dateInput);
    if (parsed) setPickerDate(parsed);
    setShowDatePicker(true);
  };

  const onDatePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && date) {
      setDateInput(formatDateDisplay(date));
      setPickerDate(date);
    }
  };

  const openBestBeforePicker = () => {
    const parsed = parseFinnishDateStrict(bestBeforeInput);
    if (parsed) setPickerBestBeforeDate(parsed);
    setShowBestBeforePicker(true);
  };

  const onBestBeforePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowBestBeforePicker(false);
    if (event.type === 'set' && date) {
      setBestBeforeInput(formatDateDisplay(date));
      setPickerBestBeforeDate(date);
    }
  };

  const addBox = () => {
    setBoxes((prev) => [...prev, { id: String(nextId.current++), weightKg: '', ean: '' }]);
  };

  const updateBox = (id: string, patch: Partial<BoxDraft>) => {
    setBoxes((prev) => prev.map((box) => (box.id === id ? { ...box, ...patch } : box)));
  };

  const removeBox = (id: string) => {
    setBoxes((prev) => prev.filter((box) => box.id !== id));
  };

  // Laatikot lähetetään yksi kerrallaan, ei Promise.all:lla: ne jakavat saman
  // (tuote, valmistuspäivä) -erän, joten rinnakkaiset pyynnöt kilpailisivat samasta
  // rivistä. Onnistuneet rivit poistetaan listalta sitä mukaa, jotta uudelleenyritys
  // ei lähetä — eikä kahdenna — jo tallennettuja laatikoita.
  const saveBoxes = async (
    target: Product,
    drafts: BoxDraft[],
    productionDate: Date,
    bestBefore: Date | null,
  ) => {
    setSaving(true);

    const failed: BoxDraft[] = [];
    let saved = 0;
    let labelless = 0;
    let firstError: unknown = null;

    for (const box of drafts) {
      const grams = parseWeightToGrams(box.weightKg);
      const ean = box.ean.trim();

      try {
        // Tyhjä kenttä tarkoittaa laatikkoa jolle ei tulosteta tarraa: noEan estää
        // backendia rakentamasta sille koodia, jota ei ole missään laatikon kyljessä.
        await submitWeighing({
          productId: target.id,
          ...(ean ? { ean } : { noEan: true }),
          weightKg: grams / 1000,
          productionDate: formatDateIso(productionDate),
          ...(bestBefore ? { bestBefore: formatDateIso(bestBefore) } : {}),
        });
        if (!ean) labelless += 1;
        saved += 1;
      } catch (err) {
        failed.push(box);
        firstError ??= err;
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['batches'] });
    await queryClient.invalidateQueries({ queryKey: ['batchEvents'] });

    setBoxes(failed);
    setSaving(false);

    if (failed.length === 0) {
      onClose();
      const labellessNote = labelless
        ? `\n\n${labelless} laatikkoa jäi ilman koodia — ne lisätään tilaukselle käsin ` +
          'varastosta valitsemalla, ei skannaamalla.'
        : '';
      Alert.alert(
        'Erä tallennettu',
        `${saved} laatikkoa, ${formatKg(totalGrams)} kg.${labellessNote}`,
      );
      return;
    }

    const detail = firstError instanceof Error ? `\n\n${firstError.message}` : '';
    Alert.alert(
      'Osa laatikoista jäi tallentamatta',
      `${saved} laatikkoa tallennettiin, ${failed.length} epäonnistui. ` +
        `Epäonnistuneet jäivät listalle — voit yrittää niitä uudelleen.${detail}`,
    );
  };

  const handleSave = async () => {
    if (!product) {
      Alert.alert('Tuote puuttuu', 'Valitse erän tuote.');
      return;
    }

    const productionDate = parseFinnishDateStrict(dateInput);
    if (!productionDate) {
      Alert.alert(
        'Virheellinen päivämäärä',
        `"${dateInput.trim()}" ei ole kelvollinen päivämäärä. Käytä muotoa pp.kk.vvvv.`,
      );
      return;
    }

    let bestBefore: Date | null = null;
    if (bestBeforeInput.trim()) {
      bestBefore = parseFinnishDateStrict(bestBeforeInput);
      if (!bestBefore) {
        Alert.alert(
          'Virheellinen parasta ennen -päivä',
          `"${bestBeforeInput.trim()}" ei ole kelvollinen päivämäärä. Käytä muotoa pp.kk.vvvv.`,
        );
        return;
      }
      if (bestBefore < productionDate) {
        Alert.alert(
          'Virheellinen parasta ennen -päivä',
          'Parasta ennen -päivä ei voi olla ennen valmistuspäivää.',
        );
        return;
      }
    }

    if (boxes.length === 0) {
      Alert.alert('Ei laatikoita', 'Lisää erään vähintään yksi laatikko.');
      return;
    }

    for (const [index, box] of boxes.entries()) {
      const grams = parseWeightToGrams(box.weightKg);
      if (!Number.isFinite(grams) || grams <= 0) {
        Alert.alert(
          'Virheellinen paino',
          `Laatikon ${index + 1} paino puuttuu tai on virheellinen. Syötä paino kilogrammoissa.`,
        );
        return;
      }
    }

    // Kanta sallii vain yhden erän per tuote ja valmistuspäivä, ja backend lisää
    // painon olemassa olevaan erään. Se on oikea lopputulos mutta ei sitä mitä
    // "uusi erä" -napista odottaa, joten se kysytään ensin.
    if (existingBatch) {
      Alert.alert(
        'Erä on jo olemassa',
        `Tuotteelle ${product.name} on jo erä päivälle ${dateInput.trim()} ` +
          `(${formatKg(existingBatch.current_weight)} kg). Lisätäänkö laatikot siihen? ` +
          'Erän parasta ennen -päivä ei muutu.',
        [
          { text: 'Peruuta', style: 'cancel' },
          {
            text: 'Lisää erään',
            onPress: () => {
              void saveBoxes(product, boxes, productionDate, bestBefore);
            },
          },
        ],
      );
      return;
    }

    // Poistettu erä ei ole erälistalla — GET /batches suodattaa ne pois — mutta backend
    // herättää sen henkiin: paino nollautuu uuden laatikon painoon ja erän aiemmat
    // punnitusrivit siirtyvät pois lokista. Sitä ei tehdä kysymättä, joten poistetut
    // haetaan tässä erikseen. Haku vain tallennushetkellä: se on harvinainen tapaus,
    // eikä modaalin auki pitäminen ansaitse omaa pollaustaan.
    setCheckingDeleted(true);
    let deletedBatch: Batch | undefined;
    try {
      const isoDate = formatDateIso(productionDate);
      deletedBatch = (await fetchDeletedBatches()).find(
        (batch) => batch.ProductId === product.id && batch.production_date === isoDate,
      );
    } catch (err) {
      setCheckingDeleted(false);
      Alert.alert(
        'Erien tarkistus epäonnistui',
        err instanceof Error ? err.message : 'Yhteys backendiin ei toiminut. Yritä uudelleen.',
      );
      return;
    }
    setCheckingDeleted(false);

    if (deletedBatch) {
      Alert.alert(
        'Erä on poistettu',
        `Tuotteelle ${product.name} on päivälle ${dateInput.trim()} poistettu erä. ` +
          'Laatikot lisätään siihen ja erä palautuu käyttöön, jolloin sen paino alkaa ' +
          'näistä laatikoista ja vanhat punnitukset siirtyvät pois lokin oletusnäkymästä. ' +
          'Jatketaanko?',
        [
          { text: 'Peruuta', style: 'cancel' },
          {
            text: 'Palauta erä',
            onPress: () => {
              void saveBoxes(product, boxes, productionDate, bestBefore);
            },
          },
        ],
      );
      return;
    }

    void saveBoxes(product, boxes, productionDate, bestBefore);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop: absorbs all stray touches — modal NEVER closes from outside */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />
      <View style={orderStyles.smOverlay} pointerEvents="box-none">
        <GlassCard blurRadius={24} style={orderStyles.smShell}>
          <View style={orderStyles.smTopRow}>
            <View style={orderStyles.smCustomerPill}>
              <Text style={orderStyles.smCustomerPillText}>LISÄÄ ERÄ</Text>
            </View>
            <Pressable accessibilityLabel="Sulje" hitSlop={12} onPress={onClose}>
              <Ionicons color={colors.textOnDark} name="close" size={28} />
            </Pressable>
          </View>

          <View style={orderStyles.smPanel}>
            <Pressable
              accessibilityLabel="Valitse tuote"
              onPress={() => setShowProductPicker(true)}
              style={orderStyles.smScanFieldRow}
            >
              <Text
                numberOfLines={1}
                style={[batchStyles.abmSelectText, !product && batchStyles.abmSelectPlaceholder]}
              >
                {product ? product.name : 'VALITSE TUOTE'}
              </Text>
              <Ionicons color={colors.iconOnLight} name="chevron-down" size={22} />
            </Pressable>

            <View style={orderStyles.smScanFieldRow}>
              <TextInput
                keyboardType="numbers-and-punctuation"
                onChangeText={setDateInput}
                placeholder="VALMISTUSPÄIVÄ (pp.kk.vvvv)"
                placeholderTextColor={colors.inputPlaceholder}
                returnKeyType="next"
                style={orderStyles.smScanFieldInput}
                value={dateInput}
              />
              <Pressable accessibilityLabel="Valitse valmistuspäivä" hitSlop={10} onPress={openDatePicker}>
                <Ionicons color={colors.iconOnLight} name="calendar-outline" size={24} />
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                display="default"
                locale="fi"
                mode="date"
                onChange={onDatePickerChange}
                value={pickerDate}
              />
            )}

            <View style={orderStyles.smScanFieldRow}>
              <TextInput
                keyboardType="numbers-and-punctuation"
                onChangeText={setBestBeforeInput}
                placeholder="PARASTA ENNEN (pp.kk.vvvv)"
                placeholderTextColor={colors.inputPlaceholder}
                returnKeyType="next"
                style={orderStyles.smScanFieldInput}
                value={bestBeforeInput}
              />
              <Pressable
                accessibilityLabel="Valitse parasta ennen -päivämäärä"
                hitSlop={10}
                onPress={openBestBeforePicker}
              >
                <Ionicons color={colors.iconOnLight} name="calendar-outline" size={24} />
              </Pressable>
            </View>

            {showBestBeforePicker && (
              <DateTimePicker
                display="default"
                locale="fi"
                mode="date"
                onChange={onBestBeforePickerChange}
                value={pickerBestBeforeDate}
              />
            )}

            {existingBatch ? (
              <Text style={batchStyles.abmNotice}>
                Tälle päivälle on jo erä ({formatKg(existingBatch.current_weight)} kg).
                Laatikot lisätään siihen, eikä parasta ennen -päivä muutu.
              </Text>
            ) : null}

            <View style={orderStyles.smTableHeader}>
              <View style={orderStyles.smDeleteCell} />
              <Text style={[orderStyles.smTableHeaderText, batchStyles.abmOrdinalCell]}>#</Text>
              <Text style={[orderStyles.smTableHeaderText, { flex: 1 }]}>EAN (jos tarrassa)</Text>
              <Text style={[orderStyles.smTableHeaderText, orderStyles.smWeightCell]}>PAINO KG</Text>
            </View>

            <FlatList
              data={boxes}
              ItemSeparatorComponent={() => <View style={orderStyles.smTableDivider} />}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={orderStyles.smScanEmpty}>
                  Ei laatikoita. Lisää erään vähintään yksi laatikko.
                </Text>
              }
              renderItem={({ item, index }) => (
                <View style={orderStyles.smTableRow}>
                  <TouchableOpacity
                    accessibilityLabel={`Poista rivi ${index + 1}`}
                    disabled={saving}
                    onPress={() => removeBox(item.id)}
                    style={orderStyles.smDeleteCell}
                  >
                    <Ionicons color={colors.iconOnLight} name="close" size={22} />
                  </TouchableOpacity>
                  <Text style={batchStyles.abmOrdinalCell}>{index + 1}.</Text>
                  <TextInput
                    editable={!saving}
                    keyboardType="numeric"
                    onChangeText={(value) => updateBox(item.id, { ean: value.replace(/\s+/g, '') })}
                    placeholder="—"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={batchStyles.abmEanInput}
                    value={item.ean}
                  />
                  <TextInput
                    editable={!saving}
                    keyboardType="decimal-pad"
                    onChangeText={(value) => updateBox(item.id, { weightKg: value })}
                    placeholder="0,000"
                    placeholderTextColor={colors.inputPlaceholder}
                    style={orderStyles.smWeightInput}
                    value={item.weightKg}
                  />
                </View>
              )}
              showsVerticalScrollIndicator={false}
              style={orderStyles.smTableList}
            />

            <Pressable
              accessibilityLabel="Lisää laatikko erään"
              disabled={saving}
              onPress={addBox}
              style={batchStyles.abmAddBoxBtn}
            >
              <Ionicons color={colors.iconOnLightStrong} name="add" size={22} />
              <Text style={batchStyles.abmAddBoxBtnText}>LISÄÄ LAATIKKO</Text>
            </Pressable>

            <Text style={batchStyles.abmHint}>
              Tyhjä EAN-kenttä: laatikko jää ilman koodia eikä sitä voi skannata —
              tilaukselle se lisätään käsin varastosta valitsemalla.
            </Text>

            <View style={orderStyles.smFooterRow}>
              <Text style={orderStyles.smScanTotal}>
                {boxes.length} kpl · {formatKg(totalGrams)} kg
              </Text>
              <TouchableOpacity
                disabled={saving || checkingDeleted || boxes.length === 0}
                onPress={() => {
                  void handleSave();
                }}
                style={[
                  orderStyles.smSavePill,
                  (saving || checkingDeleted || boxes.length === 0) &&
                    orderStyles.smSaveBtnDisabled,
                ]}
              >
                <Text style={orderStyles.smSavePillText}>
                  {saving ? 'Tallennetaan...' : checkingDeleted ? 'Tarkistetaan...' : 'TALLENNA'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        <AppModal
          animationType="slide"
          onClose={() => setShowProductPicker(false)}
          visible={showProductPicker}
        >
          <View style={components.modalOverlay}>
            <View style={components.modalCard}>
              <Text style={components.modalTitle}>Valitse tuote</Text>
              <TextInput
                onChangeText={setProductQuery}
                placeholder="Hae tuotetta..."
                placeholderTextColor={colors.inputPlaceholder}
                style={orderStyles.smSearchInput}
                value={productQuery}
              />
              <ScrollView style={batchStyles.abmPickerScroll} showsVerticalScrollIndicator={false}>
                {filteredProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setProductId(item.id);
                      setShowProductPicker(false);
                      setProductQuery('');
                    }}
                    style={components.modalRow}
                  >
                    <Text style={components.modalRowText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Button
                label="Peruuta"
                onPress={() => {
                  setShowProductPicker(false);
                  setProductQuery('');
                }}
                variant="cancel"
              />
            </View>
          </View>
        </AppModal>
      </View>
    </View>
  );
};

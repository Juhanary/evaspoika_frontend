import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { adjustBoxWeight, deleteBox } from '@/src/features/boxes/infrastructure/boxesApi';
import { colors } from '@/src/shared/constants/colors';
import { screen } from '@/src/shared/styles/components';
import { batchStyles } from '@/src/shared/styles/batches';
import { productStyles } from '@/src/shared/styles/products';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { EmptyState } from '@/src/shared/ui/EmptyState/EmptyState';
import { formatDateFi, formatTimeFi } from '@/src/shared/utils/date';
import { formatKg, formatKgLabel, parseWeightToGrams } from '@/src/shared/utils/weight';
import { BatchBox } from '../../domain/types';
import { useBatchBoxes } from '../hooks/useBatches';

/**
 * Erän laatikot painoineen — sama lista varastonäytön tuotepudotuksessa ja
 * MUOKKAA ERIÄ -näytössä.
 *
 * Kaksi näyttöä, kaksi taustaa: pudotus on vaalean lasikortin päällä ja eränäyttö
 * tummalla. Sisältö, haku ja muokkauslogiikka ovat samat, joten ne ovat täällä kerran
 * ja variantti valitsee vain värit — muuten säännöt ehtisivät erkaantua toisistaan
 * sitä mukaa kun kumpaakin näyttöä muokataan erikseen.
 */
type Variant = 'light' | 'dark';

type ActionMode = 'delete' | 'add' | 'sub';

type BatchBoxListProps = {
  batchId: number;
  /** Laatikot haetaan vasta kun rivi on auki — ks. useBatchBoxes. */
  enabled: boolean;
  variant?: Variant;
  /**
   * Rivin muokkaustoiminnot: painon lisäys, vähennys ja laatikon poisto. Päällä vain
   * siellä missä erää muokataan (MUOKKAA ERIÄ). Varastonäytön pudotus on katselua
   * varten, eikä siellä ole tuhoavia toimintoja yhden kosketuksen päässä.
   */
  editable?: boolean;
};

const VARIANT_STYLES = {
  light: {
    list: productStyles.invBoxList,
    row: productStyles.invBoxRow,
    ordinal: productStyles.invBoxOrdinal,
    ean: productStyles.invBoxEan,
    packed: productStyles.invBoxPacked,
    weight: productStyles.invBoxWeight,
    original: productStyles.invBoxOriginal,
    hint: productStyles.invBoxHint,
    error: productStyles.invBoxError,
    actionColor: colors.iconOnLight,
  },
  dark: {
    list: batchStyles.blBoxList,
    row: batchStyles.blBoxRow,
    ordinal: batchStyles.blBoxOrdinal,
    ean: batchStyles.blBoxEan,
    packed: batchStyles.blBoxPacked,
    weight: batchStyles.blBoxWeight,
    original: batchStyles.blBoxOriginal,
    hint: batchStyles.blBoxHint,
    error: batchStyles.blBoxError,
    actionColor: colors.textOnDark,
  },
} as const;

const MODAL_TITLES: Record<ActionMode, string> = {
  delete: 'Poista laatikko',
  add: 'Lisää painoa laatikkoon',
  sub: 'Vähennä painoa laatikosta',
};

const packedLabel = (packedAt: string | null) => {
  const date = formatDateFi(packedAt);
  if (!date) return '—';
  const time = formatTimeFi(packedAt);
  return time ? `${date} ${time}` : date;
};

const boxLabel = (box: BatchBox) => box.ean ?? `Laatikko ${box.id}`;

export function BatchBoxList({
  batchId,
  enabled,
  variant = 'light',
  editable = false,
}: BatchBoxListProps) {
  const queryClient = useQueryClient();
  const { data: boxes, isLoading, error } = useBatchBoxes(batchId, enabled);

  const [pending, setPending] = useState<{ box: BatchBox; mode: ActionMode } | null>(null);
  const [amountKg, setAmountKg] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const styles = VARIANT_STYLES[variant];

  const openAction = (box: BatchBox, mode: ActionMode) => {
    setAmountKg('');
    setReason('');
    setPending({ box, mode });
  };

  const closeAction = () => {
    setPending(null);
    setAmountKg('');
    setReason('');
  };

  const confirmAction = async () => {
    if (!pending) return;

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      Alert.alert('Syy puuttuu', 'Kirjoita syy muutokselle.');
      return;
    }

    let grams = 0;
    if (pending.mode !== 'delete') {
      grams = parseWeightToGrams(amountKg);
      if (!Number.isFinite(grams) || grams <= 0) {
        Alert.alert('Virheellinen paino', 'Syötä positiivinen paino kilogrammoissa.');
        return;
      }
    }

    setBusy(true);
    try {
      if (pending.mode === 'delete') {
        await deleteBox(pending.box.id, trimmedReason);
      } else {
        await adjustBoxWeight(
          pending.box.id,
          pending.mode === 'add' ? grams : -grams,
          trimmedReason,
        );
      }
      // Erän paino muuttuu laatikon mukana backendissä, joten koko erälista on
      // päivitettävä — ei vain tämän erän laatikoita. Etuliite kattaa myös
      // ['batches', id, 'boxes'] -kyselyn.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['batches'] }),
        queryClient.invalidateQueries({ queryKey: ['batchEvents'] }),
      ]);
      closeAction();
    } catch (e) {
      Alert.alert('Virhe', e instanceof Error ? e.message : 'Muutos epäonnistui');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.list}>
      {isLoading ? (
        <Text style={styles.hint}>Ladataan laatikoita...</Text>
      ) : error ? (
        <Text style={styles.error}>
          Laatikoiden haku epäonnistui
          {error instanceof Error ? `: ${error.message}` : ''}
        </Text>
      ) : (boxes ?? []).length === 0 ? (
        <EmptyState message="Ei laatikoita hyllyllä." style={styles.hint} />
      ) : (
        (boxes ?? []).map((box, index) => (
          <View key={box.id} style={styles.row}>
            <Text style={styles.ordinal}>{index + 1}.</Text>
            <Text numberOfLines={1} style={styles.ean}>
              {box.ean ?? 'ei tarraa'}
            </Text>
            <Text style={styles.packed}>{packedLabel(box.packed_at)}</Text>
            <Text style={styles.weight}>{formatKgLabel(box.remaining_weight)}</Text>
            {/* Tarrallisella laatikolla ero kertoo että tarra lupaa eri painon kuin
                hyllyssä on. Tarrattomalla sellaista lupausta ei ole, joten siinä ero
                on vain se mitä laatikkoon alun perin pakattiin. */}
            {box.remaining_weight !== box.weight ? (
              <Text style={styles.original}>
                {box.ean ? 'tarrassa' : 'pakattu'} {formatKg(box.weight)} kg
              </Text>
            ) : null}
            {editable ? (
              <>
                <Pressable
                  accessibilityLabel={`Lisää painoa laatikkoon ${boxLabel(box)}`}
                  onPress={() => openAction(box, 'add')}
                  style={({ pressed }) => [batchStyles.blBoxActionBtn, pressed && screen.pressed]}
                >
                  <Ionicons color={styles.actionColor} name="add" size={22} />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Vähennä painoa laatikosta ${boxLabel(box)}`}
                  onPress={() => openAction(box, 'sub')}
                  style={({ pressed }) => [batchStyles.blBoxActionBtn, pressed && screen.pressed]}
                >
                  <Ionicons color={styles.actionColor} name="remove" size={22} />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Poista laatikko ${boxLabel(box)}`}
                  onPress={() => openAction(box, 'delete')}
                  style={({ pressed }) => [batchStyles.blBoxActionBtn, pressed && screen.pressed]}
                >
                  <Ionicons color={styles.actionColor} name="trash-outline" size={22} />
                </Pressable>
              </>
            ) : null}
          </View>
        ))
      )}

      {/* Laatikon muutokset: vahvistus ja pakollinen syy samassa näkymässä. Syy
          päätyy erän tapahtumalokiin, kuten käsin tehdyssä painon muutoksessa. */}
      <AppModal
        animationType="fade"
        onClose={busy ? undefined : closeAction}
        visible={pending !== null}
      >
        <View style={batchStyles.blBoxDelOverlay}>
          <View style={batchStyles.blBoxDelCard}>
            <Text style={batchStyles.blBoxDelTitle}>
              {pending ? MODAL_TITLES[pending.mode] : ''}
            </Text>

            {pending ? (
              <>
                <Text style={batchStyles.blBoxDelDetail}>
                  {boxLabel(pending.box)} · {formatKgLabel(pending.box.remaining_weight)}
                </Text>
                {pending.mode === 'delete' ? (
                  <Text style={batchStyles.blBoxDelWarning}>
                    Laatikko kirjataan hävikkiin ja sen paino vähennetään erästä.
                  </Text>
                ) : null}
              </>
            ) : null}

            {pending && pending.mode !== 'delete' ? (
              <TextInput
                autoFocus
                keyboardType="decimal-pad"
                onChangeText={setAmountKg}
                placeholder="Paino kg (esim. 1.500)"
                placeholderTextColor={colors.inputPlaceholder}
                style={batchStyles.blBoxDelInput}
                value={amountKg}
              />
            ) : null}

            <TextInput
              autoFocus={pending?.mode === 'delete'}
              onChangeText={setReason}
              placeholder="Syy muutokselle (pakollinen)"
              placeholderTextColor={colors.inputPlaceholder}
              style={batchStyles.blBoxDelInput}
              value={reason}
            />

            <View style={batchStyles.blBoxDelBtnRow}>
              <Pressable
                disabled={busy}
                onPress={closeAction}
                style={({ pressed }) => [
                  batchStyles.blBoxDelCancelBtn,
                  (pressed || busy) && screen.pressed,
                ]}
              >
                <Text style={batchStyles.blBoxDelCancelBtnText}>Peruuta</Text>
              </Pressable>
              <Pressable
                disabled={busy}
                onPress={confirmAction}
                style={({ pressed }) => [
                  pending?.mode === 'delete'
                    ? batchStyles.blBoxDelConfirmBtn
                    : batchStyles.blBoxSaveBtn,
                  (pressed || busy) && screen.pressed,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text
                    style={
                      pending?.mode === 'delete'
                        ? batchStyles.blBoxDelConfirmBtnText
                        : batchStyles.blBoxSaveBtnText
                    }
                  >
                    {pending?.mode === 'delete'
                      ? 'Poista'
                      : pending?.mode === 'add'
                        ? 'Lisää'
                        : 'Vähennä'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </AppModal>
    </View>
  );
}

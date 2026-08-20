import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { components } from '@/src/shared/styles/components';
import { boxSplitStyles as styles } from '@/src/shared/styles/boxSplit';
import { colors } from '@/src/shared/constants/colors';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { Button } from '@/src/shared/ui/Button/ActionButton';
import { useRefreshAll } from '@/src/shared/hooks/useRefreshAll';
import { formatKgLabel } from '@/src/shared/utils/weight';
import { formatDateFi } from '@/src/shared/utils/date';
import { ApiError } from '@/src/infrastructure/api/error';
import {
  fetchBoxCandidates,
  fetchRecentBoxes,
  splitBox,
  type BoxCandidate,
} from '../../infrastructure/boxesApi';
import { splitBalance } from '../../domain/splitDraft';
import { useSplitDraft } from '../hooks/useSplitDraft';
import { useNewBoxes } from '../hooks/useNewBoxes';

// Laatikon jakaminen — ohjattu polku, ei ohjekirja.
//
// Vaaka ei tiedä olemassa olevista laatikoista: se kirjaa jokaisen punnituksen
// uutena tavarana, joten laatikon purkaminen kahdentaa sekä painon että
// laatikkomäärän. Aiempi versio luotti siihen että työntekijä muistaa käydä
// tallentamassa jaon jälkikäteen. Tämä näyttö poistaa muistamisen tarpeen:
//
//   1. Jako aloitetaan skannaamalla vanha tarra ENNEN punnitusta.
//   2. Sen jälkeen vaa'alta tulevat punnitukset poimitaan listaan automaattisesti
//      (GET /boxes/recent, lähtöpisteenä jaon alkuhetken viimeisin laatikko).
//   3. Aloitettu jako säilyy laitteella ja näkyy muistutuspalkkina joka näytöllä,
//      kunnes se on viety loppuun tai peruttu tietoisesti.
//   4. Tallennus aukeaa vasta kun painot täsmäävät — tai kun ero on erikseen
//      vahvistettu hävikiksi.

const errorMessage = (err: unknown, fallback: string) => {
  if (err instanceof ApiError) {
    const payload = err.payload as Record<string, unknown> | null;
    return String(payload?.error ?? err.message);
  }
  return err instanceof Error ? err.message : fallback;
};

const boxLabel = (box: BoxCandidate) => box.ean || `Laatikko ${box.id}`;

export default function SplitBoxScreen() {
  const { draft, loading, save, clear } = useSplitDraft();
  const { withRefresh } = useRefreshAll();

  const [pickerMatches, setPickerMatches] = useState<BoxCandidate[] | null>(null);
  const [busy, setBusy] = useState(false);
  // Hävikki vahvistetaan sille painosummalle joka näytöllä oli — uusi punnitus
  // mitätöi vahvistuksen itsestään, joten vanhaa kuittausta ei voi vahingossa
  // käyttää eri lopputulokseen.
  const [lossConfirmedAt, setLossConfirmedAt] = useState<number | null>(null);
  const [eanInput, setEanInput] = useState('');

  const eanRef = useRef<TextInput>(null);
  const eanValueRef = useRef('');
  const scanLockRef = useRef(false);

  const balance = draft ? splitBalance(draft) : null;
  const lossConfirmed = !!balance && lossConfirmedAt === balance.collected;

  const { data: recent } = useNewBoxes(
    draft?.original.ProductId,
    draft?.baselineBoxId,
    !!draft && !busy,
  );

  // Vaa'alta tulleet uudet laatikot listaan. Käsin poistettuja ei lisätä takaisin,
  // eikä tilaukselle jo skannattuja lainkaan — niitä ei voi jakaa.
  useEffect(() => {
    if (!draft || !recent?.boxes?.length) return;

    const known = new Set([
      draft.original.id,
      ...draft.parts.map((part) => part.id),
      ...draft.dismissedIds,
    ]);
    const additions = recent.boxes.filter((box) => !known.has(box.id) && !box.on_order);
    if (additions.length === 0) return;

    save({
      ...draft,
      parts: [...draft.parts, ...additions].sort((a, b) => a.id - b.id),
    });
  }, [recent, draft, save]);

  const startSplit = useCallback(
    async (box: BoxCandidate) => {
      if (!box.ProductId) {
        Alert.alert('Laatikolla ei ole tuotetta', 'Erän tuote puuttuu, joten jakoa ei voi aloittaa.');
        return;
      }

      setBusy(true);
      try {
        // Lähtöpiste: tämän jälkeen syntyvät laatikot ovat tämän jaon osia.
        const { latest_box_id } = await fetchRecentBoxes(box.ProductId);
        await save({
          original: box,
          parts: [],
          dismissedIds: [],
          baselineBoxId: Math.max(latest_box_id, box.id),
          startedAt: new Date().toISOString(),
        });
        setLossConfirmedAt(null);
      } catch (err) {
        Alert.alert('Virhe', errorMessage(err, 'Jaon aloitus epäonnistui'));
      } finally {
        setBusy(false);
        setTimeout(() => eanRef.current?.focus(), 50);
      }
    },
    [save],
  );

  const addPart = useCallback(
    (box: BoxCandidate) => {
      if (!draft) return;
      if (box.ProductId !== draft.original.ProductId) {
        Alert.alert(
          'Eri tuote',
          `${boxLabel(box)} on tuotetta "${box.productName ?? 'tuntematon'}", jaettava laatikko tuotetta "${draft.original.productName ?? 'tuntematon'}".`,
        );
        return;
      }
      if (draft.parts.some((part) => part.id === box.id)) return;

      save({
        ...draft,
        parts: [...draft.parts, box].sort((a, b) => a.id - b.id),
        dismissedIds: draft.dismissedIds.filter((id) => id !== box.id),
      });
    },
    [draft, save],
  );

  const removePart = useCallback(
    (box: BoxCandidate) => {
      if (!draft) return;
      save({
        ...draft,
        parts: draft.parts.filter((part) => part.id !== box.id),
        // Ilman tätä pollaus lisäisi laatikon takaisin seuraavalla kierroksella.
        dismissedIds: [...draft.dismissedIds, box.id],
      });
    },
    [draft, save],
  );

  const applySelection = useCallback(
    (box: BoxCandidate) => {
      if (box.on_order) {
        Alert.alert(
          'Laatikko on tilauksella',
          `${boxLabel(box)} on jo skannattu tilaukselle. Poista tilausrivi ensin tai valitse toinen laatikko.`,
        );
        return;
      }

      if (!draft) {
        startSplit(box);
        return;
      }
      if (box.id === draft.original.id) return;

      addPart(box);
    },
    [addPart, draft, startSplit],
  );

  const handleScan = useCallback(
    async (rawEan: string) => {
      const ean = rawEan.replace(/\s+/g, '').trim();
      if (!ean || scanLockRef.current) return;

      scanLockRef.current = true;
      setEanInput('');
      eanValueRef.current = '';

      try {
        const { matches } = await fetchBoxCandidates(ean);

        const chosenIds = new Set(
          draft ? [draft.original.id, ...draft.parts.map((part) => part.id)] : [],
        );
        const available = matches.filter((match) => !chosenIds.has(match.id));

        if (available.length === 0) {
          Alert.alert(
            'Laatikkoa ei löydy',
            matches.length > 0
              ? `Koodin "${ean}" laatikot on jo valittu.`
              : `Koodilla "${ean}" ei löydy laatikkoa varastosta.`,
          );
          return;
        }

        if (available.length === 1) {
          applySelection(available[0]);
          return;
        }

        // Sama koodi monella laatikolla — EAN-13-painokoodi ei yksilöi laatikkoa,
        // joten oikea erä on valittava käsin.
        setPickerMatches(available);
      } catch (err) {
        Alert.alert('Virhe', errorMessage(err, 'Haku epäonnistui'));
      } finally {
        scanLockRef.current = false;
        setTimeout(() => eanRef.current?.focus(), 50);
      }
    },
    [applySelection, draft],
  );

  const handleCancel = () => {
    if (!draft) return;
    Alert.alert(
      'Peru jako',
      'Aloitettu jako perutaan eikä mitään tallenneta. Jos olet jo punninnut osat, '
        + 'varastoon jää kahdennettu paino kunnes jako tehdään uudelleen.',
      [
        { text: 'Jatka jakoa', style: 'cancel' },
        {
          text: 'Peru jako',
          style: 'destructive',
          onPress: () => {
            clear();
            setLossConfirmedAt(null);
          },
        },
      ],
    );
  };

  const handleSave = () => {
    if (!draft || !balance || balance.state === 'waiting' || balance.state === 'over') return;
    if (balance.state === 'short' && !lossConfirmed) return;

    const lossNote =
      balance.remaining > 0 ? `\nHävikki: ${formatKgLabel(balance.remaining)}` : '';

    Alert.alert(
      'Vahvista jako',
      `${draft.original.productName ?? 'Tuote'}\n`
        + `Jaettava laatikko: ${formatKgLabel(balance.target)}\n`
        + `Osat (${draft.parts.length}): ${formatKgLabel(balance.collected)}${lossNote}\n\n`
        + 'Vanha laatikko poistetaan ja osat siirretään sen erään.',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Jaa',
          onPress: () => {
            setBusy(true);
            withRefresh(async () => {
              const result = await splitBox(
                draft.original.id,
                draft.parts.map((part) => part.id),
              );
              // Luonnos pois ennen refetchiä, jottei muistutuspalkki vilahda enää.
              await clear();
              setLossConfirmedAt(null);
              Alert.alert(
                'Laatikko jaettu',
                `Erä ${result.batch.batch_number}: ${formatKgLabel(result.batch.current_weight)}\n`
                  + `${result.parts.length} laatikkoa vanhan tilalla.`
                  + (result.loss_grams > 0 ? `\nHävikki: ${formatKgLabel(result.loss_grams)}` : ''),
              );
            })
              .catch((err) => {
                Alert.alert('Jako epäonnistui', errorMessage(err, 'Jako epäonnistui'));
              })
              .finally(() => {
                setBusy(false);
                setTimeout(() => eanRef.current?.focus(), 50);
              });
          },
        },
      ],
    );
  };

  const scanInput = (
    <TextInput
      autoFocus
      caretHidden
      keyboardType="numeric"
      onBlur={() => {
        if (pickerMatches === null && !busy) {
          setTimeout(() => eanRef.current?.focus(), 80);
        }
      }}
      onChangeText={(value) => {
        const clean = value.replace(/\s+/g, '');
        eanValueRef.current = clean;
        setEanInput(clean);
      }}
      onSubmitEditing={() => handleScan(eanValueRef.current)}
      ref={eanRef}
      returnKeyType="done"
      showSoftInputOnFocus={false}
      style={styles.hiddenEanInput}
      value={eanInput}
    />
  );

  const picker = (
    <AppModal
      animationType="slide"
      onClose={() => setPickerMatches(null)}
      visible={pickerMatches !== null}
    >
      <View style={components.modalOverlay}>
        <View style={components.modalCard}>
          <Text style={components.modalTitle}>Valitse laatikko</Text>
          <Text style={components.modalEmpty}>
            Samalla koodilla on useita laatikoita. Valitse se erä josta laatikko on.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerScroll}>
            {(pickerMatches ?? []).map((match) => (
              <TouchableOpacity
                disabled={match.on_order}
                key={match.id}
                onPress={() => {
                  setPickerMatches(null);
                  applySelection(match);
                }}
                style={[components.modalRow, match.on_order && styles.pickerRowDisabled]}
              >
                <Text style={components.modalRowText}>
                  {match.batch_number ?? 'Ei erää'} — {match.productName ?? 'Tuntematon tuote'}
                </Text>
                <Text style={components.modalRowSubText}>
                  {(formatDateFi(match.production_date) ?? 'Ei päiväystä')
                    + ` / ${formatKgLabel(match.weight)}`
                    + (match.on_order ? ' / tilauksella' : '')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button label="Peruuta" onPress={() => setPickerMatches(null)} variant="cancel" />
        </View>
      </View>
    </AppModal>
  );

  if (loading) {
    return (
      <ScreenLayout leftAction="back" title="JAA LAATIKKO">
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textOnDark} size="large" />
        </View>
      </ScreenLayout>
    );
  }

  // --- Vaihe 1: jakoa ei ole aloitettu -------------------------------------
  if (!draft || !balance) {
    return (
      <ScreenLayout leftAction="back" title="JAA LAATIKKO">
        {scanInput}

        <View style={styles.startBlock}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1 / 3</Text>
          </View>
          <Text style={styles.startTitle}>Skannaa laatikon nykyinen tarra</Text>
          <Text style={styles.startBody}>
            Se laatikko josta aiot ottaa osan pois.
          </Text>

          <Pressable onPress={() => eanRef.current?.focus()} style={styles.scanBar}>
            {busy ? (
              <ActivityIndicator color="rgba(0,0,0,0.6)" size="small" />
            ) : (
              <Ionicons color="rgba(30, 140, 60, 0.85)" name="barcode-outline" size={26} />
            )}
            <Text style={styles.scanBarText}>
              {busy ? 'ALOITETAAN...' : 'ODOTTAA SKANNAUSTA'}
            </Text>
          </Pressable>

          <View style={styles.hintBox}>
            <Ionicons color={colors.warning} name="alert-circle-outline" size={20} />
            <Text style={styles.hintText}>
              Tee tämä ennen punnitusta. Tabletti poimii vaa&apos;an punnitukset
              itsestään, joten uusia tarroja ei tarvitse skannata.
            </Text>
          </View>
        </View>

        {picker}
      </ScreenLayout>
    );
  }

  // --- Vaihe 2–3: jako on kesken -------------------------------------------
  const saveBlocked =
    balance.state === 'waiting'
    || balance.state === 'over'
    || (balance.state === 'short' && !lossConfirmed);

  const blockReason =
    balance.state === 'waiting'
      ? 'Punnitse ensimmäinen osa vaa’alla'
      : balance.state === 'over'
        ? `Osat painavat ${formatKgLabel(-balance.remaining)} liikaa — tarkista listalta ylimääräinen laatikko`
        : balance.state === 'short' && !lossConfirmed
          ? `${formatKgLabel(balance.remaining)} punnitsematta`
          : '';

  return (
    <ScreenLayout
      leftAction="back"
      rightActions={[
        { icon: 'trash-outline', onPress: handleCancel, accessibilityLabel: 'Peru jako' },
      ]}
      title="JAA LAATIKKO"
    >
      {scanInput}

      <View style={styles.originalCard}>
        <Text style={styles.cardLabel}>JAETTAVA LAATIKKO</Text>
        <View style={styles.originalHeaderRow}>
          <View style={components.flex1}>
            <Text numberOfLines={1} style={styles.originalName}>
              {draft.original.productName ?? 'Tuntematon tuote'}
            </Text>
            <Text style={styles.originalMeta}>
              {boxLabel(draft.original)}
              {draft.original.batch_number ? ` · erä ${draft.original.batch_number}` : ''}
              {draft.original.production_date
                ? ` · ${formatDateFi(draft.original.production_date)}`
                : ''}
            </Text>
          </View>
          <Text style={styles.originalWeight}>{formatKgLabel(balance.target)}</Text>
        </View>
      </View>

      {/* Edistyminen: kuinka paljon lähtölaatikosta on punnittu takaisin. */}
      <View style={styles.balanceBlock}>
        <View style={styles.balanceHeader}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              {balance.state === 'waiting' ? '2 / 3' : '3 / 3'}
            </Text>
          </View>
          <Text style={styles.balanceNumbers}>
            {formatKgLabel(balance.collected)} / {formatKgLabel(balance.target)}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(balance.progress * 100)}%` },
              balance.state === 'balanced' && styles.progressFillOk,
              balance.state === 'over' && styles.progressFillOver,
            ]}
          />
        </View>

        {balance.state === 'waiting' ? (
          <View style={styles.waitingRow}>
            <ActivityIndicator color={colors.textOnDark} size="small" />
            <Text style={styles.waitingText}>
              Punnitse osat vaa&apos;alla — myös jäljelle jäävä laatikko. Punnitukset
              ilmestyvät tähän itsestään.
            </Text>
          </View>
        ) : balance.state === 'balanced' ? (
          <Text style={styles.balanceOk}>Painot täsmäävät. Voit tallentaa.</Text>
        ) : balance.state === 'over' ? (
          <Text style={styles.balanceOver}>
            Osia on {formatKgLabel(-balance.remaining)} liikaa. Poista listalta laatikko
            joka ei kuulu tähän jakoon.
          </Text>
        ) : (
          <Text style={styles.balanceShort}>
            Punnitsematta {formatKgLabel(balance.remaining)}. Punnitse loputkin, tai
            vahvista alla että erotus on hävikkiä.
          </Text>
        )}
      </View>

      <View style={styles.partsHeader}>
        <Text style={styles.cardLabel}>OSAT ({draft.parts.length})</Text>
        <Text style={styles.cardLabel}>{formatKgLabel(balance.collected)}</Text>
      </View>

      <FlatList
        data={draft.parts}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.partsEmpty}>
            Ei vielä punnittuja osia.
          </Text>
        }
        renderItem={({ item, index }) => (
          <View style={styles.partRow}>
            <Text style={styles.partIndex}>{index + 1}.</Text>
            <Text numberOfLines={1} style={styles.partEan}>
              {boxLabel(item)}
            </Text>
            <Text style={styles.partWeight}>{formatKgLabel(item.weight)}</Text>
            <TouchableOpacity
              accessibilityLabel="Poista osa"
              hitSlop={8}
              onPress={() => removePart(item)}
            >
              <Ionicons color="rgba(255,255,255,0.7)" name="close" size={22} />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        style={styles.partsList}
      />

      {/* Erotus on kuitattava tietoisesti — sitä ei voi ohittaa vahingossa. */}
      {balance.state === 'short' ? (
        <Pressable
          onPress={() => setLossConfirmedAt(lossConfirmed ? null : balance.collected)}
          style={[styles.lossRow, lossConfirmed && styles.lossRowConfirmed]}
        >
          <Ionicons
            color={lossConfirmed ? colors.actionGreen : 'rgba(255,255,255,0.55)'}
            name={lossConfirmed ? 'checkbox' : 'square-outline'}
            size={26}
          />
          <Text style={styles.lossText}>
            Vahvistan: {formatKgLabel(balance.remaining)} on hävikkiä, ei punnitsematta
            jäänyttä laatikkoa.
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.summaryRow}>
        <Text numberOfLines={2} style={styles.blockReason}>
          {blockReason}
        </Text>

        <TouchableOpacity
          disabled={saveBlocked || busy}
          onPress={handleSave}
          style={[styles.saveBtn, (saveBlocked || busy) && styles.disabled]}
        >
          <Text style={styles.saveBtnText}>{busy ? 'TALLENNETAAN...' : 'TALLENNA'}</Text>
        </TouchableOpacity>
      </View>

      {picker}
    </ScreenLayout>
  );
}

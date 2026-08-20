import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BoxCandidate } from '../infrastructure/boxesApi';

// Kesken oleva jako säilyy laitteella.
//
// Aiemmin jako oli muistin varassa: jos työntekijä poistui näytöltä tai sovellus
// käynnistyi uudelleen, aloitettu jako katosi jäljettömiin ja varastoon jäi
// kahdennettu paino. Nyt jako on tila jonka voi vain viedä loppuun tai perua
// tietoisesti — ja niin kauan kuin se on kesken, siitä muistutetaan joka näytöllä.
const DRAFT_KEY = '@evaspoika_split_draft_v1';

// Sama toleranssi kuin backendin SPLIT_WEIGHT_TOLERANCE, jotta tallennus ei kaadu
// yllättäen sen jälkeen kun näyttö on jo näyttänyt painojen täsmäävän.
export const SPLIT_WEIGHT_TOLERANCE = 200;

export type SplitDraft = {
  /** Laatikko joka puretaan. Valittu skannaamalla vanha tarra. */
  original: BoxCandidate;
  /** Osat: vaa'alta automaattisesti poimitut ja käsin skannatut. */
  parts: BoxCandidate[];
  /** Käsin poistetut — ilman tätä pollaus lisäisi ne heti takaisin. */
  dismissedIds: number[];
  /** Laatikkojuoksun lähtöpiste: tämän jälkeen tulleet punnitukset ovat jaon osia. */
  baselineBoxId: number;
  startedAt: string;
};

export type SplitBalanceState = 'waiting' | 'short' | 'balanced' | 'over';

export type SplitBalance = {
  collected: number;
  target: number;
  /** Punnitsematta jäänyt paino. Negatiivinen = osia on liikaa. */
  remaining: number;
  state: SplitBalanceState;
  /** Osuus 0–1 edistymispalkkia varten. */
  progress: number;
};

export const splitBalance = (draft: SplitDraft): SplitBalance => {
  const target = draft.original.weight;
  const collected = draft.parts.reduce((sum, part) => sum + part.weight, 0);
  const remaining = target - collected;

  const state: SplitBalanceState =
    draft.parts.length === 0
      ? 'waiting'
      : remaining > SPLIT_WEIGHT_TOLERANCE
        ? 'short'
        : remaining < -SPLIT_WEIGHT_TOLERANCE
          ? 'over'
          : 'balanced';

  return {
    collected,
    target,
    remaining,
    state,
    progress: target > 0 ? Math.min(collected / target, 1) : 0,
  };
};

export const readSplitDraft = async (): Promise<SplitDraft | null> => {
  const raw = await AsyncStorage.getItem(DRAFT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SplitDraft;
    // Vaillinainen luonnos on pahempi kuin ei luonnosta: se jäisi roikkumaan
    // banneriin ilman että sitä voi viedä loppuun.
    if (!parsed?.original?.id || !Array.isArray(parsed.parts)) return null;
    return { ...parsed, dismissedIds: parsed.dismissedIds ?? [] };
  } catch {
    return null;
  }
};

export const writeSplitDraft = (draft: SplitDraft) =>
  AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

export const clearSplitDraft = () => AsyncStorage.removeItem(DRAFT_KEY);

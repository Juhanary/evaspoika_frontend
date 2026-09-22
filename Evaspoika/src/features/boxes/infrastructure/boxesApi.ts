import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';

export type BoxLookup = {
  id: number;
  ean: string;
  /** Tarran paino. Ei muutu vaikka laatikosta olisi syöty osa — tarraa ei tulosteta uudelleen. */
  weight_kg: number;
  /**
   * Mitä laatikossa on nyt jäljellä. Tämä on se mitä asiakkaalle lähtee, joten
   * tilausrivin paino lasketaan tästä. Eroaa tarrasta kun laatikko on syöty osittain
   * (Netvisorin kilomyynti tai käsin tehty painonkorjaus).
   */
  remaining_weight_kg: number;
  BatchId: number;
  batch_number: string;
  ProductId: number;
  productName: string;
  /** Montako saman koodin laatikkoa on vielä hyllyssä tämän jälkeen. */
  remaining_with_ean: number;
};

// exclude: laatikot jotka ovat jo skannauslistassa mutta joita ei ole vielä
// tallennettu tilaukselle. Samalla EAN-koodilla voi olla monta laatikkoa (painokoodi
// yksilöi tuotteen ja painon, ei laatikkoa), ja ilman tätä haku palautti aina saman
// rivin — jolloin kahdesta samanpainoisesta laatikosta vain ensimmäisen sai lisättyä.
export function fetchBoxByEan(ean: string, exclude: number[] = []) {
  return apiRequest<BoxLookup>(`${endpoints.boxes}/by-ean/${encodeURIComponent(ean)}`, {
    query: exclude.length > 0 ? { exclude: exclude.join(',') } : undefined,
  });
}

export type ParsedEan = {
  ean: string;
  weight_kg: number;
  weight_grams: number;
  productId: number | null;
  productName: string | null;
  price_per_kg: number | null;
  productCodeFromEan: number | null;
  // Backend palauttaa nämä kun tuote löytyi olemassa olevan laatikon kautta.
  batchId: number | null;
  batchNumber: string | null;
};

export function parseBoxEan(ean: string) {
  return apiRequest<ParsedEan>(`${endpoints.boxes}/parse-ean/${encodeURIComponent(ean)}`);
}

// EAN-13-painokoodi yksilöi tuotteen ja painon, ei laatikkoa: samalla koodilla voi
// olla useita laatikoita eri erissä. Jaossa väärä valinta rikkoisi väärän erän
// saldon, joten backend palauttaa kaikki osumat ja käyttäjä valitsee.
export type BoxCandidate = {
  id: number;
  ean: string;
  weight: number;
  packed_at: string | null;
  BatchId: number;
  batch_number: string | null;
  production_date: string | null;
  best_before: string | null;
  ProductId: number | null;
  productName: string | null;
};

// Backend palauttaa vain hyllyssä olevat laatikot — myytyä tai hävikkiin kirjattua ei
// voi jakaa. reason kertoo kumpi on kyseessä kun osumia ei ole, jotta koodi ei näytä
// tuntemattomalta silloin kun laatikko on olemassa mutta poissa hyllyltä.
export function fetchBoxCandidates(ean: string) {
  return apiRequest<{ ean: string; matches: BoxCandidate[]; reason: string | null }>(
    `${endpoints.boxes}/candidates/${encodeURIComponent(ean)}`,
  );
}

// Tuotteen laatikot jotka ovat syntyneet annetun id:n jälkeen. Jakonäyttö ottaa
// jaon alkaessa lähtöpisteen (afterId pois → pelkkä latest_box_id) ja pollaa
// sen jälkeen tulleita punnituksia, jolloin osat ilmestyvät listaan itsestään.
export function fetchRecentBoxes(productId: number, afterId?: number) {
  return apiRequest<{ latest_box_id: number; boxes: BoxCandidate[] }>(
    `${endpoints.boxes}/recent`,
    { query: { productId, ...(afterId != null ? { afterId } : {}) } },
  );
}

export type SplitBoxResult = {
  original: { id: number; ean: string | null; weight: number };
  parts: { id: number; ean: string | null; weight: number }[];
  loss_grams: number;
  batch: {
    id: number;
    batch_number: string;
    production_date: string | null;
    best_before: string | null;
    current_weight: number;
    product_name: string | null;
  };
};

// Laatikosta on otettu osa pois ja osat on jo punnittu vaa'alla. Alkuperäinen
// laatikko puretaan ja osat siirretään sen erään, jolloin paino ei kahdennu.
export function splitBox(boxId: number, newBoxIds: number[]) {
  return apiRequest<SplitBoxResult>(`${endpoints.boxes}/${boxId}/split`, {
    method: 'POST',
    body: JSON.stringify({ newBoxIds }),
  });
}

export type AdjustBoxWeightResult = {
  id: number;
  ean: string | null;
  BatchId: number;
  /** Muutos grammoina, etumerkki mukana. */
  delta: number;
  weight: number;
  remaining_weight: number;
  status: string | null;
  batch_current_weight: number;
};

// Yhden laatikon painon korjaus grammoina, etumerkillä.
//
// Erän painon korjaus (PUT /batches/:id) kohdistuu erään: lisätty paino valuu
// uusimpaan laatikkoon ja vähennetty syö vanhinta, joten työntekijä ei tiedä mihin
// korjaus osui. Tämä osuu siihen laatikkoon joka on käsissä, ja backend siirtää erän
// painon perässä samassa transaktiossa. Syy on pakollinen ja päätyy tapahtumalokiin.
export function adjustBoxWeight(boxId: number, delta: number, reason: string) {
  return apiRequest<AdjustBoxWeightResult>(`${endpoints.boxes}/${boxId}/weight`, {
    method: 'PATCH',
    body: JSON.stringify({ delta, reason }),
  });
}

export type DeleteBoxResult = {
  id: number;
  ean: string | null;
  BatchId: number;
  /** Erästä vähennetty paino — laatikon jäljellä ollut paino, ei tarran paino. */
  removed_grams: number;
  batch_current_weight: number;
};

// Yksittäinen laatikko pois hyllyltä: kadonnut, pilaantunut tai väärin kirjattu.
//
// Backend merkitsee laatikon hävikiksi ja vähentää sen painon erästä samassa
// transaktiossa — erän painoa ei siis korjata erikseen tämän jälkeen. Laatikko ei
// katoa kannasta, joten tarra löytyy yhä jäljityksestä. Syy on pakollinen ja päätyy
// erän tapahtumalokiin.
export function deleteBox(boxId: number, reason: string) {
  return apiRequest<DeleteBoxResult>(`${endpoints.boxes}/${boxId}`, {
    method: 'DELETE',
    body: JSON.stringify({ reason }),
  });
}

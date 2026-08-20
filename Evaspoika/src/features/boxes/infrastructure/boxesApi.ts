import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';

export type BoxLookup = {
  id: number;
  ean: string;
  weight_kg: number;
  BatchId: number;
  batch_number: string;
  ProductId: number;
  productName: string;
};

export function fetchBoxByEan(ean: string) {
  return apiRequest<BoxLookup>(`${endpoints.boxes}/by-ean/${encodeURIComponent(ean)}`);
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
  on_order: boolean;
};

export function fetchBoxCandidates(ean: string) {
  return apiRequest<{ ean: string; matches: BoxCandidate[] }>(
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

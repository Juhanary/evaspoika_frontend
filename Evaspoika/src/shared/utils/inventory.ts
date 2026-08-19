export type InventorySummaryItem = {
  id: number;
  name: string;
  weight: number;
  count: number;
};

type ProductLike = {
  id: number;
  name: string;
};

type BatchLike = {
  id?: number;
  ProductId?: number | null;
  current_weight?: number | null;
  deleted_at?: string | null;
  /** Aktiivisten laatikoiden määrä. Backend laskee sen BOX-taulusta. */
  box_count?: number | null;
};

type BatchEventLike = {
  BatchId: number;
};

export function buildInventorySummary(
  products?: ProductLike[] | null,
  batches?: BatchLike[] | null,
  batchEvents?: BatchEventLike[] | null,
): InventorySummaryItem[] {
  const weightByProduct = new Map<number, number>();
  const countByProduct = new Map<number, number>();

  // Laatikkomäärä tulee erän `box_count`-kentästä, jonka backend laskee
  // BOX-taulusta poistetut pois suodattaen.
  //
  // Aiemmin määrä laskettiin tapahtumalokista (yksi WEIGHING/CREATE = yksi
  // laatikko). Se osui yleensä oikein, mutta erän palautuminen ja painon
  // korjaukset tuottavat tapahtumia jotka eivät vastaa yhtään laatikkoa —
  // jolloin varastonäkymä näytti esim. 8 laatikkoa kun niitä oli 5, vaikka
  // paino oli oikein. Tapahtumalaskenta jää varapolaksi vanhalle backendille.
  const boxesByBatch = new Map<number, number>();
  (batchEvents ?? []).forEach((event) => {
    boxesByBatch.set(event.BatchId, (boxesByBatch.get(event.BatchId) ?? 0) + 1);
  });

  (batches ?? []).forEach((batch) => {
    if (!batch.ProductId || batch.deleted_at || (batch.current_weight ?? 0) <= 0) {
      return;
    }

    weightByProduct.set(
      batch.ProductId,
      (weightByProduct.get(batch.ProductId) ?? 0) + (batch.current_weight ?? 0),
    );
    const boxCount =
      batch.box_count != null
        ? batch.box_count
        : batch.id
          ? (boxesByBatch.get(batch.id) ?? 0)
          : 0;
    countByProduct.set(batch.ProductId, (countByProduct.get(batch.ProductId) ?? 0) + boxCount);
  });

  return (products ?? [])
    .map((product) => ({
      id: product.id,
      name: product.name,
      weight: weightByProduct.get(product.id) ?? 0,
      count: countByProduct.get(product.id) ?? 0,
    }))
    .filter((item) => item.weight > 0)
    .sort((a, b) => b.weight - a.weight);
}

export function getInventoryBarColor(percentage: number) {
  if (percentage < 0.33) {
    return 'rgba(255,57,67,0.65)';
  }

  if (percentage < 0.66) {
    return 'rgba(255,235,57,0.65)';
  }

  return 'rgba(113,255,57,0.65)';
}

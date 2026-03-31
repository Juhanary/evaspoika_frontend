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
  ProductId?: number | null;
  current_weight?: number | null;
  deleted_at?: string | null;
};

export function buildInventorySummary(
  products?: ProductLike[] | null,
  batches?: BatchLike[] | null,
): InventorySummaryItem[] {
  const weightByProduct = new Map<number, number>();
  const countByProduct = new Map<number, number>();

  (batches ?? []).forEach((batch) => {
    if (!batch.ProductId || batch.deleted_at) {
      return;
    }

    weightByProduct.set(
      batch.ProductId,
      (weightByProduct.get(batch.ProductId) ?? 0) + (batch.current_weight ?? 0),
    );
    countByProduct.set(batch.ProductId, (countByProduct.get(batch.ProductId) ?? 0) + 1);
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

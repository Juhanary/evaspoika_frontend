export type ScanBox = {
  id: number;
  weight: number;
};

export type ScanInventoryProduct = {
  id: number;
  name: string;
  ean?: string | null;
  price_per_kg: number;
};

export type ScanInventoryBatch = {
  id: number;
  batch_number: string;
  production_date?: string | null;
  current_weight: number;
  Product?: ScanInventoryProduct | null;
};

export type ScanInventoryBox = {
  id: number;
  weight: number;
  remaining_weight: number;
  status: string;
  packed_at?: string | null;
  BatchId?: number | null;
  Batch?: ScanInventoryBatch | null;
};

export type ScanPreviewItem = {
  productId: number;
  ean: string;
  batchId: number;
  batchNumber: string;
  productName: string;
  pricePerKg: number;
  boxes: ScanBox[];
  totalWeight: number;
};

export type ConfirmLine = {
  batchId: number;
  boxIds: number[];
  soldWeight: number;
  pricePerGram: number;
};

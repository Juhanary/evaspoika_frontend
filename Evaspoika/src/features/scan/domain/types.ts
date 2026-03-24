export type ScanBox = {
  id: number;
  weight: number;
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

export type VirtualBox = {
  id: number;
  weight: number;
  remaining_weight: number;
  status: string;
  packed_at: string | null;
  BatchId: number;
  Batch: {
    id: number;
    batch_number: string;
    production_date: string;
    Product: {
      id: number;
      name: string;
      ean: string;
      price_per_kg: number;
    };
  };
};

export type ConfirmLine = {
  batchId: number;
  boxIds: number[];
  soldWeight: number;
  pricePerGram: number;
};

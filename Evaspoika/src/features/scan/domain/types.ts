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

export type ConfirmLine = {
  batchId: number;
  boxIds: number[];
  soldWeight: number;
  pricePerGram: number;
};

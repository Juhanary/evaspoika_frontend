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

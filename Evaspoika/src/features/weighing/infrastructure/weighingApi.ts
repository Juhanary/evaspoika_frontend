import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';

export type WeighingResult = {
  action: 'created' | 'updated';
  batchId: number;
  production_date: string;
  current_weight: number;
  delta?: number;
  initial_weight?: number;
  productCreated?: boolean;
};

export type WeighingInput = {
  ean: string;
  name?: string;
  pricePerKg?: number;
  weightKg: number;
  userId?: number;
};

export function submitWeighing(input: WeighingInput) {
  return apiRequest<WeighingResult>(endpoints.weighing, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

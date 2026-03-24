import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { BatchLog } from '../domain/types';

export function fetchBatchEvents() {
  return apiRequest<BatchLog[]>(endpoints.batchEvents);
}

export function fetchBatchLog(batchId: number) {
  return apiRequest<BatchLog[]>(`${endpoints.batchEvents}/batch/${batchId}`);
}

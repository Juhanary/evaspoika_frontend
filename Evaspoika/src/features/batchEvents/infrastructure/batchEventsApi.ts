import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { BatchLog } from '../domain/types';

export type BatchEventsQueryParams = {
  search?: string;
  types?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export function fetchBatchEvents(query?: BatchEventsQueryParams) {
  return apiRequest<BatchLog[]>(endpoints.batchEvents, {
    query,
  });
}

export function fetchBatchLog(batchId: number) {
  return apiRequest<BatchLog[]>(`${endpoints.batchEvents}/batch/${batchId}`);
}

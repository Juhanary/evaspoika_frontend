import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { BatchEvent, CreateBatchEventInput } from '../domain/types';

export function fetchBatchEvents() {
  return apiRequest<BatchEvent[]>(endpoints.batchEvents);
}

export function createBatchEvent(input: CreateBatchEventInput) {
  return apiRequest<BatchEvent>(endpoints.batchEvents, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

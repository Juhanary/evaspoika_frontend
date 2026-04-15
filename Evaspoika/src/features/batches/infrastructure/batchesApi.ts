import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { Batch, CreateBatchInput } from '../domain/types';

export function fetchBatches() {
  return apiRequest<Batch[]>(endpoints.batches);
}

export function fetchDeletedBatches() {
  return apiRequest<Batch[]>(endpoints.batches, {
    query: { includeDeleted: true },
  });
}

export function createBatch(input: CreateBatchInput) {
  return apiRequest<Batch>(endpoints.batches, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateBatch(id: number, input: Partial<CreateBatchInput>) {
  return apiRequest<Batch>(`${endpoints.batches}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteBatch(id: number) {
  return apiRequest<void>(`${endpoints.batches}/${id}`, {
    method: 'DELETE',
  });
}

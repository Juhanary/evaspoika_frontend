import { useQuery } from '@tanstack/react-query';
import {
  fetchBatchBoxes,
  fetchBatches,
  fetchDeletedBatches,
} from '../../infrastructure/batchesApi';

export function useBatches() {
  return useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
    refetchInterval: 10_000,
  });
}

export function useDeletedBatches() {
  return useQuery({
    queryKey: ['batches', 'deleted'],
    queryFn: fetchDeletedBatches,
    refetchInterval: 10_000,
  });
}

/**
 * Boxes of one batch, fetched only while the row is open.
 *
 * A product can hold dozens of batches; fetching every batch's boxes up front
 * would pull the whole warehouse on each 10 s poll for a list that is almost
 * always collapsed. The key sits under 'batches' so the existing
 * invalidateQueries({ queryKey: ['batches'] }) after a weighing or a manual
 * weight correction refreshes the open box list too.
 */
export function useBatchBoxes(batchId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ['batches', batchId, 'boxes'],
    queryFn: () => fetchBatchBoxes(batchId as number),
    enabled: enabled && batchId != null,
    refetchInterval: enabled ? 10_000 : false,
  });
}

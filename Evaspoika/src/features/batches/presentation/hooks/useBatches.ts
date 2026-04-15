import { useQuery } from '@tanstack/react-query';
import { fetchBatches, fetchDeletedBatches } from '../../infrastructure/batchesApi';

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

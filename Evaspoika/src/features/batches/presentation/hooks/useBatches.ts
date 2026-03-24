import { useQuery } from '@tanstack/react-query';
import { fetchBatches } from '../../infrastructure/batchesApi';

export function useBatches() {
  return useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
    refetchInterval: 10_000,
  });
}

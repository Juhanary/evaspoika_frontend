import { useQuery } from '@tanstack/react-query';
import { fetchBatchEvents } from '../../infrastructure/batchEventsApi';

export function useBatchEvents() {
  return useQuery({
    queryKey: ['batchEvents'],
    queryFn: fetchBatchEvents,
  });
}

import { useQuery } from '@tanstack/react-query';
import {
  fetchBatchEvents,
  fetchBatchLog,
  type BatchEventsQueryParams,
} from '../../infrastructure/batchEventsApi';

export function useBatchEvents(params?: BatchEventsQueryParams) {
  return useQuery({
    queryKey: ['batchEvents', params],
    queryFn: () => fetchBatchEvents(params),
    refetchInterval: 5_000,
  });
}

export function useBatchLog(batchId?: number) {
  return useQuery({
    queryKey: ['batchEvents', 'batch', batchId],
    queryFn: () => fetchBatchLog(batchId as number),
    enabled: typeof batchId === 'number' && Number.isFinite(batchId) && batchId > 0,
    refetchInterval: 5_000,
  });
}

import { useQuery } from '@tanstack/react-query';
import {
  fetchBatchEvents,
  fetchBatchLog,
  type BatchEventsQueryParams,
} from '../../infrastructure/batchEventsApi';

// Loki on menneisyyttä eikä muutu sekunneissa, mutta kaikki kutsujat pollasivat
// sitä viiden sekunnin välein. Koska ScreenLayout hakee tapahtumia jokaisella
// näytöllä, Pi ajoi satojen rivien nelijoinin jatkuvasti taustalla vaikka kukaan
// ei katsonut lokia. Pollaus on nyt valinnainen ja päällä vain siellä missä
// vaa'alta tulevat punnitukset pitää nähdä heti.
type BatchEventsOptions = {
  live?: boolean;
};

const LIVE_REFETCH_MS = 5_000;
const HISTORY_STALE_MS = 30_000;

export function useBatchEvents(params?: BatchEventsQueryParams, options?: BatchEventsOptions) {
  const live = options?.live ?? false;

  return useQuery({
    queryKey: ['batchEvents', params],
    queryFn: () => fetchBatchEvents(params),
    refetchInterval: live ? LIVE_REFETCH_MS : false,
    staleTime: live ? 0 : HISTORY_STALE_MS,
  });
}

export function useBatchLog(batchId?: number, options?: BatchEventsOptions) {
  const live = options?.live ?? false;

  return useQuery({
    queryKey: ['batchEvents', 'batch', batchId],
    queryFn: () => fetchBatchLog(batchId as number),
    enabled: typeof batchId === 'number' && Number.isFinite(batchId) && batchId > 0,
    refetchInterval: live ? LIVE_REFETCH_MS : false,
    staleTime: live ? 0 : HISTORY_STALE_MS,
  });
}

import { useQuery } from '@tanstack/react-query';
import { fetchRecentBoxes } from '../../infrastructure/boxesApi';

// Vaa'an punnitukset kulkevat backendille itsestään, joten jakonäyttö voi poimia
// ne suoraan sen sijaan että työntekijä skannaisi jokaisen uuden tarran. Pollaus
// on päällä vain silloin kun jako on kesken.
const POLL_MS = 3_000;

export function useNewBoxes(
  productId: number | null | undefined,
  afterId: number | null | undefined,
  enabled: boolean,
) {
  const active = enabled && !!productId && afterId != null;

  return useQuery({
    queryKey: ['boxes', 'recent', productId, afterId],
    queryFn: () => fetchRecentBoxes(productId as number, afterId as number),
    enabled: active,
    refetchInterval: active ? POLL_MS : false,
    staleTime: 0,
  });
}

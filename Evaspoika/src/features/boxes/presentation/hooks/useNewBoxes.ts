import { useQuery } from '@tanstack/react-query';
import { fetchRecentBoxes } from '../../infrastructure/boxesApi';

// Vaa'an punnitukset kulkevat backendille itsestään, joten jakonäyttö voi poimia
// ne suoraan sen sijaan että työntekijä skannaisi jokaisen uuden tarran. Pollaus
// on päällä vain silloin kun jako on kesken JA erä on vaihdettu vaa'alle.
const POLL_MS = 3_000;

export function useNewBoxes(
  productId: number | null | undefined,
  afterId: number | null | undefined,
  enabled: boolean,
) {
  const active = enabled && !!productId && afterId != null;

  return useQuery({
    // Avain on tarkoituksella 'boxesRecent' eikä 'boxes': BACKEND_QUERY_KEYS-listalla
    // oleva avain dehydratoidaan AsyncStorageen, ja kolmen sekunnin pollaus staleTimella 0
    // kirjoittaisi koko välimuistin levylle parin sekunnin välein koko jaon ajan. Tämä
    // kysely on hetkellinen työkalu eikä tila jonka on näyttävä verkon ulkopuolella.
    queryKey: ['boxesRecent', productId, afterId],
    queryFn: () => fetchRecentBoxes(productId as number, afterId as number),
    enabled: active,
    refetchInterval: active ? POLL_MS : false,
    staleTime: 0,
  });
}

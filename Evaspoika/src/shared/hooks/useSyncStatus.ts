import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isBackendQueryKey } from '@/src/shared/constants/queryKeys';

export type SyncStatus = {
  /** false = viimeisin hakuyritys epäonnistui eikä uutta dataa saada juuri nyt. */
  canRefresh: boolean;
  /** Milloin näytöllä oleva data on viimeksi saatu backendiltä. */
  lastUpdatedAt: number | null;
};

// Kuinka usein yhteyttä kokeillaan uudelleen katkon aikana.
const RETRY_INTERVAL_MS = 20_000;

/**
 * Kertoo saadaanko backendiltä juuri nyt tuoretta dataa, ja yrittää katkon
 * aikana palautumista taustalla.
 *
 * Tila luetaan kyselyiden omasta tuloksesta eikä NetInfosta. Se on tässä
 * projektissa olennaista: varaston wifissä voi olla yhteys mutta Pi silti
 * tavoittamattomissa, jolloin NetInfo sanoisi "online" ja käyttäjä luulisi
 * katsovansa tuoretta dataa.
 */
export function useSyncStatus(): SyncStatus {
  const queryClient = useQueryClient();

  const subscribe = useCallback(
    (onChange: () => void) => queryClient.getQueryCache().subscribe(onChange),
    [queryClient],
  );

  // useSyncExternalStore vertaa snapshotteja viittauksella, joten tila
  // koodataan merkkijonoksi. Uusi olio joka kutsulla johtaisi loputtomaan
  // uudelleenrenderöintiin.
  const getSnapshot = useCallback(() => {
    let failing = 0;
    let newest = 0;
    for (const query of queryClient.getQueryCache().getAll()) {
      // Vain backend-kyselyt kertovat yhteydestä; paikalliset onnistuvat aina.
      if (!isBackendQueryKey(query.queryKey)) continue;
      // fetchStatus 'idle' + error = yritys on päättynyt ja epäonnistui.
      if (query.state.fetchStatus === 'idle' && query.state.error !== null) {
        failing += 1;
      }
      if (query.state.dataUpdatedAt > newest) {
        newest = query.state.dataUpdatedAt;
      }
    }
    return `${failing}|${newest}`;
  }, [queryClient]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [failing, newest] = snapshot.split('|').map(Number);

  // Tila lukitaan kunnes jokin kysely oikeasti onnistuu. Ilman lukitusta palkki
  // vilkkuisi alla olevan uudelleenyrityksen tahdissa: kesken haun fetchStatus
  // ei ole 'idle', jolloin virhe katoaisi hetkeksi näkyvistä ja palaisi taas.
  // Onnistuminen tunnistetaan siitä että newest kasvaa katkon alun arvosta.
  const [failedAt, setFailedAt] = useState<number | null>(null);

  useEffect(() => {
    if (failedAt !== null && newest > failedAt) {
      setFailedAt(null);
      return;
    }
    if (failing > 0 && failedAt === null) {
      setFailedAt(newest);
    }
  }, [failing, newest, failedAt]);

  const canRefresh = failedAt === null;

  // Sovellus on jo edustalla, joten focus- tai mount-tapahtumaa ei tule eikä
  // mikään laukaisisi uutta hakua verkon palatessa. Ilman tätä palkki jäisi
  // näkyviin – eli valehtelisi – kunnes käyttäjä painaa sitä itse.
  useEffect(() => {
    if (canRefresh) return;
    const id = setInterval(() => {
      void queryClient.refetchQueries({ type: 'active' });
    }, RETRY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [canRefresh, queryClient]);

  return {
    canRefresh,
    lastUpdatedAt: newest > 0 ? newest : null,
  };
}

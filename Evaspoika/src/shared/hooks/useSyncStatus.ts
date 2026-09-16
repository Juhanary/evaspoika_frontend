import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isBackendQueryKey } from '@/src/shared/constants/queryKeys';

export type SyncStatus = {
  /** false = dataa ei ole saatu backendiltä pitkään aikaan, vaikka on yritetty. */
  canRefresh: boolean;
  /** Milloin näytöllä oleva data on viimeksi saatu backendiltä. */
  lastUpdatedAt: number | null;
};

/**
 * Kuinka kauan epäonnistumisen on jatkuttava yhtäjaksoisesti ennen kuin katko
 * julistetaan. Varaston verkko on ajoittain huono, ja yksittäisiä epäonnistuneita
 * hakuja sattuu jatkuvasti myös silloin kun yhteys on käytännössä kunnossa – yksi
 * epäonnistuminen edustaa jo noin 7 sekuntia yrittämistä (React Queryn kolme
 * uudelleenyritystä 1 s + 2 s + 4 s viiveellä). Vasta yhtäjaksoinen putki ilman
 * yhtäkään onnistumista on luotettava merkki katkosta.
 */
const OFFLINE_GRACE_MS = 45_000;

/** Kuinka usein yhteyttä kokeillaan uudelleen kun katko on jo julistettu. */
const RETRY_INTERVAL_MS = 20_000;

/** Kuinka tiheästi putken kestoa verrataan kelloon. */
const TICK_MS = 5_000;

/**
 * Kertoo saadaanko backendiltä tuoretta dataa, ja yrittää katkon aikana
 * palautumista taustalla.
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
      // Pelkkä error ilman fetchStatus-ehtoa: React Query säilyttää virheen myös
      // uuden haun ajan ja nollaa sen vasta onnistumisessa. Näin putki ei katkea
      // joka kerta kun uudelleenyritys on kesken.
      if (query.state.error !== null) {
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

  // Putken alkuhetki. Mikä tahansa onnistunut haku nollaa sen, joten mittarina
  // on "kuinka kauan yhtäjaksoisesti ilman tuoretta dataa" eikä "epäonnistuiko
  // viimeisin yritys".
  const [failureSince, setFailureSince] = useState<number | null>(null);
  const seenNewest = useRef(newest);

  useEffect(() => {
    if (newest > seenNewest.current) {
      seenNewest.current = newest;
      setFailureSince(null);
      return;
    }
    if (failing === 0) {
      setFailureSince(null);
      return;
    }
    // Funktiomuoto pitää failureSincen pois riippuvuuksista, jottei efekti jää
    // silmukkaan omaan tilamuutokseensa.
    setFailureSince((prev) => prev ?? Date.now());
  }, [failing, newest]);

  // Putken kesto on aikaa eikä tapahtuma, joten sitä on verrattava kelloon
  // erikseen – välimuisti ei lähetä mitään pelkän ajan kulumisesta.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (failureSince === null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [failureSince]);

  const offline = failureSince !== null && now - failureSince >= OFFLINE_GRACE_MS;

  // Sovellus on jo edustalla, joten focus- tai mount-tapahtumaa ei tule eikä
  // mikään laukaisisi uutta hakua verkon palatessa. Ilman tätä palkki jäisi
  // näkyviin – eli valehtelisi – kunnes käyttäjä painaa sitä itse. Vain
  // julistetun katkon aikana, jottei pysyvästi virheellinen kysely (esim. 4xx)
  // jää hakkaamaan backendiä ikuisesti.
  useEffect(() => {
    if (!offline) return;
    const id = setInterval(() => {
      void queryClient.refetchQueries({ type: 'active' });
    }, RETRY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [offline, queryClient]);

  return {
    canRefresh: !offline,
    lastUpdatedAt: newest > 0 ? newest : null,
  };
}

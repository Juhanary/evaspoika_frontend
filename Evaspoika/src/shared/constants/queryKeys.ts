/**
 * Kyselyt jotka hakevat dataa backendiltä. Näiden – ja vain näiden – perusteella
 * päätellään saadaanko tuoretta dataa, ja näistä säilytetään kopio levyllä.
 *
 * Rajaus on välttämätön, ei kosmeettinen. Jakoluonnos (`splitDraft`) on
 * useQuery joka lukee pelkästä AsyncStoragesta ja onnistuu siksi myös verkon
 * ulkopuolella. Jos se laskettaisiin mukaan, katko näyttäisi korjaantuvan aina
 * kun luonnos luetaan, ja "tiedot klo ..." kertoisi luonnoksen lukuhetken
 * backend-datan iän sijaan.
 *
 * `batchEvents` ja `netvisor` tulevat backendiltä mutta ovat tarkoituksella
 * poissa: kumpaakaan ei tarvita päivän tilanteen katseluun, ja batchEvents
 * haetaan limitillä 9999, joten se täyttäisi AsyncStoragen.
 */
export const BACKEND_QUERY_KEYS = [
  'orders',
  'orderLines',
  'products',
  'batches',
  'customers',
  'boxes',
] as const;

/** Kuuluuko kysely siihen joukkoon jonka tuoreudesta yhteyspalkki kertoo. */
export const isBackendQueryKey = (queryKey: readonly unknown[]) =>
  typeof queryKey[0] === 'string' &&
  (BACKEND_QUERY_KEYS as readonly string[]).includes(queryKey[0]);

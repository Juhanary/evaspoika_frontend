// Yksi paikka BATCH_LOG.event_code -koodien suomennoksille. Aiemmin jokainen
// näyttö piti omaa listaansa, ja listat erosivat toisistaan: ADJUSTMENT puuttui
// lokista kokonaan, joten se näkyi raakana koodina eikä osunut millekään
// välilehdelle.

export const EVENT_LABELS: Record<string, string> = {
  CREATE: 'Uusi erä luotu',
  WEIGHING: 'Punnitus',
  SALE: 'Myynti',
  RETURN: 'Palautus',
  INVENTORY: 'Manuaalinen korjaus',
  // Backend kirjaa ADJUSTMENTin kun painoa muutetaan ilman eventCodea.
  // PUT /batches/:id oletetaan nykyään INVENTORYksi, joten uusia ADJUSTMENT-
  // rivejä ei enää synny — vanhat rivit kannassa tarvitsevat silti otsikon.
  ADJUSTMENT: 'Painon muutos',
  EMPTY: 'Erä tyhjentyi',
  DELETE: 'Erä poistettu',
};

export const eventLabel = (code: string) => EVENT_LABELS[code] ?? code;

// Myyntitapahtumat: myynti ja sen peruutus kuuluvat samalle välilehdelle.
export const SALE_CODES = new Set(['SALE', 'RETURN']);

// Käsin tehdyt painon korjaukset.
export const CHANGE_CODES = new Set(['INVENTORY', 'ADJUSTMENT']);

// Tapahtumat joille modaali antaa oman värikorostuksen.
export const EVENT_HIGHLIGHT: Record<string, 'create' | 'empty' | 'delete' | 'return'> = {
  CREATE: 'create',
  EMPTY: 'empty',
  DELETE: 'delete',
  RETURN: 'return',
};

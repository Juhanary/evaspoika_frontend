// Erän tila on kolmiarvoinen, ei kaksiarvoinen.
//
// batchHooks asettaa deleted_at:n aina kun paino menee nollaan, joten pelkkä
// deleted_at ei erota normaalisti loppuun myytyä erää käsin poistetusta.
// Loki näytti siksi punaista "Poistettu"-merkkiä jokaisesta tyhjentyneestä
// erästä, ja oikeat poistot hukkuivat joukkoon.

export type BatchState = 'ACTIVE' | 'EMPTIED' | 'DELETED';

export const BATCH_STATE_LABELS: Record<BatchState, string> = {
  ACTIVE: 'Aktiivinen',
  EMPTIED: 'Tyhjentynyt',
  DELETED: 'Poistettu',
};

type BatchStateInput = {
  currentWeight?: number | null;
  deletedAt?: string | null;
  // DELETE-tapahtuma on varmin merkki käsin tehdystä poistosta: hookit
  // kirjaavat sen vain kun deleted_at asetetaan ilman painon muutosta.
  hasDeleteEvent?: boolean;
};

export const resolveBatchState = ({
  currentWeight,
  deletedAt,
  hasDeleteEvent,
}: BatchStateInput): BatchState => {
  if (hasDeleteEvent) return 'DELETED';

  const weight = typeof currentWeight === 'number' ? currentWeight : null;

  // Poistettu erä jossa on painoa jäljellä = käsin poistettu.
  if (deletedAt && (weight === null || weight > 0)) return 'DELETED';

  if (weight === 0) return 'EMPTIED';

  return 'ACTIVE';
};

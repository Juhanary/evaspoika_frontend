export type Batch = {
  id: number;
  batch_number: string;
  production_date?: string | null;
  best_before?: string | null;
  /** Aktiivisten laatikoiden määrä — backend laskee BOX-taulusta. */
  box_count?: number | null;
  initial_weight: number;
  current_weight: number;
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
  ProductId?: number | null;
  days_until_expiry?: number | null;
  date_alert?: 'expired' | 'expiring_soon' | null;
  expiry_date?: string | null;
};

/**
 * Yksittäinen laatikko erässä — GET /batches/:id/boxes.
 *
 * `weight` on tarraan punnittu paino, `remaining_weight` se mitä laatikossa on
 * nyt jäljellä. Ne eroavat kun erän painoa on korjattu käsin tai laatikkoa on
 * syöty osittain, ja juuri se erotus selittää miksi hyllysaldo ei vastaa tarraa.
 * Molemmat ovat kokonaislukuja grammoina, kuten kaikki painot.
 */
export type BatchBox = {
  id: number;
  ean: string | null;
  weight: number;
  remaining_weight: number;
  packed_at: string | null;
  status: string | null;
};

export type CreateBatchInput = {
  batch_number: string;
  production_date?: string | null;
  best_before?: string | null;
  initial_weight: number;
  current_weight: number;
  ProductId: number;
  userId?: number;
  eventCode?: string;
  eventDescription?: string;
  referenceId?: number;
};

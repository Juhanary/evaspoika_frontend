// Jäljitystyypit vastaavat backendin /trace-reittien vastauksia
// (evaspoika_backend/routes/traceRoute.js). Backend kokoaa ketjun valmiiksi,
// joten näissä ei ole Sequelizen include-rakenteita eikä kenttien
// vaihtoehtoisia nimiä — vain se muoto jota näyttö käyttää.

export type TraceProduct = {
  id: number;
  name: string;
  product_code?: number | null;
};

export type TraceBatch = {
  id: number;
  batch_number: string;
  production_date?: string | null;
  best_before?: string | null;
  initial_weight: number;
  current_weight: number;
  deleted_at?: string | null;
  product?: TraceProduct | null;
};

export type TraceBox = {
  id: number;
  ean?: string | null;
  weight: number;
  remaining_weight: number;
  status?: string | null;
  packed_at?: string | null;
  deleted_at?: string | null;
};

export type TraceOrderSummary = {
  id: number;
  order_date?: string | null;
  status?: string | null;
  netvisor_invoice_id?: string | null;
  netvisor_status?: string | null;
  deleted_at?: string | null;
};

export type TraceEvent = {
  id: number;
  event_code: string;
  weight_change: number;
  total_weight?: number | null;
  description?: string | null;
  user_id?: number | null;
  reference_id?: number | null;
  event_date?: string | null;
};

export type TraceDelivery = {
  order_line_id: number;
  sold_weight: number;
  deleted_at?: string | null;
  // Tosi vain kun haku tehtiin EAN-koodilla ja tämä rivi on juuri se laatikko.
  is_queried_box: boolean;
  box?: TraceBox | null;
  order?: TraceOrderSummary | null;
  customer?: { id: number; name: string } | null;
};

export type CodeTrace = {
  query: string;
  matchedBy: 'ean' | 'batch_number';
  box?: TraceBox | null;
  batch: TraceBatch;
  boxes: TraceBox[];
  events: TraceEvent[];
  deliveries: TraceDelivery[];
};

export type TraceCustomerListItem = {
  id: number;
  name: string;
  netvisor_code?: string | null;
  order_count: number;
  last_order_date?: string | null;
};

/**
 * Tilausrivin asiakas. GET /orders sisällyttää tämän aina
 * (routes/orderRoute.js: customerInclude), mutta tyyppi ei tuntenut kenttää,
 * joten näyttö ei nähnyt jo haettua asiakasta ilman erillistä hakua.
 */
export type OrderCustomer = {
  id: number;
  name: string;
  netvisor_code?: string | null;
};

export type Order = {
  id: number;
  Customer?: OrderCustomer | null;
  order_date?: string | null;
  status?: string | null;
  customer_id?: number | null;
  CustomerId?: number | null;
  netvisor_invoice_id?: string | null;
  netvisor_status?: string | null;
  manual_composition_required?: boolean;
  /**
   * Viimeisin muutos ei mennyt Netvisoriin. Rivit ovat tallessa backendissä, ja
   * backend lähettää ne uudelleen noin 10 minuutin välein (retryFailedOrderSyncs).
   */
  netvisor_resend_required?: boolean;
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
  created_by?: string | null;
};

export type NetvisorOrderLinePreview = {
  productName: string | null;
  productNetvisorKey: string | null;
  quantityGrams: number;
  quantityKg: number;
  batchNumber: string | null;
};

export type NetvisorOrderLinesResponse = {
  orderId: number;
  lines: NetvisorOrderLinePreview[];
};

export type CreateOrderInput = {
  order_date?: string | null;
  status?: string | null;
  customer_id?: number | null;
  netvisor_invoice_id?: string | null;
  netvisor_status?: string | null;
  created_by?: string | null;
};

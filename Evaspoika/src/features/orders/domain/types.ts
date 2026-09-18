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
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
  created_by?: string | null;
};

export type CreateOrderInput = {
  order_date?: string | null;
  status?: string | null;
  customer_id?: number | null;
  netvisor_invoice_id?: string | null;
  netvisor_status?: string | null;
  created_by?: string | null;
};

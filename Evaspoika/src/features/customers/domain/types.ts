export type Customer = {
  id: number;
  name: string;
  email?: string | null;
  netvisor_code?: string | null;
  deleted_at?: string | null;
};

export type CreateCustomerInput = {
  name: string;
  email?: string | null;
};

// GET /customers/:id/orders — asiakkaan koko tilaushistoria valmiiksi
// kategorioituna. Vastaus on Sequelize-rivien muodossa, joten kentät ovat
// isolla alkukirjaimella assosiaatioiden mukaan.
export type CustomerOrderLine = {
  id: number;
  BatchId?: number | null;
  sold_weight: number;
  price_per_gram?: number | null;
  box_id?: number | null;
  deleted_at?: string | null;
  Batch?: {
    id: number;
    batch_number: string;
    production_date?: string | null;
    best_before?: string | null;
    initial_weight: number;
    current_weight: number;
    deleted_at?: string | null;
    Product?: {
      id: number;
      name: string;
      product_code?: number | null;
    } | null;
  } | null;
  // Laatikon tarran EAN — reklamaation kohdistus yhteen laatikkoon.
  Box?: {
    id: number;
    ean?: string | null;
    weight: number;
    remaining_weight: number;
    status?: string | null;
    packed_at?: string | null;
    deleted_at?: string | null;
  } | null;
};

export type CustomerOrder = {
  id: number;
  customer_id?: number | null;
  order_date?: string | null;
  status?: string | null;
  netvisor_invoice_id?: string | null;
  netvisor_status?: string | null;
  deleted_at?: string | null;
  created_by?: string | null;
  OrderLines?: CustomerOrderLine[];
};

export type CustomerOrderHistory = {
  customer: Customer;
  openOrders: CustomerOrder[];
  pastOrders: CustomerOrder[];
  deletedOrders: CustomerOrder[];
  allOrders: CustomerOrder[];
  counts: {
    open: number;
    past: number;
    deleted: number;
    total: number;
  };
};

export type OrderLineProduct = {
  id: number;
  name: string;
  ean?: string | null;
};

export type OrderLineBatch = {
  id: number;
  batch_number: string;
  Product?: OrderLineProduct | null;
};

export type OrderLine = {
  id: number;
  OrderId?: number | null;
  BatchId?: number | null;
  sold_weight: number;
  price_per_gram?: number | null;
  price_per_kg?: number | null;
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
  Batch?: OrderLineBatch | null;
};

export type CreateOrderLineInput = {
  orderId: number;
  batchId: number;
  sold_weight: number;
  price_per_gram: number;
  userId?: number;
};

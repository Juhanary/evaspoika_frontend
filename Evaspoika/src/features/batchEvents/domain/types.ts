export type BatchLog = {
  id: number;
  BatchId: number;
  event_code: string;
  weight_change: number;
  description?: string | null;
  user_id?: number | null;
  reference_id?: number | null;
  event_date?: string | null;
  Batch?: {
    id: number;
    batch_number: string;
    production_date?: string | null;
    current_weight: number;
    Product?: {
      id: number;
      name: string;
      ean?: string | null;
    } | null;
  } | null;
  OrderLine?: {
    id: number;
    OrderId?: number | null;
    Order?: {
      id: number;
      customer_id?: number | null;
      order_date?: string | null;
      status?: string | null;
    } | null;
  } | null;
};

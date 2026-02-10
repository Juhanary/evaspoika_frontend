export type Batch = {
  id: number;
  batch_number: string;
  production_date?: string | null;
  best_before?: string | null;
  initial_weight: number;
  current_weight: number;
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
  ProductId?: number | null;
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

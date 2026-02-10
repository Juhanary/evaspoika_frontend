export type BatchEvent = {
  id: number;
  BatchId: number;
  EventTypeId: number;
  UserId?: number | null;
  event_date?: string | null;
  weight_change: number;
  description?: string | null;
  reference_id?: number | null;
  deleted_at?: string | null;
};

export type CreateBatchEventInput = {
  BatchId: number;
  EventTypeId: number;
  UserId?: number | null;
  event_date?: string | null;
  weight_change: number;
  description?: string | null;
  reference_id?: number | null;
};

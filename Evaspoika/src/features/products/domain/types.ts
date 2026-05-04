export type Product = {
  id: number;
  name: string;
  price_per_kg: number;
  netvisor_key?: string | null;
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
};

export type CreateProductInput = {
  name: string;
  price_per_kg: number;
};

export type Product = {
  id: number;
  name: string;
  ean?: string | null;
  price_per_kg: number;
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
};

export type CreateProductInput = {
  name: string;
  ean?: string | null;
  price_per_kg: number;
};

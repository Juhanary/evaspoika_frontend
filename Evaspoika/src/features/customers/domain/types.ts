export type Customer = {
  id: number;
  name: string;
  email?: string | null;
  deleted_at?: string | null;
};

export type CreateCustomerInput = {
  name: string;
  email?: string | null;
};

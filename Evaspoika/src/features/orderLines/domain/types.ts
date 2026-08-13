export type OrderLineProduct = {
  id: number;
  name: string;
};

export type OrderLineBatch = {
  id: number;
  batch_number: string;
  Product?: OrderLineProduct | null;
};

export type OrderLineBox = {
  id: number;
  ean: string | null;
  weight: number;
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
  // Rivin kaikki laatikot. Yhdellä rivillä on erän kaikki myydyt laatikot, koska
  // backend sallii vain yhden rivin per erä tilauksella.
  Boxes?: OrderLineBox[] | null;
};

export type CreateOrderLineInput = {
  orderId: number;
  batchId: number;
  sold_weight: number;
  price_per_gram: number;
  userId?: number;
  // Rivin laatikot. Ilman näitä ORDER_LINE_BOX jää tyhjäksi, jolloin reklamaatiossa
  // ei voi kysyä kenelle yksittäinen laatikko meni — eikä backend voi estää saman
  // laatikon skannaamista tilaukselle kahdesti.
  boxIds?: number[];
};

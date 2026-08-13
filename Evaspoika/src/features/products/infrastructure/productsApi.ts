import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import {
  NetvisorProductDetailsQuery,
  NetvisorProductListQuery,
} from '@/src/features/netvisor/domain/types';
import {
  fetchNetvisorResource,
  postNetvisorXml,
  putNetvisorXml,
} from '@/src/features/netvisor/infrastructure/netvisorApi';
import { Product } from '../domain/types';

export function fetchProducts() {
  return apiRequest<Product[]>(endpoints.products);
}

export function fetchNetvisorProducts(query?: NetvisorProductListQuery) {
  return fetchNetvisorResource('/products', query);
}

export function fetchNetvisorProductDetails(query: NetvisorProductDetailsQuery) {
  return fetchNetvisorResource('/products/details', query);
}

export function fetchNetvisorProduct(
  productId: number | string,
  query?: Omit<NetvisorProductDetailsQuery, 'id' | 'idlist'>
) {
  return fetchNetvisorResource(`/products/${productId}`, query);
}

export function createNetvisorProduct(xmlBody: string) {
  return postNetvisorXml('/products', xmlBody);
}

export function updateNetvisorProduct(productId: number | string, xmlBody: string) {
  return putNetvisorXml(`/products/${productId}`, xmlBody);
}

// HUOM: tuotteiden luonti, muokkaus, poisto ja yhdistäminen on poistettu täältä.
// Funktiot kutsuivat reittejä POST/PUT/DELETE /products ja POST /products/:id/merge/:id,
// joita backendissä ei ole — routes/productRoute.js tarjoaa vain GET / ja PATCH /:id.
// Yksikään näkymä ei kutsunut niitä, mutta valmiilta näyttävä rajapinta olisi tuottanut
// 404:n heti kun joku kytkee napin kiinni. Tuotteita hallitaan Netvisorissa ja
// synkronoidaan sieltä; jos paikallinen hallinta tulee, reitit tehdään ensin backendiin.

export function patchProductCode(id: number, product_code: number | null) {
  return apiRequest<{ id: number; product_code: number | null }>(`${endpoints.products}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ product_code }),
  });
}


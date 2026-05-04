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
import { CreateProductInput, Product } from '../domain/types';

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

export function createProduct(input: CreateProductInput) {
  return apiRequest<Product>(endpoints.products, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateProduct(id: number, input: Partial<CreateProductInput>) {
  return apiRequest<void>(`${endpoints.products}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: number) {
  return apiRequest<unknown>(`${endpoints.products}/${id}`, {
    method: 'DELETE',
  });
}

export function mergeProducts(targetId: number, sourceId: number) {
  return apiRequest<{ message: string; batchesMoved: number }>(
    `${endpoints.products}/${targetId}/merge/${sourceId}`,
    { method: 'POST' },
  );
}

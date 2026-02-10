import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { CreateProductInput, Product } from '../domain/types';

export function fetchProducts() {
  return apiRequest<Product[]>(endpoints.products);
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

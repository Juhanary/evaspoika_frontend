import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { CreateOrderInput, Order } from '../domain/types';

export function fetchOrders() {
  return apiRequest<Order[]>(endpoints.orders);
}

export function createOrder(input: CreateOrderInput) {
  return apiRequest<Order>(endpoints.orders, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateOrder(id: number, input: Partial<CreateOrderInput>) {
  return apiRequest<void>(`${endpoints.orders}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteOrder(id: number) {
  return apiRequest<unknown>(`${endpoints.orders}/${id}`, {
    method: 'DELETE',
  });
}

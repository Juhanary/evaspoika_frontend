import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { CreateOrderInput, Order } from '../domain/types';

export function fetchOrders() {
  return apiRequest<Order[]>(endpoints.orders);
}

export function fetchOrder(id: number) {
  return apiRequest<Order>(`${endpoints.orders}/${id}`);
}

export function createOrder(input: CreateOrderInput) {
  return apiRequest<Order>(endpoints.orders, {
    method: 'POST',
    auth: 'netvisorWrite',
    body: JSON.stringify(input),
  });
}

export function deleteOrder(id: number) {
  return apiRequest<unknown>(`${endpoints.orders}/${id}`, {
    method: 'DELETE',
  });
}

export function syncOrdersFromNetvisor() {
  return apiRequest<{ total: number; imported: number; skipped: number; failed: number }>(
    `${endpoints.netvisor}/sync-orders`,
    { method: 'POST', auth: 'netvisorWrite' },
  );
}

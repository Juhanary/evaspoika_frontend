import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { NetvisorDocumentDetailsQuery } from '@/src/features/netvisor/domain/types';
import { fetchNetvisorResource } from '@/src/features/netvisor/infrastructure/netvisorApi';
import { CreateOrderInput, Order } from '../domain/types';

export function fetchOrders() {
  return apiRequest<Order[]>(endpoints.orders);
}

export function fetchOrder(id: number) {
  return apiRequest<Order>(`${endpoints.orders}/${id}`);
}

export function fetchNetvisorOrderDetails(query: NetvisorDocumentDetailsQuery) {
  return fetchNetvisorResource('/orders/details', query);
}

export function fetchNetvisorOrder(
  orderId: number | string,
  query?: Omit<NetvisorDocumentDetailsQuery, 'netvisorkey' | 'netvisorkeylist'>
) {
  return fetchNetvisorResource(`/orders/${orderId}`, query);
}

export function createOrder(input: CreateOrderInput) {
  return apiRequest<Order>(endpoints.orders, {
    method: 'POST',
    auth: 'netvisorWrite',
    body: JSON.stringify(input),
  });
}

export function updateOrder(id: number, input: Partial<CreateOrderInput>) {
  return apiRequest<void>(`${endpoints.orders}/${id}`, {
    method: 'PUT',
    auth: 'netvisorWrite',
    body: JSON.stringify(input),
  });
}

export function deleteOrder(id: number) {
  return apiRequest<unknown>(`${endpoints.orders}/${id}`, {
    method: 'DELETE',
  });
}

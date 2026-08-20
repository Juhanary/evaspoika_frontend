import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { CreateOrderInput, Order } from '../domain/types';

export function fetchOrders() {
  return apiRequest<Order[]>(endpoints.orders);
}

export function fetchClosedOrders() {
  return apiRequest<Order[]>(`${endpoints.orders}?closed=true`);
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

// There is deliberately no deleteOrder() here. The backend does expose
// DELETE /api/orders/:id, but Netvisor is the system of record for orders and
// deletions are made there by hand — so the tablet must not delete them. The
// UI has no delete-order button either; a wrapper here would only invite one.

export function syncOrdersFromNetvisor() {
  return apiRequest<{ total: number; imported: number; skipped: number; failed: number }>(
    `${endpoints.netvisor}/sync-orders`,
    { method: 'POST', auth: 'netvisorWrite' },
  );
}

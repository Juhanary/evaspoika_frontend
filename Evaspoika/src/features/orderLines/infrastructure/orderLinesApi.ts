import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { CreateOrderLineInput, OrderLine } from '../domain/types';

export function fetchOrderLines(orderId: number) {
  return apiRequest<OrderLine[]>(`${endpoints.orderLines}/order/${orderId}`);
}

export function createOrderLine(input: CreateOrderLineInput) {
  return apiRequest<OrderLine>(endpoints.orderLines, {
    method: 'POST',
    auth: 'netvisorWrite',
    body: JSON.stringify(input),
  });
}

export function deleteOrderLine(id: number) {
  return apiRequest<{ message: string; orderLineId: number }>(
    `${endpoints.orderLines}/${id}`,
    { method: 'DELETE', auth: 'netvisorWrite' },
  );
}

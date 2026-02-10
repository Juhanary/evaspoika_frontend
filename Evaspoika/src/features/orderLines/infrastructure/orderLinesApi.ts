import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { CreateOrderLineInput, OrderLine } from '../domain/types';

export function createOrderLine(input: CreateOrderLineInput) {
  return apiRequest<OrderLine>(endpoints.orderLines, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

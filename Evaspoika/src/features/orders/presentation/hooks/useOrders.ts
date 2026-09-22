import { useQuery } from '@tanstack/react-query';
import {
  fetchNetvisorOrderLines,
  fetchOrder,
  fetchClosedOrders,
  fetchOrders,
} from '../../infrastructure/ordersApi';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
}

export function useClosedOrders() {
  return useQuery({
    queryKey: ['orders', 'closed'],
    queryFn: fetchClosedOrders,
  });
}

export function useOrder(orderId?: number) {
  return useQuery({
    queryKey: ['orders', orderId ?? null],
    queryFn: () => fetchOrder(orderId as number),
    enabled: typeof orderId === 'number',
  });
}

export function useNetvisorOrderLines(orderId?: number, enabled = true) {
  return useQuery({
    queryKey: ['orders', orderId ?? null, 'netvisor-lines'],
    queryFn: () => fetchNetvisorOrderLines(orderId as number),
    enabled: enabled && typeof orderId === 'number',
  });
}

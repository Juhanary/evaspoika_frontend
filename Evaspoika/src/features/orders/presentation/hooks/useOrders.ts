import { useQuery } from '@tanstack/react-query';
import {
  fetchNetvisorOrder,
  fetchNetvisorOrderDetails,
  fetchOrder,
  fetchOrders,
} from '../../infrastructure/ordersApi';
import { NetvisorDocumentDetailsQuery } from '@/src/features/netvisor/domain/types';

const hasValue = (
  value: number | string | (number | string)[] | undefined
) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value != null && String(value).trim().length > 0;
};

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
}

export function useOrder(orderId?: number) {
  return useQuery({
    queryKey: ['orders', orderId ?? null],
    queryFn: () => fetchOrder(orderId as number),
    enabled: typeof orderId === 'number',
  });
}

export function useNetvisorOrderDetails(query?: NetvisorDocumentDetailsQuery) {
  return useQuery({
    queryKey: ['netvisor', 'orders', 'details', query ?? {}],
    queryFn: () => fetchNetvisorOrderDetails(query as NetvisorDocumentDetailsQuery),
    enabled: Boolean(query && (hasValue(query.netvisorkey) || hasValue(query.netvisorkeylist))),
  });
}

export function useNetvisorOrder(
  orderId?: number | string,
  query?: Omit<NetvisorDocumentDetailsQuery, 'netvisorkey' | 'netvisorkeylist'>
) {
  return useQuery({
    queryKey: ['netvisor', 'orders', orderId ?? null, query ?? {}],
    queryFn: () => fetchNetvisorOrder(orderId as number | string, query),
    enabled: hasValue(orderId),
  });
}

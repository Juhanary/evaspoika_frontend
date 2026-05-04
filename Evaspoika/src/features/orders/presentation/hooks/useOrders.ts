import { useQuery } from '@tanstack/react-query';
import { fetchOrder, fetchOrders } from '../../infrastructure/ordersApi';

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

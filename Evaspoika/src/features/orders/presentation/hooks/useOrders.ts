import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../../infrastructure/ordersApi';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
}

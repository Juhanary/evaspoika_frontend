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

// Backend lähettää lähettämättömän muutoksen uudelleen noin 10 minuutin välein.
// Avoinna oleva näyttö ei muuten hae tilausta uudestaan, joten "Lähettämättä
// Netvisoriin" jäisi näkyviin vielä onnistuneen uudelleenlähetyksen jälkeen.
const UNSENT_ORDER_REFETCH_MS = 60_000;

export function useOrder(orderId?: number) {
  return useQuery({
    queryKey: ['orders', orderId ?? null],
    queryFn: () => fetchOrder(orderId as number),
    enabled: typeof orderId === 'number',
    refetchInterval: (query) =>
      query.state.data?.netvisor_resend_required ? UNSENT_ORDER_REFETCH_MS : false,
  });
}

export function useNetvisorOrderLines(orderId?: number, enabled = true) {
  return useQuery({
    queryKey: ['orders', orderId ?? null, 'netvisor-lines'],
    queryFn: () => fetchNetvisorOrderLines(orderId as number),
    enabled: enabled && typeof orderId === 'number',
  });
}

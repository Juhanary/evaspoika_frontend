import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import {
  CreateOrderInput,
  NetvisorOrderLinesResponse,
  Order,
} from '../domain/types';

export function fetchOrders() {
  return apiRequest<Order[]>(endpoints.orders);
}

export function fetchClosedOrders() {
  return apiRequest<Order[]>(`${endpoints.orders}?closed=true`);
}

export function fetchOrder(id: number) {
  return apiRequest<Order>(`${endpoints.orders}/${id}`);
}

export function fetchNetvisorOrderLines(id: number) {
  return apiRequest<NetvisorOrderLinesResponse>(`${endpoints.orders}/${id}/netvisor-lines`);
}

export function completeManualOrderComposition(id: number) {
  return apiRequest<{ netvisorKey: string; status: string; manual_composition_required: false }>(
    `${endpoints.orders}/${id}/complete-composition`,
    { method: 'POST', auth: 'netvisorWrite' },
  );
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
  // Backendin syncOrdersFromNetvisor-paluuarvo. Kaksi viimeistä puuttuvat vanhasta
  // backendistä, joten ne ovat valinnaisia.
  return apiRequest<{
    total: number;
    imported: number;
    updated: number;
    /** Laskutetuksi merkityt: kadonneet listalta, Netvisorissa tila laskutettu. */
    delivered: number;
    failed: number;
    /** Netvisorissa poistetut: poistettu myös täältä ja laatikot palautettu hyllylle. */
    removedInNetvisor?: number;
    /** Netvisorissa tuli uusi rivi: tilaus merkitty koostettavaksi. */
    ordersToCompose?: number;
  }>(
    `${endpoints.netvisor}/sync-orders`,
    { method: 'POST', auth: 'netvisorWrite' },
  );
}

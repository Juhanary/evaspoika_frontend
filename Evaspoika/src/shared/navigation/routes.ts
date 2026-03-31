import type { Href } from 'expo-router';

type RouteParam = number | string;

const toParam = (value: RouteParam) => String(value);

export const routes = {
  home: '/' as Href,
  orders: '/orders' as Href,
  inventory: '/inventory' as Href,
  weighing: '/weighing' as Href,
  logs: '/logs' as Href,
  more: '/more' as Href,
  moreCustomers: '/more/customers' as Href,
  moreLogs: '/more/logs' as Href,
  orderDetail(orderId: RouteParam) {
    return {
      pathname: '/orders/[orderId]',
      params: { orderId: toParam(orderId) },
    } as Href;
  },
  inventoryProduct(productId: RouteParam) {
    return {
      pathname: '/inventory/[productId]',
      params: { productId: toParam(productId) },
    } as Href;
  },
  inventoryBatch(batchId: RouteParam, batchNumber?: string) {
    const params: Record<string, string> = { batchId: toParam(batchId) };

    if (batchNumber) {
      params.batchNumber = batchNumber;
    }

    return {
      pathname: '/inventory/batch/[batchId]',
      params,
    } as Href;
  },
};

import { ScanPreviewItem } from './domain/types';

let _orderId: number | null = null;
let _items: ScanPreviewItem[] = [];

export const scanStore = {
  set(orderId: number, items: ScanPreviewItem[]) {
    _orderId = orderId;
    _items = items;
  },
  getOrderId: () => _orderId,
  getItems: () => _items,
  clear() {
    _orderId = null;
    _items = [];
  },
};

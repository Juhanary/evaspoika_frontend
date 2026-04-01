import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { ConfirmLine, ScanInventoryBox, ScanPreviewItem } from '../domain/types';

export function fetchScanBoxes() {
  return apiRequest<ScanInventoryBox[]>(`${endpoints.scan}/boxes`);
}

export function previewScan(items: { ean: string; count: number }[]) {
  return apiRequest<ScanPreviewItem[]>(`${endpoints.scan}/preview`, {
    method: 'POST',
    auth: 'netvisorWrite',
    body: JSON.stringify({ items }),
  });
}

export function confirmScan(orderId: number, lines: ConfirmLine[]) {
  return apiRequest<{ created: number; orderId: number }>(
    `${endpoints.scan}/orders/${orderId}/confirm`,
    {
      method: 'POST',
      auth: 'netvisorWrite',
      body: JSON.stringify({ lines }),
    }
  );
}

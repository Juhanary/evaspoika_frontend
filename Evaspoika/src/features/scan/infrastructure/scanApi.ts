import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { ConfirmLine, ScanPreviewItem, VirtualBox } from '../domain/types';

export function fetchBoxes() {
  return apiRequest<VirtualBox[]>(`${endpoints.scan}/boxes`);
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

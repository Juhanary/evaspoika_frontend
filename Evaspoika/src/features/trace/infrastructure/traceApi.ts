import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { CodeTrace, TraceCustomerListItem } from '../domain/types';

// Jäljitys haluaa nähdä myös poistetut rivit: palautettu tilausrivi ja poistettu
// erä ovat reklamaatiossa olennaisia faktoja. Backend suodattaa ne oletuksena
// pois soft delete -konvention mukaisesti, joten ne pyydetään eksplisiittisesti.
const AUDIT_QUERY = { includeDeleted: true } as const;

export function fetchTraceCustomers(search?: string) {
  return apiRequest<TraceCustomerListItem[]>(`${endpoints.trace}/customers`, {
    query: { search: search?.trim() || undefined },
  });
}

export function fetchCodeTrace(code: string) {
  return apiRequest<CodeTrace>(`${endpoints.trace}/code/${encodeURIComponent(code)}`, {
    query: AUDIT_QUERY,
  });
}

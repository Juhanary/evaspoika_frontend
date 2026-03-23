import { useQuery } from '@tanstack/react-query';
import {
  NetvisorDocumentDetailsQuery,
  NetvisorInvoiceListQuery,
} from '@/src/features/netvisor/domain/types';
import {
  fetchNetvisorInvoice,
  fetchNetvisorInvoiceDetails,
  fetchNetvisorInvoices,
} from '../../infrastructure/invoicesApi';

type NetvisorInvoiceQueryOptions = Omit<
  NetvisorDocumentDetailsQuery,
  'netvisorkey' | 'netvisorkeylist'
>;

const hasValue = (
  value: number | string | (number | string)[] | undefined
) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value != null && String(value).trim().length > 0;
};

export function useNetvisorInvoices(query?: NetvisorInvoiceListQuery) {
  return useQuery({
    queryKey: ['netvisor', 'invoices', query ?? {}],
    queryFn: () => fetchNetvisorInvoices(query),
  });
}

export function useNetvisorInvoiceDetails(query?: NetvisorDocumentDetailsQuery) {
  return useQuery({
    queryKey: ['netvisor', 'invoices', 'details', query ?? {}],
    queryFn: () => fetchNetvisorInvoiceDetails(query as NetvisorDocumentDetailsQuery),
    enabled: Boolean(query && (hasValue(query.netvisorkey) || hasValue(query.netvisorkeylist))),
  });
}

export function useNetvisorInvoice(
  invoiceId?: number | string,
  query?: NetvisorInvoiceQueryOptions
) {
  return useQuery({
    queryKey: ['netvisor', 'invoices', invoiceId ?? null, query ?? {}],
    queryFn: () => fetchNetvisorInvoice(invoiceId as number | string, query),
    enabled: hasValue(invoiceId),
  });
}

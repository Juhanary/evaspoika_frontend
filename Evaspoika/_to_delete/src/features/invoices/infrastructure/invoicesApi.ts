import {
  NetvisorDocumentDetailsQuery,
  NetvisorInvoiceListQuery,
} from '@/src/features/netvisor/domain/types';
import {
  fetchNetvisorResource,
  postNetvisorXml,
  putNetvisorXml,
} from '@/src/features/netvisor/infrastructure/netvisorApi';

type NetvisorInvoiceQueryOptions = Omit<
  NetvisorDocumentDetailsQuery,
  'netvisorkey' | 'netvisorkeylist'
>;

export function fetchNetvisorInvoices(query?: NetvisorInvoiceListQuery) {
  return fetchNetvisorResource('/invoices', query);
}

export function fetchNetvisorInvoiceDetails(query: NetvisorDocumentDetailsQuery) {
  return fetchNetvisorResource('/invoices/details', query);
}

export function fetchNetvisorInvoice(
  invoiceId: number | string,
  query?: NetvisorInvoiceQueryOptions
) {
  return fetchNetvisorResource(`/invoices/${invoiceId}`, query);
}

export function createNetvisorInvoice(xmlBody: string) {
  return postNetvisorXml('/invoices', xmlBody);
}

export function updateNetvisorInvoice(invoiceId: number | string, xmlBody: string) {
  return putNetvisorXml(`/invoices/${invoiceId}`, xmlBody);
}

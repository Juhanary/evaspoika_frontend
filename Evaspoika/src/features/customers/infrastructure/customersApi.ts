import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import {
  NetvisorCustomerDetailsQuery,
  NetvisorCustomerListQuery,
  NetvisorResponseEnvelope,
} from '@/src/features/netvisor/domain/types';
import { fetchNetvisorResource } from '@/src/features/netvisor/infrastructure/netvisorApi';
import { CreateCustomerInput, Customer } from '../domain/types';

type NetvisorCustomerListPayload = {
  Root?: {
    Customerlist?: {
      Customer?: {
        Name?: string;
        name?: string;
      }[] | {
        Name?: string;
        name?: string;
      };
    };
  };
};

export type NetvisorCustomerListResponse =
  NetvisorResponseEnvelope<NetvisorCustomerListPayload>;

export function fetchCustomers() {
  return apiRequest<Customer[]>(endpoints.customers);
}

export function fetchCustomer(id: number) {
  return apiRequest<Customer>(`${endpoints.customers}/${id}`);
}

export function fetchNetvisorCustomers(query?: NetvisorCustomerListQuery) {
  return fetchNetvisorResource<NetvisorCustomerListPayload>('/customers', query);
}

export function fetchNetvisorCustomerDetails(query: NetvisorCustomerDetailsQuery) {
  return fetchNetvisorResource('/customers/details', query);
}

export function fetchNetvisorCustomer(
  customerId: number | string,
  query?: Omit<NetvisorCustomerDetailsQuery, 'id' | 'idlist'>
) {
  return fetchNetvisorCustomerDetails({
    ...query,
    id: customerId,
  });
}

export function fetchNetvisorCustomersByIds(
  customerIds: (number | string)[],
  query?: Omit<NetvisorCustomerDetailsQuery, 'id' | 'idlist'>
) {
  return fetchNetvisorCustomerDetails({
    ...query,
    idlist: customerIds,
  });
}

export function createCustomer(input: CreateCustomerInput) {
  return apiRequest<Customer>(endpoints.customers, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateCustomer(id: number, input: Partial<CreateCustomerInput>) {
  return apiRequest<void>(`${endpoints.customers}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteCustomer(id: number) {
  return apiRequest<unknown>(`${endpoints.customers}/${id}`, {
    method: 'DELETE',
  });
}

import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';
import { CreateCustomerInput, Customer } from '../domain/types';

export type NetvisorCustomerListResponse = {
  Root?: {
    Customerlist?: {
      Customer?: Array<{
        Name?: string;
        name?: string;
      }> | {
        Name?: string;
        name?: string;
      };
    };
  };
};

export function fetchCustomers() {
  return apiRequest<Customer[]>(endpoints.customers);
}

export function fetchNetvisorCustomers() {
  return apiRequest<NetvisorCustomerListResponse>(`${endpoints.netvisor}/customers`);
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

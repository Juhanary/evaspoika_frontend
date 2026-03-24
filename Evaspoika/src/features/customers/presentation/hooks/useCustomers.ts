import { useQuery } from '@tanstack/react-query';
import {
  fetchCustomer,
  fetchCustomers,
  fetchNetvisorCustomer,
  fetchNetvisorCustomerDetails,
  fetchNetvisorCustomers,
} from '../../infrastructure/customersApi';
import {
  NetvisorCustomerDetailsQuery,
  NetvisorCustomerListQuery,
} from '@/src/features/netvisor/domain/types';

const hasValue = (
  value: number | string | (number | string)[] | undefined
) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value != null && String(value).trim().length > 0;
};

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
    refetchInterval: 30_000,
  });
}

export function useCustomer(customerId?: number) {
  return useQuery({
    queryKey: ['customers', customerId ?? null],
    queryFn: () => fetchCustomer(customerId as number),
    enabled: typeof customerId === 'number',
  });
}

export function useNetvisorCustomers(query?: NetvisorCustomerListQuery) {
  return useQuery({
    queryKey: ['netvisor', 'customers', query ?? {}],
    queryFn: () => fetchNetvisorCustomers(query),
  });
}

export function useNetvisorCustomerDetails(query?: NetvisorCustomerDetailsQuery) {
  return useQuery({
    queryKey: ['netvisor', 'customers', 'details', query ?? {}],
    queryFn: () => fetchNetvisorCustomerDetails(query as NetvisorCustomerDetailsQuery),
    enabled: Boolean(query && (hasValue(query.id) || hasValue(query.idlist))),
  });
}

export function useNetvisorCustomer(
  customerId?: number | string,
  query?: Omit<NetvisorCustomerDetailsQuery, 'id' | 'idlist'>
) {
  return useQuery({
    queryKey: ['netvisor', 'customers', customerId ?? null, query ?? {}],
    queryFn: () => fetchNetvisorCustomer(customerId as number | string, query),
    enabled: hasValue(customerId),
  });
}

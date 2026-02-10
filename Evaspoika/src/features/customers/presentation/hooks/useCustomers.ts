import { useQuery } from '@tanstack/react-query';
import { fetchCustomers } from '../../infrastructure/customersApi';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });
}

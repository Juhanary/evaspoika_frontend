import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../infrastructure/productsApi';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}

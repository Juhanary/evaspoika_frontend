import { useQuery } from '@tanstack/react-query';
import {
  fetchNetvisorProduct,
  fetchNetvisorProductDetails,
  fetchNetvisorProducts,
  fetchProducts,
} from '../../infrastructure/productsApi';
import {
  NetvisorProductDetailsQuery,
  NetvisorProductListQuery,
} from '@/src/features/netvisor/domain/types';

const hasValue = (
  value: number | string | (number | string)[] | undefined
) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value != null && String(value).trim().length > 0;
};

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}

export function useNetvisorProducts(query?: NetvisorProductListQuery) {
  return useQuery({
    queryKey: ['netvisor', 'products', query ?? {}],
    queryFn: () => fetchNetvisorProducts(query),
  });
}

export function useNetvisorProductDetails(query?: NetvisorProductDetailsQuery) {
  return useQuery({
    queryKey: ['netvisor', 'products', 'details', query ?? {}],
    queryFn: () => fetchNetvisorProductDetails(query as NetvisorProductDetailsQuery),
    enabled: Boolean(
      query &&
        (hasValue(query.id) ||
          hasValue(query.idlist) ||
          hasValue(query.eancode) ||
          hasValue(query.code) ||
          hasValue(query.codelist))
    ),
  });
}

export function useNetvisorProduct(
  productId?: number | string,
  query?: Omit<NetvisorProductDetailsQuery, 'id' | 'idlist'>
) {
  return useQuery({
    queryKey: ['netvisor', 'products', productId ?? null, query ?? {}],
    queryFn: () => fetchNetvisorProduct(productId as number | string, query),
    enabled: hasValue(productId),
  });
}

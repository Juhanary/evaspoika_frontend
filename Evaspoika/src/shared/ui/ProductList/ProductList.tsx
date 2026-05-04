import React from 'react';
import { SelectableSearchList } from '@/src/shared/ui/SelectableSearchList/SelectableSearchList';

export type ProductListItem = {
  id: number;
  name: string;
  price_per_kg?: number;
};

type Props = {
  products?: ProductListItem[] | null;
  isLoading: boolean;
  error?: unknown;
  onSelect: (product: ProductListItem) => void;
  title?: string;
  getSubtitle?: (product: ProductListItem) => string;
  emptyText?: string;
  query?: string;
  onQueryChange?: (text: string) => void;
  showSearchInput?: boolean;
};

const defaultSubtitle = (product: ProductListItem) => {
  const parts: string[] = [];

  if (typeof product.price_per_kg === 'number') {
    parts.push(`Price: ${product.price_per_kg}`);
  }

  return parts.length > 0 ? parts.join(' | ') : `Product ID: ${product.id}`;
};

export function ProductList({
  products,
  isLoading,
  error,
  onSelect,
  title,
  getSubtitle = defaultSubtitle,
  emptyText,
  query,
  onQueryChange,
  showSearchInput = true,
}: Props) {
  return (
    <SelectableSearchList
      emptyText={emptyText}
      error={error}
      errorPrefix="Failed to load products"
      filterItem={(product, activeQuery) =>
        !activeQuery ||
        product.name.toLowerCase().includes(activeQuery)
      }
      getSubtitle={getSubtitle}
      getTitle={(product) => product.name}
      isLoading={isLoading}
      items={products}
      keyExtractor={(product) => String(product.id)}
      loadingText="Loading products..."
      onQueryChange={onQueryChange}
      onSelect={onSelect}
      query={query}
      searchPlaceholder="Hae tuotetta..."
      showSearchInput={showSearchInput}
      title={title}
    />
  );
}

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@evaspoika_product_config_v2';
const MAX_FAVORITES = 5;

export const FIXED_CATEGORIES = [
  { id: 'makkarat', name: 'Makkarat' },
  { id: 'pihvit', name: 'Pihvit' },
  { id: 'pyorykkat', name: 'Pyörykät' },
] as const;

export type CategoryId = typeof FIXED_CATEGORIES[number]['id'];

export type ProductConfig = {
  favorites: number[];
  assignments: Record<string, CategoryId>;
  productOrder: Record<string, number[]>; // categoryId → ordered product IDs
};

const DEFAULT: ProductConfig = { favorites: [], assignments: {}, productOrder: {} };

function persist(next: ProductConfig) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function useProductConfig() {
  const [config, setConfig] = useState<ProductConfig>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setConfig({ ...DEFAULT, ...parsed });
      } catch {}
    });
  }, []);

  const toggleFavorite = useCallback((productId: number) => {
    setConfig((prev) => {
      const isFav = prev.favorites.includes(productId);
      const favorites = isFav
        ? prev.favorites.filter((id) => id !== productId)
        : [...prev.favorites, productId].slice(0, MAX_FAVORITES);
      return persist({ ...prev, favorites });
    });
  }, []);

  const assignCategory = useCallback((productId: number, categoryId: CategoryId | null) => {
    setConfig((prev) => {
      const assignments = { ...prev.assignments };
      if (categoryId === null) delete assignments[String(productId)];
      else assignments[String(productId)] = categoryId;
      return persist({ ...prev, assignments });
    });
  }, []);

  const reorderFavorites = useCallback((newOrder: number[]) => {
    setConfig((prev) => persist({ ...prev, favorites: newOrder }));
  }, []);

  const setProductCategoryOrder = useCallback((categoryId: string, order: number[]) => {
    setConfig((prev) =>
      persist({ ...prev, productOrder: { ...prev.productOrder, [categoryId]: order } }),
    );
  }, []);

  return { config, MAX_FAVORITES, toggleFavorite, assignCategory, reorderFavorites, setProductCategoryOrder };
}

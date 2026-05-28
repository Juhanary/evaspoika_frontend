import { useCallback, useEffect, useRef, useState } from 'react';
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
  productOrder: Record<string, number[]>;
};

const DEFAULT: ProductConfig = { favorites: [], assignments: {}, productOrder: {} };

export function useProductConfig() {
  const [config, setConfig] = useState<ProductConfig>(DEFAULT);
  // Prevents writing back the value we just loaded from storage
  const readyToPersist = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setConfig({ ...DEFAULT, ...parsed });
        } catch {}
      }
      readyToPersist.current = true;
    });
  }, []);

  // Single persist effect: writes whenever config changes after initial load
  useEffect(() => {
    if (!readyToPersist.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const toggleFavorite = useCallback((productId: number) => {
    setConfig((prev) => {
      const isFav = prev.favorites.includes(productId);
      const favorites = isFav
        ? prev.favorites.filter((id) => id !== productId)
        : [...prev.favorites, productId].slice(0, MAX_FAVORITES);
      return { ...prev, favorites };
    });
  }, []);

  const assignCategory = useCallback((productId: number, categoryId: CategoryId | null) => {
    setConfig((prev) => {
      const assignments = { ...prev.assignments };
      if (categoryId === null) delete assignments[String(productId)];
      else assignments[String(productId)] = categoryId;
      return { ...prev, assignments };
    });
  }, []);

  const reorderFavorites = useCallback((newOrder: number[]) => {
    setConfig((prev) => ({ ...prev, favorites: newOrder }));
  }, []);

  const setProductCategoryOrder = useCallback((categoryId: string, order: number[]) => {
    setConfig((prev) => ({
      ...prev,
      productOrder: { ...prev.productOrder, [categoryId]: order },
    }));
  }, []);

  return { config, MAX_FAVORITES, toggleFavorite, assignCategory, reorderFavorites, setProductCategoryOrder };
}

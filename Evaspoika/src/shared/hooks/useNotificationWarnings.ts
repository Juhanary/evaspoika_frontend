import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Batch } from '@/src/features/batches/domain/types';
import { Product } from '@/src/features/products/domain/types';
import { routes } from '@/src/shared/navigation/routes';

const THRESHOLDS_KEY = '@evaspoika_stock_thresholds_v1';
const SEEN_KEY = '@evaspoika_notif_seen_v1';
const READ_KEY = '@evaspoika_notif_read_v1';
const EXPIRY_WARN_DAYS = 100;

function formatDate(raw?: string | null): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

export type CombinedWarning = {
  id: string;
  kind: 'expiry' | 'stock';
  productName: string;
  dateLabel: string;
  detail: string;
  isNew: boolean;
  route: Href;
  daysLeft?: number;
};

export function useNotificationWarnings(batches: Batch[], products: Product[]) {
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [seen, setSeen] = useState<Record<string, number>>({});
  const [read, setRead] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THRESHOLDS_KEY),
      AsyncStorage.getItem(SEEN_KEY),
      AsyncStorage.getItem(READ_KEY),
    ]).then(([tRaw, sRaw, rRaw]) => {
      if (tRaw) {
        try {
          const t = JSON.parse(tRaw) as Record<string, number>;
          setThresholds(t);
          setInputValues(Object.fromEntries(Object.entries(t).map(([k, v]) => [k, String(v)])));
        } catch {}
      }
      if (sRaw) { try { setSeen(JSON.parse(sRaw)); } catch {} }
      if (rRaw) { try { setRead(new Set(JSON.parse(rRaw) as string[])); } catch {} }
      setLoaded(true);
    });
  }, []);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p.name])),
    [products],
  );

  // Raw warnings without isNew (computed from batches/products/thresholds)
  const rawWarnings = useMemo(() => {
    const list: Omit<CombinedWarning, 'isNew'>[] = [];

    for (const b of batches) {
      if (b.deleted_at || !b.ProductId || b.days_until_expiry == null || b.days_until_expiry > EXPIRY_WARN_DAYS) continue;
      list.push({
        id: `expiry_${b.id}`,
        kind: 'expiry',
        productName: productMap.get(b.ProductId) ?? '?',
        dateLabel: formatDate(b.best_before ?? b.expiry_date),
        detail: b.days_until_expiry <= 0
          ? 'Vanhentunut!'
          : b.days_until_expiry === 1
            ? 'Eräpäivä huomenna'
            : `Eräpäivä lähenee · ${b.days_until_expiry} pv`,
        route: routes.inventoryBatch(b.id, b.batch_number),
        daysLeft: b.days_until_expiry,
      });
    }

    const stockMap = new Map<number, number>();
    for (const b of batches) {
      if (!b.deleted_at && b.ProductId && (b.current_weight ?? 0) > 0) {
        stockMap.set(b.ProductId, (stockMap.get(b.ProductId) ?? 0) + (b.current_weight ?? 0));
      }
    }
    for (const p of products) {
      const thresh = thresholds[String(p.id)];
      if (!thresh || thresh <= 0) continue;
      const currentKg = (stockMap.get(p.id) ?? 0) / 1000;
      if (currentKg >= thresh) continue;
      list.push({
        id: `stock_${p.id}`,
        kind: 'stock',
        productName: p.name,
        dateLabel: '',
        detail: `${currentKg.toFixed(1)} kg varastossa · raja ${thresh} kg`,
        route: routes.inventoryProduct(p.id),
      });
    }

    return list;
  }, [batches, products, productMap, thresholds]);

  // After load: assign first-seen timestamps; prune seen only when we have real data
  useEffect(() => {
    if (!loaded) return;
    const now = Date.now();

    setSeen((prev) => {
      const next = { ...prev };
      let changed = false;
      // Assign timestamp to new warnings
      for (const w of rawWarnings) {
        if (!(w.id in next)) { next[w.id] = now; changed = true; }
      }
      // Only prune stale seen entries when we actually have warning data
      // (avoids wiping timestamps while batches are still loading)
      if (rawWarnings.length > 0) {
        const activeIds = new Set(rawWarnings.map((w) => w.id));
        for (const id of Object.keys(next)) {
          if (!activeIds.has(id)) { delete next[id]; changed = true; }
        }
      }
      if (changed) AsyncStorage.setItem(SEEN_KEY, JSON.stringify(next));
      return changed ? next : prev;
    });
    // read is intentionally never pruned: once clicked, stays read across restarts
  }, [rawWarnings, loaded]);

  // Final sorted list: newest (highest timestamp) first, unread highlighted
  const warnings = useMemo<CombinedWarning[]>(() => {
    return rawWarnings
      .map((w) => ({ ...w, isNew: !read.has(w.id) }))
      .sort((a, b) => (seen[b.id] ?? 0) - (seen[a.id] ?? 0));
  }, [rawWarnings, seen, read]);

  const hasUnread = warnings.some((w) => w.isNew);

  const markRead = useCallback((id: string) => {
    setRead((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      AsyncStorage.setItem(READ_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const saveThreshold = useCallback((productId: number, raw: string) => {
    const val = parseFloat(raw.replace(',', '.'));
    setThresholds((prev) => {
      const next = { ...prev };
      if (isNaN(val) || val <= 0) delete next[String(productId)];
      else next[String(productId)] = val;
      AsyncStorage.setItem(THRESHOLDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    warnings,
    hasUnread,
    totalCount: warnings.length,
    markRead,
    thresholds,
    inputValues,
    setInputValues,
    saveThreshold,
  };
}

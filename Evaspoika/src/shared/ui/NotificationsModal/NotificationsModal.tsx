import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Batch } from '@/src/features/batches/domain/types';
import { Product } from '@/src/features/products/domain/types';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';

const THRESHOLDS_KEY = '@evaspoika_stock_thresholds_v1';
const EXPIRY_WARN_DAYS = 100;

type Props = {
  visible: boolean;
  onClose: () => void;
  batches: Batch[];
  products: Product[];
};

type ExpiryWarning = {
  key: string;
  batchNumber: string;
  productName: string;
  daysLeft: number;
};

type StockWarning = {
  productId: number;
  productName: string;
  currentKg: number;
  thresholdKg: number;
};

export function NotificationsModal({ visible, onClose, batches, products }: Props) {
  const [page, setPage] = useState<'warnings' | 'thresholds'>('warnings');
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    AsyncStorage.getItem(THRESHOLDS_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as Record<string, number>;
        setThresholds(parsed);
        setInputValues(
          Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)])),
        );
      } catch {}
    });
  }, []);

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p.name])),
    [products],
  );

  const expiryWarnings = useMemo<ExpiryWarning[]>(() => {
    return (batches ?? [])
      .filter((b) => !b.deleted_at && b.ProductId && b.days_until_expiry != null && b.days_until_expiry <= EXPIRY_WARN_DAYS)
      .map((b) => ({
        key: String(b.id),
        batchNumber: b.batch_number,
        productName: productMap.get(b.ProductId!) ?? '?',
        daysLeft: b.days_until_expiry!,
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [batches, productMap]);

  const stockWarnings = useMemo<StockWarning[]>(() => {
    const stockMap = new Map<number, number>();
    (batches ?? []).forEach((b) => {
      if (!b.deleted_at && b.ProductId && (b.current_weight ?? 0) > 0) {
        stockMap.set(b.ProductId, (stockMap.get(b.ProductId) ?? 0) + (b.current_weight ?? 0));
      }
    });
    return products
      .map((p) => {
        const thresh = thresholds[String(p.id)];
        if (!thresh || thresh <= 0) return null;
        const currentKg = (stockMap.get(p.id) ?? 0) / 1000;
        if (currentKg >= thresh) return null;
        return { productId: p.id, productName: p.name, currentKg, thresholdKg: thresh };
      })
      .filter((w): w is StockWarning => w !== null)
      .sort((a, b) => a.currentKg / a.thresholdKg - b.currentKg / b.thresholdKg);
  }, [batches, products, thresholds]);

  const saveThreshold = useCallback((productId: number, raw: string) => {
    const val = parseFloat(raw.replace(',', '.'));
    setThresholds((prev) => {
      const next = { ...prev };
      if (isNaN(val) || val <= 0) {
        delete next[String(productId)];
      } else {
        next[String(productId)] = val;
      }
      AsyncStorage.setItem(THRESHOLDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const totalWarnings = expiryWarnings.length + stockWarnings.length;
  const hasWarnings = totalWarnings > 0;


  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <GlassCard blurRadius={24} style={styles.card}>
          <View style={styles.header}>
            <Ionicons
              color={hasWarnings ? colors.warning : colors.white}
              name={hasWarnings ? 'notifications' : 'notifications-outline'}
              size={26}
            />
            <Text style={styles.title}>ILMOITUKSET</Text>
            <Pressable hitSlop={12} onPress={onClose}>
              <Ionicons color={colors.white} name="close" size={26} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.tabBar}>
            <Pressable
              onPress={() => setPage('warnings')}
              style={[styles.tab, page === 'warnings' && styles.tabActive]}
            >
              <Text style={[styles.tabText, page === 'warnings' && styles.tabTextActive]}>
                {`Hälytykset${totalWarnings > 0 ? ` (${totalWarnings})` : ''}`}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPage('thresholds')}
              style={[styles.tab, page === 'thresholds' && styles.tabActive]}
            >
              <Text style={[styles.tabText, page === 'thresholds' && styles.tabTextActive]}>
                Hälytysrajat
              </Text>
            </Pressable>
          </View>

          {page === 'warnings' ? (
            <View style={styles.splitContainer}>
              {/* Left: Expiry warnings */}
              <View style={styles.splitPane}>
                <Text style={styles.sectionLabel}>ERÄPÄIVÄT</Text>
                <ScrollView contentContainerStyle={styles.paneContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {expiryWarnings.length === 0 ? (
                    <Text style={styles.emptyText}>Ei hälytyksiä.</Text>
                  ) : (
                    expiryWarnings.map((w) => (
                      <View key={w.key} style={styles.warnRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.warnProduct} numberOfLines={1}>{w.productName}</Text>
                          <Text style={styles.warnDetail}>
                            {`Erä ${w.batchNumber}`}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.daysBadge,
                            {
                              backgroundColor:
                                w.daysLeft <= 0
                                  ? 'rgba(220,38,38,0.22)'
                                  : w.daysLeft <= 14
                                  ? 'rgba(220,38,38,0.22)'
                                  : 'rgba(217,119,6,0.22)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.daysBadgeText,
                              {
                                color:
                                  w.daysLeft <= 14 ? colors.dangerMid : colors.warning,
                              },
                            ]}
                          >
                            {w.daysLeft <= 0 ? '!' : String(w.daysLeft)}
                          </Text>
                          {w.daysLeft > 0 ? (
                            <Text style={styles.daysBadgeSub}>pv</Text>
                          ) : null}
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              <View style={styles.splitDivider} />

              {/* Right: Stock warnings */}
              <View style={styles.splitPane}>
                <Text style={styles.sectionLabel}>VARASTOSALDO</Text>
                <ScrollView contentContainerStyle={styles.paneContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  {stockWarnings.length === 0 ? (
                    <Text style={styles.emptyText}>Ei hälytyksiä.</Text>
                  ) : (
                    stockWarnings.map((w) => (
                      <View key={w.productId} style={styles.warnRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.warnProduct} numberOfLines={1}>{w.productName}</Text>
                          <Text style={styles.warnDetail}>
                            {`${w.currentKg.toFixed(1)} / ${w.thresholdKg} kg`}
                          </Text>
                        </View>
                        <View style={[styles.daysBadge, { backgroundColor: 'rgba(217,119,6,0.22)' }]}>
                          <Text style={[styles.daysBadgeText, { color: colors.warning }]}>
                            {`${Math.round((w.currentKg / w.thresholdKg) * 100)}%`}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.list}
            >
              <Text style={styles.sectionLabel}>HÄLYTYSRAJA (KG)</Text>
              <Text style={styles.hintText}>
                Aseta tuotekohtainen alaraja. Hälytys, kun varasto alittaa rajan.
              </Text>
              {products.map((p) => (
                <View key={p.id} style={styles.threshRow}>
                  <Text numberOfLines={1} style={[styles.threshName, { flex: 1 }]}>
                    {p.name}
                  </Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onBlur={() => saveThreshold(p.id, inputValues[String(p.id)] ?? '')}
                    onChangeText={(v) => {
                      setInputValues((prev) => ({ ...prev, [String(p.id)]: v }));
                      saveThreshold(p.id, v);
                    }}
                    onSubmitEditing={() => saveThreshold(p.id, inputValues[String(p.id)] ?? '')}
                    placeholder="—"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    returnKeyType="done"
                    style={styles.threshInput}
                    value={inputValues[String(p.id)] ?? ''}
                  />
                  <Text style={styles.threshUnit}>kg</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </GlassCard>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '2%',
    bottom: spacing.lg,
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    opacity: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 32,
    color: colors.white,
    ...Platform.select({
      web: { textShadow: '0px 1px 4px rgba(0,0,0,0.38)' } as object,
      default: { textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 1 },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  tabTextActive: {
    color: colors.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1.3,
    marginBottom: spacing.md,
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  warnProduct: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
    color: '#E4E4E4',
  },
  warnDetail: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  daysBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  daysBadgeText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
  },
  hintText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: spacing.md,
  },
  threshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  threshName: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: '#E4E4E4',
  },
  threshInput: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15,
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    minWidth: 64,
    textAlign: 'right',
  },
  threshUnit: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    width: 20,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: spacing.xl,
  },
  splitPane: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  splitDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.xs,
  },
  daysBadgeSub: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginTop: -2,
  },
  paneContent: {
    paddingBottom: spacing.md,
  },
});

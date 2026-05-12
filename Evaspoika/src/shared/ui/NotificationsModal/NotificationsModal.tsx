import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Batch } from '@/src/features/batches/domain/types';
import { Product } from '@/src/features/products/domain/types';
import { colors } from '@/src/shared/constants/colors';
import { components } from '@/src/shared/styles/components';
import { notificationsModalStyles as styles } from '@/src/shared/styles/notificationsModal';
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
                <ScrollView contentContainerStyle={styles.paneContent} showsVerticalScrollIndicator={false} style={components.flex1}>
                  {expiryWarnings.length === 0 ? (
                    <Text style={styles.emptyText}>Ei hälytyksiä.</Text>
                  ) : (
                    expiryWarnings.map((w) => (
                      <View key={w.key} style={styles.warnRow}>
                        <View style={components.flex1}>
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
                                  ? colors.danger
                                  : w.daysLeft <= 60
                                  ? colors.danger50pv
                                  : colors.danger100pv,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.daysBadgeText,
                              {
                                
                                color:
                                  w.daysLeft <= 1 ? colors.white : colors.warning,
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
                <ScrollView contentContainerStyle={styles.paneContent} showsVerticalScrollIndicator={false} style={components.flex1}>
                  {stockWarnings.length === 0 ? (
                    <Text style={styles.emptyText}>Ei hälytyksiä.</Text>
                  ) : (
                    stockWarnings.map((w) => (
                      <View key={w.productId} style={styles.warnRow}>
                        <View style={components.flex1}>
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

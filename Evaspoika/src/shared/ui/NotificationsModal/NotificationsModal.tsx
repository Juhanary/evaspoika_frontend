import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product } from '@/src/features/products/domain/types';
import { colors } from '@/src/shared/constants/colors';
import { components } from '@/src/shared/styles/components';
import { notificationsModalStyles as styles } from '@/src/shared/styles/notificationsModal';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import { type CombinedWarning } from '@/src/shared/hooks/useNotificationWarnings';

type Props = {
  visible: boolean;
  onClose: () => void;
  warnings: CombinedWarning[];
  totalCount: number;
  markRead: (id: string) => void;
  products: Product[];
  thresholds?: Record<string, number>;
  inputValues: Record<string, string>;
  setInputValues: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  saveThreshold: (productId: number, raw: string) => void;
};

export function NotificationsModal({
  visible,
  onClose,
  warnings,
  totalCount,
  markRead,
  products,
  inputValues,
  setInputValues,
  saveThreshold,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<'warnings' | 'thresholds'>('warnings');

  const hasUnread = warnings.some((w) => w.isNew);

  const handlePress = (w: CombinedWarning) => {
    markRead(w.id);
    onClose();
    router.push(w.route);
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <GlassCard blurRadius={24} style={[styles.card, { top: insets.top + 90, bottom: insets.bottom + 35 }]}>
          <View style={styles.header}>
            <Ionicons
              color={hasUnread ? colors.warning : colors.white}
              name={hasUnread ? 'notifications' : 'notifications-outline'}
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
                {`Hälytykset${totalCount > 0 ? ` (${totalCount})` : ''}`}
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
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            >
              {warnings.length === 0 ? (
                <Text style={[styles.emptyText, { marginTop: 32 }]}>Ei hälytyksiä.</Text>
              ) : (
                warnings.map((w) => (
                  <Pressable
                    key={w.id}
                    onPress={() => handlePress(w)}
                    style={({ pressed }) => [
                      styles.warnRow,
                      w.isNew && styles.warnRowNew,
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    {w.isNew && <View style={styles.newDot} />}
                    <View style={[
                      styles.warnIconWrap,
                      w.kind === 'expiry' && (w.daysLeft ?? 1) <= 0
                        ? { backgroundColor: 'rgba(220,38,38,0.22)' }
                        : undefined,
                    ]}>
                      <Ionicons
                        color={
                          w.kind === 'expiry' && (w.daysLeft ?? 1) <= 0
                            ? colors.dangerMid
                            : colors.warning
                        }
                        name={w.kind === 'expiry' ? 'time-outline' : 'cube-outline'}
                        size={22}
                      />
                    </View>
                    <View style={components.flex1}>
                      {w.dateLabel ? (
                        <Text style={styles.warnDate}>{w.dateLabel}</Text>
                      ) : null}
                      <Text numberOfLines={1} style={[styles.warnProduct, w.isNew && styles.warnProductNew]}>
                        {w.productName}
                      </Text>
                      <Text style={styles.warnType}>{w.detail}</Text>
                    </View>
                    <Ionicons color="rgba(255,255,255,0.25)" name="chevron-forward" size={16} />
                  </Pressable>
                ))
              )}
            </ScrollView>
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

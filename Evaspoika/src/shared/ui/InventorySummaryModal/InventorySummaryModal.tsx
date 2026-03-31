import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import {
  getInventoryBarColor,
  type InventorySummaryItem,
} from '@/src/shared/utils/inventory';
import { formatKg } from '@/src/shared/utils/weight';

type Props = {
  visible: boolean;
  onClose: () => void;
  items: InventorySummaryItem[];
};

export function InventorySummaryModal({ visible, onClose, items }: Props) {
  const maxWeight = useMemo(
    () => Math.max(...items.map((item) => item.weight), 1),
    [items],
  );

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={StyleSheet.absoluteFill}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <GlassCard blurRadius={24} style={styles.card}>
          <View style={styles.header}>
            <Ionicons color={colors.white} name="server-outline" size={26} />
            <Text style={styles.title}>VARASTO SALDO</Text>
            <Pressable hitSlop={12} onPress={onClose}>
              <Ionicons color={colors.white} name="close" size={26} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.columnHeader}>
            <Text style={styles.columnHeaderText}>Paino / Laatikoita</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {items.length === 0 ? (
              <Text style={styles.emptyText}>Ei varastosaldoa.</Text>
            ) : (
              items.map((item) => {
                const percentage = item.weight / maxWeight;

                return (
                  <View key={item.id} style={styles.row}>
                    <Text numberOfLines={1} style={styles.rowName}>
                      {item.name}
                    </Text>

                    <View style={styles.rowBottom}>
                      <View style={styles.barWrap}>
                        <View style={styles.barBg} />
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${Math.round(percentage * 100)}%`,
                              backgroundColor: getInventoryBarColor(percentage),
                            },
                          ]}
                        />
                        <View style={[styles.tick, styles.tickLow]} />
                        <View style={[styles.tick, styles.tickMid]} />
                      </View>
                      <Text style={styles.rowWeight}>{formatKg(item.weight)}kg</Text>
                      <Text style={styles.rowCount}>{item.count}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </GlassCard>
      </View>
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
    top: '18%',
    bottom: spacing.lg,
    padding: 0,
    borderRadius: 32,
    overflow: 'hidden',
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
    textShadowColor: 'rgba(0,0,0,0.38)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  columnHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xs,
  },
  columnHeaderText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    color: '#E4E4E4',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  row: {
    gap: 6,
    paddingVertical: 10,
  },
  rowName: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 20,
    color: '#E4E4E4',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barWrap: {
    flex: 1,
    height: 19,
    borderRadius: 23,
    overflow: 'hidden',
  },
  barBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91,91,91,0.64)',
    borderRadius: 23,
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 23,
  },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#868686',
  },
  tickLow: {
    left: '33%',
  },
  tickMid: {
    left: '66%',
  },
  rowWeight: {
    minWidth: 52,
    textAlign: 'right',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: '#E4E4E4',
  },
  rowCount: {
    minWidth: 20,
    textAlign: 'right',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: '#E4E4E4',
  },
});

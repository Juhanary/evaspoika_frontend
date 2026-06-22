import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { inventorySummaryModalStyles as styles } from '@/src/shared/styles/inventorySummaryModal';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import {
  getInventoryBarColor,
  type InventorySummaryItem,
} from '@/src/shared/utils/inventory';
import { formatKg } from '@/src/shared/utils/weight';
import { components } from '../../styles/components';

const ORDER_KEY = '@evaspoika_inventory_order';
const ITEM_HEIGHT = 92;

type Props = {
  visible: boolean;
  onClose: () => void;
  items: InventorySummaryItem[];
};

type RowProps = {
  item: InventorySummaryItem;
  index: number;
  maxWeight: number;
  isDragging: boolean;
  dropAbove: boolean;
  dropBelow: boolean;
  onDragStart: (index: number) => void;
  onDragUpdate: (translationY: number) => void;
  onDragEnd: () => void;
};

const Row = React.memo(function Row({
  item, index, maxWeight, isDragging, dropAbove, dropBelow,
  onDragStart, onDragUpdate, onDragEnd,
}: RowProps) {
  const percentage = item.weight / maxWeight;

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(250)
        .onBegin(() => { runOnJS(onDragStart)(index); })
        .onUpdate((e) => { runOnJS(onDragUpdate)(e.translationY); })
        .onFinalize(() => { runOnJS(onDragEnd)(); }),
    [index, onDragStart, onDragUpdate, onDragEnd],
  );

  return (
    <View>
      {dropAbove && <View style={styles.dropLine} />}
      <View style={[styles.row, isDragging && styles.rowDragging]}>
        <View style={styles.rowTop}>
          <GestureDetector gesture={gesture}>
            <View style={styles.dragHandle}>
              <Ionicons
                color={isDragging ? colors.danger : colors.white}
                name="reorder-three"
                size={26}
              />
            </View>
          </GestureDetector>
          <Text numberOfLines={1} style={[styles.rowName, { flex: 1 }]}>
            {item.name}
          </Text>
        </View>

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
          <View style={components.invPillRight}>
            <Text style={components.invPillWeight}>{formatKg(item.weight)} kg</Text>
            <View style={components.invPillDivider} />
            <Text style={components.invPillCount}>{item.count}</Text>
          </View>
        </View>
      </View>
      {dropBelow && <View style={styles.dropLine} />}
    </View>
  );
});

export function InventorySummaryModal({ visible, onClose, items }: Props) {
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<number[]>([]);
  const [orderLoaded, setOrderLoaded] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragTo, setDragTo] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ORDER_KEY).then((raw) => {
      if (raw) {
        try { setOrder(JSON.parse(raw)); } catch {}
      }
      setOrderLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!orderLoaded || items.length === 0) return;
    const incomingIds = items.map((i) => i.id);
    setOrder((prev) => {
      const kept = prev.filter((id) => incomingIds.includes(id));
      const appended = incomingIds.filter((id) => !kept.includes(id));
      const next = [...kept, ...appended];
      AsyncStorage.setItem(ORDER_KEY, JSON.stringify(next));
      return next;
    });
  }, [items, orderLoaded]);

  const sortedItems = useMemo(() => {
    if (order.length === 0) return items;
    return [...items].sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi);
    });
  }, [items, order]);

  const maxWeight = useMemo(
    () => Math.max(...sortedItems.map((item) => item.weight), 1),
    [sortedItems],
  );

  const onDragStart = useCallback((index: number) => {
    setDragFrom(index);
    setDragTo(index);
  }, []);

  const onDragUpdate = useCallback((translationY: number) => {
    setDragFrom((from) => {
      if (from === null) return from;
      const steps = Math.round(translationY / ITEM_HEIGHT);
      const total = sortedItems.length;
      setDragTo(Math.max(0, Math.min(total - 1, from + steps)));
      return from;
    });
  }, [sortedItems.length]);

  const onDragEnd = useCallback(() => {
    setDragFrom((from) => {
      setDragTo((to) => {
        if (from !== null && to !== null && from !== to) {
          const newItems = [...sortedItems];
          const [removed] = newItems.splice(from, 1);
          newItems.splice(to, 0, removed);
          const newOrder = newItems.map((i) => i.id);
          setOrder(newOrder);
          AsyncStorage.setItem(ORDER_KEY, JSON.stringify(newOrder));
        }
        return null;
      });
      return null;
    });
  }, [sortedItems]);

  return (
    <AppModal animationType="fade" onClose={onClose} useGestureHandler visible={visible}>
        <GlassCard blurRadius={24} style={[styles.card, { top: insets.top + 90, bottom: insets.bottom + 40 }]}>
          <View style={styles.header}>
            <Ionicons color={colors.white} name="server-outline" size={26} />
            <Text style={styles.title}>VARASTOSALDO</Text>
            <Pressable hitSlop={12} onPress={onClose}>
              <Ionicons color={colors.white} name="close" size={26} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.columnHeader}>
            <Text style={styles.columnHeaderText}>Paino / Laatikoita</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          >
            {sortedItems.length === 0 ? (
              <Text style={styles.emptyText}>Ei varastosaldoa.</Text>
            ) : (
              sortedItems.map((item, index) => (
                <Row
                  key={item.id}
                  dropAbove={dragTo === index && dragFrom !== null && dragTo < dragFrom}
                  dropBelow={dragTo === index && dragFrom !== null && dragTo > dragFrom}
                  index={index}
                  isDragging={dragFrom === index}
                  item={item}
                  maxWeight={maxWeight}
                  onDragEnd={onDragEnd}
                  onDragStart={onDragStart}
                  onDragUpdate={onDragUpdate}
                />
              ))
            )}
          </ScrollView>
        </GlassCard>
    </AppModal>
  );
}

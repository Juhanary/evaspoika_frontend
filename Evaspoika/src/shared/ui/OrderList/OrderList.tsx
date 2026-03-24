import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { layout } from '@/src/shared/styles/layout';
import { spacing } from '@/src/shared/constants/spacing';

export type OrderListItem = {
  id: number;
  order_date?: string | null;
  status?: string | null;
  customer_id?: number | null;
  netvisor_status?: string | null;
};

type Props = {
  orders?: OrderListItem[] | null;
  isLoading: boolean;
  error?: unknown;
  title?: string;
  emptyText?: string;
  onSelect?: (order: OrderListItem) => void;
  getTitle?: (order: OrderListItem) => string;
  getSubtitle?: (order: OrderListItem) => string;
};

const defaultTitle = (order: OrderListItem) =>
  order.order_date
    ? new Date(order.order_date).toLocaleDateString('fi-FI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : `Tilaus #${order.id}`;

const defaultSubtitle = (order: OrderListItem) => {
  const parts: string[] = [`#${order.id}`];
  if (order.status) parts.push(order.status);
  parts.push(
    order.netvisor_status?.trim()
      ? `Netvisor: ${order.netvisor_status}`
      : 'Odottaa laskutusta'
  );
  return parts.join(' · ');
};

export function OrderList({
  orders,
  isLoading,
  error,
  title,
  emptyText,
  onSelect,
  getTitle = defaultTitle,
  getSubtitle = defaultSubtitle,
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        {title ? <Text style={layout.title}>{title}</Text> : null}
        <Text>Ladataan tilauksia...</Text>
      </View>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <View style={styles.container}>
        {title ? <Text style={layout.title}>{title}</Text> : null}
        <Text>Tilausten lataus epäonnistui: {message}</Text>
      </View>
    );
  }

  const items = orders ?? [];

  const renderItem = (item: OrderListItem) => {
    if (onSelect) {
      return (
        <Pressable
          key={item.id}
          onPress={() => onSelect(item)}
          style={({ pressed }) => [layout.listItem, pressed && layout.listItemPressed]}
          accessibilityRole="button"
        >
          <Text style={layout.listItemTitle}>{getTitle(item)}</Text>
          <Text style={layout.listItemSubtitle}>{getSubtitle(item)}</Text>
        </Pressable>
      );
    }

    return (
      <View key={item.id} style={layout.listItem}>
        <Text style={layout.listItemTitle}>{getTitle(item)}</Text>
        <Text style={layout.listItemSubtitle}>{getSubtitle(item)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {title ? <Text style={layout.title}>{title}</Text> : null}
      {items.length === 0
        ? emptyText
          ? <Text style={styles.emptyText}>{emptyText}</Text>
          : null
        : items.map(renderItem)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
});

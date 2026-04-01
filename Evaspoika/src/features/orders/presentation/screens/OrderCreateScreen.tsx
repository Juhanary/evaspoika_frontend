import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCustomers } from '@/src/features/customers/presentation/hooks/useCustomers';
import { createOrder } from '@/src/features/orders/infrastructure/ordersApi';
import { Customer } from '@/src/features/customers/domain/types';
import { spacing } from '@/src/shared/constants/spacing';
import { routes } from '@/src/shared/navigation/routes';
import { screen } from '@/src/shared/styles/screen';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';

const sortCustomers = (left: Customer, right: Customer) =>
  left.name.localeCompare(right.name, 'fi', { sensitivity: 'base' });

const getCustomerSubtitle = (customer: Customer) => {
  if (customer.email) {
    return customer.email;
  }

  if (customer.netvisor_code) {
    return `Netvisor ${customer.netvisor_code}`;
  }

  return 'Ei lisätietoja';
};

export default function OrderCreateScreen() {
  const queryClient = useQueryClient();
  const { data: customers, isLoading, error } = useCustomers();
  const [query, setQuery] = useState('');
  const [pendingCustomerId, setPendingCustomerId] = useState<number>();

  const customerRows = useMemo(
    () => [...(customers ?? [])].filter((customer) => !customer.deleted_at).sort(sortCustomers),
    [customers],
  );

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return customerRows;
    }

    return customerRows.filter((customer) =>
      [customer.name, customer.email, customer.netvisor_code, String(customer.id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [customerRows, query]);

  const createMutation = useMutation({
    mutationFn: (customerId: number) => createOrder({ customer_id: customerId }),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      if (typeof order?.id === 'number') {
        router.replace(routes.orderDetail(order.id));
        return;
      }

      router.replace(routes.orders);
    },
    onSettled: () => {
      setPendingCustomerId(undefined);
    },
  });

  const handleCreateOrder = async (customerId: number) => {
    if (createMutation.isPending) {
      return;
    }

    try {
      setPendingCustomerId(customerId);
      await createMutation.mutateAsync(customerId);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'Tuntematon virhe';

      Alert.alert('Tilauksen luonti ep\u00E4onnistui', message);
    }
  };

  return (
    <ScreenLayout
      headerSearch={{
        value: query,
        onChangeText: setQuery,
        placeholder: 'Hae asiakasta...',
      }}
      leftAction="back"
      title="UUSI TILAUS"
    >
      <View style={screen.inner}>
        <Text style={screen.sectionTitle}>VALITSE ASIAKAS</Text>
        <View style={screen.divider} />

        <Text style={screen.muted}>Asiakkaan valinta luo uuden tilauksen suoraan.</Text>

        {isLoading ? (
          <Text style={screen.muted}>Ladataan asiakkaita...</Text>
        ) : error ? (
          <Text style={screen.muted}>Asiakkaita ei voitu ladata.</Text>
        ) : (
          <FlatList
            data={filteredCustomers}
            keyExtractor={(customer) => String(customer.id)}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            ListEmptyComponent={
              <Text style={screen.muted}>Ei hakua vastaavia asiakkaita.</Text>
            }
            ItemSeparatorComponent={() => <View style={screen.rowDivider} />}
            renderItem={({ item }) => {
              const isPendingRow = item.id === pendingCustomerId;

              return (
                <Pressable
                  disabled={createMutation.isPending}
                  onPress={() => handleCreateOrder(item.id)}
                  style={({ pressed }) => [
                    screen.listRow,
                    styles.customerRow,
                    isPendingRow && styles.customerRowSelected,
                    pressed && screen.pressed,
                  ]}
                >
                  <View style={screen.listRowContent}>
                    <Text numberOfLines={1} style={screen.listRowName}>
                      {item.name}
                    </Text>
                    <Text numberOfLines={1} style={screen.listRowSummary}>
                      {getCustomerSubtitle(item)}
                    </Text>
                  </View>
                  <View style={screen.listRowMeta}>
                    <Text style={[screen.listRowMetaPrimary, isPendingRow && styles.selectedText]}>
                      {isPendingRow ? 'Luodaan...' : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  customerRow: {
    borderRadius: 24,
    paddingHorizontal: spacing.md,
  },
  customerRowSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  selectedText: {
    color: '#A7F3D0',
  },
});

import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { CustomerOrder } from '@/src/features/customers/domain/types';
import { useCustomerOrderHistory } from '@/src/features/customers/presentation/hooks/useCustomers';
import { useTraceCustomers } from '@/src/features/trace/presentation/hooks/useTrace';
import { screen } from '@/src/shared/styles/components';
import { logModalStyles as modalStyles, logStyles as styles } from '@/src/shared/styles/logs';
import { GlassModal, ModalRow } from '@/src/shared/ui/GlassModal/GlassModal';
import { formatDateFi } from '@/src/shared/utils/date';
import { formatKgLabel } from '@/src/shared/utils/weight';
import type { BatchModalTarget } from './batchEventLog';

// Asiakasnäkymä lukee valmiin ketjun backendiltä: asiakaslista /trace/customers
// ja tilaushistoria GET /customers/:id/orders. Aiemmin näkymä kokosi hierarkian
// tabletissa avointen tilausten, suljettujen tilausten, asiakkaiden ja
// erätapahtumien listoista — ja koska osa niistä rajasi laskutetut tai poistetut
// rivit pois, historiaan jäi reikiä.

// Tilauksen otsikko on aina päivämäärä. Aiemmin otsikoksi tuli "Tilaus 43" aina
// kun order_date puuttui — sisäinen tunnus ei kerro käyttäjälle mitään, eikä
// tilauksia voinut asettaa aikajärjestykseen silmämääräisesti. Päiväys puuttui
// koska Netvisorin InvoiceDate luettiin väärin; backend täyttää sen nyt, ja
// tämä varateksti on vain sen varalta ettei päiväystä oikeasti ole olemassa.
const orderTitle = (order: CustomerOrder) =>
  formatDateFi(order.order_date) ?? 'Päiväämätön tilaus';

// Tunniste kuuluu riville, mutta pienellä: Netvisorin laskunumerolla tilaus
// löytyy kirjanpidosta, sovelluksen oma id ei auta ketään.
const orderStatus = (order: CustomerOrder) => {
  const status = order.netvisor_status ?? order.status ?? null;
  const parts = [
    status,
    order.netvisor_invoice_id ? `lasku ${order.netvisor_invoice_id}` : null,
    order.deleted_at ? 'poistettu' : null,
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : null;
};

const orderLines = (order: CustomerOrder) => order.OrderLines ?? [];

const activeLines = (order: CustomerOrder) =>
  orderLines(order).filter((line) => !line.deleted_at);

const orderWeight = (order: CustomerOrder) =>
  activeLines(order).reduce((sum, line) => sum + (Number(line.sold_weight) || 0), 0);

export function CustomerTraceTab({
  search,
  onOpenBatch,
}: {
  search: string;
  onOpenBatch: (target: BatchModalTarget) => void;
}) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  // Haku menee palvelimelle. Aiemmin hakusana suodatti erätapahtumia, jotka
  // eivät sisältäneet asiakkaan nimeä lainkaan, joten tulos oli aina tyhjä.
  const { data: customers, isLoading, error } = useTraceCustomers(search);

  const rows = customers ?? [];

  return (
    <>
      <Text style={styles.resultSummary}>{rows.length} asiakasta</Text>

      {error ? (
        <Text style={screen.muted}>Virhe ladattaessa asiakkaita.</Text>
      ) : (
        <FlatList
          contentContainerStyle={!rows.length ? styles.emptyListContent : undefined}
          data={rows}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={screen.muted}>
              {isLoading
                ? 'Ladataan...'
                : search.trim()
                  ? 'Hakua vastaavia asiakkaita ei löytynyt.'
                  : 'Ei asiakkaita joilla on tilaushistoriaa.'}
            </Text>
          }
          renderItem={({ item, index }) => {
            const lastOrder = formatDateFi(item.last_order_date);

            return (
              <Pressable
                onPress={() => {
                  setSelectedCustomerId(item.id);
                  setSelectedCustomerName(item.name);
                }}
                style={({ pressed }) => [
                  styles.logItem,
                  index === rows.length - 1 && styles.logItemLast,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.logItemContent}>
                  <Text numberOfLines={1} style={styles.logItemTitle}>
                    {item.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.logItemSummary}>
                    {item.order_count} tilaus{item.order_count !== 1 ? 'ta' : ''}
                    {lastOrder ? `  ·  viimeisin ${lastOrder}` : ''}
                  </Text>
                </View>
              </Pressable>
            );
          }}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}

      <CustomerOrdersModal
        customerId={selectedCustomerId}
        customerName={selectedCustomerName}
        onClose={() => setSelectedCustomerId(null)}
        onOpenBatch={onOpenBatch}
      />
    </>
  );
}

function CustomerOrdersModal({
  customerId,
  customerName,
  onClose,
  onOpenBatch,
}: {
  customerId: number | null;
  customerName: string;
  onClose: () => void;
  onOpenBatch: (target: BatchModalTarget) => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const { data, isLoading } = useCustomerOrderHistory(customerId ?? undefined);

  // allOrders sisältää avoimet, laskutetut ja poistetut samassa aikajärjestyksessä.
  const orders = data?.allOrders ?? [];

  const handleClose = () => {
    setSelectedOrder(null);
    onClose();
  };

  return (
    <>
      <GlassModal
        icon="person-outline"
        onClose={handleClose}
        subtitle={
          data
            ? `${data.counts.total} tilausta · ${data.counts.past} laskutettu · ${data.counts.open} avoinna`
            : undefined
        }
        title={data?.customer.name ?? customerName}
        visible={customerId !== null}
      >
        <FlatList
          contentContainerStyle={modalStyles.listContent}
          data={orders}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={modalStyles.emptyText}>
              {isLoading ? 'Ladataan...' : 'Ei tilauksia.'}
            </Text>
          }
          renderItem={({ item }) => (
            <ModalRow
              deleted={Boolean(item.deleted_at)}
              meta={`${activeLines(item).length} riviä  ·  ${formatKgLabel(orderWeight(item))}`}
              onPress={() => setSelectedOrder(item)}
              subtitle={orderStatus(item)}
              title={orderTitle(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          style={modalStyles.list}
        />
      </GlassModal>

      <OrderLinesModal
        onClose={() => setSelectedOrder(null)}
        onOpenBatch={onOpenBatch}
        order={selectedOrder}
      />
    </>
  );
}

// Tilausrivit tulevat jo ladatusta historiasta — erillistä kyselyä ei tarvita,
// ja rivillä näkyy nyt myös laatikon EAN.
function OrderLinesModal({
  order,
  onClose,
  onOpenBatch,
}: {
  order: CustomerOrder | null;
  onClose: () => void;
  onOpenBatch: (target: BatchModalTarget) => void;
}) {
  return (
    <GlassModal
      icon="document-outline"
      onClose={onClose}
      subtitle={order ? orderStatus(order) : undefined}
      title={order ? orderTitle(order) : ''}
      visible={order !== null}
    >
      <FlatList
        contentContainerStyle={modalStyles.listContent}
        data={order ? orderLines(order) : []}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={modalStyles.emptyText}>Ei tilausrivejä.</Text>}
        renderItem={({ item }) => {
          const batch = item.Batch;
          const meta = [
            formatKgLabel(item.sold_weight),
            item.Box?.ean ? `EAN ${item.Box.ean}` : null,
            item.deleted_at ? 'palautettu' : null,
          ]
            .filter(Boolean)
            .join('  ·  ');

          return (
            <ModalRow
              deleted={Boolean(item.deleted_at)}
              meta={meta}
              onPress={
                batch
                  ? () =>
                      onOpenBatch({
                        batchId: batch.id,
                        batchLabel: batch.batch_number ? `Erä ${batch.batch_number}` : undefined,
                        productName: batch.Product?.name,
                        currentWeight: batch.current_weight,
                        deletedAt: batch.deleted_at,
                      })
                  : undefined
              }
              subtitle={batch?.batch_number ? `Erä ${batch.batch_number}` : null}
              title={batch?.Product?.name ?? 'Tuntematon tuote'}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        style={modalStyles.list}
      />
    </GlassModal>
  );
}

// /more/logs?customerId= avaa yhden asiakkaan tilaukset suoraan ilman listaa.
export function CustomerOrdersPanel({
  customerId,
  onOpenBatch,
}: {
  customerId: number;
  onOpenBatch: (target: BatchModalTarget) => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const { data, isLoading, error } = useCustomerOrderHistory(customerId);

  const orders = useMemo(() => data?.allOrders ?? [], [data]);

  return (
    <>
      <Text style={styles.resultSummary}>
        {data?.customer.name ? `${data.customer.name} · ` : ''}
        {orders.length} tilaus{orders.length !== 1 ? 'ta' : ''}
      </Text>

      {error ? (
        <Text style={screen.muted}>Virhe ladattaessa asiakkaan tilauksia.</Text>
      ) : (
        <FlatList
          contentContainerStyle={!orders.length ? styles.emptyListContent : undefined}
          data={orders}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={screen.muted}>{isLoading ? 'Ladataan...' : 'Ei tilauksia.'}</Text>
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setSelectedOrder(item)}
              style={({ pressed }) => [
                styles.logItem,
                Boolean(item.deleted_at) && styles.logItemDeleted,
                index === orders.length - 1 && styles.logItemLast,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.logItemContent}>
                <Text numberOfLines={1} style={styles.logItemTitle}>
                  {orderTitle(item)}
                </Text>
                <Text numberOfLines={1} style={styles.logItemSummary}>
                  {[orderStatus(item), formatKgLabel(orderWeight(item))]
                    .filter(Boolean)
                    .join('  ·  ')}
                </Text>
                <View style={styles.logItemFooter}>
                  <Text style={styles.logItemDescription}>{activeLines(item).length} riviä</Text>
                </View>
              </View>
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}

      <OrderLinesModal
        onClose={() => setSelectedOrder(null)}
        onOpenBatch={onOpenBatch}
        order={selectedOrder}
      />
    </>
  );
}

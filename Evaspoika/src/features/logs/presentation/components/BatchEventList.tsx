import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { BatchLog } from '@/src/features/batchEvents/domain/types';
import { EVENT_HIGHLIGHT, eventLabel } from '@/src/features/batchEvents/domain/eventLabels';
import { logModalStyles as modalStyles } from '@/src/shared/styles/logs';
import { formatDateFi, formatTimeFi } from '@/src/shared/utils/date';
import { formatKgLabel } from '@/src/shared/utils/weight';
import {
  BATCH_EVENT_TABS,
  type BatchEventLog,
  type BatchEventTab,
  matchesBatchEventTab,
} from './batchEventLog';

// Erän tapahtumalista välilehtineen. Käytetään sekä lokin modaalissa että
// /inventory/batch/:id -näytöllä, jotta samoja tapahtumia ei enää esitetä
// kahdella eri tavalla kahdessa eri näkymässä.

const formatWeightChange = (grams: number) => {
  if (!Number.isFinite(grams)) return '0 kg';
  return `${grams > 0 ? '+' : ''}${formatKgLabel(grams)}`;
};

// Tilausviite luetaan tapahtuman omasta payloadista (OrderLine → Order →
// Customer). Aiemmin se haettiin erillisestä avointen tilausten listasta,
// jolloin laskutetun tilauksen riviltä katosivat sekä päiväys että asiakas.
const orderReference = (event: BatchLog) => {
  const order = event.OrderLine?.Order;
  if (!order) return null;

  const parts = [formatDateFi(order.order_date), order.Customer?.name].filter(Boolean);
  return parts.length ? parts.join(' · ') : `Tilaus ${order.id}`;
};

export function BatchEventList({ log }: { log: BatchEventLog }) {
  const [activeTab, setActiveTab] = useState<BatchEventTab>('ALL');

  const visibleEvents = useMemo(
    () => log.events.filter((event) => matchesBatchEventTab(event, activeTab)),
    [activeTab, log.events],
  );

  const renderEvent = ({ item }: { item: BatchLog }) => {
    const highlight = EVENT_HIGHLIGHT[item.event_code];
    const dateLabel = formatDateFi(item.event_date) ?? '-';
    const timeLabel = formatTimeFi(item.event_date);
    const reference = orderReference(item);

    return (
      <View
        style={[
          modalStyles.eventItem,
          highlight === 'create' && modalStyles.eventItemCreate,
          highlight === 'empty' && modalStyles.eventItemEmpty,
          highlight === 'delete' && modalStyles.eventItemDelete,
          highlight === 'return' && modalStyles.eventItemReturn,
        ]}
      >
        <Text style={modalStyles.eventTitle}>{eventLabel(item.event_code)}</Text>
        {typeof item.total_weight === 'number' ? (
          <Text style={modalStyles.eventTotalWeight}>
            Kokonaispaino: {formatKgLabel(item.total_weight)}
          </Text>
        ) : null}
        {item.description ? (
          <Text style={modalStyles.eventSubtitle}>{item.description}</Text>
        ) : null}
        <Text style={modalStyles.eventSubtitle}>
          Päivämäärä: {dateLabel}
          {timeLabel ? ` klo ${timeLabel}` : ''}
        </Text>
        {reference ? <Text style={modalStyles.eventSubtitle}>{reference}</Text> : null}
        <Text style={modalStyles.eventSubtitle}>
          Muutos: {formatWeightChange(item.weight_change)}
        </Text>
      </View>
    );
  };

  return (
    <>
      <View style={modalStyles.metaRow}>
        <Text style={modalStyles.metaText}>
          Tapahtumia: {log.tabCounts[activeTab]} / {log.tabCounts.ALL}
        </Text>
        {log.isLoading ? <Text style={modalStyles.metaSubtle}>Ladataan...</Text> : null}
      </View>

      <View style={modalStyles.tabRow}>
        {BATCH_EVENT_TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={({ pressed }) => [
                modalStyles.tabButton,
                isActive && modalStyles.tabButtonActive,
                pressed && modalStyles.tabButtonPressed,
              ]}
            >
              <Text
                style={[modalStyles.tabButtonText, isActive && modalStyles.tabButtonTextActive]}
              >
                {tab.label} ({log.tabCounts[tab.key]})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        contentContainerStyle={modalStyles.listContent}
        data={visibleEvents}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={modalStyles.emptyText}>
            {log.isLoading ? 'Ladataan...' : 'Ei tapahtumia.'}
          </Text>
        }
        renderItem={renderEvent}
        showsVerticalScrollIndicator={false}
        style={modalStyles.list}
      />
    </>
  );
}

import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { BatchLog } from '@/src/features/batchEvents/domain/types';
import { EVENT_HIGHLIGHT, eventLabel } from '@/src/features/batchEvents/domain/eventLabels';
import { logModalStyles as modalStyles } from '@/src/shared/styles/logs';
import { formatDateFi, formatTimeFi } from '@/src/shared/utils/date';
import { formatKgLabel } from '@/src/shared/utils/weight';
import {
  BATCH_EVENT_TABS,
  buildEventDays,
  type BatchEventDay,
  type BatchEventLog,
  type BatchEventRow,
  type BatchEventTab,
  matchesBatchEventTab,
} from './batchEventLog';

// Erän tapahtumalista välilehtineen. Käytetään sekä lokin modaalissa että
// /inventory/batch/:id -näytöllä, jotta samoja tapahtumia ei enää esitetä
// kahdella eri tavalla kahdessa eri näkymässä.
//
// Rivi on yksi kompakti rivi eikä viisirivinen kortti: aika vasemmalla, mitä
// tapahtui keskellä, painon muutos oikealla. Päivämäärä on päiväotsikossa ja
// saman päivän punnitukset yhdessä nipussa, joten kymmenen laatikon erästä
// näkee yhdellä silmäyksellä mitä sille on tehty.

const formatWeightChange = (grams: number) => {
  if (!Number.isFinite(grams) || grams === 0) return formatKgLabel(0);
  return `${grams > 0 ? '+' : '−'}${formatKgLabel(Math.abs(grams))}`;
};

// Kuvaus joka vain toistaa tapahtuman otsikon on kohinaa. Muut kuvaukset
// kertovat jotain lisää ("synkronoitu Netvisorista", "tilaus poistettu"),
// joten ne näytetään.
const REDUNDANT_DESCRIPTIONS = new Set([
  'valmiin tuotteen punnitus',
  'luotiin uusi era, valmiin tuotteen punnitus',
  'luotiin uusi erä, valmiin tuotteen punnitus',
  'myyty tilaukselle',
  'myynti',
  'palautus',
]);

const eventDescription = (event: BatchLog) => {
  const description = event.description?.trim();
  if (!description) return null;
  return REDUNDANT_DESCRIPTIONS.has(description.toLowerCase()) ? null : description;
};

// Tilausviite luetaan tapahtuman omasta payloadista (OrderLine → Order →
// Customer). Aiemmin se haettiin erillisestä avointen tilausten listasta,
// jolloin laskutetun tilauksen riviltä katosivat sekä päiväys että asiakas.
const orderReference = (event: BatchLog) => {
  const order = event.OrderLine?.Order;
  if (!order) return null;

  const date = formatDateFi(order.order_date);
  const customer = order.Customer?.name;

  if (customer && date) return `${customer} · tilaus ${date}`;
  if (customer) return customer;
  if (date) return `Tilaus ${date}`;
  return null;
};

export function BatchEventList({ log }: { log: BatchEventLog }) {
  const [activeTab, setActiveTab] = useState<BatchEventTab>('ALL');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const days = useMemo(() => {
    const visible = log.events.filter((event) => matchesBatchEventTab(event, activeTab));
    // Punnitusvälilehdellä nippu olisi koko sisältö — siellä rivit erikseen.
    return buildEventDays(visible, activeTab !== 'WEIGHING');
  }, [activeTab, log.events]);

  // Yksi lista päiväotsikoista ja riveistä: FlatList pitää pitkänkin historian
  // sujuvana tabletilla, toisin kuin ScrollView johon renderöityisi kaikki.
  const items = useMemo(
    () =>
      days.flatMap((day) => [
        { type: 'day' as const, key: `day-${day.key}`, day },
        ...day.rows.map((row) => ({ type: 'row' as const, key: `${day.key}-${row.key}`, row })),
      ]),
    [days],
  );

  const toggleGroup = (key: string) =>
    setExpandedGroups((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );

  const handleTabChange = (tab: BatchEventTab) => {
    setActiveTab(tab);
    setExpandedGroups([]);
  };

  return (
    <>
      <BatchSummary log={log} />

      <View style={modalStyles.tabRow}>
        {BATCH_EVENT_TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabChange(tab.key)}
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
        data={items}
        keyExtractor={(item) => item.key}
        ListEmptyComponent={
          <Text style={modalStyles.emptyText}>
            {log.isLoading ? 'Ladataan...' : 'Ei tapahtumia.'}
          </Text>
        }
        renderItem={({ item }) =>
          item.type === 'day' ? (
            <DayHeader day={item.day} />
          ) : (
            <EventRow
              expanded={item.row.kind === 'weighings' && expandedGroups.includes(item.key)}
              onToggle={() => toggleGroup(item.key)}
              row={item.row}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        style={modalStyles.list}
      />
    </>
  );
}

// Erän luvut yhtenä rivinä: mitä punnittiin sisään, mitä myytiin ulos ja mitä
// on jäljellä. Nämä jouduttiin ennen laskemaan itse tapahtumista.
function BatchSummary({ log }: { log: BatchEventLog }) {
  const { summary } = log;

  const figures: { label: string; value: string }[] = [
    { label: 'Punnittu', value: formatKgLabel(summary.weighed) },
    { label: 'Laatikoita', value: String(summary.boxCount) },
    { label: 'Myyty', value: formatKgLabel(summary.sold) },
  ];

  if (summary.returned > 0) {
    figures.push({ label: 'Palautettu', value: formatKgLabel(summary.returned) });
  }
  if (summary.adjusted !== 0) {
    figures.push({ label: 'Korjaukset', value: formatWeightChange(summary.adjusted) });
  }

  figures.push({
    label: 'Jäljellä',
    value: summary.remaining === null ? '-' : formatKgLabel(summary.remaining),
  });

  return (
    <View style={modalStyles.summaryCard}>
      {figures.map((figure) => (
        <View key={figure.label} style={modalStyles.summaryItem}>
          <Text style={modalStyles.summaryValue}>{figure.value}</Text>
          <Text style={modalStyles.summaryLabel}>{figure.label}</Text>
        </View>
      ))}
    </View>
  );
}

function DayHeader({ day }: { day: BatchEventDay }) {
  return (
    <View style={modalStyles.dayHeader}>
      <Text style={modalStyles.dayHeaderText}>{day.label}</Text>
      <Text style={modalStyles.dayHeaderCount}>
        {day.eventCount === 1 ? '1 tapahtuma' : `${day.eventCount} tapahtumaa`}
      </Text>
    </View>
  );
}

function EventRow({
  row,
  expanded,
  onToggle,
}: {
  row: BatchEventRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (row.kind === 'weighings') {
    const start = formatTimeFi(row.startDate);
    const end = formatTimeFi(row.endDate);
    const timeLabel = start && end && start !== end ? `${start}–${end}` : (end ?? start ?? '');

    return (
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [modalStyles.eventRow, pressed && modalStyles.eventRowPressed]}
      >
        <View style={modalStyles.eventRowMain}>
          <Text style={modalStyles.eventTime}>{timeLabel}</Text>
          <View style={modalStyles.eventBody}>
            <Text style={modalStyles.eventTitle}>Punnitus × {row.events.length}</Text>
            <Text style={modalStyles.eventMeta}>
              {expanded ? 'Piilota punnitukset' : 'Näytä punnitukset'}
            </Text>
          </View>
          <Text style={[modalStyles.eventAmount, modalStyles.eventAmountPositive]}>
            {formatWeightChange(row.totalChange)}
          </Text>
        </View>

        {expanded ? (
          <View style={modalStyles.eventChildren}>
            {row.events.map((event) => (
              <View key={event.id} style={modalStyles.eventChildRow}>
                <Text style={modalStyles.eventTime}>{formatTimeFi(event.event_date) ?? ''}</Text>
                <Text style={modalStyles.eventChildText}>
                  {typeof event.total_weight === 'number'
                    ? `yhteensä ${formatKgLabel(event.total_weight)}`
                    : 'Punnitus'}
                </Text>
                <Text style={[modalStyles.eventAmount, modalStyles.eventAmountPositive]}>
                  {formatWeightChange(Number(event.weight_change) || 0)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
    );
  }

  const { event } = row;
  const change = Number(event.weight_change) || 0;
  const highlight = EVENT_HIGHLIGHT[event.event_code];
  const reference = orderReference(event);
  const description = eventDescription(event);

  const meta = [
    reference,
    description,
    typeof event.total_weight === 'number'
      ? `jäljellä ${formatKgLabel(event.total_weight)}`
      : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <View
      style={[
        modalStyles.eventRow,
        highlight === 'create' && modalStyles.eventRowCreate,
        highlight === 'empty' && modalStyles.eventRowEmpty,
        highlight === 'delete' && modalStyles.eventRowDelete,
        highlight === 'return' && modalStyles.eventRowReturn,
      ]}
    >
      <View style={modalStyles.eventRowMain}>
        <Text style={modalStyles.eventTime}>{formatTimeFi(event.event_date) ?? ''}</Text>
        <View style={modalStyles.eventBody}>
          <Text style={modalStyles.eventTitle}>{eventLabel(event.event_code)}</Text>
          {meta ? <Text style={modalStyles.eventMeta}>{meta}</Text> : null}
        </View>
        {change !== 0 ? (
          <Text
            style={[
              modalStyles.eventAmount,
              change > 0 ? modalStyles.eventAmountPositive : modalStyles.eventAmountNegative,
            ]}
          >
            {formatWeightChange(change)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

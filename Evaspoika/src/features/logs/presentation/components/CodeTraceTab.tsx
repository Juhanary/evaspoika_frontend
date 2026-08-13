import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { eventLabel } from '@/src/features/batchEvents/domain/eventLabels';
import {
  BATCH_STATE_LABELS,
  resolveBatchState,
} from '@/src/features/batches/domain/batchState';
import { CodeTrace, TraceDelivery } from '@/src/features/trace/domain/types';
import { useCodeTrace } from '@/src/features/trace/presentation/hooks/useTrace';
import { colors } from '@/src/shared/constants/colors';
import { logStyles as styles, traceStyles as trace } from '@/src/shared/styles/logs';
import { formatDateFi, formatTimeFi } from '@/src/shared/utils/date';
import { formatKgLabel } from '@/src/shared/utils/weight';
import type { BatchModalTarget } from './batchEventLog';

// Takaisinvetonäkymä: laatikon tarrasta tai eränumerosta koko ketju auki.
// Tämä on se kysymys josta reklamaatio käytännössä alkaa, eikä siihen ollut
// aiemmin mitään vastausta — ORDER_LINE.box_id oli paljas kokonaisluku eikä
// EAN-koodista päässyt tilaukseen.

const KeyValue = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;

  return (
    <View style={trace.kvRow}>
      <Text style={trace.kvLabel}>{label}</Text>
      <Text style={trace.kvValue}>{value}</Text>
    </View>
  );
};

const deliveryTitle = (delivery: TraceDelivery) =>
  delivery.customer?.name ?? (delivery.order ? `Tilaus ${delivery.order.id}` : 'Tuntematon');

export function CodeTraceTab({
  onOpenBatch,
}: {
  onOpenBatch: (target: BatchModalTarget) => void;
}) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading, error } = useCodeTrace(submitted);

  const canSearch = input.trim().length > 0;

  return (
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={trace.searchRow}>
        <TextInput
          autoCapitalize="characters"
          autoCorrect={false}
          onChangeText={setInput}
          onSubmitEditing={() => setSubmitted(input.trim())}
          placeholder="EAN tai eränumero"
          placeholderTextColor="rgba(255,255,255,0.42)"
          returnKeyType="search"
          style={trace.searchInput}
          value={input}
        />
        <Pressable
          disabled={!canSearch}
          onPress={() => setSubmitted(input.trim())}
          style={({ pressed }) => [
            trace.searchButton,
            !canSearch && trace.searchButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={trace.searchButtonText}>Hae</Text>
        </Pressable>
      </View>

      <Text style={trace.hint}>
        Lue laatikon viivakoodi tai syötä eränumero. Näet erän tapahtumat ja kaikki
        asiakkaat joille samaa erää on toimitettu.
      </Text>

      {isLoading ? <Text style={trace.emptyText}>Haetaan...</Text> : null}

      {error && !isLoading ? (
        <Text style={trace.emptyText}>Koodilla ei löydy laatikkoa eikä erää.</Text>
      ) : null}

      {data && !isLoading ? <CodeTraceResult onOpenBatch={onOpenBatch} trace={data} /> : null}
    </ScrollView>
  );
}

function CodeTraceResult({
  trace: result,
  onOpenBatch,
}: {
  trace: CodeTrace;
  onOpenBatch: (target: BatchModalTarget) => void;
}) {
  const batch = result.batch;
  const state = resolveBatchState({
    currentWeight: batch.current_weight,
    deletedAt: batch.deleted_at,
    hasDeleteEvent: result.events.some((event) => event.event_code === 'DELETE'),
  });

  const batchLabel = batch.batch_number ? `Erä ${batch.batch_number}` : 'Erä';
  const activeDeliveries = result.deliveries.filter((delivery) => !delivery.deleted_at);

  return (
    <>
      {result.matchedBy === 'ean' && result.box ? (
        <View style={trace.card}>
          <Text style={trace.cardTitle}>Laatikko</Text>
          <KeyValue label="EAN" value={result.box.ean} />
          <KeyValue label="Paino" value={formatKgLabel(result.box.weight)} />
          <KeyValue label="Jäljellä" value={formatKgLabel(result.box.remaining_weight)} />
          <KeyValue label="Tila" value={result.box.status} />
          <KeyValue label="Pakattu" value={formatDateFi(result.box.packed_at)} />
        </View>
      ) : null}

      <Pressable
        onPress={() =>
          onOpenBatch({
            batchId: batch.id,
            batchLabel,
            productName: batch.product?.name ?? 'Tuntematon tuote',
            currentWeight: batch.current_weight,
            deletedAt: batch.deleted_at,
          })
        }
        style={({ pressed }) => [trace.card, pressed && styles.pressed]}
      >
        <Text style={trace.cardTitle}>{batchLabel}</Text>
        <KeyValue label="Tuote" value={batch.product?.name} />
        <KeyValue label="Valmistettu" value={formatDateFi(batch.production_date)} />
        <KeyValue label="Parasta ennen" value={formatDateFi(batch.best_before)} />
        <KeyValue label="Alkupaino" value={formatKgLabel(batch.initial_weight)} />
        <KeyValue label="Jäljellä" value={formatKgLabel(batch.current_weight)} />
        <KeyValue label="Tila" value={BATCH_STATE_LABELS[state]} />
        <KeyValue label="Laatikoita erässä" value={String(result.boxes.length)} />
        <Text style={[trace.kvLabel, { marginTop: 8, color: colors.lightGray }]}>
          Avaa erän koko tapahtumaloki →
        </Text>
      </Pressable>

      <Text style={trace.sectionTitle}>
        TOIMITUKSET ({activeDeliveries.length}
        {result.deliveries.length !== activeDeliveries.length
          ? ` / ${result.deliveries.length}`
          : ''}
        )
      </Text>

      {result.deliveries.length === 0 ? (
        <Text style={trace.emptyText}>Erästä ei ole toimitettu asiakkaille.</Text>
      ) : (
        result.deliveries.map((delivery) => (
          <View
            key={delivery.order_line_id}
            style={[
              trace.card,
              delivery.is_queried_box && trace.deliveryHighlight,
              Boolean(delivery.deleted_at) && trace.deliveryReturned,
            ]}
          >
            <Text style={trace.cardTitle}>{deliveryTitle(delivery)}</Text>
            <KeyValue label="Tilauspäivä" value={formatDateFi(delivery.order?.order_date)} />
            <KeyValue label="Määrä" value={formatKgLabel(delivery.sold_weight)} />
            <KeyValue label="Laatikon EAN" value={delivery.box?.ean} />
            <KeyValue
              label="Tila"
              value={delivery.order?.netvisor_status ?? delivery.order?.status}
            />
            <KeyValue label="Lasku" value={delivery.order?.netvisor_invoice_id} />
            {delivery.is_queried_box ? (
              <KeyValue label="Osuma" value="Tämä on haettu laatikko" />
            ) : null}
            {delivery.deleted_at ? (
              <KeyValue label="Huom" value={`Palautettu ${formatDateFi(delivery.deleted_at)}`} />
            ) : null}
          </View>
        ))
      )}

      <Text style={trace.sectionTitle}>ERÄN TAPAHTUMAT ({result.events.length})</Text>

      {result.events.length === 0 ? (
        <Text style={trace.emptyText}>Ei tapahtumia.</Text>
      ) : (
        result.events.slice(0, 20).map((event) => {
          const date = formatDateFi(event.event_date);
          const time = formatTimeFi(event.event_date);

          return (
            <View key={event.id} style={trace.card}>
              <Text style={trace.cardTitle}>{eventLabel(event.event_code)}</Text>
              <KeyValue
                label="Aika"
                value={date ? `${date}${time ? ` klo ${time}` : ''}` : null}
              />
              <KeyValue
                label="Muutos"
                value={`${event.weight_change > 0 ? '+' : ''}${formatKgLabel(event.weight_change)}`}
              />
              <KeyValue
                label="Kokonaispaino"
                value={
                  typeof event.total_weight === 'number'
                    ? formatKgLabel(event.total_weight)
                    : null
                }
              />
              <KeyValue label="Selite" value={event.description} />
            </View>
          );
        })
      )}

      {result.events.length > 20 ? (
        <Text style={trace.hint}>
          Näytetään 20 uusinta tapahtumaa. Koko historia löytyy erän tapahtumalokista.
        </Text>
      ) : null}
    </>
  );
}

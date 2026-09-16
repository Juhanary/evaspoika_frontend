import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { components, screen } from '@/src/shared/styles/components';
import { productStyles } from '@/src/shared/styles/products';
import { EmptyState } from '@/src/shared/ui/EmptyState/EmptyState';
import { formatDateFi, formatTimeFi } from '@/src/shared/utils/date';
import { formatKg, formatKgLabel } from '@/src/shared/utils/weight';
import { Batch, BatchBox } from '../../domain/types';
import { useBatchBoxes } from '../hooks/useBatches';

const EXPIRY_WARNING_DAYS = 100;
const EXPIRY_CRITICAL_DAYS = 50;

type BatchRowProps = {
  batch: Batch;
  /**
   * Box count as the product list already computed it (batch.box_count, with a
   * batch-event fallback for older backends). Passed in rather than derived
   * from the fetched boxes so the collapsed row shows a number without the row
   * having to be opened first.
   */
  boxCount: number;
};

const packedLabel = (packedAt: string | null) => {
  const date = formatDateFi(packedAt);
  if (!date) return '—';
  const time = formatTimeFi(packedAt);
  return time ? `${date} ${time}` : date;
};

const BoxRow = ({ box, index }: { box: BatchBox; index: number }) => (
  <View style={productStyles.invBoxRow}>
    <Text style={productStyles.invBoxOrdinal}>{index + 1}.</Text>
    <Text numberOfLines={1} style={productStyles.invBoxEan}>
      {box.ean ?? 'ei tarraa'}
    </Text>
    <Text style={productStyles.invBoxPacked}>{packedLabel(box.packed_at)}</Text>
    <Text style={productStyles.invBoxWeight}>{formatKgLabel(box.remaining_weight)}</Text>
    {/* A partly consumed box: the label says one thing, the shelf another. */}
    {box.remaining_weight !== box.weight ? (
      <Text style={productStyles.invBoxOriginal}>tarrassa {formatKg(box.weight)} kg</Text>
    ) : null}
  </View>
);

/**
 * One batch inside the product dropdown. Tapping it opens the batch's boxes
 * with their weights — the only place in the app where an operator can see
 * what a single box weighs without scanning its label.
 */
export function BatchRow({ batch, boxCount }: BatchRowProps) {
  const [open, setOpen] = useState(false);
  const { data: boxes, isLoading, error } = useBatchBoxes(batch.id, open);

  const daysLeft = batch.days_until_expiry ?? null;
  const expiring = daysLeft !== null && daysLeft <= EXPIRY_WARNING_DAYS;

  return (
    <View>
      <Pressable
        accessibilityLabel={`Erä ${batch.batch_number}, näytä laatikot`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((prev) => !prev)}
        style={({ pressed }) => [components.invDropdownRow, pressed && screen.pressed]}
      >
        <Ionicons
          color="rgba(0,0,0,0.45)"
          name={open ? 'chevron-down' : 'chevron-forward'}
          size={18}
          style={productStyles.invBatchChevron}
        />
        <Text style={[components.invDropdownLabel, { flex: 1 }]}>
          {batch.batch_number}
        </Text>
        {expiring ? (
          <Ionicons
            color={
              (daysLeft as number) <= EXPIRY_CRITICAL_DAYS
                ? colors.danger50pvonWhite
                : colors.danger100pvonWhite
            }
            name="warning-outline"
            size={20}
            style={productStyles.invWarnIconGap}
          />
        ) : null}
        <Text style={[components.invDropdownLabel, productStyles.invDropdownBoxCountText]}>
          {boxCount} laatikkoa
        </Text>
        <Text style={[components.invDropdownWeight, productStyles.invDropdownBatchWeightText]}>
          {formatKg(batch.current_weight)} kg
        </Text>
      </Pressable>

      {open ? (
        <View style={productStyles.invBoxList}>
          {isLoading ? (
            <Text style={productStyles.invBoxHint}>Ladataan laatikoita...</Text>
          ) : error ? (
            <Text style={productStyles.invBoxError}>
              Laatikoiden haku epäonnistui
              {error instanceof Error ? `: ${error.message}` : ''}
            </Text>
          ) : (boxes ?? []).length === 0 ? (
            <EmptyState message="Ei laatikoita hyllyllä." style={productStyles.invBoxHint} />
          ) : (
            (boxes ?? []).map((box, index) => (
              <BoxRow box={box} index={index} key={box.id} />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

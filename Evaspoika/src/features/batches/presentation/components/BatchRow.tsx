import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { components, screen } from '@/src/shared/styles/components';
import { productStyles } from '@/src/shared/styles/products';
import { formatKg } from '@/src/shared/utils/weight';
import { Batch } from '../../domain/types';
import { BatchBoxList } from './BatchBoxList';

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

/**
 * One batch inside the product dropdown. Tapping it opens the batch's boxes
 * with their weights — the same list the MUOKKAA ERIÄ screen opens, rendered by
 * BatchBoxList.
 */
export function BatchRow({ batch, boxCount }: BatchRowProps) {
  const [open, setOpen] = useState(false);

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

      {open ? <BatchBoxList batchId={batch.id} enabled={open} variant="light" /> : null}
    </View>
  );
}

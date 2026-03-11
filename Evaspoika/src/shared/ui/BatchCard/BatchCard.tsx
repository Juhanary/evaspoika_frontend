import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { formatKg } from '@/src/shared/utils/weight';

export type BatchCardItem = {
  id: number;
  batch_number: string;
  current_weight: number;
};

export type BatchSelection = {
  selected: boolean;
  weight: string;
};

type Props = {
  batch: BatchCardItem;
  selection?: BatchSelection;
  isSubmitting?: boolean;
  onToggle: (batchId: number) => void;
  onWeightChange: (batchId: number, value: string) => void;
};

export function BatchCard({
  batch,
  selection,
  isSubmitting = false,
  onToggle,
  onWeightChange,
}: Props) {
  const isSelected = selection?.selected ?? false;

  return (
    <View style={[styles.batchCard, isSelected && styles.batchCardSelected]}>
      <Pressable
        onPress={() => onToggle(batch.id)}
        style={styles.batchHeader}
        accessibilityRole="button"
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkboxLabel}>X</Text>}
        </View>
        <View style={styles.batchInfo}>
          <Text style={styles.batchTitle}>Erä {batch.batch_number}</Text>
          <Text style={styles.batchSubtitle}>
            Available: {formatKg(batch.current_weight)} kg
          </Text>
        </View>
      </Pressable>
      {isSelected && (
        <TextInput
          placeholder="Sold weight (kg)"
          value={selection?.weight ?? ''}
          onChangeText={(value) => onWeightChange(batch.id, value)}
          style={styles.weightInput}
          keyboardType="numeric"
          editable={!isSubmitting}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  batchCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#fff',
  },
  batchCardSelected: {
    borderColor: colors.primary,
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  batchInfo: {
    flex: 1,
  },
  batchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  batchSubtitle: {
    fontSize: 12,
    color: colors.muted,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.sm,
    backgroundColor: '#fff',
  },
});

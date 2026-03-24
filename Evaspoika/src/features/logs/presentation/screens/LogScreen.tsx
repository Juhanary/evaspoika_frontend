import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useBatchEvents } from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { components } from '@/src/shared/styles/components';
import { layout } from '@/src/shared/styles/layout';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { BatchLog } from '@/src/features/batchEvents/domain/types';
import { formatKg } from '@/src/shared/utils/weight';

const EVENT_LABELS: Record<string, string> = {
  CREATE: 'Luotu',
  WEIGHING: 'Punnitus',
  SALE: 'Myynti',
  ADJUSTMENT: 'Korjaus',
  INVENTORY: 'Inventaario',
  DELETE: 'Poistettu',
};

const EVENT_COLORS: Record<string, string> = {
  CREATE: colors.success,
  WEIGHING: colors.primary,
  SALE: colors.purple,
  ADJUSTMENT: colors.warning,
  INVENTORY: colors.info,
  DELETE: colors.danger,
};

export default function LogScreen() {
  const { data: events, isLoading, error, dataUpdatedAt } = useBatchEvents();
  const [search, setSearch] = useState('');
  const [filterCode, setFilterCode] = useState<string | null>(null);

  const allCodes = useMemo(() => {
    const codes = new Set((events ?? []).map((e) => e.event_code));
    return Array.from(codes).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (events ?? []).filter((e) => {
      const ev = e as BatchLog;
      if (filterCode && ev.event_code !== filterCode) return false;
      if (!q) return true;
      const productName = ev.Batch?.Product?.name?.toLowerCase() ?? '';
      const batchNum = ev.Batch?.batch_number?.toLowerCase() ?? '';
      const desc = (ev.description ?? '').toLowerCase();
      const code = (EVENT_LABELS[ev.event_code] ?? ev.event_code).toLowerCase();
      return (
        productName.includes(q) ||
        batchNum.includes(q) ||
        desc.includes(q) ||
        code.includes(q)
      );
    });
  }, [events, search, filterCode]);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('fi-FI')
    : null;

  const renderItem = ({ item }: { item: BatchLog }) => {
    const label = EVENT_LABELS[item.event_code] ?? item.event_code;
    const color = EVENT_COLORS[item.event_code] ?? colors.muted;
    const dateStr = item.event_date
      ? new Date(item.event_date).toLocaleString('fi-FI', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';
    const productName = item.Batch?.Product?.name ?? `Erä #${item.BatchId}`;
    const batchNum = item.Batch?.batch_number ?? '-';
    const sign = item.weight_change >= 0 ? '+' : '';

    return (
      <View style={styles.logRow}>
        <View style={[styles.codeTag, { backgroundColor: color }]}>
          <Text style={styles.codeText}>{label}</Text>
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowProduct}>{productName}</Text>
          <Text style={styles.rowMeta}>
            Erä {batchNum} · {dateStr}
          </Text>
          {item.description ? (
            <Text style={styles.rowDesc}>{item.description}</Text>
          ) : null}
        </View>
        <Text style={[styles.rowWeight, { color: item.weight_change >= 0 ? colors.success : colors.danger }]}>
          {sign}{formatKg(item.weight_change)} kg
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Ladataan lokia...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>Virhe: {error instanceof Error ? error.message : 'Tuntematon'}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screenCompact}>
      <View style={styles.header}>
        <Text style={layout.screenTitle}>Tapahtumaloki</Text>
        {lastUpdated ? (
          <Text style={components.updatedText}>Päivitetty {lastUpdated}</Text>
        ) : null}
      </View>

      <TextInput
        style={components.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="Hae tuotteella, erällä tai kuvauksella..."
        clearButtonMode="while-editing"
      />

      <View style={styles.chips}>
        <TouchableOpacity
          style={[components.chip, !filterCode && components.chipActive]}
          onPress={() => setFilterCode(null)}
        >
          <Text style={[components.chipText, !filterCode && components.chipTextActive]}>Kaikki</Text>
        </TouchableOpacity>
        {allCodes.map((code) => (
          <TouchableOpacity
            key={code}
            style={[components.chip, filterCode === code && components.chipActive]}
            onPress={() => setFilterCode(filterCode === code ? null : code)}
          >
            <Text style={[components.chipText, filterCode === code && components.chipTextActive]}>
              {EVENT_LABELS[code] ?? code}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={components.countText}>{filtered.length} tapahtumaa</Text>

      <FlatList
        data={filtered as BatchLog[]}
        keyExtractor={(e) => String(e.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={components.emptyText}>Ei tapahtumia.</Text>}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  codeTag: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xs - 1,
    alignSelf: 'flex-start',
    minWidth: 62,
    alignItems: 'center',
  },
  codeText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  rowBody: { flex: 1 },
  rowProduct: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textDark,
  },
  rowMeta: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: spacing.xs / 2,
  },
  rowDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
    fontStyle: 'italic',
  },
  rowWeight: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    alignSelf: 'center',
  },
});

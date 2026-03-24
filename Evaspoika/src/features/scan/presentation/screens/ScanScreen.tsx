import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { previewScan } from '../../infrastructure/scanApi';
import { scanStore } from '../../scanStore';
import { layout } from '@/src/shared/styles/layout';
import { components } from '@/src/shared/styles/components';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { routes } from '@/src/shared/navigation/routes';

type Props = { orderId: number };

type ScannedEntry = { ean: string; count: number };

export default function ScanScreen({ orderId }: Props) {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [eanInput, setEanInput] = useState('');
  const [scanned, setScanned] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const handleScan = (raw: string) => {
    const ean = raw.trim();
    if (!ean) return;
    setScanned(prev => ({ ...prev, [ean]: (prev[ean] ?? 0) + 1 }));
    setEanInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const removeEntry = (ean: string) => {
    setScanned(prev => {
      const next = { ...prev };
      delete next[ean];
      return next;
    });
  };

  const handleConfirm = async () => {
    const entries: ScannedEntry[] = Object.entries(scanned).map(([ean, count]) => ({
      ean,
      count,
    }));
    if (entries.length === 0) {
      Alert.alert('Tyhjä', 'Skannaa ensin tuotteita.');
      return;
    }
    setLoading(true);
    try {
      const preview = await previewScan(entries);
      scanStore.set(orderId, preview);
      router.push(routes.orderScanConfirm(orderId));
    } catch (err) {
      Alert.alert('Virhe', err instanceof Error ? err.message : 'Esikatselu epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const entries = Object.entries(scanned);
  const totalBoxes = entries.reduce((s, [, c]) => s + c, 0);

  return (
    <View style={layout.screen}>
      <Text style={layout.screenTitle}>Tilaus #{orderId}</Text>
      <Text style={components.helperText}>Skannaa EAN-koodi tai syötä käsin</Text>

      <TextInput
        ref={inputRef}
        style={components.scanInput}
        value={eanInput}
        onChangeText={setEanInput}
        onSubmitEditing={() => handleScan(eanInput)}
        placeholder="EAN-koodi..."
        keyboardType="numeric"
        autoFocus
        returnKeyType="done"
      />

      <TouchableOpacity
        style={components.outlineBtn}
        onPress={() => router.push(routes.orderVirtualScanner(orderId))}
      >
        <Text style={components.outlineBtnText}>Virtuaaliskanneri</Text>
      </TouchableOpacity>

      {entries.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.listTitle}>Skannattu ({totalBoxes} kpl)</Text>
          <FlatList
            data={entries}
            keyExtractor={([ean]) => ean}
            renderItem={({ item: [ean, count] }) => (
              <View style={layout.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.ean}>{ean}</Text>
                  <Text style={styles.count}>{count} kpl</Text>
                </View>
                <TouchableOpacity onPress={() => removeEntry(ean)}>
                  <Text style={components.dangerText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <TouchableOpacity
        style={[components.confirmBtn, (loading || entries.length === 0) && layout.disabled]}
        onPress={handleConfirm}
        disabled={loading || entries.length === 0}
      >
        <Text style={components.confirmBtnText}>
          {loading ? 'Ladataan...' : 'Vahvista →'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listTitle: {
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  rowLeft: { flex: 1 },
  ean: { fontWeight: typography.weights.semibold },
  count: {
    color: colors.muted,
    fontSize: typography.sizes.md,
  },
});

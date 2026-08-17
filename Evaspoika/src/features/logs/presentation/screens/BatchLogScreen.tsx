import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { BATCH_STATE_LABELS } from '@/src/features/batches/domain/batchState';
import { screen } from '@/src/shared/styles/components';
import { logStyles as styles } from '@/src/shared/styles/logs';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { BatchEventList } from '../components/BatchEventList';
import { useBatchEventLog } from '../components/batchEventLog';

// Yhden erän tapahtumat omana näyttönään (/inventory/batch/:batchId).
// Korvaa aiemman BatchEventsScreenin, joka haki kaikki tapahtumat oletusrajalla
// 50 ja suodatti vasta selaimessa — vanhemman erän kohdalla se näytti tyhjää.
// Nyt tapahtumat haetaan erän omalla endpointilla ja esitetään täsmälleen
// samalla komponentilla kuin lokin modaalissa.
export default function BatchLogScreen({
  batchId,
  batchNumber,
}: {
  batchId?: number;
  batchNumber?: string;
}) {
  const target = useMemo(
    () =>
      typeof batchId === 'number' && Number.isFinite(batchId) && batchId > 0
        ? { batchId, batchLabel: batchNumber ? `Erä ${batchNumber}` : undefined }
        : null,
    [batchId, batchNumber],
  );

  const log = useBatchEventLog(target);

  if (!target) {
    return (
      <ScreenLayout leftAction="back" title="ERÄ">
        <View style={screen.inner}>
          <Text style={screen.muted}>Erää ei löytynyt.</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout leftAction="back" title={log.batchLabel.toUpperCase()}>
      <View style={screen.inner}>
        <Text style={screen.sectionTitle}>{log.batchLabel.toUpperCase()}</Text>
        <View style={screen.divider} />
        <Text style={styles.resultSummary}>
          {[
            log.productName,
            log.productionDate ? `valmistettu ${log.productionDate}` : null,
            BATCH_STATE_LABELS[log.state],
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <BatchEventList log={log} />
      </View>
    </ScreenLayout>
  );
}

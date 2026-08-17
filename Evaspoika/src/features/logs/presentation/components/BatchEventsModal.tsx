import React from 'react';
import { Text, View } from 'react-native';
import { BATCH_STATE_LABELS } from '@/src/features/batches/domain/batchState';
import { logModalStyles as modalStyles } from '@/src/shared/styles/logs';
import { GlassModal } from '@/src/shared/ui/GlassModal/GlassModal';
import { formatDateFi } from '@/src/shared/utils/date';
import { BatchEventList } from './BatchEventList';
import { type BatchModalTarget, useBatchEventLog } from './batchEventLog';

export type { BatchModalTarget };

// Erän elinkaari modaalina. Lokin kaikki kolme välilehteä avaavat tämän, joten
// erän tapahtumat näytetään koko sovelluksessa samalla tavalla.
export function BatchEventsModal({
  target,
  onClose,
}: {
  target: BatchModalTarget | null;
  onClose: () => void;
}) {
  const log = useBatchEventLog(target);
  const isDeleted = log.state === 'DELETED';

  return (
    <GlassModal
      cardStyle={isDeleted ? modalStyles.cardDeleted : undefined}
      headerExtra={
        log.state !== 'ACTIVE' ? (
          <View style={modalStyles.deletedHeaderBadge}>
            <Text style={modalStyles.deletedHeaderBadgeText}>
              {BATCH_STATE_LABELS[log.state]}
              {isDeleted && log.deletedAt ? ` ${formatDateFi(log.deletedAt) ?? ''}` : ''}
            </Text>
          </View>
        ) : undefined
      }
      icon={isDeleted ? 'archive-outline' : 'time-outline'}
      onClose={onClose}
      // Eränumero on tiivis 09062026 — valmistuspäivä luettavassa muodossa
      // otsikon alla kertoo mitä numero tarkoittaa.
      subtitle={
        target
          ? [log.productName, log.productionDate ? `valmistettu ${log.productionDate}` : null]
              .filter(Boolean)
              .join(' · ')
          : undefined
      }
      title={log.batchLabel}
      visible={target !== null}
    >
      <BatchEventList log={log} />
    </GlassModal>
  );
}

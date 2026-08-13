import React, { useDeferredValue, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { screen } from '@/src/shared/styles/components';
import { logStyles as styles } from '@/src/shared/styles/logs';
import {
  type ScreenLayoutLeftAction,
  ScreenLayout,
} from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import {
  BatchEventsModal,
  type BatchModalTarget,
} from '../components/BatchEventsModal';
import { BatchLogTab } from '../components/BatchLogTab';
import { CodeTraceTab } from '../components/CodeTraceTab';
import { CustomerOrdersPanel, CustomerTraceTab } from '../components/CustomerTraceTab';

// Loki on jaettu kysymyksen mukaan, ei taulun mukaan:
//
//   Erät      — mitä tälle erälle on tapahtunut
//   Asiakkaat — mitä tälle asiakkaalle on toimitettu
//   Jäljitys  — mistä tämä laatikko tuli ja minne muualle samaa erää meni
//
// Aiemmin kaikki kolme yritettiin kattaa yhdellä listalla, joka kokosi
// hierarkian kuudesta rinnakkaisesta kyselystä tabletin muistissa. Nyt jokainen
// välilehti hakee oman valmiin koosteensa, ja erän tapahtumat avautuvat kaikista
// samaan jaettuun modaaliin.

type ScreenTab = 'BATCHES' | 'CUSTOMERS' | 'TRACE';

const SCREEN_TABS: { key: ScreenTab; label: string }[] = [
  { key: 'BATCHES', label: 'Erät' },
  { key: 'CUSTOMERS', label: 'Asiakkaat' },
  { key: 'TRACE', label: 'Jäljitys' },
];

const SEARCH_PLACEHOLDERS: Record<ScreenTab, string> = {
  BATCHES: 'Hae tuotetta, erää, asiakasta tai tapahtumaa...',
  CUSTOMERS: 'Hae asiakasta...',
  TRACE: '',
};

type LogScreenProps = {
  leftAction?: ScreenLayoutLeftAction;
  customerId?: number;
};

export default function LogScreen({ leftAction = 'home', customerId }: LogScreenProps) {
  const [screenTab, setScreenTab] = useState<ScreenTab>('BATCHES');
  const [query, setQuery] = useState('');
  const [batchTarget, setBatchTarget] = useState<BatchModalTarget | null>(null);
  const deferredQuery = useDeferredValue(query);

  const isSingleCustomer = typeof customerId === 'number';
  // Jäljitysvälilehdellä on oma koodikenttänsä, joten yläpalkin haku piilotetaan.
  const showHeaderSearch = !isSingleCustomer && screenTab !== 'TRACE';

  const handleTabChange = (tab: ScreenTab) => {
    setScreenTab(tab);
    setQuery('');
  };

  const title = isSingleCustomer ? 'ASIAKKAAN TILAUKSET' : 'LOKI';

  return (
    <>
      <ScreenLayout
        headerSearch={
          showHeaderSearch
            ? {
                value: query,
                onChangeText: setQuery,
                placeholder: SEARCH_PLACEHOLDERS[screenTab],
              }
            : undefined
        }
        leftAction={leftAction}
        title={title}
      >
        <View style={screen.inner}>
          <Text style={screen.sectionTitle}>{title}</Text>
          <View style={screen.divider} />

          {isSingleCustomer ? (
            <CustomerOrdersPanel customerId={customerId} onOpenBatch={setBatchTarget} />
          ) : (
            <>
              <View style={styles.screenTabRow}>
                {SCREEN_TABS.map((tab) => {
                  const isActive = screenTab === tab.key;

                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => handleTabChange(tab.key)}
                      style={[styles.screenTab, isActive && styles.screenTabActive]}
                    >
                      <Text
                        style={[
                          styles.screenTabText,
                          isActive && styles.screenTabTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {screenTab === 'BATCHES' ? (
                <BatchLogTab onOpenBatch={setBatchTarget} search={deferredQuery} />
              ) : screenTab === 'CUSTOMERS' ? (
                <CustomerTraceTab onOpenBatch={setBatchTarget} search={deferredQuery} />
              ) : (
                <CodeTraceTab onOpenBatch={setBatchTarget} />
              )}
            </>
          )}
        </View>
      </ScreenLayout>

      <BatchEventsModal onClose={() => setBatchTarget(null)} target={batchTarget} />
    </>
  );
}

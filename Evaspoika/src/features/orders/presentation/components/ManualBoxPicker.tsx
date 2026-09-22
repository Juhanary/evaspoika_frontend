import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Batch, BatchBox } from '@/src/features/batches/domain/types';
import { useBatchBoxes } from '@/src/features/batches/presentation/hooks/useBatches';
import { Product } from '@/src/features/products/domain/types';
import { colors } from '@/src/shared/constants/colors';
import { components, screen } from '@/src/shared/styles/components';
import { orderStyles } from '@/src/shared/styles/orders';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { Button } from '@/src/shared/ui/Button/ActionButton';
import { formatDateFi } from '@/src/shared/utils/date';
import { formatKg, formatKgLabel } from '@/src/shared/utils/weight';

/**
 * Laatikon valinta varastosta tilaukselle — ilman skannausta.
 *
 * Käsin lisätyssä erässä laatikko voi jäädä kokonaan ilman tarraa, jolloin sille ei
 * ole koodia jota skannata. Ilman tätä polkua sellainen laatikko olisi varastossa
 * mutta sitä ei saisi myytyä kenellekään. Valinta tuottaa saman rivin kuin skannaus:
 * laatikon id kulkee tallennuksessa ORDER_LINE_BOX -liitokseen, joten jäljitys
 * vastaa kysymykseen "kenelle tämä laatikko meni" myös tarrattomasta laatikosta.
 *
 * Kaksi vaihetta: ensin erä, sitten sen laatikot. Laatikoita ei haeta kaikista eristä
 * kerralla — varastossa on kymmeniä eriä, ja lista olisi käyttökelvoton.
 */

export type ManualBoxSelection = {
  box: BatchBox;
  batch: Batch;
  product: Product | null;
};

type ManualBoxPickerProps = {
  visible: boolean;
  onClose: () => void;
  batches: Batch[];
  products: Product[];
  /** Jo listalla olevat laatikot — sama laatikko ei kuulu tilaukselle kahdesti. */
  excludeBoxIds: number[];
  onSelect: (selection: ManualBoxSelection) => void;
};

type BatchOption = {
  batch: Batch;
  product: Product | null;
  productName: string;
};

export function ManualBoxPicker({
  visible,
  onClose,
  batches,
  products,
  excludeBoxIds,
  onSelect,
}: ManualBoxPickerProps) {
  const [selected, setSelected] = useState<BatchOption | null>(null);
  const [query, setQuery] = useState('');

  const { data: boxes, isLoading, error } = useBatchBoxes(
    selected?.batch.id ?? null,
    visible && selected != null,
  );

  const options = useMemo<BatchOption[]>(() => {
    const search = query.trim().toLowerCase();

    return batches
      .filter((batch) => !batch.deleted_at && (batch.current_weight ?? 0) > 0)
      .map((batch) => {
        const product = products.find((item) => item.id === batch.ProductId) ?? null;
        return { batch, product, productName: product?.name ?? 'Tuntematon tuote' };
      })
      .filter((option) =>
        search
          ? option.productName.toLowerCase().includes(search) ||
            option.batch.batch_number.toLowerCase().includes(search)
          : true,
      )
      .sort((left, right) => {
        const byProduct = left.productName.localeCompare(right.productName, 'fi', {
          sensitivity: 'base',
        });
        if (byProduct !== 0) return byProduct;

        const leftDate = left.batch.production_date ?? '';
        const rightDate = right.batch.production_date ?? '';
        return leftDate.localeCompare(rightDate);
      });
  }, [batches, products, query]);

  const available = useMemo(
    () => (boxes ?? []).filter((box) => !excludeBoxIds.includes(box.id)),
    [boxes, excludeBoxIds],
  );

  const close = () => {
    setSelected(null);
    setQuery('');
    onClose();
  };

  return (
    <AppModal animationType="slide" onClose={close} visible={visible}>
      <View style={components.modalOverlay}>
        <View style={components.modalCard}>
          <Text style={components.modalTitle}>
            {selected ? `Valitse laatikko — ${selected.productName}` : 'Valitse erä'}
          </Text>

          {selected ? (
            isLoading ? (
              <View style={screen.centeredInline}>
                <ActivityIndicator color={colors.muted} size="small" />
              </View>
            ) : error ? (
              <Text style={components.modalEmpty}>
                Laatikoiden haku epäonnistui
                {error instanceof Error ? `: ${error.message}` : ''}
              </Text>
            ) : available.length === 0 ? (
              <Text style={components.modalEmpty}>
                Ei vapaita laatikoita tässä erässä.
              </Text>
            ) : (
              <ScrollView style={orderStyles.batchPickerScroll} showsVerticalScrollIndicator={false}>
                {available.map((box) => (
                  <TouchableOpacity
                    key={box.id}
                    onPress={() => {
                      onSelect({ box, batch: selected.batch, product: selected.product });
                      close();
                    }}
                    style={components.modalRow}
                  >
                    <Text style={components.modalRowText}>
                      {box.ean ?? 'Ei tarraa'} — {formatKgLabel(box.remaining_weight)}
                    </Text>
                    <Text style={components.modalRowSubText}>
                      {`Erä ${selected.batch.batch_number} / pakattu ${
                        formatDateFi(box.packed_at) ?? 'ei tiedossa'
                      }`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )
          ) : (
            <>
              {/* Hakukenttä myös silloin kun haku ei osu mihinkään: se on ainoa tapa
                  tyhjentää haku, ja ilman sitä tyhjä lista näyttäisi tyhjältä varastolta. */}
              <TextInput
                onChangeText={setQuery}
                placeholder="Hae tuotetta tai erää..."
                placeholderTextColor={colors.inputPlaceholder}
                style={orderStyles.smSearchInput}
                value={query}
              />
              {options.length === 0 ? (
                <Text style={components.modalEmpty}>
                  {query.trim() ? 'Ei hakua vastaavia eriä.' : 'Ei eriä varastossa.'}
                </Text>
              ) : (
                <ScrollView style={orderStyles.batchPickerScroll} showsVerticalScrollIndicator={false}>
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.batch.id}
                      onPress={() => setSelected(option)}
                      style={components.modalRow}
                    >
                      <Text style={components.modalRowText}>
                        {option.productName} — {option.batch.batch_number}
                      </Text>
                      <Text style={components.modalRowSubText}>
                        {`${formatDateFi(option.batch.production_date) ?? 'Ei päiväystä'} / ${formatKg(
                          option.batch.current_weight,
                        )} kg`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}

          <Button
            label={selected ? 'Takaisin' : 'Peruuta'}
            onPress={() => (selected ? setSelected(null) : close())}
            variant="cancel"
          />
        </View>
      </View>
    </AppModal>
  );
}

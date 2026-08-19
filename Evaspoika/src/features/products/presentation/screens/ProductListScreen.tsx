import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FlatList,
  GestureDetector,
  Gesture,
  ScrollView,
} from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { Batch } from '@/src/features/batches/domain/types';
import { useBatchEvents } from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { parseBoxEan } from '@/src/features/boxes/infrastructure/boxesApi';
import { submitWeighing } from '@/src/features/weighing/infrastructure/weighingApi';
import { routes } from '@/src/shared/navigation/routes';
import { colors } from '@/src/shared/constants/colors';
import { components, screen } from '@/src/shared/styles/components';
import { orderStyles, productStyles } from '@/src/shared/styles/orders';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { Button } from '@/src/shared/ui/Button/ActionButton';
import { EmptyState } from '@/src/shared/ui/EmptyState/EmptyState';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import { ScreenLayout } from '@/src/shared/ui/ScreenLayout/ScreenLayout';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';
import { formatKg } from '@/src/shared/utils/weight';
import { formatDateIso, parseFinnishDateStrict } from '@/src/shared/utils/date';
import { patchProductCode } from '../../infrastructure/productsApi';
import { Product } from '../../domain/types';
import { useProducts } from '../hooks/useProducts';
import {
  useProductConfig,
  FIXED_CATEGORIES,
  CategoryId,
  ProductConfig,
} from '../hooks/useProductConfig';

const ITEM_HEIGHT = 66;
const ALL_PRODUCTS_ORDER_KEY = '__all__';

type ProductRow = {
  product: Product;
  batchCount: number;
  totalWeight: number;
  boxCount: number;
};

type PendingBox = {
  id: string;
  ean: string;
  productId: number | null;
  productName: string;
  weightKg: number;
};

// ─── Drag handle ─────────────────────────────────────────────────────────────

type DragHandleProps = {
  index: number;
  active: boolean;
  onDragStart: (index: number) => void;
  onDragUpdate: (translationY: number) => void;
  onDragEnd: () => void;
};

const DragHandle = React.memo(function DragHandle({
  index, active, onDragStart, onDragUpdate, onDragEnd,
}: DragHandleProps) {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(250)
        .onBegin(() => { runOnJS(onDragStart)(index); })
        .onUpdate((e) => { runOnJS(onDragUpdate)(e.translationY); })
        .onFinalize(() => { runOnJS(onDragEnd)(); }),
    [index, onDragStart, onDragUpdate, onDragEnd],
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={productStyles.dragHandle}>
        <Ionicons
          color={active ? colors.danger : colors.white}
          name="reorder-three"
          size={30}
        />
      </View>
    </GestureDetector>
  );
});

// Stable component reference (defined once at module scope) so FlatList
// never sees it as "changed" between renders.
const ItemSeparator = () => <View style={productStyles.favItemSeparator} />;

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ProductListScreen() {
  const router = useRouter();
  const { data: products, isLoading, error: productsError } = useProducts();
  const { data: batches, error: batchesError } = useBatches();
  // Same query (types + limit) and cache key as ScreenLayout's inventory-modal
  // fetch, so opening this screen and opening the inventory modal share one
  // request instead of each firing their own 9999-row fetch.
  const { data: batchEvents } = useBatchEvents({ types: 'WEIGHING,CREATE', limit: 9999 });
  const {
    config,
    MAX_FAVORITES,
    toggleFavorite,
    assignCategory,
    reorderFavorites,
    setProductCategoryOrder,
    toggleHidden,
  } = useProductConfig();

  const [query, setQuery] = useState('');
  const [favExpandedId, setFavExpandedId] = useState<number | null>(null);
  const [catExpandedId, setCatExpandedId] = useState<number | null>(null);
  const [showAddBoxesModal, setShowAddBoxesModal] = useState(false);
  const [showHiddenModal, setShowHiddenModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dropdownY, setDropdownY] = useState(200);
  const filterBtnRef = useRef<View>(null);
  const [configTargetId, setConfigTargetId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  // Favorites drag state
  const [favDragFrom, setFavDragFrom] = useState<number | null>(null);
  const [favDragTo, setFavDragTo] = useState<number | null>(null);

  // Category list drag state
  const [catDragFrom, setCatDragFrom] = useState<number | null>(null);
  const [catDragTo, setCatDragTo] = useState<number | null>(null);

  // Clear search when leaving inventory screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        setQuery('');
      };
    }, []),
  );

  // Laatikkomäärä tulee ensisijaisesti erän box_count-kentästä (backend laskee
  // sen BOX-taulusta) — sama luotettava lähde kuin src/shared/utils/inventory.ts
  // käyttää varastosaldo-modaalissa. Tapahtumalokiin (batchEvents) perustuva
  // laskenta on vain varapolku, jos box_count puuttuu: erän palautus tai
  // painonkorjaus voi tuottaa tapahtuman joka ei vastaa yhtään laatikkoa,
  // jolloin pelkkä tapahtumalaskenta näyttäisi väärän luvun.
  const boxesByBatchId = useMemo(() => {
    const eventCounts = new Map<number, number>();
    (batchEvents ?? []).forEach((event) => {
      eventCounts.set(event.BatchId, (eventCounts.get(event.BatchId) ?? 0) + 1);
    });

    const map = new Map<number, number>();
    (batches ?? []).forEach((batch) => {
      map.set(
        batch.id,
        batch.box_count != null ? batch.box_count : (eventCounts.get(batch.id) ?? 0),
      );
    });
    return map;
  }, [batchEvents, batches]);

  const allRows = useMemo<ProductRow[]>(() => {
    const weightMap = new Map<number, { count: number; weight: number }>();
    const boxMap = new Map<number, number>();

    (batches ?? []).forEach((batch) => {
      if (!batch.deleted_at && batch.ProductId && (batch.current_weight ?? 0) > 0) {
        const existing = weightMap.get(batch.ProductId) ?? { count: 0, weight: 0 };
        weightMap.set(batch.ProductId, {
          count: existing.count + 1,
          weight: existing.weight + (batch.current_weight ?? 0),
        });
      }
      if (batch.ProductId) {
        boxMap.set(batch.ProductId, (boxMap.get(batch.ProductId) ?? 0) + (boxesByBatchId.get(batch.id) ?? 0));
      }
    });

    return (products ?? []).map((product) => ({
      product,
      batchCount: weightMap.get(product.id)?.count ?? 0,
      totalWeight: weightMap.get(product.id)?.weight ?? 0,
      boxCount: boxMap.get(product.id) ?? 0,
    }));
  }, [batches, boxesByBatchId, products]);

  const rows = useMemo<ProductRow[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allRows.filter(
      (row) =>
        !config.hidden.includes(row.product.id) &&
        (!normalizedQuery || row.product.name.toLowerCase().includes(normalizedQuery)),
    );
  }, [allRows, config.hidden, query]);

  const hiddenRows = useMemo(
    () => allRows.filter((row) => config.hidden.includes(row.product.id)),
    [allRows, config.hidden],
  );

  const batchesByProduct = useMemo(() => {
    const map = new Map<number, Batch[]>();
    (batches ?? [])
      .filter((b) => !b.deleted_at && b.ProductId)
      .forEach((b) => {
        const list = map.get(b.ProductId!) ?? [];
        list.push(b);
        map.set(b.ProductId!, list);
      });
    return map;
  }, [batches]);

  // Maintain favorites in config.favorites order
  const favoriteRows = useMemo(
    () =>
      config.favorites
        .map((id) => rows.find((r) => r.product.id === id))
        .filter((r): r is ProductRow => r !== undefined),
    [rows, config.favorites],
  );

  // Category list ordered by stored productOrder
  const displayRows = useMemo<ProductRow[]>(() => {
    if (query.trim()) return rows;
    if (selectedCategory) {
      const catRows = rows.filter(
        (r) => config.assignments[String(r.product.id)] === selectedCategory,
      );
      const order = config.productOrder?.[selectedCategory] ?? [];
      if (!order.length) {
        return [...catRows].sort((a, b) => {
          const aHasWeight = a.totalWeight > 0;
          const bHasWeight = b.totalWeight > 0;
          if (aHasWeight !== bHasWeight) {
            return aHasWeight ? -1 : 1;
          }
          return a.product.name.localeCompare(b.product.name, 'fi', { sensitivity: 'base' });
        });
      }
      return [...catRows].sort((a, b) => {
        const ai = order.indexOf(a.product.id);
        const bi = order.indexOf(b.product.id);
        return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi);
      });
    }
    const order = config.productOrder?.[ALL_PRODUCTS_ORDER_KEY] ?? [];
    if (!order.length) {
      return [...rows].sort((a, b) => {
        const aHasWeight = a.totalWeight > 0;
        const bHasWeight = b.totalWeight > 0;
        if (aHasWeight !== bHasWeight) {
          return aHasWeight ? -1 : 1;
        }
        return a.product.name.localeCompare(b.product.name, 'fi', { sensitivity: 'base' });
      });
    }
    return [...rows].sort((a, b) => {
      const ai = order.indexOf(a.product.id);
      const bi = order.indexOf(b.product.id);
      return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi);
    });
  }, [rows, config, query, selectedCategory]);

  const configTarget = useMemo(
    () => rows.find((r) => r.product.id === configTargetId) ?? null,
    [rows, configTargetId],
  );

  const activeCatLabel = useMemo(() => {
    if (query.trim()) return null;
    if (selectedCategory) return FIXED_CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? null;
    return null;
  }, [selectedCategory, query]);

  // ── Favorites drag callbacks ────────────────────────────────────────────────

  const onFavDragStart = useCallback((index: number) => {
    setFavDragFrom(index);
    setFavDragTo(index);
  }, []);

  const onFavDragUpdate = useCallback((translationY: number) => {
    setFavDragFrom((from) => {
      if (from === null) return from;
      const steps = Math.round(translationY / ITEM_HEIGHT);
      setFavDragTo(Math.max(0, Math.min(favoriteRows.length - 1, from + steps)));
      return from;
    });
  }, [favoriteRows.length]);

  const onFavDragEnd = useCallback(() => {
    setFavDragFrom((from) => {
      setFavDragTo((to) => {
        if (from !== null && to !== null && from !== to) {
          const ids = favoriteRows.map((r) => r.product.id);
          const [removed] = ids.splice(from, 1);
          ids.splice(to, 0, removed);
          reorderFavorites(ids);
        }
        return null;
      });
      return null;
    });
  }, [favoriteRows, reorderFavorites]);

  // ── Category drag callbacks ─────────────────────────────────────────────────

  const onCatDragStart = useCallback((index: number) => {
    setCatDragFrom(index);
    setCatDragTo(index);
  }, []);

  const onCatDragUpdate = useCallback((translationY: number) => {
    setCatDragFrom((from) => {
      if (from === null) return from;
      const steps = Math.round(translationY / (ITEM_HEIGHT + 12));
      setCatDragTo(Math.max(0, Math.min(displayRows.length - 1, from + steps)));
      return from;
    });
  }, [displayRows.length]);

  const onCatDragEnd = useCallback(() => {
    setCatDragFrom((from) => {
      setCatDragTo((to) => {
        if (from !== null && to !== null && from !== to) {
          const ids = displayRows.map((r) => r.product.id);
          const [removed] = ids.splice(from, 1);
          ids.splice(to, 0, removed);
          setProductCategoryOrder(selectedCategory ?? ALL_PRODUCTS_ORDER_KEY, ids);
        }
        return null;
      });
      return null;
    });
  }, [displayRows, selectedCategory, setProductCategoryOrder]);

  const openDropdown = useCallback(() => {
    filterBtnRef.current?.measureInWindow((_x, y, _w, h) => {
      setDropdownY(y + h + 6);
      setShowFilterDropdown(true);
    });
  }, []);

  // ── Row renderer ────────────────────────────────────────────────────────────
  // Memoized so a keystroke in the search box or expanding one row doesn't
  // hand FlatList a brand-new renderItem/header on every render (which forces
  // it to re-render every visible row instead of just the one that changed).

  const renderProductRow = useCallback((
    item: ProductRow,
    expandedId: number | null,
    setExpandedId: React.Dispatch<React.SetStateAction<number | null>>,
    dragHandle?: React.ReactNode,
  ) => {
    const isExpanded = expandedId === item.product.id;
    const productBatches = batchesByProduct.get(item.product.id) ?? [];
    const isFav = config.favorites.includes(item.product.id);
    
    // Check if any batch has a warning
    const hasWarning = productBatches.some((batch) => {
      const daysLeft = batch.days_until_expiry ?? null;
      return daysLeft !== null && daysLeft <= 100;
    });
    const minDaysLeft = productBatches.reduce((min, batch) => {
      const daysLeft = batch.days_until_expiry ?? null;
      if (daysLeft === null || daysLeft > 100) return min;
      return Math.min(min, daysLeft);
    }, Number.MAX_SAFE_INTEGER);

    return (
      <View style={components.invPillRow}>
        {dragHandle}
        <View style={components.flex1}>
          <Pressable
            onLongPress={() => setConfigTargetId(item.product.id)}
            onPress={() =>
              setExpandedId((prev) => (prev === item.product.id ? null : item.product.id))
            }
            style={({ pressed }) => [
              components.invPillLeft,
              isExpanded && components.invPillLeftExpanded,
              pressed && screen.pressed,
            ]}
          >
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text numberOfLines={1} style={components.invPillLeftText}>
                {item.product.name}
              </Text>
              {item.product.product_code ? (
                <Text style={productStyles.invPillPlu}>{item.product.product_code}</Text>
              ) : null}
            </View>
            {isFav ? (
              <Ionicons color="#f5a623" name="star" size={13} style={productStyles.invIconTrailingGap} />
            ) : null}
            {!item.product.product_code ? (
              <Ionicons
                color="rgba(220,60,0,0.85)"
                name="keypad-outline"
                size={16}
                style={productStyles.invIconTrailingGap}
              />
            ) : null}
            {!item.product.netvisor_key ? (
              <Ionicons
                color="rgba(255,165,0,0.85)"
                name="cloud-offline-outline"
                size={16}
                style={productStyles.invIconTrailingGap}
              />
            ) : null}
            {hasWarning ? (
              <Ionicons
                color={minDaysLeft <= 50 ? colors.danger50pvonWhite : colors.danger100pvonWhite}
                name="warning-outline"
                size={30}
                style={productStyles.invIconTrailingGap}
              />
            ) : null}
            <Ionicons
              color="rgba(0,0,0,0.45)"
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
            />
          </Pressable>

          {isExpanded ? (
            <View style={components.invDropdown}>
              {productBatches.length === 0 ? (
                <EmptyState message="Ei eriä." style={components.invDropdownLabel} />
              ) : (
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={productStyles.invBatchScrollView}>
                  {productBatches.map((batch) => {
                    const batchBoxCount = boxesByBatchId.get(batch.id) ?? 0;
                    const daysLeft = batch.days_until_expiry ?? null;
                    const expiring = daysLeft !== null && daysLeft <= 100;
                    return (
                      <View key={batch.id}>
                        <View style={components.invDropdownRow}>
                          <Text style={[components.invDropdownLabel, { flex: 1 }]}>
                            {batch.batch_number}
                          </Text>
                          {expiring ? (
                            <Ionicons
                              color={daysLeft <= 50 ? colors.danger50pvonWhite : colors.danger100pvonWhite}
                              name="warning-outline"
                              size={20}
                              style={productStyles.invWarnIconGap}
                            />
                          ) : null}
                          <Text style={[components.invDropdownLabel, productStyles.invDropdownBoxCountText]}>
                            {batchBoxCount} laatikkoa
                          </Text>
                          <Text style={[components.invDropdownWeight, productStyles.invDropdownBatchWeightText]}>
                            {formatKg(batch.current_weight)} kg
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
              <View style={components.invDropdownDivider} />
              <View style={[components.invDropdownRow, { gap: 6 }]}>
                <Text style={[components.invDropdownLabelYhteensa, { flex: 1 }]}>Yhteensä</Text>
                <Text style={[components.invDropdownLabel, { minWidth: 48, textAlign: 'right', fontSize: 20 }]}>
                  {item.batchCount} erää
                </Text>
                <Text style={[components.invDropdownLabel, { minWidth: 48, textAlign: 'right', fontSize: 20 }]}>
                  {item.boxCount} laatikkoa
                </Text>
                <Text style={[components.invDropdownWeight, { minWidth: 80, textAlign: 'right', fontSize: 20 }]}>
                  {formatKg(item.totalWeight)} kg
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(routes.inventoryProduct(item.product.id))}
                style={({ pressed }) => [components.invDropdownBtn, pressed && screen.pressed]}
              >
                <Text style={components.invDropdownBtnText}>MUOKKAA ERIÄ</Text>
              </Pressable>
              {!item.product.product_code ? (
                <Text style={productStyles.productCodeWarningText}>
                  Tuotekoodi puuttuu — vaaka ei tunnista tuotetta. Paina pitkään asettaaksesi.
                </Text>
              ) : null}
              {!item.product.netvisor_key ? (
                <Text style={productStyles.netvisorWarningText}>
                  Ei vahvistettu Netvisorissa
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={components.invPillRight}>
          <Text style={components.invPillWeight}>{formatKg(item.totalWeight)} kg</Text>
          <View style={components.invPillDivider} />
          <Text style={components.invPillCount}>{item.boxCount}</Text>
        </View>
      </View>
    );
  }, [batchesByProduct, boxesByBatchId, config.favorites, router, setConfigTargetId]);

  const sectionLabel = useCallback((title: string) => (
    <View style={productStyles.sectionLabelRow}>
      <Text style={productStyles.sectionLabelText}>{title}</Text>
      <View style={productStyles.sectionLabelRule} />
    </View>
  ), []);

  const listHeader = useMemo(() => (
    <View>
      {/* Favorites — only in all-products view */}
      {!query.trim() && selectedCategory === null && favoriteRows.length > 0 ? (
        <View style={productStyles.favSectionWrap}>
          {sectionLabel('★  SUOSIKIT')}
          {favoriteRows.map((row, index) => {
            const isDragging = favDragFrom === index;
            const dropAbove = favDragTo === index && favDragFrom !== null && favDragTo < favDragFrom;
            const dropBelow = favDragTo === index && favDragFrom !== null && favDragTo > favDragFrom;
            return (
              <View key={`fav-${row.product.id}`} style={{ opacity: isDragging ? 0.4 : 1 }}>
                {dropAbove && <View style={productStyles.dragDropLine} />}
                {renderProductRow(row, favExpandedId, setFavExpandedId, (
                  <DragHandle
                    active={isDragging}
                    index={index}
                    onDragEnd={onFavDragEnd}
                    onDragStart={onFavDragStart}
                    onDragUpdate={onFavDragUpdate}
                  />
                ))}
                {dropBelow && <View style={productStyles.dragDropLine} />}
                {index < favoriteRows.length - 1 ? <View style={productStyles.favItemSeparator} /> : null}
              </View>
            );
          })}
          <View style={productStyles.favSectionBottomDivider} />
        </View>
      ) : null}

      {/* Section label for selected category */}
      {!query.trim() && activeCatLabel ? sectionLabel(activeCatLabel.toUpperCase()) : null}
    </View>
  ), [
    query, selectedCategory, favoriteRows, sectionLabel, favDragFrom, favDragTo,
    renderProductRow, favExpandedId, setFavExpandedId, onFavDragEnd, onFavDragStart,
    onFavDragUpdate, activeCatLabel,
  ]);

  const emptyText = useMemo(() => {
    if (query.trim()) return 'Ei tuotteita.';
    if (selectedCategory) return 'Ei tuotteita tässä kategoriassa. Lisää pitkällä painalluksella.';
    return null;
  }, [query, selectedCategory]);

  const showCatDragHandles = !query.trim();

  const renderListItem = useCallback(({ item, index }: { item: ProductRow; index: number }) => {
    const isDragging = catDragFrom === index;
    const dropAbove = catDragTo === index && catDragFrom !== null && catDragTo < catDragFrom;
    const dropBelow = catDragTo === index && catDragFrom !== null && catDragTo > catDragFrom;
    return (
      <View style={{ opacity: isDragging ? 0.4 : 1 }}>
        {dropAbove && <View style={productStyles.dragDropLine} />}
        {renderProductRow(item, catExpandedId, setCatExpandedId, showCatDragHandles ? (
          <DragHandle
            active={isDragging}
            index={index}
            onDragEnd={onCatDragEnd}
            onDragStart={onCatDragStart}
            onDragUpdate={onCatDragUpdate}
          />
        ) : undefined)}
        {dropBelow && <View style={productStyles.dragDropLine} />}
      </View>
    );
  }, [
    catDragFrom, catDragTo, renderProductRow, catExpandedId, setCatExpandedId,
    showCatDragHandles, onCatDragEnd, onCatDragStart, onCatDragUpdate,
  ]);

  return (
    <>
      <ScreenLayout title="VARASTO">
        <View style={screen.innerSm}>
          <View style={productStyles.searchFilterRow}>
            <SearchInput
              onChangeText={setQuery}
              placeholder="Hae tuotetta..."
              style={productStyles.searchFilterInput}
              value={query}
              variant="dark"
            />
            <View ref={filterBtnRef}>
              <Pressable
                accessibilityLabel="Suodata tuotteita"
                onPress={openDropdown}
                style={({ pressed }) => [
                  productStyles.filterBtn,
                  selectedCategory !== null && productStyles.filterBtnActive,
                  pressed && screen.pressed,
                ]}
              >
                <Ionicons
                  color={selectedCategory !== null ? colors.white : 'rgba(0,0,0,0.65)'}
                  name="options-outline"
                  size={22}
                />
              </Pressable>
            </View>
          </View>
          <View style={screen.columnHeaderRow}>
            <Text style={screen.columnHeaderText}>Paino / Laatikoita</Text>
          </View>

          {productsError ? (
            <Text style={screen.muted}>Virhe: {String(productsError)}</Text>
          ) : batchesError ? (
            <Text style={screen.muted}>Virhe: {String(batchesError)}</Text>
          ) : isLoading ? (
            <Text style={screen.muted}>Ladataan...</Text>
          ) : (
            <FlatList
              contentContainerStyle={productStyles.invListContent}
              data={displayRows}
              ItemSeparatorComponent={ItemSeparator}
              keyExtractor={(row) => String(row.product.id)}
              ListEmptyComponent={emptyText ? <EmptyState message={emptyText} /> : null}
              ListHeaderComponent={listHeader}
              renderItem={renderListItem}
              showsVerticalScrollIndicator={false}
              style={components.flex1}
            />
          )}
        </View>
      </ScreenLayout>

      <Modal animationType="none" onRequestClose={() => setShowFilterDropdown(false)} transparent visible={showFilterDropdown}>
        <Pressable style={{ flex: 1 }} onPress={() => setShowFilterDropdown(false)}>
          <Pressable onPress={() => {}} style={[productStyles.filterDropdownCard, { top: dropdownY }]}>
            <Pressable
              onPress={() => { setSelectedCategory(null); setShowFilterDropdown(false); }}
              style={productStyles.filterDropdownItem}
            >
              <Ionicons
                color={selectedCategory === null ? colors.primary : 'rgba(0,0,0,0.3)'}
                name={selectedCategory === null ? 'radio-button-on' : 'radio-button-off'}
                size={18}
              />
              <Text style={[productStyles.filterDropdownItemText, selectedCategory === null && productStyles.filterDropdownItemSelected]}>
                Kaikki tuotteet
              </Text>
            </Pressable>
            {FIXED_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => { setSelectedCategory(cat.id); setShowFilterDropdown(false); }}
                style={productStyles.filterDropdownItem}
              >
                <Ionicons
                  color={selectedCategory === cat.id ? colors.primary : 'rgba(0,0,0,0.3)'}
                  name={selectedCategory === cat.id ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                />
                <Text style={[productStyles.filterDropdownItemText, selectedCategory === cat.id && productStyles.filterDropdownItemSelected]}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
            <View style={productStyles.filterDropdownDivider} />
            <Pressable
              onPress={() => { setShowAddBoxesModal(true); setShowFilterDropdown(false); }}
              style={productStyles.filterDropdownItem}
            >
              <Ionicons color="rgba(0,0,0,0.65)" name="add-circle-outline" size={18} />
              <Text style={productStyles.filterDropdownItemText}>Lisää laatikoita</Text>
            </Pressable>
            <Pressable
              onPress={() => { setShowHiddenModal(true); setShowFilterDropdown(false); }}
              style={productStyles.filterDropdownItem}
            >
              <Ionicons color="rgba(0,0,0,0.65)" name="eye-off-outline" size={18} />
              <Text style={productStyles.filterDropdownItemText}>
                {`Näytä piilotetut${hiddenRows.length > 0 ? ` (${hiddenRows.length})` : ''}`}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <AppModal animationType="fade" visible={showAddBoxesModal}>
        <AddBoxesModal onClose={() => setShowAddBoxesModal(false)} products={products ?? []} />
      </AppModal>

      <AppModal
        animationType="fade"
        onClose={() => setConfigTargetId(null)}
        visible={configTarget !== null}
      >
        {configTarget ? (
          <ProductConfigModal
            config={config}
            maxFavorites={MAX_FAVORITES}
            onAssignCategory={(catId) => assignCategory(configTarget.product.id, catId)}
            onClose={() => setConfigTargetId(null)}
            onToggleFavorite={() => toggleFavorite(configTarget.product.id)}
            onToggleHidden={() => toggleHidden(configTarget.product.id)}
            row={configTarget}
          />
        ) : null}
      </AppModal>

      <AppModal animationType="fade" onClose={() => setShowHiddenModal(false)} visible={showHiddenModal}>
        <HiddenProductsModal onClose={() => setShowHiddenModal(false)} onUnhide={toggleHidden} rows={hiddenRows} />
      </AppModal>
    </>
  );
}

// ─── Hidden products modal ───────────────────────────────────────────────────

const HiddenProductsModal = ({
  rows,
  onUnhide,
  onClose,
}: {
  rows: ProductRow[];
  onUnhide: (productId: number) => void;
  onClose: () => void;
}) => (
  <View style={components.modalOverlay}>
    <View style={components.modalCard}>
      <View style={productStyles.configModalHeaderRow}>
        <Text style={[components.modalTitle, productStyles.configModalTitleOverride]}>Piilotetut tuotteet</Text>
        <Pressable accessibilityLabel="Sulje" hitSlop={10} onPress={onClose}>
          <Ionicons color="rgba(0,0,0,0.4)" name="close" size={24} />
        </Pressable>
      </View>

      {rows.length === 0 ? (
        <Text style={screen.muted}>Ei piilotettuja tuotteita.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={productStyles.hiddenModalScroll}>
          {rows.map((row) => (
            <Pressable
              key={row.product.id}
              onPress={() => onUnhide(row.product.id)}
              style={productStyles.hiddenModalRow}
            >
              <Text numberOfLines={1} style={[productStyles.hiddenModalRowText, { flex: 1 }]}>
                {row.product.name}
              </Text>
              <Ionicons color="rgba(0,0,0,0.5)" name="eye-outline" size={18} />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Button
        contentStyle={productStyles.configModalCloseBtnMargin}
        label="Valmis"
        onPress={onClose}
        variant="cancel"
      />
    </View>
  </View>
);

// ─── Product config modal ────────────────────────────────────────────────────

const ProductConfigModal = ({
  row,
  config,
  maxFavorites,
  onToggleFavorite,
  onToggleHidden,
  onAssignCategory,
  onClose,
}: {
  row: ProductRow;
  config: ProductConfig;
  maxFavorites: number;
  onToggleFavorite: () => void;
  onToggleHidden: () => void;
  onAssignCategory: (categoryId: CategoryId | null) => void;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const isFav = config.favorites.includes(row.product.id);
  const currentCatId = (config.assignments[String(row.product.id)] ?? null) as CategoryId | null;
  const [codeInput, setCodeInput] = useState(row.product.product_code ? String(row.product.product_code) : '');
  const [codeSaving, setCodeSaving] = useState(false);
  const [codeSaved, setCodeSaved] = useState(false);
  const [catSaved, setCatSaved] = useState(false);

  const handleSaveCode = async () => {
    const parsed = codeInput.trim() === '' ? null : parseInt(codeInput.trim(), 10);
    if (codeInput.trim() !== '' && (isNaN(parsed!) || parsed! <= 0 || parsed! > 99)) {
      Alert.alert('Virheellinen tuotekoodi', 'Tuotekoodin täytyy olla 1–99 välillä.');
      return;
    }
    setCodeSaving(true);
    try {
      await patchProductCode(row.product.id, parsed);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setCodeSaved(true);
      setTimeout(() => setCodeSaved(false), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Virhe', `Tuotekoodin tallennus epäonnistui.\n${msg}`);
    } finally {
      setCodeSaving(false);
    }
  };

  const handleAssignCategory = (catId: CategoryId | null) => {
    onAssignCategory(catId);
    setCatSaved(true);
    setTimeout(() => setCatSaved(false), 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={components.modalOverlay}
    >
      <View style={components.modalCard}>
        <View style={productStyles.configModalHeaderRow}>
          <Text numberOfLines={1} style={[components.modalTitle, productStyles.configModalTitleOverride]}>
            {row.product.name}
          </Text>
          <Pressable accessibilityLabel="Sulje" hitSlop={10} onPress={onClose}>
            <Ionicons color="rgba(0,0,0,0.4)" name="close" size={24} />
          </Pressable>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => {
              if (!isFav && config.favorites.length >= maxFavorites) {
                Alert.alert('Suosikkeja täynnä', `Suosikkeja voi olla enintään ${maxFavorites}.`);
                return;
              }
              onToggleFavorite();
            }}
            style={productStyles.configModalFavRow}
          >
            <Ionicons
              color={isFav ? '#f5a623' : 'rgba(0,0,0,0.35)'}
              name={isFav ? 'star' : 'star-outline'}
              size={22}
            />
            <Text style={[productStyles.configModalFavText, isFav && { color: '#f5a623' }]}>
              {isFav ? 'Poista suosikeista' : 'Lisää suosikkeihin'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleHidden} style={productStyles.configModalFavRow}>
            <Ionicons color="rgba(0,0,0,0.35)" name="eye-off-outline" size={22} />
            <Text style={productStyles.configModalFavText}>Piilota</Text>
          </TouchableOpacity>

          <View style={productStyles.configModalDivider} />

          <Text style={productStyles.configModalSectionLabel}>
            KATEGORIA
          </Text>

          <TouchableOpacity
            onPress={() => handleAssignCategory(null)}
            style={productStyles.configModalCatRow}
          >
            <Ionicons
              color={currentCatId === null ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.25)'}
              name={currentCatId === null ? 'radio-button-on' : 'radio-button-off'}
              size={20}
            />
            <Text style={productStyles.configModalCatNoneText}>
              Ei kategoriaa
            </Text>
          </TouchableOpacity>

          {FIXED_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleAssignCategory(cat.id)}
              style={productStyles.configModalCatRow}
            >
              <Ionicons
                color={currentCatId === cat.id ? 'rgba(226, 13, 13, 0.75)' : 'rgba(0,0,0,0.25)'}
                name={currentCatId === cat.id ? 'radio-button-on' : 'radio-button-off'}
                size={20}
              />
              <Text style={productStyles.configModalCatName}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}

          {catSaved ? (
            <Text style={productStyles.configModalSavedText}>Tallennettu ✓</Text>
          ) : null}

          <View style={productStyles.configModalDivider} />

          <Text style={[productStyles.configModalSectionLabel, { marginTop: 10 }]}>TUOTEKOODI (VAAKA)</Text>
          <Text style={productStyles.configModalPluCurrent}>
            {row.product.product_code ? `Nykyinen: ${row.product.product_code}` : 'Ei asetettu — vaaka ei tunnista tuotetta'}
          </Text>
          <View style={productStyles.configModalPluRow}>
            <TextInput
              keyboardType="number-pad"
              maxLength={2}
              onChangeText={setCodeInput}
              placeholder="Tuotekoodi (01–99)"
              placeholderTextColor="rgba(0,0,0,0.3)"
              style={productStyles.configModalPluInput}
              value={codeInput}
            />
            <TouchableOpacity
              disabled={codeSaving || codeSaved}
              onPress={handleSaveCode}
              style={[
                productStyles.configModalPluSaveBtn,
                codeSaved && productStyles.configModalPluSaveBtnSuccess,
              ]}
            >
              <Text style={productStyles.configModalPluSaveBtnText}>
                {codeSaving ? '...' : codeSaved ? '✓' : 'Tallenna'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            contentStyle={productStyles.configModalCloseBtnMargin}
            label="Valmis"
            onPress={onClose}
            variant="cancel"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Add boxes modal ─────────────────────────────────────────────────────────

const AddBoxesModal = ({
  onClose,
  products,
}: {
  onClose: () => void;
  products: Product[];
}) => {
  const queryClient = useQueryClient();
  const [eanInput, setEanInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [bestBeforeInput, setBestBeforeInput] = useState('');
  const [showBestBeforePicker, setShowBestBeforePicker] = useState(false);
  const [pickerBestBeforeDate, setPickerBestBeforeDate] = useState(new Date());
  const [pendingBoxes, setPendingBoxes] = useState<PendingBox[]>([]);
  const [productPickerFor, setProductPickerFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const eanRef = useRef<TextInput>(null);
  const eanValueRef = useRef('');
  const nextId = useRef(1);
  const scanLockRef = useRef(false);

  const formatDateFinnish = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${date.getFullYear()}`;
  };

  const openDatePicker = () => {
    // Pre-populate picker with currently typed date if valid
    const parts = dateInput.split('.');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) setPickerDate(parsed);
    }
    setShowDatePicker(true);
  };

  const onDatePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && date) {
      setDateInput(formatDateFinnish(date));
      setPickerDate(date);
    }
  };

  const openBestBeforePicker = () => {
    const parts = bestBeforeInput.split('.');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) setPickerBestBeforeDate(parsed);
    }
    setShowBestBeforePicker(true);
  };

  const onBestBeforeDatePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowBestBeforePicker(false);
    if (event.type === 'set' && date) {
      setBestBeforeInput(formatDateFinnish(date));
      setPickerBestBeforeDate(date);
    }
  };

  // Refocus EAN input after product picker closes or saving finishes
  useEffect(() => {
    if (productPickerFor === null && !saving) {
      const t = setTimeout(() => eanRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [productPickerFor, saving]);

  const handleScan = async (ean: string) => {
    const normalized = ean.replace(/\s+/g, '').trim();
    if (!normalized || scanLockRef.current) return;
    scanLockRef.current = true;
    setScanning(true);
    setEanInput('');
    try {
      const parsed = await parseBoxEan(normalized);
      setPendingBoxes((prev) => [
        ...prev,
        {
          id: String(nextId.current++),
          ean: normalized,
          productId: parsed.productId,
          productName: parsed.productName ?? '',
          weightKg: parsed.weight_kg,
        },
      ]);
    } catch {
      Alert.alert(
        'Tunnistus epäonnistui',
        `EAN ${normalized} ei ole painotettu viivakoodimuoto tai tapahtui verkkovirhe.`,
      );
    } finally {
      scanLockRef.current = false;
      setScanning(false);
      setTimeout(() => eanRef.current?.focus(), 50);
    }
  };

  const handleSave = async () => {
    if (!dateInput.trim()) {
      Alert.alert('Päivämäärä puuttuu', 'Kirjoita boksin päivämäärä ennen tallentamista.');
      return;
    }

    const productionDate = parseFinnishDateStrict(dateInput);
    if (!productionDate) {
      Alert.alert(
        'Virheellinen päivämäärä',
        `"${dateInput.trim()}" ei ole kelvollinen päivämäärä. Käytä muotoa pp.kk.vvvv.`,
      );
      return;
    }

    let bestBefore: Date | null = null;
    if (bestBeforeInput.trim()) {
      bestBefore = parseFinnishDateStrict(bestBeforeInput);
      if (!bestBefore) {
        Alert.alert(
          'Virheellinen parasta ennen -päivä',
          `"${bestBeforeInput.trim()}" ei ole kelvollinen päivämäärä. Käytä muotoa pp.kk.vvvv.`,
        );
        return;
      }
      if (bestBefore < productionDate) {
        Alert.alert(
          'Virheellinen parasta ennen -päivä',
          'Parasta ennen -päivä ei voi olla ennen valmistuspäivää.',
        );
        return;
      }
    }

    if (pendingBoxes.length === 0) {
      Alert.alert('Tyhjä', 'Ei laatikoita tallennettavaksi.');
      return;
    }
    for (const box of pendingBoxes) {
      if (!box.productName.trim()) {
        Alert.alert('Tuote puuttuu', `Valitse tuote laatikolle ${box.ean}.`);
        return;
      }
    }

    setSaving(true);

    // Sent one at a time, not with Promise.all: every box in a session normally
    // shares (product, production_date), so parallel requests contend for the
    // same row. A rejected Promise.all also left the successful writes in place
    // with every row still on screen, so retrying re-sent — and double-counted —
    // the boxes that had already landed. Successful rows are dropped as they go,
    // so a retry only re-sends what actually failed.
    const failed: PendingBox[] = [];
    let saved = 0;
    let firstError: unknown = null;

    for (const box of pendingBoxes) {
      try {
        await submitWeighing({
          ean: box.ean,
          name: box.productName,
          weightKg: box.weightKg,
          productionDate: formatDateIso(productionDate),
          bestBefore: bestBefore ? formatDateIso(bestBefore) : undefined,
        });
        saved += 1;
      } catch (err) {
        failed.push(box);
        firstError ??= err;
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['batches'] });
    // Prefix match: invalidates every batchEvents query (this screen's,
    // ScreenLayout's inventory modal, per-batch logs), not one specific key.
    await queryClient.invalidateQueries({ queryKey: ['batchEvents'] });

    setPendingBoxes(failed);
    setSaving(false);

    if (failed.length === 0) {
      setEanInput('');
      onClose();
      Alert.alert('Tallennettu', `${saved} laatikkoa lisätty järjestelmään.`);
      return;
    }

    const detail = firstError instanceof Error ? `\n\n${firstError.message}` : '';
    Alert.alert(
      'Osa laatikoista jäi tallentamatta',
      `${saved} laatikkoa tallennettiin, ${failed.length} epäonnistui. ` +
        `Epäonnistuneet jäivät listalle — voit yrittää niitä uudelleen.${detail}`,
    );
  };

  const totalWeightGrams = pendingBoxes.reduce((sum, b) => sum + Math.round(b.weightKg * 1000), 0);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop: absorbs all stray touches — modal NEVER closes from outside */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />
      <View style={orderStyles.smOverlay} pointerEvents="box-none">
      <GlassCard blurRadius={24} style={orderStyles.smShell}>
        <View style={orderStyles.smTopRow}>
          <View style={orderStyles.smCustomerPill}>
            <Text style={orderStyles.smCustomerPillText}>LISÄÄ LAATIKOITA</Text>
          </View>
          <Pressable accessibilityLabel="Sulje" hitSlop={12} onPress={onClose}>
            <Ionicons color={colors.textOnDark} name="close" size={28} />
          </Pressable>
        </View>

        <View style={orderStyles.smPanel}>
          <View style={orderStyles.smScanFieldRow}>
            <TextInput
              keyboardType="numbers-and-punctuation"
              onChangeText={setDateInput}
              placeholder="PÄIVÄMÄÄRÄ (pp.kk.vvvv)"
              placeholderTextColor="rgba(0,0,0,0.32)"
              returnKeyType="next"
              style={orderStyles.smScanFieldInput}
              value={dateInput}
            />
            <Pressable accessibilityLabel="Valitse päivämäärä" hitSlop={10} onPress={openDatePicker}>
              <Ionicons color="rgba(0,0,0,0.42)" name="calendar-outline" size={24} />
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              display="default"
              locale="fi"
              mode="date"
              onChange={onDatePickerChange}
              value={pickerDate}
            />
          )}

          <View style={orderStyles.smScanFieldRow}>
            <TextInput
              keyboardType="numbers-and-punctuation"
              onChangeText={setBestBeforeInput}
              placeholder="PARASTA ENNEN (pp.kk.vvvv)"
              placeholderTextColor="rgba(0,0,0,0.32)"
              returnKeyType="next"
              style={orderStyles.smScanFieldInput}
              value={bestBeforeInput}
            />
            <Pressable accessibilityLabel="Valitse parasta ennen -päivämäärä" hitSlop={10} onPress={openBestBeforePicker}>
              <Ionicons color="rgba(0,0,0,0.42)" name="calendar-outline" size={24} />
            </Pressable>
          </View>

          {showBestBeforePicker && (
            <DateTimePicker
              display="default"
              locale="fi"
              mode="date"
              onChange={onBestBeforeDatePickerChange}
              value={pickerBestBeforeDate}
            />
          )}

          <TextInput
            autoFocus
            caretHidden
            keyboardType="numeric"
            onBlur={() => {
              if (productPickerFor === null && !saving) {
                setTimeout(() => eanRef.current?.focus(), 80);
              }
            }}
            onChangeText={(v) => { const c = v.replace(/\s+/g, ''); eanValueRef.current = c; setEanInput(c); }}
            onSubmitEditing={() => handleScan(eanValueRef.current)}
            ref={eanRef}
            returnKeyType="done"
            showSoftInputOnFocus={false}
            style={orderStyles.smHiddenEanInput}
            value={eanInput}
          />
          <Pressable
            onPress={() => eanRef.current?.focus()}
            style={[orderStyles.smScanStatusBar, scanning && orderStyles.smScanStatusBarScanning]}
          >
            <Ionicons
              color={scanning ? 'rgba(0,0,0,0.38)' : 'rgba(30, 140, 60, 0.85)'}
              name={scanning ? 'time-outline' : 'barcode-outline'}
              size={24}
            />
            <Text style={[orderStyles.smScanStatusBarText, scanning && orderStyles.smScanStatusBarTextScanning]}>
              {scanning ? 'Tunnistetaan...' : 'SKANNAA EAN-KOODI'}
            </Text>
          </Pressable>

          <View style={orderStyles.smTableHeader}>
            <View style={orderStyles.smDeleteCell} />
            <Text style={[orderStyles.smTableHeaderText, orderStyles.smProductCell]}>TUOTE</Text>
            <Text style={[orderStyles.smTableHeaderText, orderStyles.smWeightCell]}>PAINO</Text>
          </View>

          <FlatList
            data={pendingBoxes}
            ItemSeparatorComponent={() => <View style={orderStyles.smTableDivider} />}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={orderStyles.smScanEmpty}>
                Skannaa laatikoiden EAN-koodit. Paino ja tuote tunnistetaan automaattisesti.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={orderStyles.smTableRow}>
                <TouchableOpacity
                  accessibilityLabel="Poista laatikko"
                  disabled={saving}
                  onPress={() => setPendingBoxes((prev) => prev.filter((b) => b.id !== item.id))}
                  style={orderStyles.smDeleteCell}
                >
                  <Ionicons color="rgba(0,0,0,0.54)" name="close" size={22} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setProductPickerFor(item.id)}
                  style={[orderStyles.smProductCell, orderStyles.smBatchSelectBtn]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      orderStyles.smBatchSelectText,
                      !item.productName && orderStyles.smBatchSelectPlaceholder,
                    ]}
                  >
                    {item.productName || 'VALITSE TUOTE'}
                  </Text>
                  <Ionicons color="rgba(0,0,0,0.7)" name="chevron-down" size={14} />
                </TouchableOpacity>
                <Text style={[orderStyles.smTableRowText, orderStyles.smWeightCell]}>
                  {item.weightKg.toFixed(3)} kg
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            style={orderStyles.smTableList}
          />

          <View style={orderStyles.smFooterRow}>
            <Text style={orderStyles.smScanTotal}>
              {pendingBoxes.length} kpl · {formatKg(totalWeightGrams)} kg
            </Text>
            <TouchableOpacity
              disabled={saving || pendingBoxes.length === 0}
              onPress={handleSave}
              style={[
                orderStyles.smSavePill,
                (saving || pendingBoxes.length === 0) && orderStyles.smSaveBtnDisabled,
              ]}
            >
              <Text style={orderStyles.smSavePillText}>
                {saving ? 'Tallennetaan...' : 'TALLENNA'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>

      <AppModal
        animationType="slide"
        onClose={() => setProductPickerFor(null)}
        visible={productPickerFor != null}
      >
        <View style={components.modalOverlay}>
          <View style={components.modalCard}>
            <Text style={components.modalTitle}>Valitse tuote</Text>
            <ScrollView style={productStyles.addBoxPickerScroll} showsVerticalScrollIndicator={false}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => {
                    const rowId = productPickerFor;
                    setPendingBoxes((prev) =>
                      prev.map((b) =>
                        b.id === rowId ? { ...b, productId: product.id, productName: product.name } : b,
                      ),
                    );
                    setProductPickerFor(null);
                  }}
                  style={components.modalRow}
                >
                  <Text style={components.modalRowText}>{product.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              label="Peruuta"
              onPress={() => setProductPickerFor(null)}
              variant="cancel"
            />
          </View>
        </View>
      </AppModal>
      </View>
    </View>
  );
};

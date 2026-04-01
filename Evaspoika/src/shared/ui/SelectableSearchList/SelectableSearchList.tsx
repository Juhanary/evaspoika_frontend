import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '@/src/shared/constants/spacing';
import { layout } from '@/src/shared/styles/layout';
import { CustomButton } from '@/src/shared/ui/Button/CustomButton';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';

type Props<T> = {
  items?: T[] | null;
  isLoading: boolean;
  error?: unknown;
  title?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  loadingText: string;
  errorPrefix: string;
  onSelect?: (item: T) => void;
  filterItem: (item: T, query: string) => boolean;
  getTitle: (item: T) => string;
  getSubtitle: (item: T) => string;
  keyExtractor: (item: T) => string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  emptyActionDisabled?: boolean;
  query?: string;
  onQueryChange?: (text: string) => void;
  showSearchInput?: boolean;
};

export function SelectableSearchList<T>({
  items,
  isLoading,
  error,
  title,
  emptyText,
  searchPlaceholder = 'Hae...',
  loadingText,
  errorPrefix,
  onSelect,
  filterItem,
  getTitle,
  getSubtitle,
  keyExtractor,
  emptyActionLabel,
  onEmptyAction,
  emptyActionDisabled,
  query,
  onQueryChange,
  showSearchInput = true,
}: Props<T>) {
  const [internalQuery, setInternalQuery] = useState('');
  const activeQuery = query ?? internalQuery;
  const handleQueryChange = onQueryChange ?? setInternalQuery;

  const filteredItems = useMemo(() => {
    const normalizedQuery = activeQuery.trim().toLowerCase();

    return (items ?? []).filter((item) => filterItem(item, normalizedQuery));
  }, [activeQuery, filterItem, items]);

  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text>{loadingText}</Text>
      </View>
    );
  }

  if (error) {
    if (__DEV__) {
      console.error(errorPrefix, error);
    }

    return (
      <View style={[layout.screen, layout.center]}>
        <Text>{errorPrefix}</Text>
      </View>
    );
  }

  return (
    <View style={layout.screen}>
      {title ? <Text style={layout.title}>{title}</Text> : null}
      {showSearchInput ? (
        <SearchInput
          onChangeText={handleQueryChange}
          placeholder={searchPlaceholder}
          value={activeQuery}
        />
      ) : null}
      <FlatList
        data={filteredItems}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          emptyText || emptyActionLabel ? (
            <View style={styles.emptyContainer}>
              {emptyText ? <Text style={styles.emptyText}>{emptyText}</Text> : null}
              {emptyActionLabel && onEmptyAction ? (
                <CustomButton
                  disabled={emptyActionDisabled}
                  label={emptyActionLabel}
                  onPress={onEmptyAction}
                />
              ) : null}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const content = (
            <>
              <Text style={layout.listItemTitle}>{getTitle(item)}</Text>
              <Text style={layout.listItemSubtitle}>{getSubtitle(item)}</Text>
            </>
          );

          if (!onSelect) {
            return <View style={layout.listItem}>{content}</View>;
          }

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                layout.listItem,
                pressed && layout.listItemPressed,
              ]}
            >
              {content}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    marginTop: spacing.md,
  },
  emptyText: {
    marginBottom: spacing.sm,
  },
});

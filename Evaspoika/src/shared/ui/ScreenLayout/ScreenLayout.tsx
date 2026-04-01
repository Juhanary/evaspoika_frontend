import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { spacing } from '@/src/shared/constants/spacing';
import { goBackOrHome } from '@/src/shared/navigation/goBackOrHome';
import { routes } from '@/src/shared/navigation/routes';
import { dark } from '@/src/shared/styles/dark';
import {
  AppHeader,
  type AppHeaderAction,
  type AppHeaderSearch,
} from '@/src/shared/ui/AppHeader/AppHeader';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import { InventorySummaryModal } from '@/src/shared/ui/InventorySummaryModal/InventorySummaryModal';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';
import { buildInventorySummary } from '@/src/shared/utils/inventory';

export type ScreenLayoutLeftAction = 'home' | 'back' | 'none';

type Props = {
  title?: string;
  leftAction?: ScreenLayoutLeftAction;
  onBack?: () => void;
  rightActions?: AppHeaderAction[];
  headerSearch?: AppHeaderSearch;
  showInventoryAction?: boolean;
  wrapInCard?: boolean;
  cardStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

const BG = require('@/src/assets/images/home_bg-50c5c1.png');

export function ScreenLayout({
  title,
  leftAction = 'home',
  onBack,
  rightActions = [],
  headerSearch,
  showInventoryAction = true,
  wrapInCard = true,
  cardStyle,
  children,
}: Props) {
  const [showInventory, setShowInventory] = useState(false);
  const { data: products } = useProducts();
  const { data: batches } = useBatches();

  const inventoryItems = useMemo(
    () => buildInventorySummary(products, batches),
    [products, batches],
  );
  const inlineSearch = wrapInCard ? headerSearch : undefined;

  const headerLeftAction: AppHeaderAction | null =
    leftAction === 'home'
      ? {
          icon: 'home',
          onPress: () => router.navigate(routes.home),
          accessibilityLabel: 'Koti',
        }
      : leftAction === 'back'
        ? {
            icon: 'arrow-back',
            onPress: onBack ?? goBackOrHome,
            accessibilityLabel: 'Takaisin',
          }
        : null;

  const headerRightActions: AppHeaderAction[] = showInventoryAction
    ? [
        ...rightActions,
        {
          icon: 'server-outline',
          onPress: () => setShowInventory(true),
          accessibilityLabel: 'Varastosaldo',
        },
      ]
    : rightActions;

  return (
    <ImageBackground resizeMode="cover" source={BG} style={dark.screen}>
      <AppHeader
        leftAction={headerLeftAction}
        rightActions={headerRightActions}
        search={wrapInCard ? undefined : headerSearch}
        title={title}
      />

      <View style={styles.contentContainer}>
        {wrapInCard ? (
          <GlassCard blurRadius={18} style={[styles.card, cardStyle]}>
            {inlineSearch ? (
              <View style={styles.inlineSearchContainer}>
                <SearchInput
                  onChangeText={inlineSearch.onChangeText}
                  placeholder={inlineSearch.placeholder ?? 'Hae...'}
                  style={styles.inlineSearch}
                  value={inlineSearch.value}
                  variant="dark"
                />
              </View>
            ) : null}
            {children}
          </GlassCard>
        ) : (
          <View style={styles.plainContent}>{children}</View>
        )}
      </View>

      <InventorySummaryModal
        items={inventoryItems}
        onClose={() => setShowInventory(false)}
        visible={showInventory}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
  },
  inlineSearchContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  inlineSearch: {
    width: '100%',
    maxWidth: 720,
    marginBottom: 0,
  },
  plainContent: {
    flex: 1,
  },
});

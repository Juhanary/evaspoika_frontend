import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { spacing } from '@/src/shared/constants/spacing';
import { dark } from '@/src/shared/styles/dark';
import {
  AppHeader,
  type AppHeaderAction,
  type AppHeaderSearch,
} from '@/src/shared/ui/AppHeader/AppHeader';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import { InventorySummaryModal } from '@/src/shared/ui/InventorySummaryModal/InventorySummaryModal';
import { ScreenCloseButtonRow } from '@/src/shared/ui/ScreenCloseButton/ScreenCloseButton';
import { buildInventorySummary } from '@/src/shared/utils/inventory';

type Props = {
  title?: string;
  showHomeButton?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
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
  showHomeButton = true,
  showCloseButton = true,
  onClose,
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
        rightActions={headerRightActions}
        search={headerSearch}
        showHomeButton={showHomeButton}
        title={title}
      />

      <View style={styles.contentContainer}>
        {wrapInCard ? (
          <GlassCard blurRadius={18} style={[styles.card, cardStyle]}>
            {showCloseButton ? (
              <ScreenCloseButtonRow
                onPress={onClose}
                style={styles.closeButtonInsideCard}
              />
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
  closeButtonInsideCard: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  card: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: 0,
  },
  plainContent: {
    flex: 1,
  },
});

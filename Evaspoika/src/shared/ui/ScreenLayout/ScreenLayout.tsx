import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBatches } from '@/src/features/batches/presentation/hooks/useBatches';
import { useProducts } from '@/src/features/products/presentation/hooks/useProducts';
import { useBatchEvents } from '@/src/features/batchEvents/presentation/hooks/useBatchEvents';
import { goBackOrHome } from '@/src/shared/navigation/goBackOrHome';
import { routes } from '@/src/shared/navigation/routes';
import { colors } from '@/src/shared/constants/colors';
import { dark } from '@/src/shared/styles/dark';
import { components } from '@/src/shared/styles/components';
import {
  AppHeader,
  type AppHeaderAction,
  type AppHeaderSearch,
} from '@/src/shared/ui/AppHeader/AppHeader';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';
import { InventorySummaryModal } from '@/src/shared/ui/InventorySummaryModal/InventorySummaryModal';
import { NotificationsModal } from '@/src/shared/ui/NotificationsModal/NotificationsModal';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';
import { buildInventorySummary } from '@/src/shared/utils/inventory';
import { useNotificationWarnings } from '@/src/shared/hooks/useNotificationWarnings';

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

// eslint-disable-next-line @typescript-eslint/no-require-imports
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
  const [showNotifications, setShowNotifications] = useState(false);
  const insets = useSafeAreaInsets();
  const { data: products } = useProducts();
  const { data: batches } = useBatches();
  const { data: batchEvents } = useBatchEvents({ types: 'WEIGHING,CREATE', limit: 9999 });

  const notif = useNotificationWarnings(batches ?? [], products ?? []);

  const inventoryItems = useMemo(
    () => buildInventorySummary(products, batches, batchEvents),
    [products, batches, batchEvents],
  );

  const inlineSearch = wrapInCard ? headerSearch : undefined;

  const headerLeftAction: AppHeaderAction | null =
    leftAction !== 'none'
      ? {
          icon: 'home',
          onPress: () => router.navigate(routes.home),
          accessibilityLabel: 'Koti',
        }
      : null;

  const headerRightActions: AppHeaderAction[] = showInventoryAction
    ? [
        ...rightActions,
        {
          icon: notif.hasUnread ? 'notifications' : 'notifications-outline',
          iconColor: notif.hasUnread ? colors.warning : undefined,
          onPress: () => setShowNotifications(true),
          accessibilityLabel: 'Ilmoitukset',
        },
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

      <View style={[components.screenContent, { paddingBottom: insets.bottom }]}>
        {wrapInCard ? (
          <GlassCard blurRadius={18} style={[components.screenCard, cardStyle]}>
            {leftAction === 'back' ? (
              <Pressable
                accessibilityLabel="Takaisin"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onBack ?? goBackOrHome}
                style={components.screenBackBtn}
              >
                <Ionicons color="rgba(255,255,255,0.7)" name="arrow-back" size={20} />
                <Text style={components.screenBackBtnText}>TAKAISIN</Text>
              </Pressable>
            ) : null}
            {inlineSearch ? (
              <View style={components.screenInlineSearch}>
                <SearchInput
                  onChangeText={inlineSearch.onChangeText}
                  placeholder={inlineSearch.placeholder ?? 'Hae...'}
                  style={components.screenInlineSearchMax}
                  value={inlineSearch.value}
                  variant="dark"
                />
              </View>
            ) : null}
            {children}
          </GlassCard>
        ) : (
          <View style={components.screenPlain}>
            {leftAction === 'back' ? (
              <Pressable
                accessibilityLabel="Takaisin"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onBack ?? goBackOrHome}
                style={components.screenBackBtn}
              >
                <Ionicons color="rgba(255,255,255,0.7)" name="arrow-back" size={20} />
                <Text style={components.screenBackBtnText}>TAKAISIN</Text>
              </Pressable>
            ) : null}
            {children}
          </View>
        )}
      </View>

      <InventorySummaryModal
        items={inventoryItems}
        onClose={() => setShowInventory(false)}
        visible={showInventory}
      />
      <NotificationsModal
        inputValues={notif.inputValues}
        markRead={notif.markRead}
        onClose={() => setShowNotifications(false)}
        products={products ?? []}
        saveThreshold={notif.saveThreshold}
        setInputValues={notif.setInputValues}
        totalCount={notif.totalCount}
        visible={showNotifications}
        warnings={notif.warnings}
      />
    </ImageBackground>
  );
}

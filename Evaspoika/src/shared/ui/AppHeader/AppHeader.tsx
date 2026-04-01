import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { GlassIconButton } from '@/src/shared/ui/GlassIconButton/GlassIconButton';
import { SearchInput } from '@/src/shared/ui/SearchInput/SearchInput';

const LOGO = require('@/src/assets/images/Logo.png');

export type AppHeaderAction = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  accessibilityLabel: string;
};

export type AppHeaderSearch = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

type Props = {
  title?: string;
  leftAction?: AppHeaderAction | null;
  rightActions?: AppHeaderAction[];
  search?: AppHeaderSearch;
};

export function AppHeader({
  title,
  leftAction = null,
  rightActions = [],
  search,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.side}>
        {leftAction ? (
          <GlassIconButton
            accessibilityLabel={leftAction.accessibilityLabel}
            icon={leftAction.icon}
            iconSize={26}
            onPress={leftAction.onPress}
          />
        ) : null}
      </View>

      <View style={styles.center}>
        {search ? (
          <SearchInput
            label={title}
            onChangeText={search.onChangeText}
            placeholder={search.placeholder ?? 'Hae...'}
            style={styles.searchContainer}
            value={search.value}
            variant="dark"
          />
        ) : (
          <>
            <Image resizeMode="contain" source={LOGO} style={styles.logo} />
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </>
        )}
      </View>

      <View style={[styles.side, styles.sideRight]}>
        {rightActions.map((action, index) => (
          <GlassIconButton
            key={`${action.icon}-${index}`}
            accessibilityLabel={action.accessibilityLabel}
            icon={action.icon}
            iconSize={26}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  side: {
    minWidth: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 6,
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textOnDark,
  },
  searchContainer: {
    marginBottom: 0,
  },
});

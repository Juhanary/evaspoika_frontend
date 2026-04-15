import React from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { components } from '@/src/shared/styles/components';
import { Button } from '@/src/shared/ui/Button/ActionButton';
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
    <View style={[components.appHeader, { paddingTop: insets.top + 10 }]}>
      <View style={components.appHeaderSide}>
        {leftAction ? (
          <Button
            accessibilityLabel={leftAction.accessibilityLabel}
            icon={leftAction.icon}
            iconSize={26}
            onPress={leftAction.onPress}
            variant="glassIcon"
          />
        ) : null}
      </View>

      <View style={components.appHeaderCenter}>
        {search ? (
          <SearchInput
            label={title}
            onChangeText={search.onChangeText}
            placeholder={search.placeholder ?? 'Hae...'}
            style={components.appHeaderSearch}
            value={search.value}
            variant="dark"
          />
        ) : (
          <>
            <Image resizeMode="contain" source={LOGO} style={components.appHeaderLogo} />
            {title ? <Text style={components.appHeaderTitle}>{title}</Text> : null}
          </>
        )}
      </View>

      <View style={[components.appHeaderSide, components.appHeaderSideRight]}>
        {rightActions.map((action, index) => (
          <Button
            key={`${action.icon}-${index}`}
            accessibilityLabel={action.accessibilityLabel}
            icon={action.icon}
            iconSize={26}
            onPress={action.onPress}
            variant="glassIcon"
          />
        ))}
      </View>
    </View>
  );
}

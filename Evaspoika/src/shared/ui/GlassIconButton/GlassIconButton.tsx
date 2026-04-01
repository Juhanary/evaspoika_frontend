import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { glassActionSurface } from '@/src/shared/styles/components';
import { ActionButton } from '@/src/shared/ui/Button/ActionButton';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  iconSize?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GlassIconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 58,
  iconSize = 48,
  disabled = false,
  style,
}: Props) {
  const radius = size / 2;

  return (
    <ActionButton
      accessibilityLabel={accessibilityLabel}
      contentStyle={[styles.surface, { borderRadius: radius }]}
      disabled={disabled}
      disabledOpacity={0.6}
      hitSlop={8}
      icon={icon}
      iconColor={colors.textOnDark}
      iconSize={iconSize}
      onPress={onPress}
      pressedOpacity={0.72}
      style={[styles.button, { width: size, height: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
  },
  surface: {
    ...glassActionSurface,
  },
});

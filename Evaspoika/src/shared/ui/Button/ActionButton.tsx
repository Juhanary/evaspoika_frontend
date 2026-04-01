import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type Insets,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';

type ActionButtonBaseProps = {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  iconSize?: number;
  hitSlop?: Insets | number;
  pressedOpacity?: number;
  disabledOpacity?: number;
  labelAdjustsFontSizeToFit?: boolean;
  labelMinimumFontScale?: number;
  labelNumberOfLines?: number;
};

type ActionButtonWithLabelProps = ActionButtonBaseProps & {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  accessibilityLabel?: string;
};

type ActionButtonIconOnlyProps = ActionButtonBaseProps & {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label?: undefined;
  accessibilityLabel: string;
};

export type ActionButtonProps =
  | ActionButtonWithLabelProps
  | ActionButtonIconOnlyProps;

export function ActionButton({
  onPress,
  label,
  icon,
  accessibilityLabel,
  disabled = false,
  style,
  contentStyle,
  labelStyle,
  iconColor = colors.textOnDark,
  iconSize = 24,
  hitSlop,
  pressedOpacity = 0.8,
  disabledOpacity = 0.45,
  labelAdjustsFontSizeToFit = false,
  labelMinimumFontScale = 0.75,
  labelNumberOfLines,
}: ActionButtonProps) {
  const hasVisibleLabel = typeof label === 'string' && label.trim().length > 0;
  const resolvedAccessibilityLabel = accessibilityLabel ?? (hasVisibleLabel ? label : undefined);

  if (!icon && !hasVisibleLabel) {
    if (__DEV__) {
      console.error('ActionButton requires either a label or an icon.');
    }

    return null;
  }

  if (!resolvedAccessibilityLabel) {
    if (__DEV__) {
      console.error('Icon-only ActionButton requires an accessibilityLabel.');
    }

    return null;
  }

  return (
    <Pressable
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [
        styles.content,
        contentStyle,
        style,
        pressed && !disabled ? { opacity: pressedOpacity } : null,
        disabled ? { opacity: disabledOpacity } : null,
      ]}
    >
      {icon ? <Ionicons color={iconColor} name={icon} size={iconSize} /> : null}
      {hasVisibleLabel ? (
        <Text
          adjustsFontSizeToFit={labelAdjustsFontSizeToFit}
          minimumFontScale={labelMinimumFontScale}
          numberOfLines={labelNumberOfLines}
          style={labelStyle}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});

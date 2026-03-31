import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { glassActionSurface } from '@/src/shared/styles/components';

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
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        { width: size, height: size, borderRadius: radius },
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.surface, { borderRadius: radius }]}>
        <Ionicons color={colors.textOnDark} name={icon} size={iconSize} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    overflow: 'hidden',
  },
  surface: {
    ...glassActionSurface,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.4,
  },
});

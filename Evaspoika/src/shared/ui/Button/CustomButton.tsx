import React from 'react';
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { spacing } from '@/src/shared/constants/spacing';
import { components } from '@/src/shared/styles/components';
import { ActionButton } from '@/src/shared/ui/Button/ActionButton';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export function CustomButton({
  label,
  onPress,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: Props) {
  return (
    <ActionButton
      accessibilityLabel={accessibilityLabel ?? label}
      contentStyle={components.primaryBtn}
      disabled={disabled}
      disabledOpacity={0.45}
      label={label}
      labelStyle={[components.primaryBtnText, textStyle]}
      onPress={onPress}
      pressedOpacity={0.8}
      style={[styles.button, style]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: spacing.sm,
  },
});

import React from 'react';
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { glassActionSurface } from '@/src/shared/styles/components';
import { ActionButton } from '@/src/shared/ui/Button/ActionButton';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function GlassNavButton({
  label,
  onPress,
  disabled = false,
  style,
  textStyle,
}: Props) {
  return (
    <ActionButton
      contentStyle={styles.button}
      disabled={disabled}
      disabledOpacity={0.1}
      label={label}
      labelStyle={[styles.label, textStyle]}
      onPress={onPress}
      pressedOpacity={0.9}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    ...glassActionSurface,
    borderRadius: 67,
    paddingVertical: spacing.xl,
    paddingHorizontal: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 48,
    fontWeight: '400',
    color: colors.textOnDark,
    textShadowColor: 'rgba(0,0,0,0.25)',
  },
});

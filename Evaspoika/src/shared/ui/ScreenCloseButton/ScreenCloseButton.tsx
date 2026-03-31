import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { closeCurrentScreen } from '@/src/shared/navigation/closeCurrentScreen';
import { GlassIconButton } from '@/src/shared/ui/GlassIconButton/GlassIconButton';

type ScreenCloseButtonProps = {
  accessibilityLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ScreenCloseButton({
  accessibilityLabel = 'Sulje',
  onPress,
  style,
}: ScreenCloseButtonProps) {
  return (
    <GlassIconButton
      accessibilityLabel={accessibilityLabel}
      icon="close"
      iconSize={24}
      onPress={onPress ?? closeCurrentScreen}
      size={52}
      style={style}
    />
  );
}

type ScreenCloseButtonRowProps = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ScreenCloseButtonRow({
  onPress,
  style,
}: ScreenCloseButtonRowProps) {
  return (
    <View style={[styles.row, style]}>
      <ScreenCloseButton onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-end',
  },
});

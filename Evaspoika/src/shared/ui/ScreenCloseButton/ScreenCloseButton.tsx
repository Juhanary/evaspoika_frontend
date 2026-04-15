import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { closeCurrentScreen } from '@/src/shared/navigation/closeCurrentScreen';
import { components } from '@/src/shared/styles/components';
import { Button } from '@/src/shared/ui/Button/ActionButton';

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
    <Button
      accessibilityLabel={accessibilityLabel}
      icon="close"
      iconSize={24}
      onPress={onPress ?? closeCurrentScreen}
      size={52}
      style={style}
      variant="glassIcon"
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
    <View style={[components.screenCloseRow, style]}>
      <ScreenCloseButton onPress={onPress} />
    </View>
  );
}

import React from 'react';
import {
  Pressable,
  Text,
  View,
  type Insets,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import { components, glassActionSurface } from '@/src/shared/styles/components';

type ButtonVariant = 'primary' | 'glass' | 'glassIcon' | 'glassNav';

type ButtonBaseProps = {
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
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
  size?: number; // for glassIcon
};

type ButtonWithLabelProps = ButtonBaseProps & {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  accessibilityLabel?: string;
};

type ButtonIconOnlyProps = ButtonBaseProps & {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label?: undefined;
  accessibilityLabel: string;
};

export type ButtonProps = ButtonWithLabelProps | ButtonIconOnlyProps;

export function Button({
  onPress,
  label,
  icon,
  variant = 'primary',
  size = 58,
  disabled = false,
  style,
  contentStyle,
  labelStyle,
  iconColor,
  iconSize,
  hitSlop,
  pressedOpacity,
  disabledOpacity = 0.45,
  labelAdjustsFontSizeToFit,
  labelMinimumFontScale,
  labelNumberOfLines,
  accessibilityLabel,
}: ButtonProps) {
  const hasVisibleLabel = label && label.trim().length > 0;

  const getDefaultContentStyle = () => {
    switch (variant) {
      case 'primary':
        return components.buttonPrimary;
      case 'glass':
        return [glassActionSurface];
      case 'glassIcon':
        return [{ backgroundColor: colors.darkCard, borderRadius: size / 2, width: size, height: size }];
      case 'glassNav':
        return components.buttonGlassNav;
      default:
        return components.buttonPrimary;
    }
  };

  const getDefaultLabelStyle = () => {
    switch (variant) {
      case 'primary':
        return components.buttonText;
      case 'glassNav':
        return components.buttonTextGlassNav;
      default:
        return components.buttonText;
    }
  };

  const getDefaultIconColor = () => {
    switch (variant) {
      case 'glassIcon':
      case 'glassNav':
        return colors.textOnDark;
      default:
        return iconColor;
    }
  };

  const getDefaultIconSize = () => {
    switch (variant) {
      case 'glassIcon':
        return 48;
      default:
        return iconSize;
    }
  };

  const getDefaultPressedOpacity = () => {
    switch (variant) {
      case 'glassIcon':
        return 0.9;
      case 'glassNav':
        return 0.9;
      default:
        return 0.8;
    }
  };

  const getDefaultDisabledOpacity = () => {
    switch (variant) {
      case 'glassIcon':
        return 0.85;
      case 'glassNav':
        return 0.2;
      default:
        return 0.6;
    }
  };

  const getDefaultNormalOpacity = () => {
    switch (variant) {
      case 'glassIcon':
        return 1.5;
      default:
        return 1.5;
    }
  };

  const getDefaultHitSlop = () => {
    switch (variant) {
      case 'glassIcon':
        return 8;
      default:
        return hitSlop;
    }
  };

  const getDefaultStyle = () => {
    switch (variant) {
      case 'glassIcon':
        return [{ overflow: 'hidden' as const, width: size, height: size }];
      default:
        return undefined;
    }
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      hitSlop={getDefaultHitSlop()}
      onPress={onPress}
      style={({ pressed }) => {
        let opacity: number | undefined;
        if (disabled) {
          opacity = disabledOpacity ?? getDefaultDisabledOpacity();
        } else if (pressed) {
          opacity = pressedOpacity ?? getDefaultPressedOpacity();
        } else {
          opacity = getDefaultNormalOpacity();
        }
        return [
          getDefaultStyle(),
          style,
          opacity !== undefined ? { opacity } : null,
        ];
      }}
    >
    
      <View style={[components.actionButtonContent, getDefaultContentStyle(), contentStyle]}>
        {icon ? (
          <Ionicons
            color={iconColor ?? getDefaultIconColor()}
            name={icon}
            size={iconSize ?? getDefaultIconSize()}
          />
        ) : null}
        {hasVisibleLabel ? (
          <Text
            adjustsFontSizeToFit={labelAdjustsFontSizeToFit}
            minimumFontScale={labelMinimumFontScale}
            numberOfLines={labelNumberOfLines}
            style={[getDefaultLabelStyle(), labelStyle]}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

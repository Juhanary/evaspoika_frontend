import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/constants/colors';
import {
  GLASS_CARD_BOTTOM_OFFSET,
  GLASS_CARD_TOP_OFFSET,
  glassModalStyles,
} from '@/src/shared/styles/glassModal';
import { AppModal } from '@/src/shared/ui/AppModal/AppModal';
import { GlassCard } from '@/src/shared/ui/GlassCard/GlassCard';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Full-height glass card positioned to line up exactly with the screen cards.
export function GlassModalCard({
  style,
  blurRadius = 24,
  children,
  ...props
}: React.ComponentProps<typeof GlassCard>) {
  const insets = useSafeAreaInsets();
  return (
    <GlassCard
      blurRadius={blurRadius}
      style={[
        glassModalStyles.card,
        { top: insets.top + GLASS_CARD_TOP_OFFSET, bottom: insets.bottom + GLASS_CARD_BOTTOM_OFFSET },
        style,
      ]}
      {...props}
    >
      {children}
    </GlassCard>
  );
}

// Shared modal header: leading icon, centered title (+ optional subtitle / extra), close button.
export function ModalHeader({
  icon,
  iconColor,
  title,
  subtitle,
  extra,
  onClose,
}: {
  icon: IoniconName;
  iconColor?: string;
  title: string;
  subtitle?: string | null;
  extra?: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <View style={glassModalStyles.header}>
      <Ionicons color={iconColor ?? colors.white} name={icon} size={26} />
      <View style={glassModalStyles.headerText}>
        <Text numberOfLines={1} style={glassModalStyles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={glassModalStyles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
        {extra}
      </View>
      <Pressable accessibilityLabel="Sulje" hitSlop={12} onPress={onClose}>
        <Ionicons color={colors.white} name="close" size={26} />
      </Pressable>
    </View>
  );
}

// Generic list row inside a glass modal: title (+ optional subtitle / meta) and,
// when pressable, a trailing chevron. Covers the customer / order / batch lists.
export function ModalRow({
  title,
  subtitle,
  meta,
  onPress,
  deleted,
}: {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  onPress?: () => void;
  deleted?: boolean;
}) {
  const body = (
    <>
      <View style={{ flex: 1 }}>
        <Text style={glassModalStyles.rowTitle}>{title}</Text>
        {subtitle ? (
          <Text numberOfLines={1} style={glassModalStyles.rowSubtitle}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? <Text style={glassModalStyles.rowMeta}>{meta}</Text> : null}
      </View>
      {onPress ? (
        <Ionicons color="rgba(255,255,255,0.45)" name="chevron-forward" size={18} />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={glassModalStyles.row}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        glassModalStyles.row,
        deleted && glassModalStyles.rowDeleted,
        pressed && { opacity: 0.7 },
      ]}
    >
      {body}
    </Pressable>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  icon: IoniconName;
  iconColor?: string;
  title: string;
  subtitle?: string | null;
  headerExtra?: React.ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
  useGestureHandler?: boolean;
  animationType?: 'fade' | 'slide' | 'none';
  children: React.ReactNode;
};

// One scaffold for every glass modal: backdrop + positioned card + header + divider.
// Pass the body (lists, tabs, etc.) as children.
export function GlassModal({
  visible,
  onClose,
  icon,
  iconColor,
  title,
  subtitle,
  headerExtra,
  cardStyle,
  useGestureHandler,
  animationType = 'fade',
  children,
}: Props) {
  return (
    <AppModal
      animationType={animationType}
      onClose={onClose}
      useGestureHandler={useGestureHandler}
      visible={visible}
    >
      <GlassModalCard style={cardStyle}>
        <ModalHeader
          extra={headerExtra}
          icon={icon}
          iconColor={iconColor}
          onClose={onClose}
          subtitle={subtitle}
          title={title}
        />
        <View style={glassModalStyles.divider} />
        {children}
      </GlassModalCard>
    </AppModal>
  );
}

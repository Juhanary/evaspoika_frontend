import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { radii } from '../constants/radii';

type Style = ViewStyle | TextStyle | ImageStyle;

// Base Design Tokens / Composable Parts
export const base = {
  row: { flexDirection: 'row', alignItems: 'center' } as ViewStyle,
  center: { alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  } as ViewStyle,
} as const;

// Button Factory
export type ButtonVariant = 'primary' | 'secondary' | 'confirm' | 'cancel' | 'glass' | 'nav';
export type Size = 'sm' | 'md' | 'lg' | 'xl';

export const button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
}: {
  variant?: ButtonVariant;
  size?: Size;
  disabled?: boolean;
} = {}): ViewStyle[] => {
  const styles: ViewStyle[] = [
    base.center,
    { borderRadius: radii.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  ];

  if (variant === 'primary' || variant === 'secondary') {
    styles.push({ backgroundColor: colors.darkCard });
  }

  if (variant === 'confirm') {
    styles.push({ backgroundColor: colors.darkCard, borderRadius: radii.lg, padding: spacing.lg });
  }

  if (variant === 'glass') {
    styles.push({ backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' });
  }

  if (variant === 'nav') {
    styles.push({
      backgroundColor: colors.darkCard,
      borderRadius: 67,
      paddingVertical: spacing.xl,
      paddingHorizontal: 46,
    });
  }

  if (size === 'sm') styles.push({ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm });
  if (size === 'lg') styles.push({ paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl });

  if (disabled) styles.push({ opacity: 0.4 });

  return styles;
};

// Text Factory
export type TextVariant = 'body' | 'label' | 'title' | 'header' | 'button' | 'muted';
export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export const text = ({
  variant = 'body',
  weight = 'regular',
  size,
  color,
}: {
  variant?: TextVariant;
  weight?: FontWeight;
  size?: keyof typeof typography.sizes;
  color?: string;
} = {}): TextStyle[] => {
  const styles: TextStyle[] = [
    {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      fontWeight: typography.weights[weight],
    },
  ];

  if (variant === 'title') styles.push({ fontSize: typography.sizes['4xl'], color: colors.textOnDark });
  if (variant === 'header') styles.push({ fontSize: typography.sizes['5xl'], color: colors.textOnDark, fontWeight: '700' });
  if (variant === 'button') styles.push({ fontSize: typography.sizes.xl, color: colors.textOnDark, fontWeight: '700' });
  if (variant === 'muted') styles.push({ color: colors.textOnDarkMuted });
  if (variant === 'label') styles.push({ fontWeight: '700', letterSpacing: 2, fontSize: 11 });

  if (size) styles.push({ fontSize: typography.sizes[size] });
  if (color) styles.push({ color });

  return styles;
};

// Container / Layout Factory
export const container = ({
  variant = 'screen',
  gap,
}: {
  variant?: 'screen' | 'card' | 'row' | 'center' | 'section' | 'modal';
  gap?: keyof typeof spacing;
} = {}): ViewStyle[] => {
  const styles: ViewStyle[] = [];

  if (variant === 'screen') styles.push({ flex: 1, padding: spacing.xl });
  if (variant === 'card') styles.push(base.card);
  if (variant === 'row') styles.push(base.row);
  if (variant === 'center') styles.push(base.center);
  if (variant === 'section') styles.push({ marginBottom: spacing.lg });
  if (variant === 'modal') styles.push({
    backgroundColor: colors.white,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    padding: spacing.xl,
  });

  if (gap) styles.push({ gap: spacing[gap] });

  return styles;
};

// Input Factory
export const input = ({
  variant = 'default',
}: {
  variant?: 'default' | 'search' | 'flat';
} = {}): ViewStyle[] => {
  const styles: ViewStyle[] = [{
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
  }];

  if (variant === 'search') {
    styles.push({
      borderRadius: radii.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: 12,
      backgroundColor: 'rgba(255,255,255,0.96)',
    });
  }

  return styles;
};

import { ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { base, text } from './styleFactory';

// ===========================================================================
// Dark theme rows / labels.
// ===========================================================================
export const dark = {
  screen: {
    flex: 1,
    backgroundColor: colors.darkBg,
  } as ViewStyle,

  sectionLabel: [
    ...text({ size: 'xs', weight: 'semibold', color: colors.textOnDarkMuted }),
    { letterSpacing: 2, marginBottom: spacing.md, marginLeft: spacing.md, marginTop: spacing.lg , marginRight: spacing.md},
  ] as TextStyle[],

  row: [
    base.row,
    {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.07)',
    },
  ] as ViewStyle[],

  rowTitle: [
    ...text({ size: 'xl', weight: 'semibold', color: colors.textOnDark }),
    { fontSize: 18 },
  ] as TextStyle[],

  rowSub: [
    ...text({ size: 'sm', color: colors.textOnDarkMuted }),
    { fontSize: 14, marginTop: spacing.xs / 2 },
  ] as TextStyle[],

  muted: [
    ...text({ size: 'md', color: colors.muted }),
    { paddingVertical: spacing.xs },
  ] as TextStyle[],

  pressed: {
    opacity: 0.7,
  } as ViewStyle,
} as const;

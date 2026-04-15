import { ViewStyle, TextStyle } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { text, base } from './factory';

export const dark = {
  screen: {
    flex: 1,
    backgroundColor: colors.darkBg,
  } as ViewStyle,
  
  sectionLabel: [
    ...text({ size: 'xs', weight: 'semibold', color: colors.textOnDarkMuted }),
    { letterSpacing: 2, marginBottom: spacing.xs },
  ] as TextStyle[],

  row: [
    base.row,
    {
      paddingVertical: spacing.sm + 2,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.07)',
    },
  ] as ViewStyle[],

  rowTitle: text({ size: 'xl', weight: 'semibold', color: colors.textOnDark }),
  
  rowSub: [
    ...text({ size: 'sm', color: colors.textOnDarkMuted }),
    { marginTop: spacing.xs / 2 },
  ] as TextStyle[],

  muted: [
    ...text({ size: 'md', color: colors.muted }),
    { paddingVertical: spacing.xs },
  ] as TextStyle[],

  pressed: {
    opacity: 0.7,
  } as ViewStyle,
} as const;

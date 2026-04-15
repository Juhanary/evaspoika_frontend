import { ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { container, text, base } from './factory';

export const layout = {
  screen: container({ variant: 'screen' }),
  center: container({ variant: 'center' }),
  section: container({ variant: 'section' }),
  
  title: text({
    variant: 'title',
    weight: 'semibold',
    size: '4xl',
  }),

  screenTitle: text({
    variant: 'header',
    weight: 'bold',
    size: '5xl',
  }),

  listItem: [
    {
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.07)',
    },
  ] as ViewStyle[],

  listItemTitle: text({
    size: 'xl',
    color: colors.textOnDark,
  }),

  listItemSubtitle: text({
    size: 'md',
    color: colors.textOnDarkMuted,
  }),

  pressed: { opacity: 0.6 } as ViewStyle,
  disabled: { opacity: 0.4 } as ViewStyle,
  
  row: [
    base.row,
    {
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.07)',
    },
  ] as ViewStyle[],
} as const;

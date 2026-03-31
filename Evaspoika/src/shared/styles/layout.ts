import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.xl,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.semibold,
    color: colors.textOnDark,
    marginBottom: spacing.md,
  },
  screenTitle: {
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    color: colors.textOnDark,
    marginBottom: spacing.md,
  },
  listItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  listItemTitle: {
    fontSize: typography.sizes.xl,
    color: colors.textOnDark,
  },
  listItemSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textOnDarkMuted,
  },
  listItemPressed: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
});

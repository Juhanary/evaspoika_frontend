import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

export const dark = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textOnDarkMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  row: {
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  rowTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textOnDark,
  },
  rowSub: {
    fontSize: typography.sizes.sm,
    color: colors.textOnDarkMuted,
    marginTop: spacing.xs / 2,
  },
  muted: {
    color: colors.muted,
    fontSize: typography.sizes.md,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});

import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';

export const layout = StyleSheet.create({
  // Containers
  screen: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  screenCompact: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },

  // Titles
  title: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  screenTitle: {
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },

  // List items
  listItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemTitle: {
    fontSize: typography.sizes.xl,
    color: colors.text,
  },
  listItemSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.muted,
  },

  // Press states
  listItemPressed: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
});

import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';

export const errorBoundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['4xl'],
    fontFamily: 'Montserrat_600SemiBold',
    color: colors.textDark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.base,
    fontFamily: 'Montserrat_400Regular',
    color: colors.muted,
    textAlign: 'center',
  },
  detail: {
    marginTop: spacing.xl,
    fontSize: typography.sizes.sm,
    fontFamily: 'Montserrat_400Regular',
    color: colors.danger,
    textAlign: 'center',
  },
});

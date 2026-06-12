import { Platform, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';

export const glassModalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.lg,
    bottom: spacing.lg,
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
    opacity: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 32,
    color: colors.white,
    ...Platform.select({
      web: { textShadow: '0px 1px 4px rgba(0,0,0,0.38)' } as object,
      default: { textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 1 },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});

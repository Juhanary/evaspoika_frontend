import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { glassActionSurface } from './components';

export const productStyles = StyleSheet.create({
  // --- Weighing / product list rows ---
  productRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.surfaceMid,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  productName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textOnDark,
    flex: 1,
  },
  productEan: {
    fontSize: typography.sizes.md,
    color: colors.textOnDarkMuted,
  },
  newProductRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  newProductRowText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },

  // --- Weighing card ---
  weighingCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMid,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  selectedName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.successDark,
  },
  batchStatus: {
    fontSize: typography.sizes.md,
    color: colors.successMid,
    marginTop: spacing.xs / 2,
  },

  // --- Weighing inputs ---
  nameInput: {
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.sm,
    fontSize: typography.sizes.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.xs,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.sm,
    fontSize: typography.sizes.base,
    backgroundColor: colors.white,
  },
  changeBtn: {
    ...glassActionSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
  },
  changeBtnText: {
    color: colors.textOnDark,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.md,
  },
  eanRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  eanLabel: {
    fontSize: typography.sizes.md,
    color: colors.muted,
    width: 40,
  },
  eanInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.xs + 2,
    fontSize: typography.sizes.md,
    backgroundColor: colors.white,
    color: colors.textSecondary,
  },
  batchesRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  weightRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes['3xl'],
    backgroundColor: colors.white,
  },
  weighBtn: {
    ...glassActionSurface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  weighBtnText: {
    color: colors.textOnDark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xl,
  },

  // --- Batch event rows (WeighingScreen) ---
  eventsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textOnDark,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  eventRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  eventLeft: {
    flex: 1,
  },
  eventCode: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textOnDark,
  },
  eventDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textOnDarkMuted,
    marginTop: spacing.xs / 2,
  },
  eventRight: {
    alignItems: 'flex-end' as const,
  },
  eventWeight: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textOnDark,
  },
  eventDate: {
    fontSize: typography.sizes.xs,
    color: colors.textOnDarkMuted,
    marginTop: spacing.xs / 2,
  },

  // --- Inventory pill row (ProductListScreen) ---
  invPillRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 8,
  },
  invPillLeft: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: '#E4E4E4',
    borderRadius: 33,
    paddingHorizontal: 20,
    paddingVertical: 18,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
  },
  invPillLeftExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  invPillLeftText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 22,
    color: 'rgba(0,0,0,0.82)',
    flex: 0.7,
    marginRight: 8,
  },
  invPillRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 200,
  },
  invPillCount: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 22,
    color: 'rgba(255,255,255,0.82)',
    flex: 1,
    textAlign: 'center' as const,
  },
  invPillDivider: {
    width: 2,
    height: 28,
    backgroundColor: 'rgba(255,255,255,255.7)',
    marginHorizontal: 6,
  },
  invPillWeight: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 18,
    color: 'rgba(255,255,255,0.82)',
    flex: 1,
    textAlign: 'center' as const,
  },

  // --- Inventory dropdown (ProductListScreen) ---
  invDropdown: {
    backgroundColor: '#E4E4E4',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 20,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.18)',
  },
  invDropdownRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
  },
  invDropdownLabel: {
    fontFamily: 'Montserrat_300Light',
    fontSize: 20,
    color: 'rgba(0,0,0,0.74)',
    flex: 1,
  },
  invDropdownLabelYhteensa: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    color: 'rgba(0,0,0,0.74)',
    textAlign: 'right' as const,
    flex: 1,
    paddingRight: 18,
  },
  invDropdownWeight: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    color: 'rgba(0,0,0,0.74)',
  },
  invDropdownDivider: { height: 2, backgroundColor: 'rgba(0,0,0,0.74)' },
  invDropdownBtn: {
    marginVertical: 12,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 32,
    flex: 0.2,
    maxWidth: 220,
    ...glassActionSurface,
  },
  invDropdownBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    color: colors.textSecondary,
  },
});

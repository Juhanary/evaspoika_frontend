import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { glassActionSurface } from './styleFactory';

// configModalTitleOverride and searchFilterInput are verbatim-identical
// (confirmed by a value-level before/after diff) — shared so they stay
// identical by construction.
const flexNoMarginBottom = { flex: 1, marginBottom: 0 };

// ===========================================================================
// ProductListScreen styles.
// ===========================================================================
export const productStyles = StyleSheet.create({
  // --- ProductListScreen drag-handle ---
  dragHandle: { paddingHorizontal: 6, paddingVertical: 4, justifyContent: 'center' as const },
  dragDropLine: { height: 4, borderRadius: 1, backgroundColor: colors.danger, marginVertical: 1 },
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
    fontFamily: typography.families.semibold,
    fontSize: 18,
    color: colors.textSecondary,
  },

  // --- ProductListScreen section label ---
  sectionLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
    flex: 1,
  },
  sectionLabelText: {
    fontFamily: typography.families.bold,
    fontSize: typography.sizes.xl,
    color: 'rgba(240, 228, 228, 0.82)',
    letterSpacing: 1.2,
  },
  sectionLabelRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginLeft: spacing.sm,
  },

  // --- ProductListScreen product code warning ---
  productCodeWarningText: {
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.xs,
    color: 'rgba(220,60,0,0.9)' as const,
    textAlign: 'center' as const,
    marginTop: spacing.xs + 2,
  },

  // --- ProductListScreen Netvisor warning ---
  netvisorWarningText: {
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.xs,
    color: colors.warning,
    textAlign: 'center' as const,
    marginTop: spacing.xs + 2,
  },

  // --- ProductConfigModal section label ---
  configModalSectionLabel: {
    fontSize: 11,
    fontFamily: typography.families.bold,
    color: 'rgba(0,0,0,0.35)' as const,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  configModalPluRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 6,
  },
  configModalPluInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)' as const,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 15,
    fontFamily: typography.families.medium,
    color: 'rgba(0,0,0,0.8)' as const,
    backgroundColor: 'rgba(0,0,0,0.04)' as const,
  },
  configModalPluSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(37,99,235,0.85)' as const,
  },
  configModalPluSaveBtnSuccess: {
    backgroundColor: 'rgba(22,163,74,0.85)' as const,
  },
  configModalPluSaveBtnText: {
    fontFamily: typography.families.semibold,
    fontSize: 13,
    color: colors.white,
  },
  configModalSavedText: {
    fontFamily: typography.families.medium,
    fontSize: 12,
    color: 'rgba(22,163,74,0.9)' as const,
    marginTop: 6,
    marginBottom: 2,
  },
  configModalPluCurrent: {
    fontSize: 13,
    fontFamily: typography.families.regular,
    color: 'rgba(0,0,0,0.45)' as const,
    marginBottom: 4,
  },

  invPillPlu: {
    fontSize: 12,
    fontFamily: typography.families.regular,
    color: 'rgba(0,0,0,0.38)' as const,
    marginTop: 1,
  },

  // --- ProductListScreen pill row overrides ---
  invIconTrailingGap: { marginRight: 4 },
  invWarnIconGap: { marginRight: 2 },
  invBatchScrollView: { maxHeight: 200 },
  invDropdownBoxCountText: { minWidth: 48, textAlign: 'right' as const },
  invDropdownBatchWeightText: { minWidth: 80, textAlign: 'right' as const },

  // --- ProductListScreen list layout ---
  invListContent: { paddingBottom: 8 },
  addBoxPickerScroll: { maxHeight: 300 },

  // --- ProductListScreen favorites section ---
  favSectionWrap: { marginBottom: 10 },
  favItemSeparator: { height: 12 },
  favSectionBottomDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)' as const,
    marginTop: 14,
    marginHorizontal: 4,
  },

  // --- ProductConfigModal ---
  configModalHeaderRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 14,
  },
  configModalTitleOverride: flexNoMarginBottom,
  configModalFavRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
  },
  configModalFavText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: typography.families.semibold,
    color: 'rgba(0,0,0,0.65)' as const,
  },
  configModalDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 10,
  },
  configModalCatRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  configModalCatNoneText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: typography.families.regular,
    color: 'rgba(0,0,0,0.55)' as const,
  },
  configModalCatName: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: typography.families.medium,
    color: 'rgba(0,0,0,0.8)' as const,
  },
  configModalCloseBtnMargin: { marginTop: 14 },

  // --- Search + filter row (ProductListScreen) ---
  searchFilterRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 8,
  },
  searchFilterInput: flexNoMarginBottom,
  filterBtn: {
    width: 56,
    height: 56,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(37,99,235,0.85)',
    borderColor: 'rgba(37,99,235,0.9)',
  },

  // --- Filter dropdown (ProductListScreen) ---
  filterDropdownCard: {
    position: 'absolute' as const,
    right: 16,
    minWidth: 220,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    elevation: 10,
    boxShadow: '0px 4px 16px rgba(0,0,0,0.18)',
    paddingVertical: 6,
  },
  filterDropdownItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterDropdownItemText: {
    fontFamily: typography.families.medium,
    fontSize: 15,
    color: 'rgba(0,0,0,0.7)' as const,
  },
  filterDropdownItemSelected: {
    fontFamily: typography.families.bold,
    color: 'rgba(0,0,0,0.9)' as const,
  },
  filterDropdownDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 12,
    marginVertical: 4,
  },
  // --- Hidden products modal ---
  hiddenModalScroll: { maxHeight: 320 },
  hiddenModalRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)' as const,
  },
  hiddenModalRowText: {
    fontFamily: typography.families.medium,
    fontSize: 15,
    color: 'rgba(0,0,0,0.75)' as const,
  },
});

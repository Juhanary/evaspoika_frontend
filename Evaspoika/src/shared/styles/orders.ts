import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { glassActionSurface } from './styleFactory';

// ProductListScreen and BatchListScreen styles used to live in this file too
// (as productStyles/batchStyles). They now live in their own files —
// re-exported below so `import { productStyles } from '.../orders'` etc.
// keeps working unchanged.
export * from './products';
export * from './batches';

// A few pairs of styles below were verbatim-identical (confirmed by a
// value-level before/after diff) — shared here so they stay identical by
// construction instead of by coincidence.
const scanActionBtn = {
  ...glassActionSurface,
  alignSelf: 'center' as const,
  borderRadius: 81,
  paddingVertical: 16,
  paddingHorizontal: 52,
  marginTop: 4,
};
const sectionSpacing = {
  marginTop: spacing.sm,
  marginBottom: spacing.md,
};
const darkThinInputText = {
  flex: 1,
  fontFamily: typography.families.regular,
  fontSize: 18,
  color: 'rgba(0,0,0,0.74)',
};

export const orderStyles = StyleSheet.create({
  // --- Order list rows ---
  orderRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  orderRowTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textOnDark,
  },
  orderRowSub: {
    fontSize: typography.sizes.md,
    color: colors.textOnDarkMuted,
    marginTop: spacing.xs / 2,
  },

  // --- Order list header actions ---
  actions: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 36,
  },
  actionButtonText: {
    fontFamily: typography.families.medium,
    fontSize: 24,
    color: colors.textOnDark,
  },

  // --- Order create screen ---
  customerRow: {
    borderRadius: 24,
    paddingHorizontal: spacing.md,
  },
  customerRowSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  selectedText: {
    color: colors.successText,
  },

  // --- Order detail layout ---
  customerName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textOnDark,
    marginBottom: spacing.sm,
  },
  contentPadded: {
    paddingBottom: spacing.xl,
  },
  metaBlock: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  netvisorSection: sectionSpacing,
  linesSection: sectionSpacing,
  form: {
    marginTop: spacing.md,
  },
  scanBtn: {
    ...glassActionSurface,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center' as const,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  scanBtnText: {
    color: colors.textOnDark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.lg,
  },
  lineProduct: {
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs / 2,
  },
  lineBatch: {
    color: colors.muted,
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs / 2,
  },
  lineDetail: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },

  // --- Order detail main (od*) ---
  odScroll: { flex: 1 },
  odScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  odCustomerPill: {
    alignSelf: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(217,217,217,0.2)',
    borderRadius: 66,
    paddingVertical: 13,
    paddingHorizontal: 48,
    gap: 2,
  },
  odCustomerPillText: {
    fontFamily: typography.families.medium,
    fontSize: 28,
    color: colors.offWhite,
  },
  odDateText: {
    fontFamily: typography.families.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  odTableRowDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  odTableEmptyText: {
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: 'rgba(0,0,0,0.45)',
    textAlign: 'center' as const,
    paddingVertical: 16,
  },
  odProductCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 33,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
  },
  odProductCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  odProductCardName: {
    fontFamily: typography.families.medium,
    fontSize: 22,
    color: 'rgba(0,0,0,0.82)',
    flex: 1,
  },
  odBatchRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 9,
    paddingLeft: 8,
  },
  odBatchRowLabel: {
    fontFamily: typography.families.light,
    fontSize: 20,
    color: 'rgba(0,0,0,0.74)',
    flex: 1,
  },
  odBatchRowWeight: {
    fontFamily: typography.families.regular,
    fontSize: 20,
    color: 'rgba(0,0,0,0.74)',
  },
  odProductCardTotalDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 4,
    marginBottom: 2,
  },
  odProductCardTotalRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    paddingLeft: 8,
  },
  odProductCardTotalLabel: {
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: 'rgba(0,0,0,0.45)',
    flex: 1,
  },
  odProductCardTotalWeight: {
    fontFamily: typography.families.semibold,
    fontSize: 22,
    color: 'rgba(0,0,0,0.82)',
  },
  odBatchSubLabel: {
    fontFamily: typography.families.light,
    fontSize: 15,
    color: 'rgba(0,0,0,0.5)',
    paddingLeft: 8,
    paddingTop: 6,
    paddingBottom: 2,
  },
  odLineRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 5,
    paddingLeft: 16,
  },
  odLineWeight: darkThinInputText,
  odLineDeleteBtn: {
    padding: 6,
  },
  odSkannaaBtn: scanActionBtn,
  odVirtualScanBtn: scanActionBtn,
  odVirtualScanBtnText: {
    fontFamily: typography.families.regular,
    fontSize: 24,
    color: colors.textOnDark,
  },
  odFooterButtons: {
    flexDirection: 'row' as const,
    gap: spacing.md,
  },
  odDeleteBtn: {
    flex: 1,
    borderRadius: 81,
    paddingVertical: 14,
    alignItems: 'center' as const,
    backgroundColor: colors.deleteRed,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.20)',
  },
  odDeleteBtnText: {
    fontFamily: typography.families.semibold,
    fontSize: 20,
    color: colors.white,
  },
  odFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  odLahetaBtn: {
    borderRadius: 81,
    paddingVertical: 14,
    alignItems: 'center' as const,
    backgroundColor: colors.actionGreen,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.20)',
  },
  odLahetaBtnText: {
    fontFamily: typography.families.semibold,
    fontSize: 28,
    color: 'rgba(0,0,0,0.82)',
  },

  // --- Order list status labels ---
  statusWarningText: {
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.xs,
    color: colors.warning,
    marginTop: spacing.xs / 2,
  },

  // --- Scan modal (sm*) ---
  smOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  smShell: {
    ...glassActionSurface,
    flex: 1,
    minHeight: 0,
    maxHeight: '92%',
    borderRadius: 44,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  smTopRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  smCustomerPill: {
    flex: 1,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(217,217,217,0.22)',
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',

  },
  smCustomerPillText: {
    fontFamily: typography.families.regular,
    fontSize: 20,
    color: colors.textOnDark,
  },
  smPanel: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'rgba(245,245,245,1.0)',
    borderRadius: 42,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    boxShadow: '0px 4px 18px rgba(0,0,0,0.18)',
  },
  smScanFieldRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  smScanFieldInput: darkThinInputText,
  smTableHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  smTableHeaderText: {
    fontFamily: typography.families.regular,
    fontSize: 11,
    color: 'rgba(0,0,0,0.46)',
  },
  smTableList: {
    flex: 1,
  },
  smTableRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  smTableRowText: {
    fontFamily: typography.families.regular,
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
  },
  smTableDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  smDeleteCell: {
    width: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  smProductCell: {
    flex: 1.8,
  },
  smBatchCell: {
    flex: 1.3,
    alignItems: 'center' as const,
  },
  smWeightCell: {
    width: 82,
    textAlign: 'right' as const,
  },
  smBatchSelectBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.xs,
  },
  smBatchSelectText: {
    fontFamily: typography.families.semibold,
    fontSize: 17,
    color: 'rgba(0,0,0,0.82)',
  },
  smBatchSelectPlaceholder: {
    color: 'rgba(0,0,0,0.6)',
  },
  smWeightInput: {
    width: 82,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.white,
    fontFamily: typography.families.regular,
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
    textAlign: 'center' as const,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  smScanningText: {
    textAlign: 'center' as const,
    color: 'rgba(0,0,0,0.52)',
    fontSize: typography.sizes.base,
    marginBottom: spacing.sm,
  },
  smScanEmpty: {
    textAlign: 'center' as const,
    color: 'rgba(0,0,0,0.48)',
    fontSize: typography.sizes.md,
    padding: spacing.xl,
  },
  smFooterRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  smScanTotal: {
    flex: 1,
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: 'rgba(0,0,0,0.62)',
  },
  smSavePill: {
    backgroundColor: colors.actionGreen,
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.20)',
  },
  smSaveBtnDisabled: { opacity: 0.4 },
  smSavePillText: {
    fontFamily: typography.families.semibold,
    color: 'rgba(0,0,0,0.84)',
    fontSize: 18,
  },

  // --- Virtual scan modal (smVirtual*) ---
  smVirtualTitle: {
    fontFamily: typography.families.medium,
    fontSize: 24,
    color: 'rgba(0,0,0,0.82)',
    textAlign: 'center' as const,
    marginBottom: spacing.lg,
  },
  smVirtualScroll: {
    flex: 1,
    minHeight: 0,
  },
  smVirtualScrollContent: {
    paddingBottom: spacing.sm,
  },
  smVirtualField: {
    marginBottom: spacing.lg,
  },
  smVirtualFieldLabel: {
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: 'rgba(0,0,0,0.62)',
    marginBottom: spacing.sm,
  },
  smVirtualPicker: {
    flexGrow: 0,
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    overflow: 'hidden' as const,
  },
  smVirtualPickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  smVirtualPickerSelected: {
    backgroundColor: 'rgba(57, 245, 106, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: colors.actionGreen,
  },
  smVirtualPickerText: {
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: 'rgba(0,0,0,0.82)',
  },
  smVirtualPickerSubText: {
    fontFamily: typography.families.light,
    fontSize: 14,
    color: 'rgba(0,0,0,0.52)',
    marginTop: 2,
  },
  smVirtualWeightInput: {
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    fontFamily: typography.families.regular,
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  batchPickerScroll: { maxHeight: 300 },

  smHiddenEanInput: {
    position: 'absolute' as const,
    width: 1,
    height: 1,
    opacity: 0,
  },
  smScanStatusBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(57, 245, 106, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(57, 245, 106, 0.28)',
  },
  smScanStatusBarScanning: {
    backgroundColor: colors.white,
    borderColor: 'rgba(0,0,0,0.10)',
  },
  smScanStatusBarText: {
    flex: 1,
    fontFamily: typography.families.regular,
    fontSize: 18,
    color: 'rgba(30, 140, 60, 0.9)',
  },
  smScanStatusBarTextScanning: {
    color: 'rgba(0,0,0,0.42)',
  },
});

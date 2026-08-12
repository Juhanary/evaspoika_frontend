import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { glassActionSurface } from './components';

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
    fontFamily: 'Montserrat_500Medium',
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
  netvisorSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  linesSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
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
    fontFamily: 'Montserrat_500Medium',
    fontSize: 28,
    color: colors.offWhite,
  },
  odDateText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  odTableRowDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  odTableEmptyText: {
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_500Medium',
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
    fontFamily: 'Montserrat_300Light',
    fontSize: 20,
    color: 'rgba(0,0,0,0.74)',
    flex: 1,
  },
  odBatchRowWeight: {
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(0,0,0,0.45)',
    flex: 1,
  },
  odProductCardTotalWeight: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    color: 'rgba(0,0,0,0.82)',
  },
  odBatchSubLabel: {
    fontFamily: 'Montserrat_300Light',
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
  odLineWeight: {
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: 'rgba(0,0,0,0.74)',
  },
  odLineDeleteBtn: {
    padding: 6,
  },
  odSkannaaBtn: {
    ...glassActionSurface,
    alignSelf: 'center' as const,
    borderRadius: 81,
    paddingVertical: 16,
    paddingHorizontal: 52,
    marginTop: 4,
  },
  odVirtualScanBtn: {
    ...glassActionSurface,
    alignSelf: 'center' as const,
    borderRadius: 81,
    paddingVertical: 16,
    paddingHorizontal: 52,
    marginTop: 4,
  },
  odVirtualScanBtnText: {
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_600SemiBold',
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
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 28,
    color: 'rgba(0,0,0,0.82)',
  },

  // --- Order list status labels ---
  statusWarningText: {
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_400Regular',
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
  smScanFieldInput: {
    flex: 1,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: 'rgba(0,0,0,0.74)',
  },
  smTableHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  smTableHeaderText: {
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_600SemiBold',
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
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_600SemiBold',
    color: 'rgba(0,0,0,0.84)',
    fontSize: 18,
  },

  // --- Virtual scan modal (smVirtual*) ---
  smVirtualTitle: {
    fontFamily: 'Montserrat_500Medium',
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
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(0,0,0,0.82)',
  },
  smVirtualPickerSubText: {
    fontFamily: 'Montserrat_300Light',
    fontSize: 14,
    color: 'rgba(0,0,0,0.52)',
    marginTop: 2,
  },
  smVirtualWeightInput: {
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: 'rgba(30, 140, 60, 0.9)',
  },
  smScanStatusBarTextScanning: {
    color: 'rgba(0,0,0,0.42)',
  },
});

// ===========================================================================
// ProductListScreen styles. Was products.ts.
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
    fontFamily: 'Montserrat_600SemiBold',
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
    fontFamily: 'Montserrat_700Bold',
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
    fontFamily: 'Montserrat_400Regular',
    fontSize: typography.sizes.xs,
    color: 'rgba(220,60,0,0.9)' as const,
    textAlign: 'center' as const,
    marginTop: spacing.xs + 2,
  },

  // --- ProductListScreen Netvisor warning ---
  netvisorWarningText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: typography.sizes.xs,
    color: colors.warning,
    textAlign: 'center' as const,
    marginTop: spacing.xs + 2,
  },

  // --- ProductConfigModal section label ---
  configModalSectionLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
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
    fontFamily: 'Montserrat_500Medium',
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
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: colors.white,
  },
  configModalSavedText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: 'rgba(22,163,74,0.9)' as const,
    marginTop: 6,
    marginBottom: 2,
  },
  configModalPluCurrent: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(0,0,0,0.45)' as const,
    marginBottom: 4,
  },

  invPillPlu: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
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
  configModalTitleOverride: { flex: 1, marginBottom: 0 },
  configModalFavRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
  },
  configModalFavText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
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
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(0,0,0,0.55)' as const,
  },
  configModalCatName: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
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
  searchFilterInput: {
    flex: 1,
    marginBottom: 0,
  },
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
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15,
    color: 'rgba(0,0,0,0.7)' as const,
  },
  filterDropdownItemSelected: {
    fontFamily: 'Montserrat_700Bold',
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
    fontFamily: 'Montserrat_500Medium',
    fontSize: 15,
    color: 'rgba(0,0,0,0.75)' as const,
  },
});

// ===========================================================================
// BatchListScreen styles. Was batches.ts.
// ===========================================================================
export const batchStyles = StyleSheet.create({
  blColHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 30,
    color: '#E5E5E5',
    fontWeight: '500' as const,
  },
  blRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  blDateText: { flex: 1, fontSize: 25, color: '#E5E5E5' },
  blWarnIcon: { marginRight: 6 },
  blBtnGroup: { flexDirection: 'row' as const, gap: 8, marginRight: 12 },
  blAdjBtn: {
    ...glassActionSurface,
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  blWeightText: {
    fontSize: 25,
    fontWeight: '500' as const,
    color: colors.white,
    width: 140,
    textAlign: 'right' as const,
  },
  blEmpty: { padding: 16, color: '#888', textAlign: 'center' as const },
  blFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  blValmisBtn: {
    ...glassActionSurface,
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  blValmisBtnText: {
    color: colors.textOnDark,
    fontWeight: '700' as const,
    fontSize: 25,
  },
  blTotalText: { fontSize: 14, fontWeight: '700' as const, color: colors.text, letterSpacing: 0.5 },
  blTotalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blTotalLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 26,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  blTotalValue: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 26,
    color: colors.white,
  },
  // --- Weight adjustment modal ---
  blAdjOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  blAdjCard: {
    maxWidth: 400,
    minWidth: 400,
    maxHeight: '90%' as `${number}%`,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    gap: spacing.md,
  },
  blAdjTitle: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    color: 'rgba(0,0,0,0.82)',
    marginBottom: 4,
  },
  blAdjCurrentWeight: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    color: 'rgba(0,0,0,0.5)',
  },
  blAdjInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
    backgroundColor: '#F5F5F5',
  },
  blAdjBtnRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: 4,
  },
  blAdjCancelBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.18)',
  },
  blAdjCancelBtnText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 17,
    color: 'rgba(0,0,0,0.6)',
  },
  blAdjSaveBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center' as const,
    backgroundColor: colors.actionGreen,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
  },
  blAdjSaveBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: 'rgba(0,0,0,0.82)',
  },
});

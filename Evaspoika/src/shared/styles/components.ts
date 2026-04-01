import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';

export const glassActionSurface = {
  backgroundColor: colors.darkCard,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
} as const;

export const components = StyleSheet.create({
  // --- Inputs ---
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    fontSize: typography.sizes.xl,
  },
  // --- Cards ---
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    backgroundColor: colors.surface,
  },
  cardSuccess: {
    backgroundColor: colors.successLight,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },

  // --- Chips ---
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderMid,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.accentDark,
    borderColor: colors.accentDark,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },

  // --- Buttons ---
  primaryBtn: {
    ...glassActionSurface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.textOnDark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xl,
  },
  confirmBtn: {
    ...glassActionSurface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.textOnDark,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  dangerText: {
    color: colors.dangerMid,
    fontSize: typography.sizes['3xl'],
    paddingHorizontal: spacing.sm,
  },

  // --- Meta rows (label + value) ---
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  metaLabel: {
    fontWeight: typography.weights.semibold,
  },
  metaValue: {
    color: colors.textSubtle,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },

  // --- Section headers ---
  sectionHeader: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.textOnDark,
  },

  // --- Text helpers ---
  mutedText: {
    color: colors.textOnDarkMuted,
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textOnDarkMuted,
    marginTop: spacing.xl,
  },
  errorText: {
    color: colors.dangerDark,
  },
  helperText: {
    color: colors.textSubtle,
  },
  updatedText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  countText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginBottom: spacing.xs + 2,
  },

  // --- Code / payload blocks ---
  codeBlock: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.textDark,
  },
  codeText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
  },

  // --- Footer (bottom action bar) ---
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    padding: spacing.xl,
    maxHeight: '70%',
  },
  modalTitle: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes['2xl'],
    marginBottom: spacing.md,
  },
  modalEmpty: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  modalRow: {
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  modalRowText: {
    fontSize: typography.sizes.lg,
    color: colors.textDark,
  },
  modalRowSubText: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSubtle,
  },
  modalCancelBtn: {
    ...glassActionSurface,
    marginTop: spacing.md,
    padding: spacing.md + 2,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  modalCancelText: {
    color: colors.textOnDark,
    fontWeight: typography.weights.semibold,
  },

  // --- Order rows ---
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
  customerName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textOnDark,
    marginBottom: spacing.sm,
  },
  listFlex: {
    flex: 1,
  },
  btnRow: {
    marginBottom: spacing.sm,
  },

  // --- Order detail ---
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

  // --- Weighing screen ---
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
  batchChip: {
    backgroundColor: colors.surfaceMid,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  batchChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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

  // --- Product inventory pill row (ProductListScreen) ---
  invPillRow: {
    flexDirection: 'row' as const,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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
    backgroundColor: '#E4E4E4',
    borderRadius: 33,
    paddingHorizontal: 14,
    paddingVertical: 18,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  invPillCount: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 22,
    color: 'rgba(0,0,0,0.82)',
    flex: 1,
    textAlign: 'center' as const,
  },
  invPillDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.7)',
    marginHorizontal: 6,
  },
  invPillWeight: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
    flex: 1,
    textAlign: 'center' as const,
  },

  // --- Order detail main screen ---
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
    color: '#EDEDED',
  },
  odDateText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  odTableSection: { gap: 6 },
  odTableHeaders: {
    flexDirection: 'row' as const,
    paddingHorizontal: 12,
  },
  odTableHeaderText: {
    fontFamily: 'Montserrat_300Light',
    fontSize: 16,
    color: '#FFFFFF',
  },
  odTableBody: {
    backgroundColor: '#E4E4E4',
    borderRadius: 33,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  odTableRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
  },
  odTableRowText: {
    fontFamily: 'Montserrat_300Light',
    fontSize: 24,
    color: 'rgba(0,0,0,0.82)',
  },
  odProductGroupRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingTop: 12,
    paddingBottom: 8,
  },
  odProductGroupTitle: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 24,
    color: 'rgba(0,0,0,0.88)',
  },
  odProductGroupLabel: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(0,0,0,0.54)',
  },
  odProductGroupWeight: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 22,
    color: 'rgba(0,0,0,0.88)',
  },
  odBatchSummaryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingTop: 8,
    paddingBottom: 10,
  },
  odBatchSummarySpacer: {
    flex: 3,
  },
  odBatchSummaryText: {
    fontFamily: 'Montserrat_300Light',
    fontSize: 21,
    color: 'rgba(0,0,0,0.74)',
  },
  odProductGroupDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    marginVertical: 4,
  },
  odTableRowDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  odTableEmptyText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(0,0,0,0.45)',
    textAlign: 'center' as const,
    paddingVertical: 12,
  },
  odTotalDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    marginTop: 4,
    marginBottom: 8,
  },
  odTotalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingBottom: 4,
  },
  odTotalText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    color: 'rgba(0,0,0,0.82)',
  },
  odTotalWeight: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    color: 'rgba(0,0,0,0.82)',
  },
  odSkannaaBtn: {
    ...glassActionSurface,
    alignSelf: 'center' as const,
    borderRadius: 81,
    paddingVertical: 16,
    paddingHorizontal: 52,
    marginTop: 8,
  },
  odSkaannaaBtnText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 32,
    color: colors.textOnDark,
  },

  // --- Scan modal (inside OrderDetailScreen) ---
  smOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  smShell: {
    ...glassActionSurface,
    flex: 1,
    maxHeight: '92%',
    borderRadius: 44,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(86, 86, 86, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  smTopRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  smBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  smTopSpacer: {
    width: 44,
    height: 44,
  },
  smCustomerPill: {
    flex: 1,
    maxWidth: 320,
    alignItems: 'center' as const,
    alignSelf: 'center' as const,
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
    backgroundColor: 'rgba(245,245,245,0.96)',
    borderRadius: 42,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  smScanFieldRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#39F56A',
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  smSaveBtnDisabled: { opacity: 0.4 },
  smSavePillText: {
    fontFamily: 'Montserrat_600SemiBold',
    color: 'rgba(0,0,0,0.84)',
    fontSize: 18,
  },

  // --- BatchList screen ---
  blProductHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  blProductName: { fontSize: 15, fontWeight: '700' as const, color: '#111', flex: 1 },
  blColHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 30,
    color: '#666',
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
  blDateText: { flex: 1, fontSize: 25, color: '#111' },
  blWarnIcon: { marginRight: 6 },
  blBtnGroup: { flexDirection: 'row' as const, gap: 8, marginRight: 12 },
  blCircleBtn: {
    ...glassActionSurface,
    width: 60,
    height: 60,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  blWeightText: {
    fontSize: 25,
    fontWeight: '500' as const,
    color: 'white',
    minWidth: 54,
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
    fontSize: 15,
  },
  blTotalText: { fontSize: 14, fontWeight: '700' as const, color: '#111', letterSpacing: 0.5 },
});

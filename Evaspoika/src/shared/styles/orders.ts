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
    color: '#A7F3D0',
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
    color: '#EDEDED',
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
    backgroundColor: '#E4E4E4',
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
    backgroundColor: '#FF4444',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.20)',
  },
  odDeleteBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
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
    backgroundColor: '#39F56A',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.20)',
  },
  odLahetaBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 28,
    color: 'rgba(0,0,0,0.82)',
  },

  // --- Scan modal (sm*) ---
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
    minHeight: 0,
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
    backgroundColor: 'rgba(245,245,245,0.96)',
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
    backgroundColor: '#FFFFFF',
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
    borderLeftColor: '#39F56A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});

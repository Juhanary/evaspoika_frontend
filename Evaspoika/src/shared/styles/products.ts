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

  // --- ProductListScreen PLU warning ---
  pluWarningText: {
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

  // --- ProductConfigModal PLU section ---
  configModalPluSectionLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    color: 'rgba(0,0,0,0.35)' as const,
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 10,
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
    color: '#fff' as const,
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

  // --- ProductListScreen pill row overrides ---
  invPillNameTextFlex: { flex: 1 },
  invIconTrailingGap: { marginRight: 4 },
  invWarnIconGap: { marginRight: 2 },
  invBatchScrollView: { maxHeight: 200 },
  invDropdownBatchNumFlex: { flex: 1 },
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

  // --- ProductListScreen category cards ---
  catCardRow: {
    flexDirection: 'row' as const,
    gap: 20,
    marginTop: 50,
    marginBottom: 24,
    flex: 1,
    justifyContent: 'center' as const,
  },
  catCard: {
    alignContent: 'center' as const,
    height: 68,
    width: 68,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    borderRadius: 68,
    marginLeft: 40,
    marginRight: 40,
  },
  catCardSelected: {
    backgroundColor: 'rgba(0,0,0,0.11)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.22)',
  },
  catCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginBottom: 5,
  },
  catCardLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)' as const,
    letterSpacing: 0.6,
  },
  catCardLabelSelected: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10,
    color: 'rgba(0,0,0,0.82)' as const,
    letterSpacing: 0.6,
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
  configModalFavTextActive: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#f5a623' as const,
  },
  configModalDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 10,
  },
  configModalCatSectionLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    color: 'rgba(0,0,0,0.35)' as const,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  configModalCatRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 8,
    paddingBottom: 8,
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
    width: 46,
    height: 46,
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
    backgroundColor: '#fff',
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
});

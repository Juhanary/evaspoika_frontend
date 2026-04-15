import { ViewStyle, TextStyle, Platform } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { button as buttonFactory, text as textFactory, container as containerFactory, base, input as inputFactory } from './factory';

export const glassActionSurface = {
  backgroundColor: colors.darkCard,
} as const;

export const components = {
  // Base utilities
  flex1: [base.flex1] as ViewStyle[],
  row: [base.row] as ViewStyle[],
  center: [base.center] as ViewStyle[],
  gapSm: [{ gap: spacing.sm }] as ViewStyle[],
  gapMd: [{ gap: spacing.md }] as ViewStyle[],
  mbSm: [{ marginBottom: spacing.sm }] as ViewStyle[],
  mbMd: [{ marginBottom: spacing.md }] as ViewStyle[],
  mtMd: [{ marginTop: spacing.md }] as ViewStyle[],
  pMd: [{ padding: spacing.md }] as ViewStyle[],
  pXl: [{ padding: spacing.xl }] as ViewStyle[],

  // Inputs
  input: inputFactory(),
  nameInput: [
    ...inputFactory(),
    { fontSize: typography.sizes.xl, marginBottom: spacing.sm },
  ] as ViewStyle[],
  priceInput: [
    ...inputFactory(),
    { fontSize: typography.sizes.xl, marginBottom: spacing.sm },
  ] as ViewStyle[],

  // Cards
  card: containerFactory({ variant: 'card' }),
  cardSuccess: [
    ...containerFactory({ variant: 'card' }),
    {
      backgroundColor: colors.successLight,
      borderColor: colors.successBorder,
      borderRadius: radii.xl,
      padding: spacing.md + 2,
      marginBottom: spacing.md,
    },
  ] as ViewStyle[],
  weighingCard: containerFactory({ variant: 'card' }),
  cardHeader: [base.row, { justifyContent: 'space-between' }] as ViewStyle[],

  // Chips
  chip: [
    {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: radii['2xl'],
      borderWidth: 1,
      borderColor: colors.borderMid,
      backgroundColor: colors.surface,
    },
  ] as ViewStyle[],
  chipActive: [{ backgroundColor: colors.accentDark, borderColor: colors.accentDark }] as ViewStyle[],
  chipText: textFactory({ size: 'sm' }),
  chipTextActive: textFactory({ size: 'sm', weight: 'semibold', color: colors.white }),

  // Buttons
  button: buttonFactory({ variant: 'primary' }),
  buttonPrimary: buttonFactory({ variant: 'primary' }),
  buttonConfirm: buttonFactory({ variant: 'confirm' }),
  buttonModalCancel: [
    ...buttonFactory({ variant: 'primary' }),
    { marginTop: spacing.md, padding: spacing.md + 2 },
  ] as ViewStyle[],
  buttonGlassIcon: [glassActionSurface, { overflow: 'hidden' }] as ViewStyle[],
  buttonGlassNav: buttonFactory({ variant: 'nav' }),

  // Button text
  buttonText: textFactory({ variant: 'button' }),
  buttonTextConfirm: textFactory({ variant: 'button' }),
  buttonTextModalCancel: textFactory({ weight: 'semibold', color: colors.textOnDark }),
  buttonTextGlassNav: [
    {
      fontFamily: 'Montserrat_400Regular',
      fontSize: 48,
      fontWeight: '400',
      color: colors.textOnDark,
      ...Platform.select({
        web: { textShadow: '0px 1px 4px rgba(0,0,0,0.25)' } as object,
        default: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 4 },
      }),
    },
  ] as TextStyle[],

  // Meta rows
  metaRow: [base.row, { justifyContent: 'space-between', marginBottom: spacing.xs }] as ViewStyle[],
  metaLabel: [{ fontWeight: typography.weights.semibold }] as TextStyle[],
  metaValue: [
    { color: colors.textSubtle, flex: 1, textAlign: 'right', marginLeft: spacing.md },
  ] as TextStyle[],

  // Section headers
  sectionHeader: textFactory({ variant: 'body', weight: 'bold', color: colors.textOnDark, size: 'lg' }),
  eventsTitle: [
    ...textFactory({ variant: 'body', weight: 'bold', color: colors.textOnDark, size: 'lg' }),
    { marginTop: spacing.md, marginBottom: spacing.xs },
  ] as TextStyle[],

  // Text helpers
  textMuted: textFactory({ variant: 'muted' }),
  textEmpty: [
    ...textFactory({ variant: 'muted' }),
    { textAlign: 'center', marginTop: spacing.xl },
  ] as TextStyle[],

  // Modal
  modalOverlay: [{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }] as ViewStyle[],
  modalCard: containerFactory({ variant: 'modal' }),
  modalTitle: [
    ...textFactory({ size: '2xl', weight: 'bold' }),
    { marginBottom: spacing.md },
  ] as TextStyle[],
  modalEmpty: [
    ...textFactory({ color: colors.muted }),
    { textAlign: 'center', paddingVertical: spacing.lg },
  ] as TextStyle[],
  modalRow: [
    { paddingVertical: spacing.md + 2, borderBottomWidth: 1, borderColor: colors.borderLight },
  ] as ViewStyle[],
  modalRowText: textFactory({ color: colors.textDark }),
  modalRowSubText: [
    ...textFactory({ size: 'sm', color: colors.textSubtle }),
    { marginTop: spacing.xs },
  ] as TextStyle[],

  // Weighing specific
  eventRow: [
    base.row,
    { justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  ] as ViewStyle[],
  eventLeft: [{ flex: 1 }] as ViewStyle[],
  eventRight: [{ alignItems: 'flex-end' }] as ViewStyle[],
  eventCode: textFactory({ weight: 'bold' }),
  eventDesc: textFactory({ size: 'sm', color: colors.textSubtle }),
  eventWeight: textFactory({ weight: 'semibold' }),
  eventDate: textFactory({ size: 'xs', color: colors.textSubtle }),
  
  newProductRow: [
    base.row,
    { padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  ] as ViewStyle[],
  newProductRowText: textFactory({ color: colors.accent, weight: 'bold' }),
  productRow: [
    base.row,
    { padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  ] as ViewStyle[],
  productName: textFactory({ weight: 'semibold' }),
  productEan: textFactory({ size: 'sm', color: colors.textSubtle }),

  selectedName: textFactory({ size: 'xl', weight: 'bold' }),
  batchStatus: textFactory({ size: 'sm', color: colors.textSubtle }),
  changeBtn: [base.center, { padding: spacing.sm }] as ViewStyle[],
  changeBtnText: textFactory({ color: colors.accent, weight: 'semibold' }),

  eanRow: [base.row, { marginTop: spacing.md, gap: spacing.md }] as ViewStyle[],
  eanLabel: textFactory({ weight: 'bold', size: 'sm' }),
  eanInput: inputFactory(),

  batchesRow: [base.row, { flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }] as ViewStyle[],
  batchChip: [
    { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.full, backgroundColor: colors.darkSurface, borderWidth: 1, borderColor: colors.border },
  ] as ViewStyle[],
  batchChipText: textFactory({ size: 'xs', color: colors.white }),

  weightRow: [base.row, { marginTop: spacing.xl, gap: spacing.md }] as ViewStyle[],
  weightInput: [
    ...inputFactory(),
    { flex: 1, fontSize: 32, height: 80, textAlign: 'center' },
  ] as ViewStyle[],
  weighBtn: buttonFactory({ variant: 'confirm' }),
  weighBtnText: textFactory({ variant: 'button', size: '2xl' }),

  // Inventory specific
  invPillRow: [base.row, { gap: 8 }] as ViewStyle[],
  invPillLeft: [
    base.row,
    {
      flex: 1,
      height: 44,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: radii.full,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
  ] as ViewStyle[],
  invPillLeftExpanded: [{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }] as ViewStyle[],
  invPillLeftText: textFactory({ weight: 'bold', color: colors.textDark }),
  invDropdown: [
    {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      padding: 16,
      marginTop: -2,
      zIndex: -1,
    },
  ] as ViewStyle[],
  invDropdownLabel: textFactory({ size: 'sm', color: colors.textSubtle }),
  invDropdownLabelYhteensa: textFactory({ weight: 'bold', color: colors.textDark }),
  invDropdownRow: [base.row, { justifyContent: 'space-between', paddingVertical: 4 }] as ViewStyle[],
  invDropdownWeight: textFactory({ weight: 'bold', color: colors.textDark }),
  invDropdownDivider: [
    { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 8 },
  ] as ViewStyle[],
  invDropdownBtn: [
    base.center,
    { backgroundColor: colors.darkBg, borderRadius: radii.md, paddingVertical: 10, marginTop: 4 },
  ] as ViewStyle[],
  invDropdownBtnText: textFactory({ weight: 'bold', color: colors.white, size: 'xs' }),
  invPillRight: [
    base.row,
    {
      width: 130,
      height: 44,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: radii.full,
      paddingHorizontal: 14,
      justifyContent: 'center',
      gap: 10,
    },
  ] as ViewStyle[],
  invPillWeight: textFactory({ weight: 'bold', color: colors.white, size: 'sm' }),
  invPillDivider: [{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)' }] as ViewStyle[],
  invPillCount: textFactory({ weight: 'bold', color: colors.white, size: 'sm' }),
} as const;

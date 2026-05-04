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
        default: { textShadowColor: 'rgba(0,0,0,0.25)', textShadowRadius: 1 },
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
  weighBtnText: textFactory({ variant: 'button', size: '3xl' }),

  // Inventory specific
  invPillRow: [base.row, { gap: 8 }] as ViewStyle[],
  invPillLeft: [
    base.row,
    {
      flex: 1,
      height: 70,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderRadius: radii.full,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
  ] as ViewStyle[],
  invPillLeftExpanded:[ {  borderTopRightRadius: radii['3xl'],  borderTopLeftRadius: radii['3xl'] , borderBottomLeftRadius: 0, borderBottomRightRadius: 0, },  
] as ViewStyle[],
  invPillLeftText: textFactory({ weight: 'bold', color: colors.textDark, size: '3xl' }),
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
  invDropdownLabel: textFactory({ size: '3xl', color: colors.textSubtle }),
  invDropdownLabelYhteensa: textFactory({ weight: 'bold', color: colors.textDark, size: '3xl' }),
  invDropdownRow: [base.row, { justifyContent: 'space-between', paddingVertical: 4 }] as ViewStyle[],
  invDropdownWeight: textFactory({ weight: 'bold', color: colors.textDark, size: '3xl' }),
  invDropdownDivider: [
    { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 8 },
  ] as ViewStyle[],
  invDropdownBtn: [
    base.center,
    { backgroundColor: colors.darkBg, borderRadius: radii.md, paddingVertical: 10, marginTop: 4 },
  ] as ViewStyle[],
  invDropdownBtnText: textFactory({ weight: 'bold', color: colors.white, size: '3xl' }),
  invPillRight: [
    base.row,
    {
      width: 130,
      height: 70,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: radii.full,
      paddingHorizontal: 14,
      justifyContent: 'center',
      gap: 10,
    },
  ] as ViewStyle[],
  invPillWeight: textFactory({ weight: 'bold', color: colors.white, size: '3xl' }),
  invPillDivider: [{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)' }] as ViewStyle[],
  invPillCount: textFactory({ weight: 'bold', color: colors.white, size: '3xl' }),

  // Button internals
  glassActionSurface: [{ backgroundColor: colors.darkCard }] as ViewStyle[],
  actionButtonContent: [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }] as ViewStyle[],

  // ScreenLayout
  screenContent: [{ flex: 1 }] as ViewStyle[],
  screenCard: [{ flex: 1, marginHorizontal: spacing.lg, marginBottom: spacing.lg, padding: 0 }] as ViewStyle[],
  screenPlain: [{ flex: 1 }] as ViewStyle[],
  screenBackBtn: [{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4, alignSelf: 'flex-start' }] as ViewStyle[],
  screenBackBtnText: [{ fontFamily: 'Montserrat_400Regular', fontSize: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }] as TextStyle[],
  screenInlineSearch: [{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm, alignItems: 'center' }] as ViewStyle[],
  screenInlineSearchMax: [{ width: '100%', maxWidth: 720, marginBottom: 0 }] as ViewStyle[],
  screenCloseRow: [{ alignItems: 'flex-end' }] as ViewStyle[],

  // AppHeader
  appHeader: [{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: 14, backgroundColor: 'transparent' }] as ViewStyle[],
  appHeaderSide: [{ minWidth: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: 6 }] as ViewStyle[],
  appHeaderSideRight: [{ justifyContent: 'flex-end' }] as ViewStyle[],
  appHeaderCenter: [{ flex: 1, alignItems: 'center' }] as ViewStyle[],
  appHeaderLogo: [{ width: 120, height: 40 }] as ViewStyle[],
  appHeaderTitle: [{ marginTop: 4, fontSize: 16, fontWeight: '700', letterSpacing: 2, color: colors.textOnDark }] as TextStyle[],
  appHeaderSearch: [{ marginBottom: 0 }] as ViewStyle[],

  // SearchInput
  searchContainer: [{ width: '100%', gap: spacing.xs, marginBottom: spacing.md }] as ViewStyle[],
  searchLabel: [{ alignSelf: 'center', fontSize: 11, fontWeight: '700', letterSpacing: 2 }] as TextStyle[],
  searchLabelDark: [{ color: 'rgba(255,255,255,0.82)' }] as TextStyle[],
  searchLabelLight: [{ color: colors.textSubtle }] as TextStyle[],
  searchField: [{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radii.full, paddingHorizontal: spacing.lg, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 1 }] as ViewStyle[],
  searchFieldDark: [{ backgroundColor: 'rgba(12, 18, 28, 0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }] as ViewStyle[],
  searchFieldLight: [{ backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: colors.borderMid }] as ViewStyle[],
  searchInput: [{ flex: 1, fontSize: typography.sizes.lg, fontFamily: 'Montserrat_400Regular' }] as TextStyle[],
  searchInputDark: [{ color: colors.textOnDark }] as TextStyle[],
  searchInputLight: [{ color: colors.textSecondary }] as TextStyle[],

  // SelectableSearchList
  selectableEmpty: [{ marginTop: spacing.md }] as ViewStyle[],
  selectableEmptyText: [{ marginBottom: spacing.sm }] as TextStyle[],

  // General
  flex: [{ flex: 1 }] as ViewStyle[],

  // BatchList archive section
  blArchiveHeader: [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }] as ViewStyle[],
  blArchiveHeaderText: [{ fontFamily: 'Montserrat_500Medium', fontSize: 15, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 }] as TextStyle[],
  blArchiveRow: [{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }] as ViewStyle[],
  blArchiveLabel: [{ fontFamily: 'Montserrat_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.5)', flex: 1 }] as TextStyle[],
  blArchiveSub: [{ fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }] as TextStyle[],
  blArchiveWeight: [{ fontFamily: 'Montserrat_500Medium', fontSize: 15, color: 'rgba(255,255,255,0.45)', marginRight: 8 }] as TextStyle[],

  // BatchEvents tab bar
  tabRow: [{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.sm }] as ViewStyle[],
  tabButton: [{ flex: 1, paddingVertical: spacing.sm + 2, alignItems: 'center' }] as ViewStyle[],
  tabButtonActive: [{ borderBottomWidth: 2, borderBottomColor: colors.textOnDark }] as ViewStyle[],
  tabButtonPressed: [{ opacity: 0.7 }] as ViewStyle[],
  tabText: [{ fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }] as TextStyle[],
  tabTextActive: [{ color: colors.textOnDark, fontWeight: '600' }] as TextStyle[],

  // GlassCard
  glassCard: [{ borderRadius: 32, padding: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 1 }] as ViewStyle[],
  glassCardOverlay: [{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.06)',  }] as ViewStyle[],
} as const;

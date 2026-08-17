import { ViewStyle, TextStyle, ImageStyle, Platform, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';

// ===========================================================================
// Style factory toolkit (composable parts + builders). Was factory.ts.
// ===========================================================================
export const base = {
  row: { flexDirection: 'row', alignItems: 'center' } as ViewStyle,
  center: { alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  } as ViewStyle,
} as const;

export type ButtonVariant = 'primary' | 'secondary' | 'confirm' | 'cancel' | 'glass' | 'nav';
export type Size = 'sm' | 'md' | 'lg' | 'xl';

export const button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
}: {
  variant?: ButtonVariant;
  size?: Size;
  disabled?: boolean;
} = {}): ViewStyle[] => {
  const styles: ViewStyle[] = [
    base.center,
    { borderRadius: radii.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  ];

  if (variant === 'primary' || variant === 'secondary') {
    styles.push({ backgroundColor: colors.darkCard });
  }

  if (variant === 'confirm') {
    styles.push({ backgroundColor: colors.darkCard, borderRadius: radii.lg, padding: spacing.lg });
  }

  if (variant === 'glass') {
    styles.push({ backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' });
  }

  if (variant === 'nav') {
    styles.push({
      backgroundColor: colors.darkCard,
      borderRadius: 67,
      paddingVertical: spacing.xl,
      paddingHorizontal: 46,
      opacity: disabled ? 0.5 : 0.8,
    });
  }

  if (size === 'sm') styles.push({ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm });
  if (size === 'lg') styles.push({ paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl });

  if (disabled) styles.push({ opacity: 0.5 });

  return styles;
};

export type TextVariant = 'body' | 'label' | 'title' | 'header' | 'button' | 'muted';
export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export const text = ({
  variant = 'body',
  weight = 'regular',
  size,
  color,
}: {
  variant?: TextVariant;
  weight?: FontWeight;
  size?: keyof typeof typography.sizes;
  color?: string;
} = {}): TextStyle[] => {
  const styles: TextStyle[] = [
    {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      fontWeight: typography.weights[weight],
    },
  ];

  if (variant === 'title') styles.push({ fontSize: typography.sizes['4xl'], color: colors.textOnDark });
  if (variant === 'header') styles.push({ fontSize: typography.sizes['5xl'], color: colors.textOnDark, fontWeight: '700' });
  if (variant === 'button') styles.push({ fontSize: typography.sizes.xl, color: colors.textOnDark, fontWeight: '700' });
  if (variant === 'muted') styles.push({ color: colors.textOnDarkMuted });
  if (variant === 'label') styles.push({ fontWeight: '700', letterSpacing: 2, fontSize: 11 });

  if (size) styles.push({ fontSize: typography.sizes[size] });
  if (color) styles.push({ color });

  return styles;
};

export const container = ({
  variant = 'screen',
  gap,
}: {
  variant?: 'screen' | 'card' | 'row' | 'center' | 'section' | 'modal';
  gap?: keyof typeof spacing;
} = {}): ViewStyle[] => {
  const styles: ViewStyle[] = [];

  if (variant === 'screen') styles.push({ flex: 1, padding: spacing.xl });
  if (variant === 'card') styles.push(base.card);
  if (variant === 'row') styles.push(base.row);
  if (variant === 'center') styles.push(base.center);
  if (variant === 'section') styles.push({ marginBottom: spacing.lg });
  if (variant === 'modal') styles.push({
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    padding: spacing.xl,
  });

  if (gap) styles.push({ gap: spacing[gap] });

  return styles;
};

export const input = ({
  variant = 'default',
}: {
  variant?: 'default' | 'search' | 'flat';
} = {}): ViewStyle[] => {
  const styles: ViewStyle[] = [{
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
  }];

  if (variant === 'search') {
    styles.push({
      borderRadius: radii.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: 12,
      backgroundColor: 'rgba(255,255,255,0.96)',
    });
  }

  return styles;
};

// Aliases kept so the `components` object below reads unchanged.
const buttonFactory = button;
const textFactory = text;
const containerFactory = container;
const inputFactory = input;

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
  ] as TextStyle[],
  priceInput: [
    ...inputFactory(),
    { fontSize: typography.sizes.xl, marginBottom: spacing.sm },
  ] as TextStyle[],

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
  modalOverlay: [{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }] as ViewStyle[],
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
  eanInput: inputFactory() as TextStyle[],

  batchesRow: [base.row, { flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }] as ViewStyle[],
  batchChip: [
    { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.full, backgroundColor: colors.darkSurface, borderWidth: 1, borderColor: colors.border },
  ] as ViewStyle[],
  batchChipText: textFactory({ size: 'xs', color: colors.white }),

  weightRow: [base.row, { marginTop: spacing.xl, gap: spacing.md }] as ViewStyle[],
  weightInput: [
    ...inputFactory(),
    { flex: 1, fontSize: 32, height: 80, textAlign: 'center' },
  ] as TextStyle[],
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
      paddingHorizontal: 30,
      justifyContent: 'space-between',
    },
  ] as ViewStyle[],
  invPillLeftExpanded:[ {  borderTopRightRadius: radii['3xl'],  borderTopLeftRadius: radii['3xl'] , borderBottomLeftRadius: 0, borderBottomRightRadius: 0, },  
] as ViewStyle[],
  invPillLeftText: textFactory({ weight: 'bold', color: colors.textDark, size: '3xl' }),
  invDropdown: [
    {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderBottomLeftRadius: radii['3xl'],
      borderBottomRightRadius: radii['3xl'],
            padding: 10,
      marginTop: -2,
      zIndex: -1,
    },
  ] as ViewStyle[],
  invDropdownLabel: textFactory({ size: '3xl', color: colors.textSubtle }),
  invDropdownLabelYhteensa: textFactory({ weight: 'bold', color: colors.textDark, size: '3xl' }),
  invDropdownRow: [base.row, { justifyContent: 'space-between', paddingVertical: 10, paddingLeft: 20, paddingRight: 20 }] as ViewStyle[],
  invDropdownWeight: textFactory({ weight: 'bold', color: colors.textDark, size: '3xl' }),
  invDropdownDivider: [
    { height: 1, backgroundColor: colors.borderMid, marginVertical: 8 },
  ] as ViewStyle[],
  invDropdownBtn: [
    base.center,
    { backgroundColor: colors.darkBg, borderRadius: radii['3xl'], paddingVertical: 10, margin: 20, },
  ] as ViewStyle[],
  invDropdownBtnText: textFactory({ weight: 'bold', color: colors.white, size: '3xl' }),
  invPillRight: [
    base.row,
    {
      width: 130,
      height: 70,
           borderRadius: radii.full,
      paddingHorizontal: 14,
      justifyContent: 'center',
      gap: 10,
    },
  ] as ViewStyle[],
  invPillWeight: textFactory({ weight: 'bold', color: colors.white, size: '3xl' }),
  invPillDivider: [{ width: 2, height: 20, backgroundColor: colors.borderMid }] as ViewStyle[],
  invPillCount: textFactory({ weight: 'bold', color: colors.white, size: '3xl' }),

  // Button internals
  actionButtonContent: [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }] as ViewStyle[],

  // ScreenLayout
  screenContent: [{ flex: 1 }] as ViewStyle[],
  screenCard: [{ flex: 1, marginHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.lg, padding: 0, borderRadius: 44 }] as ViewStyle[],
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
  appHeaderLogo: [{ width: 120, height: 40 }] as ImageStyle[],
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

  // BatchEvents tab bar
  tabRow: [{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.sm }] as ViewStyle[],
  tabButton: [{ flex: 1, paddingVertical: spacing.sm + 2, alignItems: 'center' }] as ViewStyle[],
  tabButtonActive: [{ borderBottomWidth: 2, borderBottomColor: colors.textOnDark }] as ViewStyle[],
  tabButtonPressed: [{ opacity: 0.7 }] as ViewStyle[],
  tabText: [{ fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }] as TextStyle[],
  tabTextActive: [{ color: colors.textOnDark, fontWeight: '600' }] as TextStyle[],

  // GlassCard
  glassCard: [{ borderRadius: 32, padding: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.50, shadowRadius: 1 }] as ViewStyle[],
  glassCardOverlay: [{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.06)',  }] as ViewStyle[],
} as const;

// ===========================================================================
// Screen scaffold (inner padding, section titles, list rows). Was screen.ts.
// ===========================================================================
export const screen = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  innerSm: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 35,
    color: colors.offWhite,
    marginBottom: 12,
    ...Platform.select({
      web: { textShadow: '0px 1px 4px rgba(0,0,0,0.38)' } as object,
      default: { textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 1 },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 22,
    gap: 12,
  },
  listRowContent: {
    flex: 1,
    gap: 6,
  },
  listRowName: {
    fontFamily: 'Montserrat_300Light',
    fontSize: 28,
    color: colors.offWhite,
  },
  listRowSummary: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(237,237,237,0.82)',
  },
  listRowMeta: {
    minWidth: 84,
    alignItems: 'flex-end',
    gap: 4,
    paddingTop: 4,
  },
  listRowMetaPrimary: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
    color: colors.offWhite,
  },
  listRowMetaSecondary: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: 'rgba(237,237,237,0.72)',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  muted: {
    marginTop: 24,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnHeaderRow: {
    alignItems: 'flex-end',
    paddingRight: 4,
    marginBottom: 8,
  },
  columnHeaderText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 20,
    color: colors.offWhite,
  },
  logGroup: {
    paddingVertical: 12,
    gap: 4,
  },
  logGroupDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  logDateHeader: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 24,
    color: colors.white,
    marginBottom: 6,
  },
  logEntry: {
    paddingLeft: 8,
    gap: 2,
    marginBottom: 4,
  },
  logEntryText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    color: colors.white,
  },
});

// ===========================================================================
// Dark theme rows / labels. Was dark.ts.
// ===========================================================================
export const dark = {
  screen: {
    flex: 1,
    backgroundColor: colors.darkBg,
  } as ViewStyle,

  sectionLabel: [
    ...text({ size: 'xs', weight: 'semibold', color: colors.textOnDarkMuted }),
    { letterSpacing: 2, marginBottom: spacing.md, marginLeft: spacing.md, marginTop: spacing.lg , marginRight: spacing.md},
  ] as TextStyle[],

  row: [
    base.row,
    {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.07)',
    },
  ] as ViewStyle[],

  rowTitle: [
    ...text({ size: 'xl', weight: 'semibold', color: colors.textOnDark }),
    { fontSize: 18 },
  ] as TextStyle[],

  rowSub: [
    ...text({ size: 'sm', color: colors.textOnDarkMuted }),
    { fontSize: 14, marginTop: spacing.xs / 2 },
  ] as TextStyle[],

  muted: [
    ...text({ size: 'md', color: colors.muted }),
    { paddingVertical: spacing.xs },
  ] as TextStyle[],

  pressed: {
    opacity: 0.7,
  } as ViewStyle,
} as const;

// ===========================================================================
// Layout helpers. Was layout.ts.
// ===========================================================================
export const layout = {
  screen: container({ variant: 'screen' }),
  center: container({ variant: 'center' }),
  section: container({ variant: 'section' }),

  title: text({
    variant: 'title',
    weight: 'semibold',
    size: '4xl',
  }),

  screenTitle: text({
    variant: 'header',
    weight: 'bold',
    size: '5xl',
  }),

  listItem: [
    {
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.07)',
    },
  ] as ViewStyle[],

  listItemTitle: text({
    size: 'xl',
    color: colors.textOnDark,
  }),

  listItemSubtitle: text({
    size: 'md',
    color: colors.textOnDarkMuted,
  }),

  pressed: { opacity: 0.6 } as ViewStyle,
  disabled: { opacity: 0.4 } as ViewStyle,

  row: [
    base.row,
    {
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.07)',
    },
  ] as ViewStyle[],
} as const;

// ===========================================================================
// ErrorBoundary. Was errorBoundary.ts.
// ===========================================================================
export const errorBoundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['4xl'],
    fontFamily: 'Montserrat_600SemiBold',
    color: colors.textDark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.base,
    fontFamily: 'Montserrat_400Regular',
    color: colors.muted,
    textAlign: 'center',
  },
  detail: {
    marginTop: spacing.xl,
    fontSize: typography.sizes.sm,
    fontFamily: 'Montserrat_400Regular',
    color: colors.danger,
    textAlign: 'center',
  },
});

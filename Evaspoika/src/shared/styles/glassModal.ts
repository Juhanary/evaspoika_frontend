import { Platform, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';

// Shared geometry for every full-height glass card (screens AND modals) so they
// all line up at the exact same position. Screens sit in layout flow below the
// AppHeader; modals are absolutely positioned, so they mirror the same offsets.
//
// AppHeader height = paddingTop(insets.top + 10) + icon row(58 + 6) + paddingBottom(14)
const APP_HEADER_HEIGHT = 88;
// Screens use marginTop: spacing.sm below the header — modals match it.
export const GLASS_CARD_TOP_OFFSET = APP_HEADER_HEIGHT + spacing.sm; // 96
export const GLASS_CARD_BOTTOM_OFFSET = spacing.lg; // 16
// Single corner radius shared by screen cards and modal cards.
export const GLASS_CARD_RADIUS = 44;

export const glassModalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.lg,
    bottom: spacing.lg,
    padding: 0,
    borderRadius: GLASS_CARD_RADIUS,
    overflow: 'hidden',
    opacity: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: typography.families.regular,
    fontSize: 32,
    color: colors.white,
    textAlign: 'center',
    ...Platform.select({
      web: { textShadow: '0px 1px 4px rgba(0,0,0,0.38)' } as object,
      default: { textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 1 },
    }),
  },
  subtitle: {
    fontFamily: typography.families.regular,
    fontSize: 15,
    color: colors.lightGray,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    fontFamily: typography.families.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  // Generic list row used by <ModalRow>.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(217,217,217,0.12)',
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: spacing.sm,
  },
  rowDeleted: {
    backgroundColor: 'rgba(196,60,60,0.15)',
    borderColor: 'rgba(255,120,120,0.20)',
  },
  rowTitle: {
    fontFamily: typography.families.medium,
    fontSize: 18,
    color: colors.offWhite,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontFamily: typography.families.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
  rowMeta: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.48)',
    marginTop: 2,
  },
});

// --- NotificationsModal ---
const notificationsSpecific = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabText: {
    fontFamily: typography.families.medium,
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  tabTextActive: {
    color: colors.white,
  },
  sectionLabel: {
    fontFamily: typography.families.bold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
  },
  warnRowNew: {
    backgroundColor: 'rgba(217,119,6,0.10)',
    borderBottomColor: 'rgba(217,119,6,0.18)',
  },
  newDot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  warnIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(217,119,6,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warnDate: {
    fontFamily: typography.families.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 1,
  },
  warnProduct: {
    fontFamily: typography.families.semibold,
    fontSize: 22,
    color: colors.offWhite,
  },
  warnProductNew: {
    color: colors.white,
  },
  warnType: {
    fontFamily: typography.families.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
  },
  hintText: {
    fontFamily: typography.families.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: spacing.md,
  },
  threshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  threshName: {
    fontFamily: typography.families.regular,
    fontSize: 24,
    color: colors.lightGray,
  },
  threshInput: {
    fontFamily: typography.families.medium,
    fontSize: 20,
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    minWidth: 64,
    textAlign: 'right',
  },
  threshUnit: {
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    width: 20,
  },
});

export const notificationsModalStyles = { ...glassModalStyles, ...notificationsSpecific };

// --- InventorySummaryModal ---
const inventorySpecific = StyleSheet.create({
  columnHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xs,
  },
  columnHeaderText: {
    fontFamily: typography.families.regular,
    fontSize: 20,
    color: '#E4E4E4',
  },
  row: {
    gap: 6,
    paddingVertical: 10,
  },
  rowDragging: {
    opacity: 0.4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowName: {
    fontFamily: typography.families.medium,
    fontSize: 20,
    color: '#E4E4E4',
  },
  dragHandle: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barWrap: {
    flex: 1,
    height: 40,
    borderRadius: 23,
    overflow: 'hidden',
  },
  barBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91,91,91,0.64)',
    borderRadius: 23,
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 23,
  },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#868686',
  },
  tickLow: {
    left: '33%',
  },
  tickMid: {
    left: '66%',
  },
  dropLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.danger,
    marginHorizontal: spacing.sm,
  },
});

export const inventorySummaryModalStyles = { ...glassModalStyles, ...inventorySpecific };

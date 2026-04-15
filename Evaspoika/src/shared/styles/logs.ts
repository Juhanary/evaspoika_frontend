import { Platform, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';

// Batch-modal overlay styles (was `modalStyles` in LogScreen)
export const logModalStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '2%',
    bottom: spacing.lg,
    padding: 0,
    borderRadius: 32,
    overflow: 'hidden',
  },
  cardDeleted: {
    borderColor: 'rgba(255, 126, 126, 0.34)',
    backgroundColor: 'rgba(94, 32, 32, 0.22)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 28,
    color: colors.white,
    ...Platform.select({
      web: { textShadow: '0px 1px 4px rgba(0,0,0,0.38)' } as object,
      default: { textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 4 },
    }),
  },
  subtitle: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    color: '#E4E4E4',
    marginTop: 2,
  },
  deletedHeaderBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 999,
    backgroundColor: 'rgba(196, 72, 72, 0.26)',
    borderWidth: 1,
    borderColor: 'rgba(255, 167, 167, 0.28)',
  },
  deletedHeaderBadgeText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 13,
    color: '#FFD4D4',
  },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  metaText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 18,
    color: '#E4E4E4',
  },
  metaSubtle: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  tabButton: {
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.xs + 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(217,217,217,0.14)',
  },
  tabButtonActive: {
    backgroundColor: '#E4E4E4',
    borderColor: '#E4E4E4',
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  tabButtonText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: '#F2F2F2',
  },
  tabButtonTextActive: {
    color: 'rgba(0,0,0,0.78)',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  eventItem: {
    backgroundColor: 'rgba(217,217,217,0.16)',
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  eventTitle: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 20,
    color: '#EDEDED',
    marginBottom: spacing.xs,
  },
  eventSubtitle: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: spacing.xs / 2,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
});

// Main list / item styles (was `styles` in LogScreen)
export const logStyles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  pressed: {
    opacity: 0.72,
  },
  resultSummary: {
    marginBottom: spacing.md,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
  },
  list: {
    flex: 1,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
  },
  logItemDeleted: {
    backgroundColor: 'rgba(177, 67, 67, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 100, 0.45)',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255, 70, 70, 0.8)',
  },
  logItemLast: {
    paddingBottom: spacing.lg,
  },
  logItemContent: {
    flex: 1,
    gap: 4,
  },
  logItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  logItemTitle: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 22,
    color: colors.textOnDark,
  },
  logItemTitleDeleted: {
    color: '#FFE0E0',
  },
  logItemSummary: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.84)',
  },
  logItemSummaryDeleted: {
    color: 'rgba(255,224,224,0.86)',
  },
  logItemDescription: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.58)',
  },
  logItemDescriptionDeleted: {
    color: 'rgba(255,214,214,0.76)',
  },
  deletedBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 196, 196, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 188, 188, 0.2)',
  },
  deletedBadgeText: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: '#FFD4D4',
  },
});

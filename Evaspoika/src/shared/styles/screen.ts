import { Platform, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { typography } from '@/src/shared/constants/typography';

// rowDivider and logGroupDivider are verbatim-identical (confirmed by a
// value-level before/after diff) — shared so they stay identical by
// construction.
const hairlineDivider = {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.07)',
};

// ===========================================================================
// Screen scaffold (inner padding, section titles, list rows).
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
    fontFamily: typography.families.regular,
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
    fontFamily: typography.families.light,
    fontSize: 28,
    color: colors.offWhite,
  },
  listRowSummary: {
    fontFamily: typography.families.regular,
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
    fontFamily: typography.families.medium,
    fontSize: 13,
    color: colors.offWhite,
  },
  listRowMetaSecondary: {
    fontFamily: typography.families.regular,
    fontSize: 13,
    color: 'rgba(237,237,237,0.72)',
  },
  rowDivider: hairlineDivider,
  muted: {
    marginTop: 24,
    fontFamily: typography.families.regular,
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
  // Like `centered`, but without flex: 1 — for a loading state inside a
  // modal or card that shouldn't stretch to fill all available height.
  centeredInline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  columnHeaderRow: {
    alignItems: 'flex-end',
    paddingRight: 4,
    marginBottom: 8,
  },
  columnHeaderText: {
    fontFamily: typography.families.medium,
    fontSize: 20,
    color: colors.offWhite,
  },
  logGroup: {
    paddingVertical: 12,
    gap: 4,
  },
  logGroupDivider: hairlineDivider,
  logDateHeader: {
    fontFamily: typography.families.regular,
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
    fontFamily: typography.families.regular,
    fontSize: 20,
    color: colors.white,
  },
});

import { Platform, StyleSheet } from 'react-native';

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
    fontSize: 32,
    color: '#EDEDED',
    marginBottom: 12,
    ...Platform.select({
      web: { textShadow: '0px 1px 4px rgba(0,0,0,0.38)' } as object,
      default: { textShadowColor: 'rgba(0,0,0,0.38)', textShadowRadius: 4 },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#EDEDED',
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
    color: '#EDEDED',
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
    fontSize: 15,
    color: '#EDEDED',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
});

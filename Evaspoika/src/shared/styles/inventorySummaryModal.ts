import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { glassModalStyles } from './glassModal';

const specific = StyleSheet.create({
  columnHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xs,
  },
  columnHeaderText: {
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_500Medium',
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
    height: 50,
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

export const inventorySummaryModalStyles = { ...glassModalStyles, ...specific };

import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { glassModalStyles } from './glassModal';

const specific = StyleSheet.create({
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
    fontFamily: 'Montserrat_500Medium',
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  tabTextActive: {
    color: colors.white,
  },
  sectionLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1.3,
    marginBottom: spacing.xl,
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  warnProduct: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    color: '#E4E4E4',
  },
  warnDetail: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  daysBadge: {
    minWidth: 55,
    height: 55,
    borderRadius: 69,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  daysBadgeText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  daysBadgeSub: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: -2,
  },
  hintText: {
    fontFamily: 'Montserrat_400Regular',
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
    fontFamily: 'Montserrat_400Regular',
    fontSize: 24,
    color: '#E4E4E4',
  },
  threshInput: {
    fontFamily: 'Montserrat_500Medium',
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
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    width: 20,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: spacing.xl,
  },
  splitPane: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  splitDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.xs,
  },
  paneContent: {
    paddingBottom: spacing.md,
  },
});

export const notificationsModalStyles = { ...glassModalStyles, ...specific };

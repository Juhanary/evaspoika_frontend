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
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 1,
  },
  warnProduct: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    color: colors.offWhite,
  },
  warnProductNew: {
    color: colors.white,
  },
  warnType: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 1,
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
    color: colors.lightGray,
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
});

export const notificationsModalStyles = { ...glassModalStyles, ...specific };

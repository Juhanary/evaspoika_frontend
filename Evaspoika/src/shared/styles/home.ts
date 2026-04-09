import { StyleSheet } from 'react-native';
import { spacing } from '../constants/spacing';

export const homeStyles = StyleSheet.create({
  outerScroll: {
    flex: 1,
  },
  outerScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    padding: 0,
  },
  ordersCard: {
    padding: 0,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logo: {
    width: 240,
    height: 78,
  },
  logoSubtitle: {
    marginTop: spacing.xs,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 4,
    color: '#F0F0F0',
    textShadowColor: 'rgba(0,0,0,0.38)',
    textShadowRadius: 4,
  },
  topArea: {
    paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      paddingBottom: 50,
  },
  btnGroup: {
    flexDirection: 'column',
    gap: 28,
    
  },
  ordersSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  ordersSectionLabel: {
    marginBottom: spacing.sm,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ordersSectionDivider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.xl,
  },
  ordersRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  ordersRowBody: {
    flex: 1,
    gap: spacing.xs,
  },
  ordersRowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ordersRowName: {

    fontFamily: 'Montserrat_500Medium',
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ordersRowSummary: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 20,
    lineHeight: 18,
    padding: 4,
    color: 'rgba(255,255,255,0.82)',
  },
  ordersRowDate: {
    minWidth: 72,
    textAlign: 'right',
    fontFamily: 'Montserrat_500Medium',
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  searchResultsPadding: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});

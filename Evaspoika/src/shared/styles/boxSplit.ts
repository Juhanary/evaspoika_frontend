import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';
import { glassActionSurface } from './styleFactory';

// Laatikon jakonäkymä. Skannauspalkki ja rivilista noudattavat tilauksen
// skannausmodaalin ulkoasua, jotta sama työvaihe näyttää samalta kummassakin.
export const boxSplitStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- Aloitusvaihe: näytöllä on vain yksi mahdollinen tekeminen ---
  startBlock: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  startTitle: {
    fontFamily: typography.families.semibold,
    fontSize: typography.sizes['5xl'],
    color: colors.textOnDark,
    textAlign: 'center',
  },
  startBody: {
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.xl,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  stepBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  stepBadgeText: {
    fontFamily: typography.families.bold,
    fontSize: typography.sizes.xs,
    letterSpacing: 2,
    color: colors.textOnDark,
  },

  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(217,119,6,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.4)',
    borderRadius: radii.xl,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  hintText: {
    flex: 1,
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.base,
    color: colors.textOnDark,
  },

  // --- Skannauspalkki ---
  hiddenEanInput: {
    height: 0,
    width: 0,
    opacity: 0,
    position: 'absolute',
  },
  scanBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.full,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  scanBarText: {
    fontFamily: typography.families.bold,
    fontSize: typography.sizes.xl,
    letterSpacing: 1,
    color: 'rgba(0,0,0,0.72)',
  },

  // --- Jaettava laatikko ---
  originalCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  originalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardLabel: {
    fontFamily: typography.families.bold,
    fontSize: typography.sizes.xs,
    letterSpacing: 2,
    color: colors.textOnDarkMuted,
    marginBottom: spacing.xs,
  },
  originalName: {
    fontFamily: typography.families.semibold,
    fontSize: typography.sizes['4xl'],
    color: colors.textOnDark,
  },
  originalMeta: {
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.md,
    color: colors.textOnDarkMuted,
    marginTop: spacing.xs / 2,
  },
  originalWeight: {
    fontFamily: typography.families.bold,
    fontSize: typography.sizes['5xl'],
    color: colors.textOnDark,
  },

  // --- Edistyminen ---
  balanceBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  balanceNumbers: {
    fontFamily: typography.families.bold,
    fontSize: typography.sizes['4xl'],
    color: colors.textOnDark,
  },
  progressTrack: {
    height: 10,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  progressFillOk: {
    backgroundColor: colors.barFill,
  },
  progressFillOver: {
    backgroundColor: colors.deleteRed,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  waitingText: {
    flex: 1,
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.lg,
    color: colors.textOnDark,
  },
  balanceOk: {
    fontFamily: typography.families.semibold,
    fontSize: typography.sizes.lg,
    color: colors.successText,
  },
  balanceShort: {
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.lg,
    color: colors.textOnDarkMuted,
  },
  balanceOver: {
    fontFamily: typography.families.semibold,
    fontSize: typography.sizes.lg,
    color: colors.deletedText,
  },

  // --- Osalista ---
  partsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  partIndex: {
    fontFamily: typography.families.bold,
    fontSize: typography.sizes.base,
    color: colors.textOnDarkMuted,
    width: 22,
  },
  partEan: {
    flex: 1,
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.lg,
    color: colors.textOnDark,
  },
  partWeight: {
    fontFamily: typography.families.semibold,
    fontSize: typography.sizes['3xl'],
    color: colors.textOnDark,
  },
  partsEmpty: {
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.base,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  partsList: {
    flex: 1,
  },

  // --- Hävikin kuittaus ---
  lossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: radii.xl,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  lossRowConfirmed: {
    borderColor: colors.actionGreen,
    backgroundColor: 'rgba(57,245,106,0.10)',
  },
  lossText: {
    flex: 1,
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.base,
    color: colors.textOnDark,
  },

  // --- Tallennus ---
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  blockReason: {
    flex: 1,
    fontFamily: typography.families.regular,
    fontSize: typography.sizes.base,
    color: colors.textOnDarkMuted,
  },
  saveBtn: {
    ...glassActionSurface,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  saveBtnText: {
    fontFamily: typography.families.bold,
    fontSize: typography.sizes.xl,
    letterSpacing: 1,
    color: 'rgba(0,0,0,0.78)',
  },
  disabled: {
    opacity: 0.45,
  },

  // --- Valintamodaali kun samalla EAN-koodilla on monta laatikkoa ---
  pickerScroll: {
    maxHeight: 320,
  },
  pickerRowDisabled: {
    opacity: 0.4,
  },

  // --- Muistutuspalkki (ScreenLayout, näkyy joka näytöllä) ---
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  bannerText: {
    flex: 1,
    fontFamily: typography.families.bold,
    fontSize: typography.sizes.base,
    letterSpacing: 0.5,
    color: colors.white,
  },
});

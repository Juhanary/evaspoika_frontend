import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { glassActionSurface } from './styleFactory';

// ===========================================================================
// BatchListScreen styles.
// ===========================================================================
export const batchStyles = StyleSheet.create({
  // Lasikortilla on padding: 0 ja 44 px:n kulmapyöristys, joten tämä otsikko on
  // kortin ensimmäisenä lapsena aivan vasemmassa yläkulmassa ellei se tee itse tilaa.
  blColHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    fontSize: 30,
    color: '#E5E5E5',
    fontWeight: '500' as const,
  },
  blRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  blDateText: { flex: 1, fontSize: 25, color: '#E5E5E5' },
  blWarnIcon: { marginRight: 6 },
  blBtnGroup: { flexDirection: 'row' as const, gap: 8, marginRight: 12 },
  blAdjBtn: {
    ...glassActionSurface,
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  blWeightText: {
    fontSize: 25,
    fontWeight: '500' as const,
    color: colors.white,
    width: 140,
    textAlign: 'right' as const,
  },
  blEmpty: { padding: 16, color: '#888', textAlign: 'center' as const },
  blFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  blValmisBtn: {
    ...glassActionSurface,
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  blValmisBtnText: {
    color: colors.textOnDark,
    fontWeight: '700' as const,
    fontSize: 25,
  },
  blTotalText: { fontSize: 14, fontWeight: '700' as const, color: colors.text, letterSpacing: 0.5 },
  blTotalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  blTotalLabel: {
    fontFamily: typography.families.semibold,
    fontSize: 26,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  blTotalValue: {
    fontFamily: typography.families.semibold,
    fontSize: 26,
    color: colors.white,
  },
  // --- Weight adjustment modal ---
  blAdjOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  blAdjCard: {
    maxWidth: 400,
    minWidth: 400,
    maxHeight: '90%' as `${number}%`,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    gap: spacing.md,
  },
  blAdjTitle: {
    fontFamily: typography.families.semibold,
    fontSize: 22,
    color: 'rgba(0,0,0,0.82)',
    marginBottom: 4,
  },
  blDeleteHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  blDeleteReasonInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    minHeight: 90,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlignVertical: 'top' as const,
    backgroundColor: '#F5F5F5',
    fontFamily: typography.families.regular,
    fontSize: 17,
    color: 'rgba(0,0,0,0.82)',
  },
  blAdjCurrentWeight: {
    fontFamily: typography.families.regular,
    fontSize: 15,
    color: 'rgba(0,0,0,0.5)',
  },
  blAdjInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: typography.families.regular,
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
    backgroundColor: '#F5F5F5',
  },
  blAdjBtnRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: 4,
  },
  blAdjCancelBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.18)',
  },
  blAdjCancelBtnText: {
    fontFamily: typography.families.regular,
    fontSize: 17,
    color: 'rgba(0,0,0,0.6)',
  },
  blAdjSaveBtn: {
    flex: 1,
    borderRadius: 50,
    minHeight: 52,
    paddingVertical: 15,
    alignItems: 'center' as const,
    backgroundColor: colors.actionGreen,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
  },
  blAdjSaveBtnText: {
    fontFamily: typography.families.semibold,
    fontSize: 17,
    color: 'rgba(0,0,0,0.82)',
  },

  // --- BatchListScreen: erän laatikot (tumma variantti) ---
  blChevron: { marginRight: 8 },
  blBoxList: {
    paddingLeft: 34,
    paddingRight: 16,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  blBoxRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(229,229,229,0.28)',
  },
  blBoxOrdinal: {
    minWidth: 28,
    fontSize: 18,
    fontFamily: typography.families.regular,
    color: colors.textOnDarkMuted,
    textAlign: 'right' as const,
  },
  blBoxEan: {
    flex: 1,
    fontSize: 22,
    fontFamily: typography.families.semibold,
    color: '#E5E5E5',
  },
  blBoxPacked: {
    fontSize: 16,
    fontFamily: typography.families.regular,
    color: colors.textOnDarkMuted,
  },
  blBoxWeight: {
    minWidth: 96,
    fontSize: 22,
    fontFamily: typography.families.semibold,
    color: '#E5E5E5',
    textAlign: 'right' as const,
  },
  blBoxOriginal: {
    minWidth: 118,
    fontSize: 14,
    fontFamily: typography.families.regular,
    color: colors.danger100pvonWhite,
    textAlign: 'right' as const,
  },
  blBoxHint: {
    paddingVertical: spacing.sm,
    fontSize: 18,
    fontFamily: typography.families.regular,
    color: colors.textOnDarkMuted,
  },
  blBoxError: {
    paddingVertical: spacing.sm,
    fontSize: 18,
    fontFamily: typography.families.regular,
    color: colors.deletedText,
  },
  // Rivin napit ovat listan molemmissa varianteissa samankokoiset: kosketusalue on
  // sama riippumatta siitä kummalla näytöllä lista on auki.
  blBoxActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // --- Erätason painonkorjaus laatikkolistan alla ---
  // Toissijainen ja nimetty: painoa muutetaan laatikoittain, mutta hävikkiin kirjattu
  // laatikko ei ole enää listalla eikä sen painoa voi palauttaa laatikon kautta.
  blBatchAdjRow: {
    paddingHorizontal: 34,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  blBatchAdjText: {
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: colors.textOnDarkMuted,
  },
  blBatchAdjBtnRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },

  // --- Laatikon poisto -modaali (jaettu molempien varianttien kesken) ---
  blBoxDelOverlay: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: spacing.xl,
  },
  blBoxDelCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: spacing.xl,
    gap: spacing.md,
  },
  blBoxDelTitle: {
    fontFamily: typography.families.semibold,
    fontSize: 22,
    color: colors.textDark,
  },
  blBoxDelDetail: {
    fontFamily: typography.families.regular,
    fontSize: 17,
    color: colors.textSubtle,
  },
  blBoxDelWarning: {
    fontFamily: typography.families.regular,
    fontSize: 15,
    color: colors.warning,
  },
  blBoxDelInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: typography.families.regular,
    fontSize: 18,
    color: colors.textDark,
  },
  blBoxDelBtnRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  blBoxDelCancelBtn: {
    flex: 1,
    borderRadius: 50,
    minHeight: 52,
    paddingVertical: 15,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.18)',
  },
  blBoxDelCancelBtnText: {
    fontFamily: typography.families.regular,
    fontSize: 17,
    color: 'rgba(0,0,0,0.6)',
  },
  blBoxDelConfirmBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center' as const,
    backgroundColor: colors.deleteRed,
  },
  blBoxDelConfirmBtnText: {
    fontFamily: typography.families.semibold,
    fontSize: 17,
    color: colors.white,
  },
  // Painon muutos ei ole tuhoava toimenpide, joten se ei käytä poiston punaista.
  blBoxSaveBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center' as const,
    backgroundColor: colors.actionGreen,
  },
  blBoxSaveBtnText: {
    fontFamily: typography.families.semibold,
    fontSize: 17,
    color: 'rgba(0,0,0,0.82)',
  },

  // --- AddBatchModal: erän lisäys ilman vaakaa ---
  // Kuori (smShell, smPanel, smTableRow…) tulee orderStyles-tiedostosta, jotta
  // modaali näyttää samalta kuin LISÄÄ LAATIKOITA sen vieressä. Vain tämän
  // modaalin omat kentät ovat täällä.
  abmSelectText: {
    flex: 1,
    fontFamily: typography.families.semibold,
    fontSize: 18,
    color: 'rgba(0,0,0,0.82)',
  },
  abmSelectPlaceholder: { color: 'rgba(0,0,0,0.42)' },
  abmOrdinalCell: {
    width: 28,
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: 'rgba(0,0,0,0.46)',
  },
  abmEanInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    fontFamily: typography.families.regular,
    fontSize: 16,
    color: 'rgba(0,0,0,0.82)',
  },
  abmAddBoxBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed' as const,
    borderColor: 'rgba(0,0,0,0.22)',
  },
  abmAddBoxBtnText: {
    fontFamily: typography.families.semibold,
    fontSize: 17,
    color: 'rgba(0,0,0,0.7)',
  },
  abmHint: {
    fontFamily: typography.families.regular,
    fontSize: 14,
    color: 'rgba(0,0,0,0.5)',
    paddingTop: spacing.xs,
  },
  abmPickerScroll: { maxHeight: 320 },
  // Huomautus joka muuttaa sen mitä nappi tekee — ei sama asia kuin ohjeteksti.
  abmNotice: {
    fontFamily: typography.families.semibold,
    fontSize: 15,
    color: colors.warning,
    paddingBottom: spacing.sm,
  },
});

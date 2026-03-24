import { StyleSheet } from 'react-native';
import { colors } from '@/src/shared/constants/colors';
import { spacing } from '@/src/shared/constants/spacing';
import { typography } from '@/src/shared/constants/typography';
import { radii } from '@/src/shared/constants/radii';

export const components = StyleSheet.create({
  // --- Inputs ---
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    fontSize: typography.sizes.xl,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.borderMid,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    fontSize: typography.sizes.base,
    marginBottom: spacing.sm,
  },
  scanInput: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.sm,
  },

  // --- Cards ---
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    backgroundColor: colors.surface,
  },
  cardWhite: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  cardSuccess: {
    backgroundColor: colors.successLight,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },

  // --- Chips ---
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borderMid,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.accentDark,
    borderColor: colors.accentDark,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },

  // --- Buttons ---
  primaryBtn: {
    backgroundColor: colors.success,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xl,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.md,
    padding: spacing.sm + 2,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  outlineBtnText: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  dangerText: {
    color: colors.dangerMid,
    fontSize: typography.sizes['3xl'],
    paddingHorizontal: spacing.sm,
  },

  // --- Meta rows (label + value) ---
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  metaLabel: {
    fontWeight: typography.weights.semibold,
  },
  metaValue: {
    color: colors.textSubtle,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },

  // --- Section headers ---
  sectionHeader: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.text,
  },

  // --- Text helpers ---
  mutedText: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: spacing.xl,
  },
  errorText: {
    color: colors.dangerDark,
  },
  helperText: {
    color: colors.textSubtle,
  },
  updatedText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  countText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginBottom: spacing.xs + 2,
  },

  // --- Code / payload blocks ---
  codeBlock: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.textDark,
  },
  codeText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
  },

  // --- Footer (bottom action bar) ---
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    padding: spacing.xl,
    maxHeight: '70%',
  },
  modalTitle: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes['2xl'],
    marginBottom: spacing.md,
  },
  modalEmpty: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  modalRow: {
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  modalRowText: {
    fontSize: typography.sizes.lg,
    color: colors.textDark,
  },
  modalCancelBtn: {
    marginTop: spacing.md,
    padding: spacing.md + 2,
    alignItems: 'center',
    backgroundColor: colors.surfaceMid,
    borderRadius: radii.md,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
});

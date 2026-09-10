import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { fs, s } from './scale';

// Mitat seuraavat Figma-designia "Frame 72 / KOTI" (kanvaasi 1024x1366 dp).
// Luvut ovat designin dp-arvoja sellaisenaan; s() ja fs() kääntävät ne
// laitteen leveydelle (ks. scale.ts). Näin sama näyttö toimii sekä varaston
// tabletilla (800 dp) että puhelimessa ilman erillisiä arvoja.
//
// Kaksi poikkeusta: prosenttimitat ovat jo valmiiksi suhteellisia, ja
// hiusviivat (height/borderWidth: 1) pidetään yhdessä pisteessä – skaalattuna
// ne vain sumenisivat ilman että ohuus paranisi.

export const homeStyles = StyleSheet.create({
  outerScroll: {
    flex: 1,
  },
  outerScrollContent: {
    paddingHorizontal: '10%',
    paddingTop: s(spacing.xxl),
    paddingBottom: s(40),
    gap: s(spacing.xxl),
  },
  card: {
    padding: 0,
    borderRadius: s(71),
  },
  ordersCard: {
    padding: 0,
    borderRadius: s(71),
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: s(spacing.xl),
  },
  logo: {
    width: s(379),
    height: s(124),
  },
  logoSubtitle: {
    marginTop: s(-2),
    fontFamily: typography.families.regular,
    fontSize: fs(32),
    fontWeight: '400',
    letterSpacing: s(2),
    color: colors.textOnDark,
  },
  topArea: {
    // Napit ovat designissa 43.5 dp kortin reunaa kapeammat.
    paddingHorizontal: s(44),
    paddingTop: s(spacing.xxl),
    paddingBottom: s(84),
  },
  btnGroup: {
    flexDirection: 'column',
    gap: s(36),
  },
  // Paikalliset ohitukset jaetulle glassNav-variantille: designin nappi on
  // 156 dp korkea ja hieman vaaleampi. Jaettu tyyli jää ennalleen, koska sama
  // variantti on käytössä tilausnäytöllä.
  navButton: {
    height: s(156),
    borderRadius: s(66.5),
    opacity: 1,
    backgroundColor: 'rgba(217,217,217,0.2)',
    // Ei varjoa. Androidilla elevation piirtää varjon läpinäkyvän taustan
    // läpi, jolloin napin keskelle jää vaalea palkki: tasan napin rajat
    // sisennettynä borderRadiusin verran.
  },
  navButtonLabel: {
    fontSize: fs(64),
  },
  ordersSection: {
    paddingHorizontal: s(33),
    paddingTop: s(17),
    paddingBottom: s(spacing.xl),
  },
  ordersSectionLabel: {
    fontFamily: typography.families.regular,
    fontSize: fs(32),
    fontWeight: '400',
    color: colors.white,
    alignSelf: 'center',
  },
  ordersSectionDivider: {
    width: s(286),
    height: 1,
    alignSelf: 'center',
    backgroundColor: colors.white,
    marginTop: s(10),
    marginBottom: s(17),
  },
  ordersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: s(14),
    gap: s(spacing.sm),
  },
  ordersRowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ordersRowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  ordersRowName: {
    width: '46%',
    fontFamily: typography.families.medium,
    fontSize: fs(14),
    fontWeight: '500',
    color: colors.white,
  },
  ordersRowSummary: {
    flex: 1,
    fontFamily: typography.families.medium,
    fontSize: fs(14),
    fontWeight: '500',
    color: colors.white,
  },
  ordersRowDate: {
    minWidth: s(110),
    textAlign: 'right',
    fontFamily: typography.families.medium,
    fontSize: fs(14),
    fontWeight: '500',
    color: colors.white,
  },
  searchResultsPadding: {
    paddingHorizontal: s(spacing.xl),
    paddingTop: s(spacing.lg),
  },
  syncBtn: {
    position: 'absolute',
    top: s(spacing.xl),
    right: s(spacing.lg),
    width: s(58),
    height: s(58),
    borderRadius: s(49),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
});

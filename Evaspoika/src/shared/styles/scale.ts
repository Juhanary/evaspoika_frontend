import { Dimensions } from 'react-native';

// Figma-designit on piirretty 1024 dp leveälle kanvaasille, mutta yksikään
// laite ei ole sen levyinen: varaston Lenovo TB311FU on 800 dp (1200x1920 px
// @ 240 dpi) ja puhelin tyypillisesti 360–430 dp. Mitat kirjoitetaan siksi
// tyylitiedostoihin designin dp-lukuina ja käännetään laitteen leveydelle
// täällä, jolloin sama näyttö skaalautuu ilman laitekohtaisia arvoja.
//
// Sovellus on lukittu portrait-tilaan (app/_layout.tsx), joten ikkunan leveys
// ei muutu ajon aikana. Siksi kerroin luetaan kerran moduulin latautuessa eikä
// tarvita useWindowDimensions-hookkia, joka ei sopisi StyleSheet.createen.

export const DESIGN_WIDTH = 1024;

export const scaleFactor = Dimensions.get('window').width / DESIGN_WIDTH;

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Designin dp-arvo → tämän laitteen dp-arvo. Käytä kaikkiin mittoihin:
 * korkeudet, leveydet, paddingit, gapit, radiukset, letterSpacing.
 */
export const s = (designDp: number) => round(designDp * scaleFactor);

/**
 * Alaraja fonttikoolle. Puhtaasti suhteellinen skaalaus kutistaisi designin
 * pienimmän tekstin (14 dp) puhelimella noin 5 dp:hen, mikä ei ole luettavaa.
 * Tabletilla raja ei aktivoidu: s(14) = 10.9, eli käytännössä sama kuin 11.
 */
export const MIN_FONT_SIZE = 11;

/** Kuten s(), mutta ei mene MIN_FONT_SIZEn alle. Käytä fontSizeen. */
export const fs = (designDp: number) => Math.max(MIN_FONT_SIZE, s(designDp));

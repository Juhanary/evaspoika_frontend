export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 15,
    xl: 16,
    '2xl': 17,
    '3xl': 18,
    '4xl': 20,
    '5xl': 22,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Montserrat-fonttiperheet ladataan app/_layout.tsx:ssä. Nämä tokenit
  // korvaavat aiemmin sirpaloituneet 'Montserrat_...' -merkkijonoliteraalit
  // tyylitiedostoissa, jotta fontin nimi on yhdessä paikassa.
  families: {
    light: 'Montserrat_300Light',
    regular: 'Montserrat_400Regular',
    medium: 'Montserrat_500Medium',
    semibold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
  },
} as const;

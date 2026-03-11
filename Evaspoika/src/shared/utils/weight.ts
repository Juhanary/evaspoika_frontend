export const GRAMS_PER_KG = 1000;

export const kgToGrams = (kg: number) => Math.round(kg * GRAMS_PER_KG);

export const parseWeightInput = (value: string) => Number(value.replace(',', '.').trim());

export const parseWeightToGrams = (value: string) => {
  const parsedKg = parseWeightInput(value);
  return Number.isFinite(parsedKg) ? kgToGrams(parsedKg) : Number.NaN;
};

export const parseGramsToBoxes = (grams: number, boxSize: number) => {  
  boxSize = boxSize / GRAMS_PER_KG; // Convert box size from kg to grams
  if (!Number.isFinite(grams) || !Number.isFinite(boxSize) || boxSize <= 0) return Number.NaN;
  return (grams / boxSize);
};

export const formatKg = (grams: number) => {
  if (!Number.isFinite(grams)) return '-';
  const value = grams / GRAMS_PER_KG;
  return value.toFixed(3).replace(/\.?0+$/, '');
};

 export const MIN_REMAINING_GRAMS = 500;
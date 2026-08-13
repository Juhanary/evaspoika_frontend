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
  return value.toFixed(2).replace(/\.?0+$/, '');
};

// Valmis näyttöteksti yksikön kanssa, esim. "12,5 kg". formatKg pyöristää
// kahteen desimaaliin; loki ja jäljitys näyttävät painot grammatarkkuudella,
// koska punnitustulokset tallennetaan grammoina.
export const formatKgLabel = (grams?: number | null) => {
  if (typeof grams !== 'number' || !Number.isFinite(grams)) return '-';

  return `${(grams / GRAMS_PER_KG).toLocaleString('fi-FI', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} kg`;
};

 export const MIN_REMAINING_GRAMS = 500;
// Weights are always stored in kg and lengths in cm; these helpers convert for display/input.

export type WeightUnit = 'kg' | 'lbs';
export type LengthUnit = 'cm' | 'inch';

const KG_PER_LB = 0.45359237;
const CM_PER_INCH = 2.54;

const round = (n: number, step = 0.1) => Math.round(n / step) * step;

export const kgToUnit = (kg: number, unit: WeightUnit) => (unit === 'lbs' ? round(kg / KG_PER_LB) : round(kg));
export const unitToKg = (value: number, unit: WeightUnit) => (unit === 'lbs' ? round(value * KG_PER_LB, 0.01) : value);

export const cmToUnit = (cm: number, unit: LengthUnit) => (unit === 'inch' ? round(cm / CM_PER_INCH) : round(cm));
export const unitToCm = (value: number, unit: LengthUnit) => (unit === 'inch' ? round(value * CM_PER_INCH, 0.01) : value);

const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });

export const formatWeight = (kg: number | null | undefined, unit: WeightUnit) =>
  kg == null ? '-' : `${nf.format(kgToUnit(kg, unit))} ${unit}`;

export const formatLength = (cm: number | null | undefined, unit: LengthUnit) =>
  cm == null ? '-' : `${nf.format(cmToUnit(cm, unit))} ${unit === 'inch' ? 'in' : 'cm'}`;

export const formatNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: digits }).format(n);

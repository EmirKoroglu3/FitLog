// Body-fat estimate from what the user already logs, so nobody has to type a % they don't know.
//  1. U.S. Navy circumference method (Hodgdon & Beckett) when waist + neck (+ hip for women) are given.
//     Typically within ~3-4 points of a DEXA scan.
//  2. Otherwise Deurenberg BMI formula from height, weight, age and sex (rougher, ~4-5 points).

export type BodyFatMethod = 'navy' | 'bmi';

export interface BodyFatInput {
  gender?: string; // profile value: 'Erkek' | 'Kadın' | 'Diğer'
  heightCm?: number;
  weightKg?: number;
  ageYears?: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
}

export interface BodyFatEstimate {
  percent: number; // one decimal
  method: BodyFatMethod;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number) => Math.min(60, Math.max(3, n));
const isFemale = (g?: string) => (g ?? '').toLocaleLowerCase('tr-TR').startsWith('kad');

export function ageFromBirthDate(birthDate?: string, now = new Date()): number | undefined {
  if (!birthDate) return undefined;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return undefined;
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age > 0 && age < 120 ? age : undefined;
}

export function estimateBodyFat(i: BodyFatInput): BodyFatEstimate | null {
  const female = isFemale(i.gender);
  const h = i.heightCm;

  // 1) Navy method (needs a valid circumference difference)
  if (h && h > 100 && i.waistCm && i.neckCm) {
    if (!female && i.waistCm > i.neckCm) {
      const pct = 495 / (1.0324 - 0.19077 * Math.log10(i.waistCm - i.neckCm) + 0.15456 * Math.log10(h)) - 450;
      if (Number.isFinite(pct)) return { percent: round1(clamp(pct)), method: 'navy' };
    }
    if (female && i.hipCm && i.waistCm + i.hipCm > i.neckCm) {
      const pct = 495 / (1.29579 - 0.35004 * Math.log10(i.waistCm + i.hipCm - i.neckCm) + 0.221 * Math.log10(h)) - 450;
      if (Number.isFinite(pct)) return { percent: round1(clamp(pct)), method: 'navy' };
    }
  }

  // 2) BMI-based fallback (Deurenberg 1991); age 30 assumed when unknown
  if (h && h > 100 && i.weightKg && i.weightKg > 25) {
    const bmi = i.weightKg / (h / 100) ** 2;
    const age = i.ageYears ?? 30;
    const pct = 1.2 * bmi + 0.23 * age - 10.8 * (female ? 0 : 1) - 5.4;
    return { percent: round1(clamp(pct)), method: 'bmi' };
  }

  return null;
}

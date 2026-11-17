// Estimated energy expenditure for logged sessions.
//
// Walking / running use the ACSM metabolic equations (speed + grade), which is what
// treadmills themselves use:
//   walking  VO2 = 0.1·S + 1.8·S·G + 3.5      (S = m/min, G = grade as a fraction)
//   running  VO2 = 0.2·S + 0.9·S·G + 3.5
//   kcal/min = VO2 (ml/kg/min) × kg / 1000 × 5
// Everything else uses MET values from the Compendium of Physical Activities:
//   kcal/min = MET × 3.5 × kg / 200
// These are estimates (±15–20%); the UI labels them as such.

import type { WorkoutSession } from '../services/trackingService';

export const DEFAULT_WEIGHT_KG = 75;

/** Approximate MET per activity (moderate effort). */
const MET: Record<string, number> = {
  Koşu: 9.8,
  Yürüyüş: 3.5,
  Bisiklet: 7.5,
  Yüzme: 7,
  Kürek: 7,
  Eliptik: 5,
  'İp Atlama': 11,
  Merdiven: 9,
  HIIT: 8,
  Diğer: 6,
};

/** Resistance training, "vigorous effort" incl. rest between sets. */
const STRENGTH_MET = 5;
/** Average time per working set incl. rest, when the session has no duration. */
const MINUTES_PER_SET = 3;

/** Walking (≤ 6.5 km/h) vs running, unless the activity says otherwise. */
function isRunning(activity: string | null | undefined, speedKmh: number) {
  if (activity === 'Koşu') return true;
  if (activity === 'Yürüyüş') return false;
  return speedKmh > 6.5;
}

/** kcal for walking/running at a speed (km/h) and incline (%) for some minutes (ACSM). */
export function treadmillKcal(speedKmh: number, inclinePercent: number, minutes: number, weightKg: number, running?: boolean) {
  if (speedKmh <= 0 || minutes <= 0) return 0;
  const s = (speedKmh * 1000) / 60; // m/min
  const g = Math.max(0, inclinePercent) / 100;
  const run = running ?? speedKmh > 6.5;
  const vo2 = run ? 0.2 * s + 0.9 * s * g + 3.5 : 0.1 * s + 1.8 * s * g + 3.5;
  return ((vo2 * weightKg) / 1000) * 5 * minutes;
}

export function metKcal(met: number, minutes: number, weightKg: number) {
  return ((met * 3.5 * weightKg) / 200) * Math.max(0, minutes);
}

export interface SessionBurn {
  kcal: number;
  /** How it was estimated, shown to the user. */
  method: 'entered' | 'treadmill' | 'met' | 'strength';
}

export function estimateSessionKcal(s: WorkoutSession, weightKg: number): SessionBurn {
  if (s.caloriesBurned && s.caloriesBurned > 0) return { kcal: s.caloriesBurned, method: 'entered' };

  const minutes = s.durationSeconds / 60;

  if (s.type === 'cardio') {
    const activity = s.cardioActivity ?? s.name;
    // Speed: entered, or derived from distance and time
    const speed = s.speedKmh ?? (s.distanceKm && minutes > 0 ? s.distanceKm / (minutes / 60) : null);
    if (speed && (activity === 'Yürüyüş' || activity === 'Koşu' || s.inclinePercent != null)) {
      return {
        kcal: Math.round(treadmillKcal(speed, s.inclinePercent ?? 0, minutes, weightKg, isRunning(activity, speed))),
        method: 'treadmill',
      };
    }
    return { kcal: Math.round(metKcal(MET[activity] ?? MET.Diğer, minutes, weightKg)), method: 'met' };
  }

  const activeMinutes = minutes > 0 ? minutes : s.setCount * MINUTES_PER_SET;
  return { kcal: Math.round(metKcal(STRENGTH_MET, activeMinutes, weightKg)), method: 'strength' };
}

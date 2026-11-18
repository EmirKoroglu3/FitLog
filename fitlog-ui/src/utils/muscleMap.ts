import { findExercise } from '../data/exerciseGuide';

/** Body regions drawn on the muscle map. */
export type MuscleId =
  | 'chest_upper' | 'chest_mid' | 'chest_lower'
  | 'delt_front' | 'delt_side' | 'delt_rear'
  | 'biceps' | 'triceps' | 'forearms'
  | 'traps' | 'lats' | 'midback' | 'lowerback'
  | 'abs' | 'obliques'
  | 'glutes' | 'glute_med' | 'quads' | 'hamstrings' | 'adductors' | 'calves';

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  chest_upper: 'Üst göğüs',
  chest_mid: 'Orta göğüs',
  chest_lower: 'Alt göğüs',
  delt_front: 'Ön omuz',
  delt_side: 'Yan omuz',
  delt_rear: 'Arka omuz',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Ön kol',
  traps: 'Trapez',
  lats: 'Kanat (lat)',
  midback: 'Orta sırt',
  lowerback: 'Bel',
  abs: 'Karın',
  obliques: 'Yan karın',
  glutes: 'Kalça',
  glute_med: 'Yan kalça',
  quads: 'Ön bacak',
  hamstrings: 'Arka bacak',
  adductors: 'İç bacak',
  calves: 'Baldır',
};

type Share = [MuscleId, number];

/**
 * Muscle-group words used in the exercise library → regions (weight 0..1).
 * Order matters: more specific phrases first ("üst göğüs" before "göğüs").
 */
const TERMS: [string, Share[]][] = [
  ['üst göğüs', [['chest_upper', 1]]],
  ['alt göğüs', [['chest_lower', 1]]],
  ['göğüs', [['chest_mid', 1], ['chest_upper', 0.25], ['chest_lower', 0.25]]],
  ['ön omuz', [['delt_front', 1]]],
  ['yan omuz', [['delt_side', 1]]],
  ['lateral', [['delt_side', 1]]],
  ['arka omuz', [['delt_rear', 1]]],
  ['omuz', [['delt_front', 0.6], ['delt_side', 0.6], ['delt_rear', 0.3]]],
  ['brachialis', [['biceps', 0.8], ['forearms', 0.4]]],
  ['biceps', [['biceps', 1]]],
  ['triceps', [['triceps', 1]]],
  ['ön kol', [['forearms', 1]]],
  ['kavrama', [['forearms', 1]]],
  ['trapez', [['traps', 1]]],
  ['kanat', [['lats', 1]]],
  ['latissimus', [['lats', 1]]],
  ['orta sırt', [['midback', 1]]],
  ['üst sırt', [['midback', 0.7], ['traps', 0.5]]],
  ['alt sırt', [['lowerback', 1]]],
  ['bel', [['lowerback', 1]]],
  ['sırt', [['lats', 0.6], ['midback', 0.6]]],
  ['yan karın', [['obliques', 1]]],
  ['oblik', [['obliques', 1]]],
  ['oblique', [['obliques', 1]]],
  ['kalça fleksör', [['abs', 0.3]]],
  ['yan kalça', [['glute_med', 1]]],
  ['gluteus medius', [['glute_med', 1]]],
  ['kalça (yan)', [['glute_med', 1]]],
  ['kalça', [['glutes', 1]]],
  ['ön bacak', [['quads', 1]]],
  ['quadriceps', [['quads', 1]]],
  ['arka bacak', [['hamstrings', 1]]],
  ['hamstring', [['hamstrings', 1]]],
  ['iç bacak', [['adductors', 1]]],
  ['adductor', [['adductors', 1]]],
  ['baldır', [['calves', 1]]],
  ['bacak', [['quads', 0.7], ['hamstrings', 0.5], ['glutes', 0.4]]],
  ['karın', [['abs', 1], ['obliques', 0.3]]],
  ['core', [['abs', 1], ['obliques', 0.5]]],
  ['tüm vücut', [['quads', 0.4], ['glutes', 0.4], ['hamstrings', 0.3], ['lats', 0.3], ['delt_front', 0.3], ['abs', 0.3], ['traps', 0.3]]],
];

function termShares(term: string): Share[] {
  const t = term.toLocaleLowerCase('tr-TR');
  return TERMS.find(([key]) => t.includes(key))?.[1] ?? [];
}

/**
 * How one set of an exercise is split over regions: the first listed muscle is the
 * main mover (full set), the others are assistants (half a set). Null when unknown.
 */
export function exerciseMuscleShares(exerciseName: string): Partial<Record<MuscleId, number>> | null {
  const guide = findExercise(exerciseName);
  if (!guide) return null;
  const out: Partial<Record<MuscleId, number>> = {};
  guide.muscleGroup.split(',').forEach((term, i) => {
    const factor = i === 0 ? 1 : 0.5;
    for (const [id, w] of termShares(term)) out[id] = Math.max(out[id] ?? 0, w * factor);
  });
  return Object.keys(out).length ? out : null;
}

export interface MuscleVolume {
  /** Effective weekly sets per region. */
  sets: Partial<Record<MuscleId, number>>;
  /** Which exercises feed each region (for the details list). */
  sources: Partial<Record<MuscleId, { name: string; sets: number }[]>>;
  /** Exercises the library doesn't know (custom names). */
  unmatched: string[];
}

/** Sums effective sets per region for a list of { name, sets } entries. */
export function muscleVolume(entries: { name: string; sets: number }[]): MuscleVolume {
  const result: MuscleVolume = { sets: {}, sources: {}, unmatched: [] };
  for (const { name, sets } of entries) {
    if (!sets) continue;
    const shares = exerciseMuscleShares(name);
    if (!shares) {
      if (!result.unmatched.includes(name)) result.unmatched.push(name);
      continue;
    }
    for (const [id, w] of Object.entries(shares) as [MuscleId, number][]) {
      const value = sets * w;
      result.sets[id] = (result.sets[id] ?? 0) + value;
      (result.sources[id] ??= []).push({ name, sets: value });
    }
  }
  return result;
}

/**
 * Intensity level for weekly sets. Roughly: <4 little, 4–8 some, 8–12 solid,
 * 12+ a lot (10–20 hard sets a week is the usual hypertrophy range).
 */
export function volumeLevel(sets: number): 0 | 1 | 2 | 3 | 4 {
  if (sets <= 0) return 0;
  if (sets < 4) return 1;
  if (sets < 8) return 2;
  if (sets < 12) return 3;
  return 4;
}

export const LEVEL_LABELS = ['Çalışmıyor', 'Az (<4 set)', 'Orta (4–8)', 'İyi (8–12)', 'Yoğun (12+)'] as const;

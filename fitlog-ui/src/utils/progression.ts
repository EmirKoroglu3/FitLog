import { findExercise } from '../data/exerciseGuide';

export interface Suggestion {
  kind: 'increase' | 'repeat' | 'deload' | 'more-reps';
  weightKg: number;
  reps: number;
  /** Short reason shown to the user. */
  reason: string;
}

/** Smallest sensible jump for the equipment (kg). */
function increment(exerciseName: string, topKg: number): number {
  const equipment = (findExercise(exerciseName)?.equipment ?? '').toLocaleLowerCase('tr-TR');
  if (equipment.includes('dumbbell') || equipment.includes('kettlebell')) return 2;
  if (topKg >= 100 && (equipment.includes('makine') || equipment.includes('leg press'))) return 5;
  return 2.5;
}

const round = (kg: number, step: number) => Math.max(0, Math.round(kg / step) * step);

/**
 * Double-progression rule (the classic "hit all reps → add weight"):
 * - every planned set at the top weight reached the target reps → add the smallest jump
 * - reps fell far short (under 60% of target) → drop ~10% and build back up
 * - otherwise → same weight, beat last time's reps
 * Bodyweight moves (0 kg) progress by one rep instead.
 */
export function suggestNext(
  exerciseName: string,
  last: { weightKg: number; reps: number }[] | undefined,
  targetReps: number,
  targetSets: number,
): Suggestion | null {
  if (!last || last.length === 0 || targetReps <= 0) return null;

  const top = Math.max(...last.map((s) => s.weightKg));
  const atTop = last.filter((s) => s.weightKg === top);
  const minReps = Math.min(...atTop.map((s) => s.reps));
  const allHit = atTop.length >= Math.max(1, targetSets) && atTop.every((s) => s.reps >= targetReps);

  if (top <= 0) {
    const best = Math.max(...last.map((s) => s.reps));
    return { kind: 'more-reps', weightKg: 0, reps: best + 1, reason: `Vücut ağırlığı: geçen sefer en iyi ${best} tekrar, bugün ${best + 1} dene.` };
  }

  if (allHit) {
    const step = increment(exerciseName, top);
    return {
      kind: 'increase',
      weightKg: top + step,
      reps: targetReps,
      reason: `Geçen sefer ${atTop.length} seti de ${targetReps}+ tekrarla bitirdin, +${step} kg zamanı.`,
    };
  }

  if (minReps < targetReps * 0.6) {
    const lighter = round(top * 0.9, increment(exerciseName, top));
    return {
      kind: 'deload',
      weightKg: lighter,
      reps: targetReps,
      reason: `Geçen sefer tekrarlar hedefin çok altında kaldı (${minReps}/${targetReps}); %10 hafifletip formu oturt.`,
    };
  }

  return {
    kind: 'repeat',
    weightKg: top,
    reps: targetReps,
    reason: `Aynı ağırlıkta kal; tüm setlerde ${targetReps} tekrara ulaşınca ağırlık artacak.`,
  };
}

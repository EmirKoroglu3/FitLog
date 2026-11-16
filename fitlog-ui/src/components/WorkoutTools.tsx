import { useState } from 'react';
import { Calculator, Flame, Info } from 'lucide-react';
import { findExercise } from '../data/exerciseGuide';
import { kgToUnit, unitToKg, type WeightUnit } from '../utils/units';
import './WorkoutTools.css';

// Standard Olympic bar and plate sets
const BAR = { kg: 20, lbs: 45 } as const;
const PLATES: Record<WeightUnit, number[]> = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
  lbs: [45, 35, 25, 10, 5, 2.5],
};

/** Plates per side for a target weight (greedy), plus what can't be matched. */
export function platesPerSide(target: number, unit: WeightUnit, bar: number = BAR[unit]) {
  let perSide = (target - bar) / 2;
  if (perSide <= 0) return { plates: [] as number[], remainder: 0 };
  const plates: number[] = [];
  for (const p of PLATES[unit]) {
    while (perSide + 1e-9 >= p) {
      plates.push(p);
      perSide -= p;
    }
  }
  return { plates, remainder: Math.round(perSide * 2 * 100) / 100 };
}

/** Classic ramp: empty bar ×10, 40%×8, 60%×5, 80%×3 (rounded to loadable weights). */
export function warmupSets(workingKg: number, unit: WeightUnit) {
  const step = unit === 'kg' ? 2.5 : unitToKg(5, 'lbs');
  const barKg = unitToKg(BAR[unit], unit);
  const round = (kg: number) => Math.max(barKg, Math.round(kg / step) * step);
  if (workingKg <= barKg) return [];
  const sets = [
    { reps: 10, weightKg: barKg },
    { reps: 8, weightKg: round(workingKg * 0.4) },
    { reps: 5, weightKg: round(workingKg * 0.6) },
    { reps: 3, weightKg: round(workingKg * 0.8) },
  ];
  // drop duplicates (light working weights)
  return sets.filter((s, i) => i === 0 || s.weightKg > sets[i - 1].weightKg);
}

const isBarbell = (name: string) => findExercise(name)?.equipment?.toLowerCase().includes('barbell') ?? false;

interface Props {
  exerciseName: string;
  /** Working weight in the user's unit. */
  targetWeight: number;
  unit: WeightUnit;
  onAddWarmups: (sets: { reps: number; weightKg: number }[]) => void;
}

export function WorkoutTools({ exerciseName, targetWeight, unit, onAddWarmups }: Props) {
  const [open, setOpen] = useState<'plates' | 'warmup' | 'guide' | null>(null);
  const guide = findExercise(exerciseName);
  const barbell = isBarbell(exerciseName);
  const { plates, remainder } = platesPerSide(targetWeight, unit);
  const warmups = warmupSets(unitToKg(targetWeight, unit), unit);

  const toggle = (k: typeof open) => setOpen((o) => (o === k ? null : k));

  return (
    <div className="workout-tools">
      <div className="tool-tabs">
        {barbell && (
          <button type="button" className={open === 'plates' ? 'active' : ''} onClick={() => toggle('plates')} aria-expanded={open === 'plates'}>
            <Calculator size={16} aria-hidden="true" /> Plaka
          </button>
        )}
        {targetWeight > 0 && (
          <button type="button" className={open === 'warmup' ? 'active' : ''} onClick={() => toggle('warmup')} aria-expanded={open === 'warmup'}>
            <Flame size={16} aria-hidden="true" /> Isınma
          </button>
        )}
        {guide && (
          <button type="button" className={open === 'guide' ? 'active' : ''} onClick={() => toggle('guide')} aria-expanded={open === 'guide'}>
            <Info size={16} aria-hidden="true" /> Nasıl yapılır?
          </button>
        )}
      </div>

      {open === 'plates' && (
        <div className="tool-panel">
          {targetWeight <= BAR[unit] ? (
            <p>Sadece bar ({BAR[unit]} {unit}).</p>
          ) : (
            <>
              <p>
                Her tarafa ({BAR[unit]} {unit} bar ile):
              </p>
              <div className="plates">
                {plates.map((p, i) => (
                  <span key={i} className="plate" style={{ height: `${28 + p * (unit === 'kg' ? 1.6 : 0.9)}px` }}>
                    {p}
                  </span>
                ))}
              </div>
              {remainder > 0 && (
                <p className="muted">
                  {remainder} {unit} plakalarla tam yakalanamıyor.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {open === 'warmup' && (
        <div className="tool-panel">
          {warmups.length === 0 ? (
            <p>Bu ağırlık için ısınma setine gerek yok.</p>
          ) : (
            <>
              <ul className="warmup-list">
                {warmups.map((w, i) => (
                  <li key={i}>
                    <span>{kgToUnit(w.weightKg, unit)} {unit}</span>
                    <span>× {w.reps}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  onAddWarmups(warmups);
                  setOpen(null);
                }}
              >
                Isınma setlerini kaydet
              </button>
            </>
          )}
        </div>
      )}

      {open === 'guide' && guide && (
        <div className="tool-panel guide">
          <p className="muscles">
            <strong>Çalışan kaslar:</strong> {guide.muscleGroup}
          </p>
          {guide.steps && (
            <ol>
              {guide.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}
          {guide.tip && <p className="tip">İpucu: {guide.tip}</p>}
        </div>
      )}
    </div>
  );
}

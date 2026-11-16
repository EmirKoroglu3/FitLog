import { bodyApi, goalsApi, sessionsApi, settingsApi, type GoalCategory, type UserSettings } from '../services/trackingService';

/**
 * Earlier versions kept workouts, measurements, goals etc. only in this browser's localStorage.
 * On first login after the update, copy that data to the server once, then mark it as done.
 * Each item is sent separately so one bad record doesn't block the rest.
 */
const inFlight = new Map<string, Promise<number>>();

/** Runs the migration at most once at a time per user (React StrictMode mounts effects twice). */
export function migrateLocalData(userId: string, current: UserSettings): Promise<number> {
  let p = inFlight.get(userId);
  if (!p) {
    p = runMigration(userId, current).finally(() => inFlight.delete(userId));
    inFlight.set(userId, p);
  }
  return p;
}

async function runMigration(userId: string, current: UserSettings): Promise<number> {
  const doneKey = `migratedToServer_${userId}`;
  if (localStorage.getItem(doneKey)) return 0;

  const read = <T>(key: string): T[] => {
    try {
      const v = JSON.parse(localStorage.getItem(`${key}_${userId}`) || '[]');
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  let moved = 0;
  const tryRun = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      moved++;
    } catch {
      /* skip invalid legacy rows */
    }
  };

  // Completed workouts (no set details were stored before)
  for (const w of read<{ date: string; programName?: string; dayName?: string; duration?: number }>('workoutLogs')) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(w.date)) continue;
    await tryRun(() =>
      sessionsApi.create({
        name: (w.dayName || w.programName || 'Antrenman').slice(0, 100),
        type: 'strength',
        startedAt: new Date(`${w.date}T12:00`).toISOString(),
        durationSeconds: Math.max(0, Math.min(86400, Math.round(w.duration ?? 0))),
        notes: 'Eski sürümden aktarıldı',
        sets: [],
      }),
    );
  }

  for (const w of read<{ date: string; glasses: number }>('waterLogs')) {
    if (w.glasses > 0) await tryRun(() => bodyApi.setWater(w.date, Math.min(40, w.glasses)));
  }

  for (const m of read<Record<string, unknown>>('bodyMeasurements')) {
    await tryRun(() =>
      bodyApi.addMeasurement({
        date: String(m.date).slice(0, 10),
        weightKg: num(m.weight),
        bodyFatPercent: num(m.bodyFat),
        chest: num(m.chest),
        waist: num(m.waist),
        hips: num(m.hips),
        biceps: num(m.biceps),
        thigh: num(m.thighs),
        calf: num(m.calves),
        neck: num(m.neck),
      }),
    );
  }

  for (const g of read<Record<string, unknown>>('fitnessGoals')) {
    await tryRun(() =>
      goalsApi.create({
        title: String(g.title || 'Hedef').slice(0, 150),
        category: (g.category as GoalCategory) || 'strength',
        targetValue: num(g.targetValue) ?? 0,
        currentValue: num(g.currentValue) ?? 0,
        unit: String(g.unit || '').slice(0, 20),
        deadline: typeof g.deadline === 'string' && g.deadline ? g.deadline.slice(0, 10) : null,
        completed: !!g.completed,
      }),
    );
  }

  for (const r of read<{ exercise: string; weight: number; date: string }>('oneRMRecords')) {
    await tryRun(() =>
      goalsApi.addOneRepMax({ exerciseName: r.exercise, weightKg: r.weight, date: String(r.date).slice(0, 10) }),
    );
  }

  // Old global preferences
  try {
    const legacy = JSON.parse(localStorage.getItem('appSettings') || 'null');
    const waterGoal = Number(localStorage.getItem(`waterGoal_${userId}`));
    if (legacy || waterGoal) {
      await settingsApi.save({
        ...current,
        defaultRestSeconds: legacy?.defaultRestTime ?? current.defaultRestSeconds,
        weightUnit: legacy?.weightUnit === 'lbs' ? 'lbs' : current.weightUnit,
        measurementUnit: legacy?.measurementUnit === 'inch' ? 'inch' : current.measurementUnit,
        soundEffects: legacy?.soundEffects ?? current.soundEffects,
        waterGoalGlasses: waterGoal > 0 ? waterGoal : current.waterGoalGlasses,
      });
    }
  } catch {
    /* ignore */
  }

  localStorage.setItem(doneKey, new Date().toISOString());
  // Old copies are no longer read anywhere
  ['workoutLogs', 'waterLogs', 'bodyMeasurements', 'fitnessGoals', 'oneRMRecords', 'waterGoal', 'achievements'].forEach((k) =>
    localStorage.removeItem(`${k}_${userId}`),
  );
  localStorage.removeItem('appSettings');
  return moved;
}

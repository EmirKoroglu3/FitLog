import type { WorkoutSession, WaterLog, BodyMeasurement } from '../services/trackingService';
import type { NutritionLogDto } from '../types/nutrition';
import type { ProfileDto } from '../types/profile';
import { toLocalDateInput } from './dateTime';

export interface AchievementInputs {
  sessions: WorkoutSession[]; // with sets
  water: WaterLog[];
  waterGoal: number;
  measurements: BodyMeasurement[];
  nutritionLogs: NutritionLogDto[];
  proteinTarget?: number | null;
  profile?: ProfileDto | null;
  programCount: number;
}

/** Progress value for every achievement id, derived only from server data. */
export type AchievementProgress = Record<string, number>;

const localDay = (iso: string) => toLocalDateInput(new Date(iso));

/** Longest run of consecutive calendar days present in the set. */
export function longestDayStreak(days: Iterable<string>): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    const cur = new Date(`${d}T00:00`);
    run = prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

/** Consecutive days ending today (or yesterday, so an unfinished today doesn't break it). */
export function currentDayStreak(days: Iterable<string>, today = new Date()): number {
  const set = new Set(days);
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!set.has(toLocalDateInput(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (set.has(toLocalDateInput(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

const weekKey = (day: string) => {
  const d = new Date(`${day}T00:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return toLocalDateInput(d);
};

/** Number of times an exercise's heaviest working set was beaten (first time doesn't count). */
export function countPersonalRecords(sessions: WorkoutSession[]): number {
  const best = new Map<string, number>();
  let prs = 0;
  for (const s of [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt))) {
    const sessionBest = new Map<string, number>();
    s.sets
      .filter((x) => !x.isWarmup && x.reps > 0 && x.weightKg > 0)
      .forEach((x) => sessionBest.set(x.exerciseName, Math.max(sessionBest.get(x.exerciseName) ?? 0, x.weightKg)));
    sessionBest.forEach((w, name) => {
      const prev = best.get(name);
      if (prev !== undefined && w > prev) prs++;
      if (prev === undefined || w > prev) best.set(name, w);
    });
  }
  return prs;
}

const maxLift = (sessions: WorkoutSession[], names: string[]) => {
  const lower = names.map((n) => n.toLocaleLowerCase('tr-TR'));
  let max = 0;
  sessions.forEach((s) =>
    s.sets.forEach((x) => {
      if (!x.isWarmup && x.reps > 0 && lower.includes(x.exerciseName.toLocaleLowerCase('tr-TR'))) max = Math.max(max, x.weightKg);
    }),
  );
  return max;
};

export function computeAchievementProgress(i: AchievementInputs): AchievementProgress {
  const workoutDays = i.sessions.map((s) => localDay(s.startedAt));

  const perWeek = new Map<string, Set<string>>();
  const perMonth = new Map<string, number>();
  workoutDays.forEach((d) => {
    perWeek.set(weekKey(d), (perWeek.get(weekKey(d)) ?? new Set()).add(d));
    perMonth.set(d.slice(0, 7), (perMonth.get(d.slice(0, 7)) ?? 0) + 1);
  });

  const hours = i.sessions.map((s) => new Date(s.startedAt).getHours());

  const proteinByDay = new Map<string, number>();
  i.nutritionLogs.forEach((l) => proteinByDay.set(localDay(l.date), (proteinByDay.get(localDay(l.date)) ?? 0) + l.protein));

  const p = i.profile;
  const profileComplete = p && p.height && p.weight && p.gender && p.birthDate && p.fitnessGoal ? 1 : 0;

  const total = i.sessions.length;
  const streak = currentDayStreak(workoutDays);
  const prs = countPersonalRecords(i.sessions);

  return {
    first_workout: total,
    workout_10: total,
    workout_25: total,
    workout_50: total,
    workout_100: total,
    workout_250: total,
    streak_3: streak,
    streak_7: streak,
    streak_14: streak,
    streak_30: streak,
    streak_100: streak,
    week_complete: Math.max(0, ...[...perWeek.values()].map((s) => s.size)),
    month_active: Math.max(0, ...perMonth.values()),
    early_bird: hours.filter((h) => h < 7).length,
    night_owl: hours.filter((h) => h >= 22).length,
    first_pr: prs,
    pr_5: prs,
    bench_100: maxLift(i.sessions, ['Bench Press']),
    squat_140: maxLift(i.sessions, ['Squat', 'Front Squat']),
    deadlift_180: maxLift(i.sessions, ['Deadlift']),
    water_goal: longestDayStreak(i.water.filter((w) => w.glasses >= i.waterGoal).map((w) => w.date)),
    nutrition_log_7: longestDayStreak(i.nutritionLogs.map((l) => localDay(l.date))),
    protein_goal: i.proteinTarget
      ? longestDayStreak([...proteinByDay].filter(([, g]) => g >= i.proteinTarget!).map(([d]) => d))
      : 0,
    profile_complete: profileComplete,
    first_program: i.programCount,
    body_measurement: i.measurements.length,
  };
}

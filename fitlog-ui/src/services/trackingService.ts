import apiClient from '../api/client';

// ---------- Types (mirror FitLog.Application.DTOs.Tracking) ----------

export interface SessionSet {
  id?: string;
  exerciseName: string;
  exerciseOrder: number;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number | null;
  isWarmup?: boolean;
}

export type SessionType = 'strength' | 'cardio';

export interface WorkoutSession {
  id: string;
  workoutProgramId?: string | null;
  workoutDayId?: string | null;
  name: string;
  type: SessionType;
  startedAt: string;
  endedAt?: string | null;
  durationSeconds: number;
  notes?: string | null;
  cardioActivity?: string | null;
  distanceKm?: number | null;
  speedKmh?: number | null;
  inclinePercent?: number | null;
  averageHeartRate?: number | null;
  caloriesBurned?: number | null;
  setCount: number;
  totalVolumeKg: number;
  sets: SessionSet[];
}

export type SaveSessionRequest = Omit<WorkoutSession, 'id' | 'setCount' | 'totalVolumeKg'>;

export interface ExerciseHistoryPoint {
  date: string;
  bestWeightKg: number;
  repsAtBest: number;
  estimated1Rm: number;
  volumeKg: number;
}

export interface WeeklyVolumePoint {
  weekStart: string;
  sessions: number;
  sets: number;
  volumeKg: number;
  cardioMinutes: number;
}

export interface PersonalRecord {
  exerciseName: string;
  bestWeightKg: number;
  repsAtBest: number;
  bestEstimated1Rm: number;
  achievedAt: string;
}

export interface BodyMeasurement {
  id: string;
  date: string; // yyyy-MM-dd
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  biceps?: number | null;
  thigh?: number | null;
  calf?: number | null;
  neck?: number | null;
}

export interface WaterLog {
  date: string;
  glasses: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  pose: 'front' | 'side' | 'back';
  note?: string | null;
}

export type GoalCategory = 'weight' | 'strength' | 'body' | 'habit' | 'nutrition';

export interface FitnessGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string | null;
  createdAt: string;
  completedAt?: string | null;
  completed: boolean;
}

export interface SaveGoalRequest {
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string | null;
  completed: boolean;
}

export interface OneRepMaxRecord {
  id: string;
  exerciseName: string;
  weightKg: number;
  date: string;
}

export interface UserSettings {
  calorieTarget?: number | null;
  proteinTarget?: number | null;
  carbTarget?: number | null;
  fatTarget?: number | null;
  waterGoalGlasses: number;
  weightUnit: 'kg' | 'lbs';
  measurementUnit: 'cm' | 'inch';
  defaultRestSeconds: number;
  soundEffects: boolean;
  notifications: boolean;
  language: 'tr' | 'en';
  favoriteFoodIds: string[];
}

export const defaultSettings: UserSettings = {
  waterGoalGlasses: 8,
  weightUnit: 'kg',
  measurementUnit: 'cm',
  defaultRestSeconds: 90,
  soundEffects: true,
  notifications: false,
  language: 'tr',
  favoriteFoodIds: [],
};

export interface CustomFood {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export type SaveCustomFoodRequest = Omit<CustomFood, 'id'>;

export interface SupplementIntake {
  supplementId: string;
  date: string;
  takenAt: string;
}

// ---------- API ----------

const data = <T>(p: Promise<{ data: T }>) => p.then((r) => r.data);

export const sessionsApi = {
  list: (params: { from?: string; to?: string; includeSets?: boolean } = {}) =>
    data(apiClient.get<WorkoutSession[]>('/sessions', { params })),
  get: (id: string) => data(apiClient.get<WorkoutSession>(`/sessions/${id}`)),
  create: (body: SaveSessionRequest) => data(apiClient.post<WorkoutSession>('/sessions', body)),
  update: (id: string, body: SaveSessionRequest) => data(apiClient.put<WorkoutSession>(`/sessions/${id}`, body)),
  remove: (id: string) => apiClient.delete(`/sessions/${id}`),
  exercises: () => data(apiClient.get<string[]>('/sessions/exercises')),
  exerciseHistory: (name: string) =>
    data(apiClient.get<ExerciseHistoryPoint[]>('/sessions/exercise-history', { params: { name } })),
  weeklyVolume: (weeks = 12) => data(apiClient.get<WeeklyVolumePoint[]>('/sessions/weekly-volume', { params: { weeks } })),
  personalRecords: () => data(apiClient.get<PersonalRecord[]>('/sessions/personal-records')),
};

type MeasurementInput = Omit<BodyMeasurement, 'id'>;

export const bodyApi = {
  measurements: () => data(apiClient.get<BodyMeasurement[]>('/body/measurements')),
  addMeasurement: (body: MeasurementInput) => data(apiClient.post<BodyMeasurement>('/body/measurements', body)),
  updateMeasurement: (id: string, body: MeasurementInput) =>
    data(apiClient.put<BodyMeasurement>(`/body/measurements/${id}`, body)),
  deleteMeasurement: (id: string) => apiClient.delete(`/body/measurements/${id}`),

  water: (from: string, to: string) => data(apiClient.get<WaterLog[]>('/body/water', { params: { from, to } })),
  setWater: (date: string, glasses: number) => data(apiClient.put<WaterLog>(`/body/water/${date}`, { glasses })),

  photos: () => data(apiClient.get<ProgressPhoto[]>('/body/photos')),
  /** Fetches the image with the auth header and returns an object URL (revoke when done). */
  photoUrl: async (id: string) => {
    const res = await apiClient.get(`/body/photos/${id}/image`, { responseType: 'blob' });
    return URL.createObjectURL(res.data as Blob);
  },
  uploadPhoto: (body: { date: string; pose: string; note?: string; dataUrl: string }) =>
    data(apiClient.post<ProgressPhoto>('/body/photos', body)),
  deletePhoto: (id: string) => apiClient.delete(`/body/photos/${id}`),
};

export const goalsApi = {
  list: () => data(apiClient.get<FitnessGoal[]>('/goals')),
  create: (body: SaveGoalRequest) => data(apiClient.post<FitnessGoal>('/goals', body)),
  update: (id: string, body: SaveGoalRequest) => data(apiClient.put<FitnessGoal>(`/goals/${id}`, body)),
  remove: (id: string) => apiClient.delete(`/goals/${id}`),
  oneRepMax: () => data(apiClient.get<OneRepMaxRecord[]>('/goals/one-rep-max')),
  addOneRepMax: (body: { exerciseName: string; weightKg: number; date: string }) =>
    data(apiClient.post<OneRepMaxRecord>('/goals/one-rep-max', body)),
  deleteOneRepMax: (id: string) => apiClient.delete(`/goals/one-rep-max/${id}`),
};

export const settingsApi = {
  get: () => data(apiClient.get<UserSettings>('/settings')),
  save: (body: UserSettings) => data(apiClient.put<UserSettings>('/settings', body)),
};

export const customFoodsApi = {
  list: () => data(apiClient.get<CustomFood[]>('/foods/custom')),
  create: (body: SaveCustomFoodRequest) => data(apiClient.post<CustomFood>('/foods/custom', body)),
  update: (id: string, body: SaveCustomFoodRequest) => data(apiClient.put<CustomFood>(`/foods/custom/${id}`, body)),
  remove: (id: string) => apiClient.delete(`/foods/custom/${id}`),
};

export const supplementIntakeApi = {
  forDate: (date: string) => data(apiClient.get<SupplementIntake[]>('/supplement-intake', { params: { date } })),
  mark: (supplementId: string, date: string) => data(apiClient.put<SupplementIntake>(`/supplement-intake/${supplementId}/${date}`)),
  unmark: (supplementId: string, date: string) => apiClient.delete(`/supplement-intake/${supplementId}/${date}`),
};

/** Best one-rep-max estimate (Epley). A single rep is the 1RM itself. */
export const epley1Rm = (weight: number, reps: number) => (reps <= 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10);

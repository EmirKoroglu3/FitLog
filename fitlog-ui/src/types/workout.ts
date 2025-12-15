export interface ExerciseDto {
  id: string;
  name: string;
  setCount: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export interface WorkoutDayDto {
  id: string;
  dayOfWeek: number;
  name?: string;
  exercises: ExerciseDto[];
}

export interface WorkoutProgramDto {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  workoutDays: WorkoutDayDto[];
}

export interface CreateWorkoutProgramRequest {
  name: string;
  description?: string;
}

export interface CreateWorkoutDayRequest {
  workoutProgramId: string;
  dayOfWeek: number;
  name?: string;
}

export interface CreateExerciseRequest {
  workoutDayId: string;
  name: string;
  setCount: number;
  reps: number;
  weight?: number;
  notes?: string;
}


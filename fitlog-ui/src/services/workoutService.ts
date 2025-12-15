import apiClient from '../api/client';
import {
  WorkoutProgramDto,
  WorkoutDayDto,
  ExerciseDto,
  CreateWorkoutProgramRequest,
  CreateWorkoutDayRequest,
  CreateExerciseRequest,
} from '../types/workout';

export const workoutService = {
  // Programs
  async getPrograms(): Promise<WorkoutProgramDto[]> {
    const response = await apiClient.get<WorkoutProgramDto[]>('/workout/programs');
    return response.data;
  },

  async getProgram(id: string): Promise<WorkoutProgramDto> {
    const response = await apiClient.get<WorkoutProgramDto>(`/workout/programs/${id}`);
    return response.data;
  },

  async createProgram(data: CreateWorkoutProgramRequest): Promise<WorkoutProgramDto> {
    const response = await apiClient.post<WorkoutProgramDto>('/workout/programs', data);
    return response.data;
  },

  async updateProgram(id: string, data: CreateWorkoutProgramRequest): Promise<WorkoutProgramDto> {
    const response = await apiClient.put<WorkoutProgramDto>(`/workout/programs/${id}`, data);
    return response.data;
  },

  async deleteProgram(id: string): Promise<void> {
    await apiClient.delete(`/workout/programs/${id}`);
  },

  // Days
  async createDay(data: CreateWorkoutDayRequest): Promise<WorkoutDayDto> {
    const response = await apiClient.post<WorkoutDayDto>('/workout/days', data);
    return response.data;
  },

  async updateDay(id: string, data: Partial<CreateWorkoutDayRequest>): Promise<WorkoutDayDto> {
    const response = await apiClient.put<WorkoutDayDto>(`/workout/days/${id}`, data);
    return response.data;
  },

  async deleteDay(id: string): Promise<void> {
    await apiClient.delete(`/workout/days/${id}`);
  },

  // Exercises
  async createExercise(data: CreateExerciseRequest): Promise<ExerciseDto> {
    const response = await apiClient.post<ExerciseDto>('/workout/exercises', data);
    return response.data;
  },

  async updateExercise(id: string, data: Partial<CreateExerciseRequest>): Promise<ExerciseDto> {
    const response = await apiClient.put<ExerciseDto>(`/workout/exercises/${id}`, data);
    return response.data;
  },

  async deleteExercise(id: string): Promise<void> {
    await apiClient.delete(`/workout/exercises/${id}`);
  },
};

export default workoutService;


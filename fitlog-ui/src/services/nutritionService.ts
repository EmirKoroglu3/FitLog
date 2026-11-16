import apiClient from '../api/client';
import { localDayRange } from '../utils/dateTime';
import {
  NutritionLogDto,
  CreateNutritionLogRequest,
  NutritionSummaryDto,
} from '../types/nutrition';

export const nutritionService = {
  async getLogs(startDate?: string, endDate?: string): Promise<NutritionLogDto[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<NutritionLogDto[]>(`/nutrition?${params.toString()}`);
    return response.data;
  },

  async getLog(id: string): Promise<NutritionLogDto> {
    const response = await apiClient.get<NutritionLogDto>(`/nutrition/${id}`);
    return response.data;
  },

  /** Totals for the user's *local* day (defaults to today). */
  async getDailySummary(day: Date = new Date()): Promise<NutritionSummaryDto> {
    const { start, end } = localDayRange(day);
    const response = await apiClient.get<NutritionSummaryDto>('/nutrition/summary', {
      params: { start, end },
    });
    return response.data;
  },

  async createLog(data: CreateNutritionLogRequest): Promise<NutritionLogDto> {
    const response = await apiClient.post<NutritionLogDto>('/nutrition', data);
    return response.data;
  },

  async updateLog(id: string, data: CreateNutritionLogRequest): Promise<NutritionLogDto> {
    const response = await apiClient.put<NutritionLogDto>(`/nutrition/${id}`, data);
    return response.data;
  },

  async deleteLog(id: string): Promise<void> {
    await apiClient.delete(`/nutrition/${id}`);
  },
};

export default nutritionService;


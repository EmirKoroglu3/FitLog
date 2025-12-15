import apiClient from '../api/client';
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

  async getDailySummary(date?: string): Promise<NutritionSummaryDto> {
    const params = date ? `?date=${date}` : '';
    const response = await apiClient.get<NutritionSummaryDto>(`/nutrition/summary${params}`);
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


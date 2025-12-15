import apiClient from '../api/client';
import { SupplementDto, CreateSupplementRequest } from '../types/supplement';

export const supplementService = {
  async getSupplements(): Promise<SupplementDto[]> {
    const response = await apiClient.get<SupplementDto[]>('/supplement');
    return response.data;
  },

  async getSupplement(id: string): Promise<SupplementDto> {
    const response = await apiClient.get<SupplementDto>(`/supplement/${id}`);
    return response.data;
  },

  async createSupplement(data: CreateSupplementRequest): Promise<SupplementDto> {
    const response = await apiClient.post<SupplementDto>('/supplement', data);
    return response.data;
  },

  async updateSupplement(id: string, data: CreateSupplementRequest): Promise<SupplementDto> {
    const response = await apiClient.put<SupplementDto>(`/supplement/${id}`, data);
    return response.data;
  },

  async deleteSupplement(id: string): Promise<void> {
    await apiClient.delete(`/supplement/${id}`);
  },
};

export default supplementService;


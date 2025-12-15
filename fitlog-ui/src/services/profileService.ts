import apiClient from '../api/client';
import { ProfileDto, UpdateProfileRequest, ProfileAnalysis } from '../types/profile';

const profileService = {
  getProfile: async (): Promise<ProfileDto> => {
    const response = await apiClient.get<ProfileDto>('/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileDto> => {
    const response = await apiClient.put<ProfileDto>('/profile', data);
    return response.data;
  },

  getAnalysis: async (): Promise<ProfileAnalysis> => {
    const response = await apiClient.get<ProfileAnalysis>('/profile/analysis');
    return response.data;
  },
};

export default profileService;


import apiClient from '../api/client';
import type { AiCoachAnalysisRequest, AiCoachAnalysisResponse } from '../types/aicoach';

export const aiCoachService = {
  async analyze(request: AiCoachAnalysisRequest): Promise<AiCoachAnalysisResponse> {
    const response = await apiClient.post<AiCoachAnalysisResponse>('/aicoach/analyze', request);
    return response.data;
  },
};

export default aiCoachService;

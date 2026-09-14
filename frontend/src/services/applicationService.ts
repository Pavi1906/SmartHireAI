import { apiClient } from './api';

export interface StudentApplicationResponse {
  applicationId: string;
  jobId: string;
  jobTitle?: string | null;
  companyName?: string | null;
  status: string;
  appliedAt: string;
  matchScore?: number | null;
}

export const applicationService = {
  updateApplicationStage: async (applicationId: string, stage: string, reason?: string) => {
    const response = await apiClient.put(`/applications/${applicationId}/stage`, {
      stage,
      reason
    });
    return response.data;
  },

  rejectApplication: async (applicationId: string, reason?: string) => {
    const response = await apiClient.post(`/applications/${applicationId}/reject`, null, {
      params: reason ? { reason } : undefined
    });
    return response.data;
  },

  withdrawApplication: async (applicationId: string, reason?: string) => {
    const response = await apiClient.post(`/applications/${applicationId}/withdraw`, null, {
      params: reason ? { reason } : undefined
    });
    return response.data;
  },

  getStageHistory: async (applicationId: string) => {
    const response = await apiClient.get(`/applications/${applicationId}/history`);
    return response.data;
  },

  // Student endpoints
  applyToJob: async (dto: { jobId: string; resumeId: string }): Promise<StudentApplicationResponse> => {
    const response = await apiClient.post<StudentApplicationResponse>('/applications/apply', dto);
    return response.data;
  },

  fetchMyApplications: async (): Promise<StudentApplicationResponse[]> => {
    const response = await apiClient.get<StudentApplicationResponse[]>('/applications/me');
    return response.data;
  }
};

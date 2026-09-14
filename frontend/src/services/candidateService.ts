import { apiClient } from './api';
import { Candidate } from '../types/recruiter';

export const candidateService = {
  listCandidates: async (jobId?: string, stage?: string, search?: string): Promise<Candidate[]> => {
    const params = new URLSearchParams();
    if (jobId) params.append('job_id', jobId);
    if (stage && stage !== 'ALL') params.append('stage', stage);
    if (search) params.append('search', search);
    params.append('limit', '500'); // Higher limit for UI

    const response = await apiClient.get(`/candidates?${params.toString()}`);
    return response.data;
  },
  
  getCandidate: async (candidateId: string): Promise<Candidate> => {
    const response = await apiClient.get(`/candidates/${candidateId}`);
    return response.data;
  }
};

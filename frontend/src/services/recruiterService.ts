import { apiClient } from './api';

/**
 * TypeScript interfaces mirroring backend DTOs for recruiter profile.
 */
export interface RecruiterProfileResponse {
  id: string;
  company_id: string;
  full_name: string;
  work_email: string;
  designation: string;
  company_name?: string;
}

export interface RecruiterProfileUpdate {
  full_name?: string;
  designation?: string;
}

/**
 * Fetch the recruiter profile from the backend.
 * Endpoint: GET /api/v1/recruiter/profile
 */
export const getRecruiterProfile = async (): Promise<RecruiterProfileResponse> => {
  const response = await apiClient.get<RecruiterProfileResponse>('/recruiter/profile');
  return response.data;
};

/**
 * Update the recruiter profile.
 * Endpoint: PATCH /api/v1/recruiter/profile
 */
export const updateRecruiterProfile = async (
  update: RecruiterProfileUpdate
): Promise<RecruiterProfileResponse> => {
  const response = await apiClient.patch<RecruiterProfileResponse>('/recruiter/profile', update);
  return response.data;
};

import { apiClient } from './api';

// Types matching the backend DTO
export interface CompanyProfile {
  name: string;
  industry?: string;
  website?: string;
}

/**
 * Fetch the current recruiter’s company profile.
 */
export const getCompanyProfile = async (): Promise<CompanyProfile> => {
  const response = await apiClient.get<CompanyProfile>('/company/profile');
  return response.data;
};

/**
 * Update the recruiter’s company profile.
 * Only the supported fields are sent.
 */
export const updateCompanyProfile = async (
  dto: Partial<Pick<CompanyProfile, 'name' | 'industry' | 'website'>>
): Promise<CompanyProfile> => {
  const response = await apiClient.patch<CompanyProfile>('/company/profile', dto);
  return response.data;
};

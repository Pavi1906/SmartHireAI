import { apiClient } from './api';
import type { Job, JobStatus } from '../types/recruiter';

/**
 * Service layer for Job operations.
 * All endpoints are under the FastAPI versioned path `/api/v1`.
 * The existing `apiClient` already injects the JWT Bearer token via its interceptor.
 */
export const jobService = {
  /** GET /api/v1/jobs/active (For students) */
  async listActiveJobs(): Promise<Job[]> {
    const response = await apiClient.get<Job[]>('/jobs/active');
    return response.data;
  },

  /** GET /api/v1/jobs */
  async listJobs(): Promise<Job[]> {
    const response = await apiClient.get<Job[]>('/jobs');
    return response.data;
  },

  /** POST /api/v1/jobs */
  async createJob(dto: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicantCount' | 'viewsCount'>): Promise<Job> {
    const response = await apiClient.post<Job>('/jobs', dto);
    return response.data;
  },

  /** GET /api/v1/jobs/{id} */
  async getJob(id: string): Promise<Job> {
    const response = await apiClient.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  /** PUT /api/v1/jobs/{id} */
  async updateJob(id: string, dto: Partial<Omit<Job, 'id'>>): Promise<Job> {
    const response = await apiClient.put<Job>(`/jobs/${id}`, dto);
    return response.data;
  },

  /** POST /api/v1/jobs/{id}/publish */
  async publishJob(id: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/jobs/${id}/publish`);
    return response.data;
  },

  /** POST /api/v1/jobs/{id}/pause */
  async pauseJob(id: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/jobs/${id}/pause`);
    return response.data;
  },

  /** POST /api/v1/jobs/{id}/close */
  async closeJob(id: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/jobs/${id}/close`);
    return response.data;
  },

  /** POST /api/v1/jobs/{id}/archive */
  async archiveJob(id: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/jobs/${id}/archive`);
    return response.data;
  },

  /** POST /api/v1/jobs/{id}/reopen */
  async reopenJob(id: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/jobs/${id}/reopen`);
    return response.data;
  },

  /** POST /api/v1/jobs/{id}/duplicate */
  async duplicateJob(id: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/jobs/${id}/duplicate`);
    return response.data;
  },

  /** DELETE /api/v1/jobs/{id} */
  async deleteJob(id: string): Promise<void> {
    await apiClient.delete(`/jobs/${id}`);
  },
};

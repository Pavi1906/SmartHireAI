import { apiClient } from './api';
import {
  RecruiterInterviewResponse,
  InterviewCreate,
  InterviewUpdate,
  InterviewFeedbackCreate,
  InterviewFeedbackResponse
} from '../types/recruiterInterview';

const BASE_URL = '/recruiter/interviews';

export const recruiterInterviewService = {
  getInterviews: async (): Promise<RecruiterInterviewResponse[]> => {
    const { data } = await apiClient.get<RecruiterInterviewResponse[]>(BASE_URL);
    return data;
  },

  getInterview: async (id: string): Promise<RecruiterInterviewResponse> => {
    const { data } = await apiClient.get<RecruiterInterviewResponse>(`${BASE_URL}/${id}`);
    return data;
  },

  scheduleInterview: async (payload: InterviewCreate): Promise<RecruiterInterviewResponse> => {
    const { data } = await apiClient.post<RecruiterInterviewResponse>(BASE_URL, payload);
    return data;
  },

  updateInterview: async (id: string, payload: InterviewUpdate): Promise<RecruiterInterviewResponse> => {
    const { data } = await apiClient.put<RecruiterInterviewResponse>(`${BASE_URL}/${id}`, payload);
    return data;
  },

  submitFeedback: async (id: string, payload: InterviewFeedbackCreate): Promise<InterviewFeedbackResponse> => {
    const { data } = await apiClient.post<InterviewFeedbackResponse>(`${BASE_URL}/${id}/feedback`, payload);
    return data;
  }
};

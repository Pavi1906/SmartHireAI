import { apiClient } from './api';

export interface ParsedResumeData {
  text?: string;
  skills?: string[];
  experience?: Array<{
    title?: string;
    position?: string;
    role?: string;
    company?: string;
    period?: string;
    description?: string;
    [key: string]: any;
  }>;
  education?: Array<{
    degree?: string;
    course?: string;
    institution?: string;
    year?: string;
    [key: string]: any;
  }>;
  projects?: Array<{
    title?: string;
    name?: string;
    description?: string;
    technologies?: string[];
    [key: string]: any;
  }>;
  certifications?: Array<{
    name?: string;
    title?: string;
    issuer?: string;
    year?: string;
    [key: string]: any;
  }>;
  achievements?: string[];
  error?: string;
  [key: string]: any;
}

export interface ResumeUploadResponse {
  resume_id: string;
  s3_key: string;
  status: 'UPLOADED' | 'PARSING' | 'PARSED' | 'FAILED';
  task_id: string;
  message: string;
}

export interface ResumeDetailResponse {
  resume_id: string;
  student_id: string;
  s3_key: string;
  status: 'UPLOADED' | 'PARSING' | 'PARSED' | 'FAILED';
  parsed_json?: ParsedResumeData | null;
  created_at: string;
}

export interface ATSScoreRequest {
  resume_id: string;
  job_description_id: string;
  resume_skills: string[];
  jd_skills: string[];
}

export interface ATSScoreResponse {
  ats_score: number;
  matched_skills: string[];
  missing_skills: string[];
  breakdown: {
    semantic?: number;
    keywords?: number;
    experience?: number;
    formatting?: number;
    [key: string]: number | undefined;
  };
}

export const resumeService = {
  /**
   * Upload resume file (PDF) via multipart/form-data.
   */
  uploadResume: async (file: File): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const token = localStorage.getItem('token');
    const response = await apiClient.post<ResumeUploadResponse>('/resumes', formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
  },

  /**
   * Fetch single resume details and parsed structure by ID.
   */
  getResumeById: async (resumeId: string): Promise<ResumeDetailResponse> => {
    const response = await apiClient.get<ResumeDetailResponse>(`/resumes/${resumeId}`);
    return response.data;
  },

  /**
   * Request ATS scoring from real backend ATS scoring engine.
   */
  calculateATSScore: async (payload: ATSScoreRequest): Promise<ATSScoreResponse> => {
    const response = await apiClient.post<ATSScoreResponse>('/ats/score', payload);
    return response.data;
  },

  /**
   * Poll resume status until PARSED or FAILED with timeout protection.
   */
  waitForResumeParsing: async (
    resumeId: string,
    maxAttempts = 60,
    intervalMs = 1000
  ): Promise<ResumeDetailResponse> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const resume = await resumeService.getResumeById(resumeId);
      const status = (resume.status || '').toUpperCase();

      if (status === 'PARSED' || status === 'COMPLETED') {
        return resume;
      }

      if (status === 'FAILED' || status === 'ERROR') {
        const errorDetail =
          resume.parsed_json?.error || 'Resume parsing failed on the server.';
        throw new Error(errorDetail);
      }

      await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Resume processing timed out. Please try again.');
  },
};

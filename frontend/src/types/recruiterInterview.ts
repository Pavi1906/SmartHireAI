export interface InterviewFeedbackCreate {
  rating: number;
  recommendation: string;
  strengths?: string[];
  weaknesses?: string[];
  notes?: string;
}

export interface InterviewFeedbackResponse {
  id: string;
  interviewId: string;
  reviewerId?: string;
  rating: number;
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  notes?: string;
  submittedAt: string;
}

export interface RecruiterInterviewResponse {
  id: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  interviewType: string;
  scheduledAt: string;
  durationMinutes: number;
  locationUrl?: string;
  status: string;
  notes?: string;
  createdAt: string;
  feedback?: InterviewFeedbackResponse;
}

export interface InterviewCreate {
  applicationId: string;
  candidateId: string;
  jobId: string;
  interviewType?: string;
  scheduledAt: string;
  durationMinutes?: number;
  locationUrl?: string;
  notes?: string;
}

export interface InterviewUpdate {
  scheduledAt?: string;
  durationMinutes?: number;
  locationUrl?: string;
  status?: string;
  notes?: string;
}

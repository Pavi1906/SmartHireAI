export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';
export type WorkplaceType = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full-time' | 'Contract' | 'Part-time' | 'Internship';

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  responsibilities?: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string;
  education: string;
  location: string;
  workplaceType: WorkplaceType;
  type: EmploymentType | string;
  salary: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  applicantCount?: number;
  viewsCount?: number;
}

export type CandidatePipelineStage = 
  | 'Sourced' 
  | 'Screening' 
  | 'Shortlisted' 
  | 'Interview' 
  | 'Selected' 
  | 'Offer' 
  | 'Hired' 
  | 'Rejected';

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  role: string;
  location?: string;
  avatar?: string;
  resumeData: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
    };
    skills?: string[];
    experience?: Array<{
      company: string;
      role: string;
      duration: string;
      achievements?: string[];
    }>;
    education?: Array<{
      degree: string;
      school: string;
      year: string;
      gpa?: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
      technologies: string[];
    }>;
  };
  matchScore?: number;
  confidence?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  recommendation?: string;
  pipelineStage: CandidatePipelineStage;
  jobId?: string;
  applicationId?: string;
  appliedAt?: string;
  time: string;
}

export interface Campaign {
  id: string;
  name: string;
  jobId?: string;
  criteria?: any;
  status: 'active' | 'completed' | 'paused' | 'draft';
  results?: string[]; // Candidate IDs
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterKPIs {
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  archivedJobs: number;
  totalCandidates: number;
  shortlistedCandidates: number;
  interviewingCandidates: number;
  averageMatchScore: number;
}

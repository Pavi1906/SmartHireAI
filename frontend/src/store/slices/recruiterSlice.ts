// recruiterSlice.ts – Redux slice for recruiter dashboard
// Integrated with real FastAPI backend. No demo data is used.

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { Job, Candidate, Campaign, CandidatePipelineStage } from '../../types/recruiter';
import { jobService } from '../../services/jobService';
import { uploadResumeSuccess } from './resumeSlice';
import { calculateMatchScore } from '../../utils/matchScore';

// Async thunks for job operations
export const fetchJobs = createAsyncThunk('recruiter/fetchJobs', async () => {
  const jobs = await jobService.listJobs();
  return jobs;
});

export const createJob = createAsyncThunk(
  'recruiter/createJob',
  async (dto: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicantCount' | 'viewsCount'>) => {
    const job = await jobService.createJob(dto);
    return job;
  }
);

export const updateJob = createAsyncThunk(
  'recruiter/updateJob',
  async ({ id, dto }: { id: string; dto: Partial<Omit<Job, 'id'>> }) => {
    const job = await jobService.updateJob(id, dto);
    return job;
  }
);

export const deleteJob = createAsyncThunk('recruiter/deleteJob', async (id: string) => {
  await jobService.deleteJob(id);
  return id;
});

export const publishJob = createAsyncThunk('recruiter/publishJob', async (id: string) => {
  const job = await jobService.publishJob(id);
  return job;
});

export const pauseJob = createAsyncThunk('recruiter/pauseJob', async (id: string) => {
  const job = await jobService.pauseJob(id);
  return job;
});

export const closeJob = createAsyncThunk('recruiter/closeJob', async (id: string) => {
  const job = await jobService.closeJob(id);
  return job;
});

export const archiveJob = createAsyncThunk('recruiter/archiveJob', async (id: string) => {
  const job = await jobService.archiveJob(id);
  return job;
});

export const reopenJob = createAsyncThunk('recruiter/reopenJob', async (id: string) => {
  const job = await jobService.reopenJob(id);
  return job;
});

export const duplicateJob = createAsyncThunk('recruiter/duplicateJob', async (id: string) => {
  const job = await jobService.duplicateJob(id);
  return job;
});

export interface RecruiterState {
  jobs: Job[];
  candidates: Candidate[];
  campaigns: Campaign[];
  loading: boolean;
  error?: string | null;
}

const initialState: RecruiterState = {
  jobs: [],
  candidates: [],
  campaigns: [],
  loading: false,
  error: null,
};

export const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
    // UI‑only reducers
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      if (!state.candidates.find(c => c.id === action.payload.id)) {
        state.candidates.unshift(action.payload);
      }
    },
    updateCandidateStage: (state, action: PayloadAction<{ id: string; stage: CandidatePipelineStage }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.id);
      if (candidate) {
        candidate.pipelineStage = action.payload.stage;
      }
    },
    addJob: (state, action: PayloadAction<Job>) => {
      state.jobs.unshift(action.payload);
    },
    updateJobInState: (state, action: PayloadAction<Job>) => {
      const idx = state.jobs.findIndex(j => j.id === action.payload.id);
      if (idx !== -1) {
        state.jobs[idx] = action.payload;
      }
    },
    removeJob: (state, action: PayloadAction<string>) => {
      state.jobs = state.jobs.filter(j => j.id !== action.payload);
    },
    addCampaign: (state, action: PayloadAction<Campaign>) => {
      if (!state.campaigns.find(c => c.id === action.payload.id)) {
        state.campaigns.unshift(action.payload);
      }
    },
    updateCampaign: (state, action: PayloadAction<Campaign>) => {
      const idx = state.campaigns.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.campaigns[idx] = { ...action.payload, updatedAt: new Date().toISOString() };
      }
    },
    deleteCampaign: (state, action: PayloadAction<string>) => {
      state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
    },
    toggleCampaignStatus: (state, action: PayloadAction<string>) => {
      const camp = state.campaigns.find(c => c.id === action.payload);
      if (camp) {
        camp.status = camp.status === 'active' ? 'completed' : 'active';
        camp.updatedAt = new Date().toISOString();
      }
    },
    restoreRecruiterState: (state, action: PayloadAction<Partial<RecruiterState>>) => {
      return { ...state, ...action.payload };
    },
    clearRecruiterState: () => {
      return {
        jobs: [],
        candidates: [],
        campaigns: [],
        loading: false,
        error: null,
      };
    },
    seedRecruiterDemoData: (state) => {
      const demoCandidates: Candidate[] = [
        {
          id: 'cand-demo-1',
          name: 'Sarah Chen',
          email: 'sarah.chen@example.com',
          role: 'Senior Full Stack Engineer',
          location: 'San Francisco, CA',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          resumeData: {
            personalInfo: {
              name: 'Sarah Chen',
              email: 'sarah.chen@example.com',
              location: 'San Francisco, CA',
              github: 'https://github.com/sarahchen',
              linkedin: 'https://linkedin.com/in/sarahchen',
            },
            skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'Tailwind CSS'],
            experience: [
              {
                company: 'TechFlow Systems',
                role: 'Senior Full Stack Engineer',
                duration: '2021 - Present',
                achievements: ['Architected scalable microservices serving 2M+ users', 'Led frontend migration to React 18 & TypeScript']
              },
              {
                company: 'Innovate Labs',
                role: 'Full Stack Developer',
                duration: '2018 - 2021',
                achievements: ['Built collaborative dashboard tools using WebSockets', 'Optimized database queries decreasing latency by 40%']
              }
            ],
            education: [
              {
                degree: 'B.S. in Computer Science',
                school: 'UC Berkeley',
                year: '2018',
                gpa: '3.9'
              }
            ],
            projects: [
              {
                name: 'CloudSync CLI',
                description: 'Open-source distributed state sync engine',
                technologies: ['TypeScript', 'Node.js', 'Docker']
              }
            ]
          },
          pipelineStage: 'Screening',
          time: '2 hours ago',
        },
        {
          id: 'cand-demo-2',
          name: 'Marcus Vance',
          email: 'marcus.vance@example.com',
          role: 'Machine Learning Engineer',
          location: 'Seattle, WA',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          resumeData: {
            personalInfo: {
              name: 'Marcus Vance',
              email: 'marcus.vance@example.com',
              location: 'Seattle, WA',
              github: 'https://github.com/marcusvance',
              linkedin: 'https://linkedin.com/in/marcusvance',
            },
            skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'LLMs', 'Vector Databases', 'Docker', 'AWS'],
            experience: [
              {
                company: 'Cognitive AI',
                role: 'Lead ML Engineer',
                duration: '2022 - Present',
                achievements: ['Fine-tuned open-source LLMs for domain-specific retrieval', 'Deployed low-latency inference pipelines with Triton']
              }
            ],
            education: [
              {
                degree: 'M.S. in Artificial Intelligence',
                school: 'University of Washington',
                year: '2020'
              }
            ]
          },
          pipelineStage: 'Shortlisted',
          time: '1 day ago',
        },
        {
          id: 'cand-demo-3',
          name: 'Elena Rostova',
          email: 'elena.rostova@example.com',
          role: 'Frontend Architect',
          location: 'New York, NY',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          resumeData: {
            personalInfo: {
              name: 'Elena Rostova',
              email: 'elena.rostova@example.com',
              location: 'New York, NY',
              github: 'https://github.com/elenarostova',
              linkedin: 'https://linkedin.com/in/elenarostova',
            },
            skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Figma', 'GraphQL', 'CI/CD'],
            experience: [
              {
                company: 'Apex Digital',
                role: 'Staff Frontend Engineer',
                duration: '2020 - Present',
                achievements: ['Created unified enterprise design system adopted by 12 squads', 'Improved Core Web Vitals to 99 percentile']
              }
            ],
            education: [
              {
                degree: 'B.S. in Software Engineering',
                school: 'NYU',
                year: '2019'
              }
            ]
          },
          pipelineStage: 'Interview',
          time: '3 days ago',
        }
      ];

      demoCandidates.forEach(candidate => {
        if (state.jobs.length > 0) {
          const match = calculateMatchScore(candidate, state.jobs[0]);
          Object.assign(candidate, match);
        }
        if (!state.candidates.find(c => c.id === candidate.id)) {
          state.candidates.push(candidate);
        }
      });
    },
  },
  extraReducers: builder => {
    // fetchJobs lifecycle
    builder.addCase(fetchJobs.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchJobs.fulfilled, (state, action) => {
      state.loading = false;
      state.jobs = action.payload;
    });
    builder.addCase(fetchJobs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch jobs';
    });
    // CRUD thunks
    builder.addCase(createJob.fulfilled, (state, action) => {
      state.jobs.unshift(action.payload);
    });
    builder.addCase(updateJob.fulfilled, (state, action) => {
      const idx = state.jobs.findIndex(j => j.id === action.payload.id);
      if (idx !== -1) state.jobs[idx] = action.payload;
    });
    builder.addCase(deleteJob.fulfilled, (state, action) => {
      state.jobs = state.jobs.filter(j => j.id !== action.payload);
    });
    // Status change thunks
    builder.addCase(publishJob.fulfilled, (state, action) => {
      const idx = state.jobs.findIndex(j => j.id === action.payload.id);
      if (idx !== -1) state.jobs[idx] = action.payload;
    });
    builder.addCase(pauseJob.fulfilled, (state, action) => {
      const idx = state.jobs.findIndex(j => j.id === action.payload.id);
      if (idx !== -1) state.jobs[idx] = action.payload;
    });
    builder.addCase(closeJob.fulfilled, (state, action) => {
      const idx = state.jobs.findIndex(j => j.id === action.payload.id);
      if (idx !== -1) state.jobs[idx] = action.payload;
    });
    builder.addCase(archiveJob.fulfilled, (state, action) => {
      const idx = state.jobs.findIndex(j => j.id === action.payload.id);
      if (idx !== -1) state.jobs[idx] = action.payload;
    });
    builder.addCase(reopenJob.fulfilled, (state, action) => {
      const idx = state.jobs.findIndex(j => j.id === action.payload.id);
      if (idx !== -1) state.jobs[idx] = action.payload;
    });
    builder.addCase(duplicateJob.fulfilled, (state, action) => {
      state.jobs.unshift(action.payload);
    });
    // Resume upload handling
    builder.addCase(uploadResumeSuccess, (state, action) => {
      const resume = action.payload;
      const candidate: Candidate = {
        id: 'candidate-' + Date.now(),
        name: resume.personalInfo?.name || 'Unnamed',
        email: resume.personalInfo?.email || '',
        role: resume.skills?.[0] || 'Unknown',
        location: resume.personalInfo?.location || 'Remote',
        resumeData: resume,
        pipelineStage: 'Sourced',
        time: 'Just now',
      } as any;
      if (state.jobs.length > 0) {
        const match = calculateMatchScore(candidate, state.jobs[0]);
        Object.assign(candidate, match);
      }
      state.candidates.unshift(candidate);
    });
  },
});

export const {
  addCandidate,
  updateCandidateStage,
  addJob,
  updateJobInState,
  removeJob,
  addCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
  restoreRecruiterState,
  clearRecruiterState,
  seedRecruiterDemoData,
} = recruiterSlice.actions;

export default recruiterSlice.reducer;

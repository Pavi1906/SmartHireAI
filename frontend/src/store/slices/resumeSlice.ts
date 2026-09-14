import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ParsedResume {
  activeResume: any | null;
  resumeId: string | null;
  resumeVersion: number;
  resumeMetadata: any | null;
  parsedText: string;
  analysis: any | null;
  ats: any | null;
  skills: string[];
  education: any[];
  projects: any[];
  experience: any[];
  certifications: any[];
  languages: any[];
  recommendations: any[];
  jobMatches: any[];
  companyReadiness: any[];
  analytics: any | null;
  lastUploaded: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  isDemoMode: boolean;
}

const loadState = (): ParsedResume => {
  return {
    activeResume: null,
    resumeId: null,
    resumeVersion: 0,
    resumeMetadata: null,
    parsedText: '',
    analysis: null,
    ats: null,
    skills: [],
    education: [],
    projects: [],
    experience: [],
    certifications: [],
    languages: [],
    recommendations: [],
    jobMatches: [],
    companyReadiness: [],
    analytics: null,
    lastUploaded: null,
    status: 'idle',
    isDemoMode: false,
  };
};

const initialState: ParsedResume = loadState();

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    restoreResumeState: (state, action: PayloadAction<any>) => {
      return { ...state, ...action.payload };
    },
    clearResumeState: (state) => {
      return {
        activeResume: null,
        resumeId: null,
        resumeVersion: 0,
        resumeMetadata: null,
        parsedText: '',
        analysis: null,
        ats: null,
        skills: [],
        education: [],
        projects: [],
        experience: [],
        certifications: [],
        languages: [],
        recommendations: [],
        jobMatches: [],
        companyReadiness: [],
        analytics: null,
        lastUploaded: null,
        status: 'idle',
        isDemoMode: false,
      };
    },
    uploadResumeStart: (state) => {
      state.status = 'loading';
    },
    uploadResumeSuccess: (state, action: PayloadAction<any>) => {
      state.status = 'success';
      state.activeResume = action.payload;
      state.resumeId = action.payload.id || `res_${Math.random().toString(36).substr(2, 9)}`;
      state.resumeVersion += 1;
      state.lastUploaded = new Date().toISOString();
      
      
    },
    uploadResumeFailure: (state) => {
      state.status = 'error';
    },
    setResumeData: (state, action: PayloadAction<any>) => {
      const { 
        resumeMetadata, parsedText, analysis, ats, skills, education, 
        projects, experience, certifications, languages, recommendations, 
        jobMatches, companyReadiness, analytics 
      } = action.payload;
      
      if (resumeMetadata !== undefined) state.resumeMetadata = resumeMetadata;
      if (parsedText !== undefined) state.parsedText = parsedText;
      if (analysis !== undefined) state.analysis = analysis;
      if (ats !== undefined) state.ats = ats;
      if (skills !== undefined) state.skills = skills;
      if (education !== undefined) state.education = education;
      if (projects !== undefined) state.projects = projects;
      if (experience !== undefined) state.experience = experience;
      if (certifications !== undefined) state.certifications = certifications;
      if (languages !== undefined) state.languages = languages;
      if (recommendations !== undefined) state.recommendations = recommendations;
      if (jobMatches !== undefined) state.jobMatches = jobMatches;
      if (companyReadiness !== undefined) state.companyReadiness = companyReadiness;
      if (analytics !== undefined) state.analytics = analytics;

      
    },
    toggleDemoMode: (state, action: PayloadAction<boolean>) => {
      state.isDemoMode = action.payload;
      
    },
  }
});

export const { restoreResumeState, clearResumeState, uploadResumeStart, uploadResumeSuccess, uploadResumeFailure, setResumeData, toggleDemoMode } = resumeSlice.actions;
export default resumeSlice.reducer;

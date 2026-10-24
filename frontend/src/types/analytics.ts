export interface StudentAnalyticsOverview {
  placementScore: number;
  placementTier: 'Tier-1 FAANG Ready' | 'High-Growth Tech Ready' | 'Enterprise Ready' | 'Foundational / Developing';
  resumeScore: number;
  skillCompetitiveness: number;
  interviewAverage: number | null;
  completedInterviewsCount: number;
  learningProgressPercent: number;
  completedModulesCount: number;
  totalModulesCount: number;
  estimatedHoursRemaining: number;
  targetRoleReadinessBoost: number;
  topCompany: {
    name: string;
    score: number;
    industry: string;
  } | null;
  averageCompanyReadiness: number;
  totalJobMatches: number;
  appliedJobsCount: number;
  criticalGapsCount: number;
  verifiedSkillsCount: number;
}

export interface SkillCategoryMetric {
  category: string;
  total: number;
  strong: number;
  developing: number;
  gaps: number;
  averageScore: number;
}

export interface InterviewTrendPoint {
  date: string;
  formattedDate: string;
  score: number;
  type: string;
  title: string;
  id: string;
}

export interface InterviewTypeMetric {
  type: string;
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  latestScore: number | null;
  targetSkills: string[];
}

export interface CompanyReadinessOverview {
  name: string;
  logo: string;
  score: number;
  industry: string;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  missingSkills: string[];
}

export interface JobMatchOverview {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  salary: string;
  applied: boolean;
}

export interface AnalyticsActionItem {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: 'learning' | 'interview' | 'resume' | 'job';
  actionLabel: string;
  route: string;
  routeState?: any;
}

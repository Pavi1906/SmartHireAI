export type SkillCategory = 
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Cloud & DevOps'
  | 'AI & Data Science'
  | 'Programming Languages'
  | 'System Architecture'
  | 'Testing & QA'
  | 'Tools & Workflow'
  | 'Soft Skills';

export type SkillProficiency = 'Advanced' | 'Proficient' | 'Intermediate' | 'Foundational' | 'Missing';

export type SkillStatus = 'strong' | 'developing' | 'gap' | 'critical_gap';

export type GapPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  score: number; // 0 - 100
  status: SkillStatus;
  progress: number; // 0 - 100
  evidence?: string[];
  yearsOfExp?: number;
  marketDemand: 'Very High' | 'High' | 'Moderate' | 'Growing';
  relatedSkills: string[];
  requiredSkills?: string[];
  whyThisLevel: string;
  recommendedAction: string;
  targetScore: number;
  isSoftSkill?: boolean;
}

export interface SkillGap {
  id: string;
  skill: string;
  category: SkillCategory;
  priority: GapPriority;
  currentLevel: SkillProficiency;
  targetLevel: SkillProficiency;
  estimatedEffort: string;
  recommendedAction: string;
  whyItMatters: string;
  careerImpact: string;
  relatedJobs: string[];
  relatedCompanies: string[];
  learningModuleId?: string;
  learningTopic?: string;
}

export interface SkillRecommendation {
  id: string;
  skill: string;
  category: SkillCategory;
  reason: string;
  priority: GapPriority;
  estimatedEffort: string;
  expectedImpact: string;
  matchBoostPercent: number;
  prerequisites: string[];
  relatedRoles: string[];
}

export interface SkillGraphNode {
  id: string;
  name: string;
  category: SkillCategory;
  score: number;
  proficiency: SkillProficiency;
  status: SkillStatus;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
  isSoftSkill?: boolean;
}

export interface SkillGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  relationship: 'prerequisite' | 'related' | 'builds_upon' | 'synergy';
  strength?: number;
}

export interface SkillIntelligenceData {
  stats: {
    totalSkills: number;
    strongSkillsCount: number;
    developingSkillsCount: number;
    criticalGapsCount: number;
    overallSkillScore: number;
    verifiedSkillsCount: number;
    marketCompetitiveness: number; // 0-100
  };
  technicalSkills: SkillItem[];
  softSkills: SkillItem[];
  allSkills: SkillItem[];
  gaps: SkillGap[];
  criticalGaps: SkillGap[];
  recommendations: SkillRecommendation[];
  graph: {
    nodes: SkillGraphNode[];
    edges: SkillGraphEdge[];
  };
  targetRoleRecommendations: {
    role: string;
    readinessScore: number;
    matchingSkills: string[];
    missingSkills: string[];
  }[];
}

export type InterviewType = 
  | 'Technical'
  | 'Coding'
  | 'Aptitude'
  | 'Behavioral'
  | 'System Design'
  | 'Mixed';

export type InterviewStatus = 
  | 'NOT_STARTED'
  | 'PREPARING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  actionLabel: string;
  actionRoute: string;
  actionState?: any;
  description: string;
}

export interface PreparationStrength {
  skill: string;
  category: string;
  score: number;
  evidence?: string;
  status: 'strong' | 'developing';
}

export interface PreparationGap {
  skill: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium';
  recommendation: string;
  learningModuleId?: string;
  whyItMatters: string;
}

export interface PreparationRecommendation {
  title: string;
  type: 'learning' | 'skills' | 'practice' | 'company';
  route: string;
  state?: any;
  description: string;
  badge: string;
}

export type QuestionFormat = 'technical' | 'coding' | 'mcq' | 'behavioral' | 'system_design';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface InterviewQuestion {
  id: string;
  number: number;
  format: QuestionFormat;
  category: string;
  title: string;
  prompt: string;
  contextOrScenario?: string;
  hint?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimitSeconds?: number;
  
  // Format specific properties
  // MCQ (Aptitude)
  mcqOptions?: MCQOption[];
  correctOptionId?: string;
  explanation?: string;

  // Coding
  initialCode?: string;
  language?: string;
  testCases?: TestCase[];
  constraints?: string[];
  sampleInputOutput?: { input: string; output: string; explanation?: string }[];

  // Behavioral STAR guidance
  starPrompts?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };

  // System Design guidance
  systemDesignPrompts?: {
    requirements: string;
    architecture: string;
    dataModel: string;
    bottlenecks: string;
  };

  // Technical structured answer
  technicalPrompts?: {
    coreConcept: string;
    tradeoffs: string;
    practicalExample: string;
  };
}

export interface UserResponse {
  questionId: string;
  format: QuestionFormat;
  textAnswer?: string;
  selectedOptionId?: string; // For MCQ
  codeAnswer?: string; // For Coding
  codeLanguage?: string;
  runResults?: {
    passed: boolean;
    output: string;
    testCasesPassed: number;
    totalTestCases: number;
    error?: string;
    executedAt: string;
  };
  starBreakdown?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  systemDesignBreakdown?: {
    requirements: string;
    architecture: string;
    dataModel: string;
    scaling: string;
  };
  technicalBreakdown?: {
    concept: string;
    tradeoffs: string;
    example: string;
  };
  timeSpentSeconds: number;
  isSkipped?: boolean;
  submittedAt?: string;
}

export interface ActiveSessionState {
  interviewId: string;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  isTimerRunning: boolean;
  status: InterviewStatus;
  responses: Record<string, UserResponse>;
  notes: string;
  startedAt: string;
  lastUpdated: string;
}

export interface InterviewSession {
  id: string;
  title: string;
  type: InterviewType;
  role: string;
  company?: string;
  status: InterviewStatus;
  createdAt: string;
  completedAt?: string;
  score?: number;
  readinessScore: number;
  durationMinutes: number;
  questionCount: number;
  questionTypes: string[];
  targetSkills: string[];
  strengths: PreparationStrength[];
  criticalGaps: PreparationGap[];
  recommendedPreparation: PreparationRecommendation[];
  checklist: ChecklistItem[];
  questions?: InterviewQuestion[];
  sessionState?: ActiveSessionState;
  previousLearningProgress: {
    totalCompletedModules: number;
    relevantModulesCompleted: string[];
    readinessBoostPercent: number;
  };
  previousPerformance?: {
    totalSessions: number;
    avgScore: number;
    lastScore?: number;
    improvementArea?: string;
  };
}

export interface InterviewTypeMetadata {
  type: InterviewType;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  defaultDuration: number;
  defaultQuestionCount: number;
  questionBreakdown: string[];
  focusAreas: string[];
  targetSkills: string[];
  badgeColor: string;
}

export interface QuestionEvaluation {
  questionId: string;
  questionNumber: number;
  title: string;
  category: string;
  format: QuestionFormat;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number; // 0 - 100
  verdict: 'Mastered' | 'Proficient' | 'Needs Practice' | 'Skipped';
  feedback: string;
  strengths: string[];
  improvementTip: string;
  userResponse?: UserResponse;
  correctAnswerText?: string;
  explanation?: string;
  timeSpentSeconds: number;
  recommendedTimeSeconds: number;
}

export interface DomainScoreBreakdown {
  domain: string;
  score: number;
  weight: number;
  description: string;
  status: 'excellent' | 'proficient' | 'needs_work';
}

export interface InterviewReportEvaluation {
  interviewId: string;
  sessionTitle: string;
  interviewType: InterviewType;
  role: string;
  company?: string;
  completedAt: string;
  overallScore: number;
  performanceBand: 'Exceptional' | 'Strong' | 'Developing' | 'Needs Targeted Practice';
  summaryVerdict: string;
  totalTimeSpentSeconds: number;
  totalDurationSeconds: number;
  questionsTotal: number;
  questionsAttempted: number;
  questionsPassed: number;
  domainBreakdown: DomainScoreBreakdown[];
  questionEvaluations: QuestionEvaluation[];
  topStrengths: {
    skill: string;
    category: string;
    evidence: string;
    score: number;
  }[];
  criticalWeaknesses: {
    skill: string;
    priority: 'Critical' | 'High' | 'Medium';
    gapDescription: string;
    remediationTip: string;
    linkedModuleId?: string;
    linkedModuleName?: string;
  }[];
  recommendedModules: {
    moduleId: string;
    title: string;
    skill: string;
    difficulty: string;
    duration: string;
    expectedImpact: string;
    priority: 'Critical' | 'High' | 'Medium';
    reason: string;
  }[];
}


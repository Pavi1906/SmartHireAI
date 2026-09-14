export type ModuleStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';
export type ModulePriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type ModuleDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ModuleCategory = 
  | 'System Architecture'
  | 'Cloud & DevOps'
  | 'Frontend Engineering'
  | 'Backend Engineering'
  | 'Data Structures & Algorithms'
  | 'Database & Storage'
  | 'Behavioral & Leadership';

export type StageType = 'lesson' | 'example' | 'practice' | 'quiz' | 'assessment';

export interface LessonSection {
  title: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  keyTakeaway?: string;
}

export interface InteractiveSimulationStep {
  id: string;
  instruction: string;
  actionType: 'click' | 'toggle' | 'slider' | 'select' | 'connect';
  label: string;
  options?: string[];
  targetValue?: string | number | boolean;
  explanation: string;
}

export interface InteractiveExampleData {
  title: string;
  description: string;
  scenario: string;
  simulationType: 'architecture_flow' | 'cache_strategy' | 'docker_pipeline' | 'react_render_tree' | 'algorithm_trace' | 'database_index';
  steps: InteractiveSimulationStep[];
  defaultConfig?: Record<string, any>;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
  isHidden?: boolean;
}

export interface CodingProblem {
  title: string;
  difficulty: ModuleDifficulty;
  timeLimit: string;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    typescript: string;
    javascript: string;
    python: string;
  };
  solutionCode: {
    javascript: string;
    typescript: string;
    python: string;
  };
  testCases: TestCase[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AssessmentQuestion {
  id: string;
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domainScoreWeight?: number;
}

export interface LearningModuleData {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ModuleCategory;
  skill: string;
  relatedSkills: string[];
  priority: ModulePriority;
  difficulty: ModuleDifficulty;
  estimatedEffort: string;
  durationMinutes: number;
  expectedImpact: string;
  learningObjectives: string[];
  prerequisites: string[];
  targetCompanies: string[];

  // 5 Stages Content
  lesson: {
    overview: string;
    sections: LessonSection[];
    summary: string;
  };
  interactiveExample: InteractiveExampleData;
  codingPractice?: CodingProblem;
  knowledgeCheck: {
    passingScorePercent: number;
    questions: QuizQuestion[];
  };
  finalAssessment: {
    passingScorePercent: number;
    questions: AssessmentQuestion[];
  };
}

export interface UserModuleProgress {
  moduleId: string;
  status: ModuleStatus;
  currentStage: number; // 0 = lesson, 1 = example, 2 = practice, 3 = quiz, 4 = assessment, 5 = completed
  completedStages: number[]; // e.g. [0, 1, 2]
  stageProgress: {
    lessonCompleted: boolean;
    exampleCompleted: boolean;
    practiceCompleted: boolean;
    quizCompleted: boolean;
    quizScore?: number;
    assessmentCompleted: boolean;
    assessmentScore?: number;
  };
  submittedCode?: string;
  selectedLanguage?: string;
  lastAccessedAt: string;
  completedAt?: string;
  progressPercent: number;
}

export interface LearningRoadmapSummary {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  overallProgressPercent: number;
  estimatedHoursRemaining: number;
  criticalGapsCovered: number;
  targetRoleReadinessBoost: number;
}

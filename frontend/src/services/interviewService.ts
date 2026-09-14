import { 
  InterviewType, 
  InterviewStatus, 
  InterviewSession, 
  InterviewTypeMetadata,
  ChecklistItem,
  PreparationStrength,
  PreparationGap,
  PreparationRecommendation,
  InterviewQuestion,
  UserResponse,
  ActiveSessionState
} from '../types/interview';
import { generateSkillIntelligence } from './skillIntelligenceService';
import { loadUserLearningProgress, CURATED_LEARNING_MODULES } from './learningService';
import { getMockInterviewQuestions } from './interviewQuestions';

// Metadata catalogue for each interview category
export const INTERVIEW_TYPE_METADATA: Record<InterviewType, InterviewTypeMetadata> = {
  Technical: {
    type: 'Technical',
    title: 'Technical Domain Interview',
    shortDesc: 'Core language runtimes, framework lifecycle, backend APIs, and design patterns.',
    fullDesc: 'Evaluates in-depth architectural and syntactic mastery of your primary programming languages, modern frameworks, data access patterns, and asynchronous execution models.',
    iconName: 'Code2',
    defaultDuration: 45,
    defaultQuestionCount: 5,
    questionBreakdown: [
      '2 Framework & Runtime Deep Dives',
      '2 API & Database Access Scenarios',
      '1 Real-world Debugging Problem'
    ],
    focusAreas: [
      'Language fundamentals & execution runtime',
      'State management & asynchronous flow',
      'API contracts & error handling',
      'Performance profiling & optimization'
    ],
    targetSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  Coding: {
    type: 'Coding',
    title: 'Live Coding & Algorithms Round',
    shortDesc: 'Data structures, algorithmic problem solving, time/space complexity analysis.',
    fullDesc: 'Interactive technical assessment testing data structures (trees, graphs, dynamic programming), algorithmic efficiency, clean code practices, and edge-case validation.',
    iconName: 'Terminal',
    defaultDuration: 60,
    defaultQuestionCount: 4,
    questionBreakdown: [
      '1 Algorithmic Warm-up & Structure Selection',
      '2 Medium Complexity LeetCode-style Challenges',
      '1 Space-Time Complexity & Optimization Review'
    ],
    focusAreas: [
      'Data structure selection & memory footprint',
      'Big-O asymptotic runtime calculation',
      'Modular decomposition & clean helper design',
      'Edge-case handling & boundary testing'
    ],
    targetSkills: ['Algorithms', 'Data Structures', 'Python', 'C++', 'Java', 'TypeScript'],
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  Aptitude: {
    type: 'Aptitude',
    title: 'Aptitude & Quantitative Problem Solving',
    shortDesc: 'Rapid quantitative reasoning, data interpretation, probability, and logical deduction.',
    fullDesc: 'Timed problem-solving rounds designed to measure computational agility, probability calculation, permutation deduction, and data interpretation speed.',
    iconName: 'BrainCircuit',
    defaultDuration: 30,
    defaultQuestionCount: 5,
    questionBreakdown: [
      '2 Quantitative Math & Work Rate Problems',
      '2 Probability & Permutation Challenges',
      '1 Logical Deduction & Data Interpretation Puzzle'
    ],
    focusAreas: [
      'Time-budgeted arithmetic calculations',
      'Probability & permutation shortcuts',
      'Chart & trend data interpretation',
      'Logical condition deduction'
    ],
    targetSkills: ['Quantitative Aptitude', 'Probability', 'Logical Reasoning', 'Data Analysis'],
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  Behavioral: {
    type: 'Behavioral',
    title: 'Behavioral & Leadership Principles',
    shortDesc: 'STAR framework responses, conflict resolution, ownership, and stakeholder collaboration.',
    fullDesc: 'Simulates behavioral inquiries evaluating engineering leadership, agency under ambiguity, constructive disagreement, mentoring, and post-mortem accountability.',
    iconName: 'Users',
    defaultDuration: 35,
    defaultQuestionCount: 4,
    questionBreakdown: [
      '1 Conflict Resolution & Technical Disagreement',
      '1 Milestone Delivery Under Extreme Ambiguity',
      '1 Production Outage Mistake & Post-Mortem',
      '1 Mentorship & Engineering Standards'
    ],
    focusAreas: [
      'STAR structural precision (Situation, Task, Action, Result)',
      'Leadership principles & extreme ownership',
      'Stakeholder alignment & empathy',
      'Continuous learning from failure'
    ],
    targetSkills: ['STAR Method', 'Leadership Principles', 'Communication', 'Conflict Resolution'],
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  'System Design': {
    type: 'System Design',
    title: 'System Design & Distributed Systems Round',
    shortDesc: 'High-level architecture, scalability, CAP theorem, caching, and data modeling.',
    fullDesc: 'Comprehensive architectural simulation covering requirements scoping, capacity planning, distributed database selection, caching layers, and resilience strategies.',
    iconName: 'Settings2',
    defaultDuration: 50,
    defaultQuestionCount: 3,
    questionBreakdown: [
      '1 Requirements Scoping & Capacity Calculations',
      '1 High-Level Architecture & API Design',
      '1 Data Modeling, Caching & Bottleneck Deep Dive'
    ],
    focusAreas: [
      'Scalability & load balancing strategies',
      'Distributed storage & partitioning (NoSQL vs SQL)',
      'Asynchronous queues & event streaming',
      'Fault tolerance, idempotency & CAP theorem'
    ],
    targetSkills: ['System Design', 'Microservices', 'Distributed Systems', 'Redis', 'Kafka'],
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  },
  Mixed: {
    type: 'Mixed',
    title: 'Comprehensive Mixed Simulation Round',
    shortDesc: 'Blended full-loop assessment spanning technical depth, coding, system design, and culture.',
    fullDesc: 'End-to-end multi-disciplinary simulation combining live coding, architectural trade-offs, and behavioral scenario questions to reflect on-site final interview loops.',
    iconName: 'Layers',
    defaultDuration: 50,
    defaultQuestionCount: 4,
    questionBreakdown: [
      '1 Technical Domain Deep Dive',
      '1 Live Coding & Data Structure Exercise',
      '1 Distributed System Design Component',
      '1 Behavioral Leadership Scenario'
    ],
    focusAreas: [
      'Holistic engineering versatility',
      'Context switching across coding and architecture',
      'Clear structured verbal communication',
      'End-to-end production readiness'
    ],
    targetSkills: ['React', 'System Design', 'Algorithms', 'Leadership', 'TypeScript'],
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  }
};

function getUserInterviewsStorageKey(userId?: string): string {
  return `smarthire_interviews_${userId || 'anonymous'}`;
}

export function generateTypeSpecificPreparation(
  type: InterviewType,
  activeResume: any | null,
  isDemoMode: boolean,
  userId?: string,
  company?: string
): {
  meta: InterviewTypeMetadata;
  strengths: PreparationStrength[];
  criticalGaps: PreparationGap[];
  recommendedPreparation: PreparationRecommendation[];
  checklist: ChecklistItem[];
  readinessScore: number;
  previousLearningProgress: {
    totalCompletedModules: number;
    relevantModulesCompleted: string[];
    readinessBoostPercent: number;
  };
} {
  const meta = INTERVIEW_TYPE_METADATA[type] || INTERVIEW_TYPE_METADATA.Technical;
  const intelligence = generateSkillIntelligence(activeResume, isDemoMode);
  const learningProgress = loadUserLearningProgress(userId);

  const allTechnical = (intelligence.graph?.nodes || []).filter(n => n.category !== 'Soft Skills' && n.status === 'strong');
  const allGaps = intelligence.criticalGaps || [];

  let relevantStrengths: PreparationStrength[] = [];
  let relevantGaps: PreparationGap[] = [];

  switch (type) {
    case 'Coding': {
      relevantStrengths = (intelligence.graph?.nodes || [])
        .filter(n => ['Algorithms', 'Data Structures', 'Python', 'TypeScript', 'JavaScript', 'Java', 'C++'].includes(n.name))
        .map(s => ({
          skill: s.name,
          category: s.category,
          score: s.score,
          evidence: `Demonstrated proficiency in algorithmic problem solving.`,
          status: s.status === 'strong' ? 'strong' : 'developing'
        }));

      if (relevantStrengths.length === 0) {
        relevantStrengths = [
          { skill: 'Data Structures & Trees', category: 'Backend', score: 85, status: 'strong', evidence: 'Recursive traversal and binary search mastery.' },
          { skill: 'Asymptotic Complexity', category: 'Backend', score: 80, status: 'strong', evidence: 'Big-O time and memory calculation accuracy.' }
        ];
      }

      relevantGaps = allGaps
        .filter(g => ['Algorithms', 'Data Structures', 'Backend', 'Python'].includes(g.category) || g.skill.includes('Algorithm'))
        .map(g => ({
          skill: g.skill,
          category: g.category,
          priority: g.priority === 'Critical' ? 'Critical' : 'High',
          recommendation: g.recommendedAction,
          learningModuleId: g.learningModuleId,
          whyItMatters: g.whyItMatters
        }));

      if (relevantGaps.length === 0) {
        relevantGaps = [
          {
            skill: 'Dynamic Programming & Memoization',
            category: 'Backend',
            priority: 'Critical',
            recommendation: 'Practice 2D state transitions and subproblem recurrence relations.',
            learningModuleId: 'dsa-graphs-trees',
            whyItMatters: 'Frequently asked in competitive technical interviews and coding rounds.'
          },
          {
            skill: 'Graph Traversal (BFS/DFS/Dijkstra)',
            category: 'Backend',
            priority: 'High',
            recommendation: 'Implement cycle detection and topological sorting in sandbox.',
            learningModuleId: 'dsa-graphs-trees',
            whyItMatters: 'Essential for dependency resolution and pathfinding problems.'
          }
        ];
      }
      break;
    }

    case 'System Design': {
      relevantStrengths = (intelligence.graph?.nodes || [])
        .filter(n => ['System Design', 'Microservices', 'Distributed Systems', 'PostgreSQL', 'Docker', 'AWS', 'Redis'].includes(n.name))
        .map(s => ({
          skill: s.name,
          category: s.category,
          score: s.score,
          evidence: `Practical system architecture and scalability experience.`,
          status: s.status === 'strong' ? 'strong' : 'developing'
        }));

      if (relevantStrengths.length === 0) {
        relevantStrengths = [
          { skill: 'REST API & Microservices', category: 'Backend', score: 88, status: 'strong', evidence: 'Stateless API routing and load balanced endpoints.' },
          { skill: 'Relational Database Modeling', category: 'Database', score: 82, status: 'strong', evidence: 'ACID compliance, schema normalization, and indexing.' }
        ];
      }

      relevantGaps = allGaps
        .filter(g => ['Cloud & DevOps', 'Database', 'Backend'].includes(g.category))
        .map(g => ({
          skill: g.skill,
          category: g.category,
          priority: 'Critical',
          recommendation: g.recommendedAction,
          learningModuleId: g.learningModuleId,
          whyItMatters: g.whyItMatters
        }));

      if (relevantGaps.length === 0) {
        relevantGaps = [
          {
            skill: 'Distributed Caching & Invalidation (Redis)',
            category: 'Database',
            priority: 'Critical',
            recommendation: 'Study cache stampede mitigation, write-through vs write-back strategies.',
            learningModuleId: 'system-design-microservices',
            whyItMatters: 'Critical to prevent database saturation at high queries-per-second.'
          },
          {
            skill: 'Message Brokers & Event Streaming (Kafka/RabbitMQ)',
            category: 'Backend',
            priority: 'High',
            recommendation: 'Review consumer group rebalancing, offset commits, and at-least-once delivery.',
            learningModuleId: 'system-design-microservices',
            whyItMatters: 'De-couples synchronous services and enables asynchronous throughput.'
          }
        ];
      }
      break;
    }

    case 'Behavioral': {
      relevantStrengths = [
        { skill: 'Cross-Functional Collaboration', category: 'Soft Skills', score: 92, status: 'strong', evidence: 'Coordinated between product managers, UI designers, and QA teams.' },
        { skill: 'Agile Delivery & Sprint Ownership', category: 'Soft Skills', score: 88, status: 'strong', evidence: 'Iterative delivery, clear retrospectives, and milestone accountability.' }
      ];

      relevantGaps = [
        {
          skill: 'Quantified Impact Delivery (STAR Results)',
          category: 'Soft Skills',
          priority: 'Critical',
          recommendation: 'Structure all project narratives with concrete percentages, latency drops, and revenue saved.',
          whyItMatters: 'Top companies reject vague narrative responses without verifiable numeric outcomes.'
        },
        {
          skill: 'Constructive Disagreement Framing',
          category: 'Soft Skills',
          priority: 'High',
          recommendation: 'Formulate responses highlighting objective data benchmarking rather than personal friction.',
          whyItMatters: 'Tests maturity, high agency, and alignment with leadership principles.'
        }
      ];
      break;
    }

    case 'Aptitude': {
      relevantStrengths = [
        { skill: 'Analytical Logic & Pattern Recognition', category: 'Soft Skills', score: 86, status: 'strong', evidence: 'Fast systematic elimination and quantitative reasoning.' },
        { skill: 'Computational Probability', category: 'Soft Skills', score: 82, status: 'strong', evidence: 'Combinatorics and mathematical formula applications.' }
      ];

      relevantGaps = [
        {
          skill: 'Time-budgeted Logical Deduction',
          category: 'Soft Skills',
          priority: 'High',
          recommendation: 'Practice 60-second puzzle elimination and percentage shortcuts.',
          whyItMatters: 'Speed and accuracy determine cutoff qualification in campus hiring.'
        },
        {
          skill: 'Data Interpretation Speed',
          category: 'Soft Skills',
          priority: 'Medium',
          recommendation: 'Review chart trends, ratio estimations, and statistical inference.',
          whyItMatters: 'Standard screening metric for technology consultancies and quantitative roles.'
        }
      ];
      break;
    }

    case 'Technical':
    case 'Mixed':
    default: {
      relevantStrengths = allTechnical.slice(0, 3).map(s => ({
        skill: s.name,
        category: s.category,
        score: s.score,
        evidence: `Demonstrated in production code and verified competencies.`,
        status: s.status === 'strong' ? 'strong' : 'developing'
      }));

      if (relevantStrengths.length === 0) {
        relevantStrengths = [
          { skill: 'React Architecture', category: 'Frontend', score: 88, status: 'strong', evidence: 'Component lifecycle and state orchestration.' },
          { skill: 'TypeScript Fundamentals', category: 'Programming Languages', score: 85, status: 'strong', evidence: 'Type safety and interface contracts.' }
        ];
      }

      relevantGaps = allGaps.slice(0, 2).map(g => ({
        skill: g.skill,
        category: g.category,
        priority: g.priority === 'Critical' ? 'Critical' : 'High',
        recommendation: g.recommendedAction,
        learningModuleId: g.learningModuleId,
        whyItMatters: g.whyItMatters
      }));

      if (relevantGaps.length === 0) {
        relevantGaps = [
          {
            skill: 'Advanced React Performance',
            category: 'Frontend',
            priority: 'Critical',
            recommendation: 'Inspect React 18 concurrent transitions, memoization, and virtualization.',
            learningModuleId: 'frontend-react-performance',
            whyItMatters: 'High-frequency question in technical frontend and full-stack rounds.'
          },
          {
            skill: 'Docker Containerization & Pipelines',
            category: 'Cloud & DevOps',
            priority: 'High',
            recommendation: 'Review multi-stage builds, container security, and CI/CD triggers.',
            learningModuleId: 'devops-docker-kubernetes',
            whyItMatters: 'Standard expectation for modern production engineering.'
          }
        ];
      }
      break;
    }
  }

  // Recommended preparation items
  const recommendedPreparation: PreparationRecommendation[] = [
    {
      title: `Review ${type} Critical Skills`,
      type: 'skills',
      route: '/skills',
      state: { targetCategory: meta.targetSkills[0] },
      description: 'Explore the interactive Skill Intelligence graph to review verified competencies and requirements.',
      badge: 'Skill Graph'
    },
    {
      title: 'Practice Target Learning Curriculum',
      type: 'learning',
      route: '/learning',
      state: { targetSkill: relevantGaps[0]?.skill || meta.targetSkills[0] },
      description: 'Complete hands-on coding sandboxes, quizzes, and scenario-based assessments on the Learning Roadmap.',
      badge: 'Learning Roadmap'
    }
  ];

  if (company) {
    recommendedPreparation.unshift({
      title: `${company} Company Preparation Track`,
      type: 'company',
      route: `/preparation/${encodeURIComponent(company.toLowerCase())}`,
      state: { company: { name: company, score: 78 } },
      description: `Review customized culture values, past interview questions, and readiness metrics for ${company}.`,
      badge: `${company} Prep`
    });
  }

  // Generate interactive checklist
  const checklist: ChecklistItem[] = [
    {
      id: 'check-1',
      label: `Review ${type} Core Strengths & Gaps`,
      completed: true,
      actionLabel: 'View Skill Graph',
      actionRoute: '/skills',
      actionState: { targetSkill: meta.targetSkills[0] },
      description: 'Verify your verified skills and identify high-priority focus areas.'
    },
    {
      id: 'check-2',
      label: 'Review Recommended Learning Module',
      completed: false,
      actionLabel: 'Open Roadmap',
      actionRoute: '/learning',
      actionState: { targetSkill: relevantGaps[0]?.skill || meta.targetSkills[0] },
      description: 'Study the curriculum and review architectural lessons before starting.'
    },
    {
      id: 'check-3',
      label: company ? `Inspect ${company} Preparation Profile` : 'Rehearse Verbal & Structural Responses',
      completed: false,
      actionLabel: company ? 'Company Prep' : 'Readiness',
      actionRoute: company ? `/preparation/${encodeURIComponent(company.toLowerCase())}` : '/readiness',
      actionState: company ? { company: { name: company, score: 80 } } : undefined,
      description: 'Formulate concise talking points and prepare structured answers.'
    },
    {
      id: 'check-4',
      label: 'Perform Audio, Camera & Quiet Space Check',
      completed: false,
      actionLabel: 'Ready Check',
      actionRoute: '#',
      description: 'Ensure your microphone is functioning and browser permissions are enabled.'
    }
  ];

  // Learning progress statistics
  const completedModuleIds = Object.keys(learningProgress).filter(id => learningProgress[id].status === 'COMPLETED');
  const relevantModulesCompleted = CURATED_LEARNING_MODULES
    .filter(m => completedModuleIds.includes(m.id))
    .map(m => m.title);

  // Readiness score calculation
  const baseScore = activeResume?.score || (isDemoMode ? 82 : 75);
  const typeOffset = type === 'Behavioral' ? 8 : type === 'System Design' ? -5 : type === 'Coding' ? -2 : 2;
  const readinessScore = Math.min(96, Math.max(50, baseScore + typeOffset + (completedModuleIds.length * 3)));

  return {
    meta,
    strengths: relevantStrengths,
    criticalGaps: relevantGaps,
    recommendedPreparation,
    checklist,
    readinessScore,
    previousLearningProgress: {
      totalCompletedModules: completedModuleIds.length,
      relevantModulesCompleted,
      readinessBoostPercent: Math.min(30, completedModuleIds.length * 8)
    }
  };
}

// Load all interview sessions for the authenticated user
export function loadUserInterviews(userId?: string): InterviewSession[] {
  try {
    const key = getUserInterviewsStorageKey(userId);
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load user interviews:', e);
  }

  return [];
}

// Save or update an interview session
export function saveInterviewSession(userId: string | undefined, session: InterviewSession): InterviewSession {
  const all = loadUserInterviews(userId);
  const existingIdx = all.findIndex(s => s.id === session.id);

  if (existingIdx >= 0) {
    all[existingIdx] = session;
  } else {
    all.unshift(session);
  }

  try {
    const key = getUserInterviewsStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save interview session:', e);
  }

  return session;
}

// Create a fresh interview session with questions and initial session state
export function createNewInterviewSession(
  type: InterviewType,
  activeResume: any | null,
  isDemoMode: boolean,
  userId?: string,
  company?: string,
  customRole?: string
): InterviewSession {
  const prepared = generateTypeSpecificPreparation(type, activeResume, isDemoMode, userId, company);
  const meta = prepared.meta;

  const role = customRole || (activeResume?.parsedContent?.skills?.[0] ? `${activeResume.parsedContent.skills[0]} Engineer` : 'Software Engineer');
  const id = `mock_${Date.now()}_${type.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const questions = getMockInterviewQuestions(type, role, company);
  const totalDurationSeconds = meta.defaultDuration * 60;

  const initialResponses: Record<string, UserResponse> = {};
  questions.forEach(q => {
    initialResponses[q.id] = {
      questionId: q.id,
      format: q.format,
      codeAnswer: q.initialCode || '',
      codeLanguage: q.language || 'typescript',
      timeSpentSeconds: 0
    };
  });

  const sessionState: ActiveSessionState = {
    interviewId: id,
    currentQuestionIndex: 0,
    timeRemainingSeconds: totalDurationSeconds,
    totalDurationSeconds,
    isTimerRunning: true,
    status: 'PREPARING',
    responses: initialResponses,
    notes: '',
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  const session: InterviewSession = {
    id,
    title: `${company ? `${company} ` : ''}${meta.title}`,
    type,
    role,
    company,
    status: 'PREPARING',
    createdAt: new Date().toISOString(),
    readinessScore: prepared.readinessScore,
    durationMinutes: meta.defaultDuration,
    questionCount: questions.length,
    questionTypes: meta.questionBreakdown,
    targetSkills: meta.targetSkills,
    strengths: prepared.strengths,
    criticalGaps: prepared.criticalGaps,
    recommendedPreparation: prepared.recommendedPreparation,
    checklist: prepared.checklist,
    questions,
    sessionState,
    previousLearningProgress: prepared.previousLearningProgress,
    previousPerformance: {
      totalSessions: 1,
      avgScore: 78,
      lastScore: 76,
      improvementArea: 'System design trade-offs & time complexity articulation'
    }
  };

  saveInterviewSession(userId, session);
  return session;
}

// Get or dynamically construct an interview session by ID
export function getInterviewById(
  interviewId: string,
  userId?: string,
  activeResume?: any,
  isDemoMode?: boolean,
  fallbackType: InterviewType = 'Technical',
  company?: string
): InterviewSession {
  const all = loadUserInterviews(userId);
  const found = all.find(s => s.id === interviewId);

  if (found) {
    // Ensure questions and sessionState exist if saved previously before migration
    if (!found.questions || found.questions.length === 0) {
      found.questions = getMockInterviewQuestions(found.type, found.role, found.company);
    }
    if (!found.sessionState) {
      const totalSec = (found.durationMinutes || 45) * 60;
      const initialResponses: Record<string, UserResponse> = {};
      found.questions.forEach(q => {
        initialResponses[q.id] = {
          questionId: q.id,
          format: q.format,
          codeAnswer: q.initialCode || '',
          codeLanguage: q.language || 'typescript',
          timeSpentSeconds: 0
        };
      });
      found.sessionState = {
        interviewId: found.id,
        currentQuestionIndex: 0,
        timeRemainingSeconds: totalSec,
        totalDurationSeconds: totalSec,
        isTimerRunning: true,
        status: found.status,
        responses: initialResponses,
        notes: '',
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      saveInterviewSession(userId, found);
    }
    return found;
  }

  // If new or parameterized ID, generate freshly
  let resolvedType: InterviewType = fallbackType;
  if (interviewId.toLowerCase().includes('coding')) resolvedType = 'Coding';
  else if (interviewId.toLowerCase().includes('sys') || interviewId.toLowerCase().includes('design')) resolvedType = 'System Design';
  else if (interviewId.toLowerCase().includes('behav')) resolvedType = 'Behavioral';
  else if (interviewId.toLowerCase().includes('apt')) resolvedType = 'Aptitude';
  else if (interviewId.toLowerCase().includes('mix')) resolvedType = 'Mixed';

  const newSession = createNewInterviewSession(resolvedType, activeResume, Boolean(isDemoMode), userId, company);
  if (interviewId !== 'new') {
    newSession.id = interviewId;
    if (newSession.sessionState) {
      newSession.sessionState.interviewId = interviewId;
    }
    saveInterviewSession(userId, newSession);
  }
  return newSession;
}

// Update checklist item completion
export function updateChecklistItem(
  userId: string | undefined,
  interviewId: string,
  checkId: string,
  completed: boolean
): InterviewSession | null {
  const all = loadUserInterviews(userId);
  const session = all.find(s => s.id === interviewId);
  if (!session) return null;

  session.checklist = session.checklist.map(item => {
    if (item.id === checkId) {
      return { ...item, completed };
    }
    return item;
  });

  const allChecked = session.checklist.every(c => c.completed);
  if (allChecked && session.status === 'PREPARING') {
    session.status = 'READY';
  }

  saveInterviewSession(userId, session);
  return session;
}

// Update active session state (question navigation, timer, answer responses)
export function updateSessionState(
  userId: string | undefined,
  interviewId: string,
  updater: (prevState: ActiveSessionState) => Partial<ActiveSessionState>
): InterviewSession | null {
  const all = loadUserInterviews(userId);
  const session = all.find(s => s.id === interviewId);
  if (!session) return null;

  if (!session.sessionState) {
    const totalSec = (session.durationMinutes || 45) * 60;
    session.sessionState = {
      interviewId: session.id,
      currentQuestionIndex: 0,
      timeRemainingSeconds: totalSec,
      totalDurationSeconds: totalSec,
      isTimerRunning: true,
      status: session.status,
      responses: {},
      notes: '',
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  const updates = updater(session.sessionState);
  session.sessionState = {
    ...session.sessionState,
    ...updates,
    lastUpdated: new Date().toISOString()
  };

  saveInterviewSession(userId, session);
  return session;
}

// Save response for a specific question
export function saveQuestionResponse(
  userId: string | undefined,
  interviewId: string,
  questionId: string,
  response: Partial<UserResponse>
): InterviewSession | null {
  return updateSessionState(userId, interviewId, prev => {
    const currentResp = prev.responses[questionId] || {
      questionId,
      format: 'technical',
      timeSpentSeconds: 0
    };
    return {
      responses: {
        ...prev.responses,
        [questionId]: {
          ...currentResp,
          ...response
        }
      }
    };
  });
}

// Update status
export function updateInterviewStatus(
  userId: string | undefined,
  interviewId: string,
  status: InterviewStatus,
  score?: number
): InterviewSession | null {
  const all = loadUserInterviews(userId);
  const session = all.find(s => s.id === interviewId);
  if (!session) return null;

  session.status = status;
  if (session.sessionState) {
    session.sessionState.status = status;
  }
  if (status === 'COMPLETED') {
    session.completedAt = session.completedAt || new Date().toISOString();
    if (score !== undefined) {
      session.score = score;
    }
  }

  saveInterviewSession(userId, session);
  return session;
}

// Retake an existing interview session by cloning config into a fresh session
export function retakeInterviewSession(
  userId: string | undefined,
  previousSession: InterviewSession,
  activeResume: any,
  isDemoMode: boolean
): InterviewSession {
  const newSession = createNewInterviewSession(
    previousSession.type,
    activeResume,
    Boolean(isDemoMode),
    userId,
    previousSession.company,
    previousSession.role
  );

  // Transfer previous session score to performance history
  if (previousSession.score !== undefined) {
    const all = loadUserInterviews(userId);
    const pastCompleted = all.filter(s => s.status === 'COMPLETED' && s.score !== undefined);
    const totalScoreSum = pastCompleted.reduce((acc, s) => acc + (s.score || 0), 0);
    const avgScore = pastCompleted.length > 0 ? Math.round(totalScoreSum / pastCompleted.length) : previousSession.score;

    newSession.previousPerformance = {
      totalSessions: pastCompleted.length,
      avgScore,
      lastScore: previousSession.score,
      improvementArea: 'System design trade-offs, algorithmic edge cases & STAR precision'
    };
    saveInterviewSession(userId, newSession);
  }

  return newSession;
}


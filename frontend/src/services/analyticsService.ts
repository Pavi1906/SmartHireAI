import { 
  StudentAnalyticsOverview, 
  SkillCategoryMetric, 
  InterviewTrendPoint, 
  InterviewTypeMetric,
  CompanyReadinessOverview,
  JobMatchOverview,
  AnalyticsActionItem 
} from '../types/analytics';
import { generateSkillIntelligence } from './skillIntelligenceService';
import { getTailoredRoadmapModules, loadUserLearningProgress } from './learningService';
import { loadUserInterviews, INTERVIEW_TYPE_METADATA } from './interviewService';
import { InterviewType } from '../types/interview';

export interface FullStudentAnalytics {
  overview: StudentAnalyticsOverview;
  skillCategories: SkillCategoryMetric[];
  allSkillsCount: number;
  topStrengths: { name: string; score: number; category: string }[];
  criticalGaps: { name: string; score: number; category: string; impact: string }[];
  interviewTrend: InterviewTrendPoint[];
  hasEnoughInterviewHistory: boolean;
  interviewTypeMetrics: InterviewTypeMetric[];
  companies: CompanyReadinessOverview[];
  jobs: JobMatchOverview[];
  actionItems: AnalyticsActionItem[];
}

export function computeStudentAnalytics(
  activeResume: any | null,
  isDemoMode: boolean,
  userId?: string
): FullStudentAnalytics | null {
  if (!activeResume && !isDemoMode) {
    return null;
  }

  // 1. Skill Intelligence
  const skillIntelligence = generateSkillIntelligence(activeResume, isDemoMode);
  if (!skillIntelligence) {
    return null;
  }
  const skills = skillIntelligence.allSkills;
  const criticalGapsList = skillIntelligence.criticalGaps;
  
  // Categorize skills
  const categoriesMap: Record<string, { scores: number[]; strong: number; developing: number; gaps: number }> = {};
  skills.forEach(s => {
    if (!categoriesMap[s.category]) {
      categoriesMap[s.category] = { scores: [], strong: 0, developing: 0, gaps: 0 };
    }
    categoriesMap[s.category].scores.push(s.score);
    if (s.score >= 80) categoriesMap[s.category].strong++;
    else if (s.score >= 60) categoriesMap[s.category].developing++;
    else categoriesMap[s.category].gaps++;
  });

  const skillCategories: SkillCategoryMetric[] = Object.entries(categoriesMap).map(([category, data]) => ({
    category,
    total: data.scores.length,
    strong: data.strong,
    developing: data.developing,
    gaps: data.gaps,
    averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / (data.scores.length || 1))
  })).sort((a, b) => b.total - a.total);

  const topStrengths = skills
    .filter(s => s.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => ({ name: s.name, score: s.score, category: s.category }));

  const criticalGaps = criticalGapsList.slice(0, 5).map(g => {
    const matchingSkill = skills.find(s => s.name.toLowerCase() === g.skill.toLowerCase());
    return {
      name: g.skill,
      score: matchingSkill?.score || 45,
      category: g.category,
      impact: g.careerImpact
    };
  });

  // 2. Learning Roadmap
  const roadmapData = getTailoredRoadmapModules(activeResume, isDemoMode, userId);
  const { summary: learningSummary, modules: learningModules } = roadmapData;

  // 3. Mock Interviews
  const interviews = loadUserInterviews(userId);
  const completedInterviews = interviews
    .filter(i => i.status === 'COMPLETED' && i.score !== undefined)
    .sort((a, b) => new Date(a.completedAt || a.createdAt).getTime() - new Date(b.completedAt || b.createdAt).getTime());

  const interviewScores = completedInterviews.map(i => i.score as number);
  const interviewAverage = interviewScores.length > 0
    ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length)
    : null;

  const interviewTrend: InterviewTrendPoint[] = completedInterviews.map((session, index) => {
    const rawDate = session.completedAt || session.createdAt;
    const d = new Date(rawDate);
    const formattedDate = isNaN(d.getTime()) 
      ? `Session ${index + 1}` 
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: rawDate,
      formattedDate,
      score: session.score || 0,
      type: session.type,
      title: session.title,
      id: session.id
    };
  });

  const interviewTypes: InterviewType[] = ['Technical', 'Coding', 'System Design', 'Behavioral', 'Aptitude', 'Mixed'];
  const interviewTypeMetrics: InterviewTypeMetric[] = interviewTypes.map(t => {
    const matching = interviews.filter(i => i.type === t);
    const completedMatching = matching.filter(i => i.status === 'COMPLETED' && i.score !== undefined);
    const avg = completedMatching.length > 0
      ? Math.round(completedMatching.reduce((a, b) => a + (b.score || 0), 0) / completedMatching.length)
      : null;
    const latest = completedMatching.length > 0 ? (completedMatching[completedMatching.length - 1].score ?? null) : null;

    return {
      type: t,
      totalSessions: matching.length,
      completedSessions: completedMatching.length,
      averageScore: avg,
      latestScore: latest,
      targetSkills: INTERVIEW_TYPE_METADATA[t]?.targetSkills || []
    };
  });

  // 4. Target Companies (Deterministic calculation aligned with CompanyReadiness page)
  const userSkills = activeResume?.skills || activeResume?.parsedContent?.skills || (isDemoMode ? ['React', 'TypeScript', 'Node.js', 'PostgreSQL'] : []);
  const baseScore = activeResume?.score || (isDemoMode ? 85 : 75);

  const generateCompanyMetric = (
    name: string, 
    logo: string, 
    industry: string, 
    missingPool: string[]
  ): CompanyReadinessOverview => {
    const score = Math.min(100, Math.max(0, baseScore - (missingPool.length * 5)));
    const matchedCount = userSkills.slice(0, 4).length;
    return {
      name,
      logo,
      score,
      industry,
      matchedSkillsCount: matchedCount,
      missingSkillsCount: missingPool.length,
      missingSkills: missingPool
    };
  };

  const companies: CompanyReadinessOverview[] = [
    generateCompanyMetric('Google', 'G', 'Big Tech', ['System Design', 'Go', 'GCP']),
    generateCompanyMetric('Microsoft', 'M', 'Big Tech', ['C#', 'Azure', 'System Design']),
    generateCompanyMetric('Amazon', 'A', 'Big Tech', ['AWS', 'Leadership Principles']),
    generateCompanyMetric('Stripe', 'S', 'FinTech', ['API Security', 'Distributed Queues']),
    generateCompanyMetric('TCS', 'T', 'IT Services', ['Java', 'Spring Boot']),
    generateCompanyMetric('Infosys', 'I', 'IT Services', ['Python', 'SQL']),
    generateCompanyMetric('Accenture', 'Ac', 'Consulting', ['Agile', 'Cloud Computing'])
  ];

  const averageCompanyReadiness = Math.round(
    companies.reduce((a, b) => a + b.score, 0) / companies.length
  );

  const topCompany = [...companies].sort((a, b) => b.score - a.score)[0] || null;

  // 5. Job Matching (Aligned with JobMatching page logic)
  const userExp = activeResume?.parsedContent?.experience || [];
  const dynamicJobs: JobMatchOverview[] = [
    {
      id: '1',
      title: userExp.length > 0 ? `Senior ${userSkills[0] || 'Software'} Engineer` : `${userSkills[0] || 'Software'} Developer`,
      company: 'Tech Innovations Inc',
      location: 'San Francisco, CA (Hybrid)',
      matchScore: Math.min(100, baseScore + 7),
      salary: '$140k - $190k',
      applied: false
    },
    {
      id: '2',
      title: `${userSkills[1] || 'Frontend'} UI Engineer`,
      company: 'Global Systems',
      location: 'Remote',
      matchScore: baseScore,
      salary: '$120k - $160k',
      applied: false
    },
    {
      id: '3',
      title: `Fullstack ${userSkills[2] || 'Web'} Developer`,
      company: 'StartupX',
      location: 'New York, NY (On-site)',
      matchScore: Math.max(0, baseScore - 7),
      salary: '$110k - $140k',
      applied: false
    }
  ];

  // 6. Composite Placement Score
  // Calculated deterministically from Resume (30%), Skills (30%), Interviews (25% if available, else redistributed), Learning (15%)
  const resumeATS = activeResume?.score || (isDemoMode ? 88 : 75);
  const skillMarketScore = skillIntelligence.stats.marketCompetitiveness;
  const learningRate = learningSummary.overallProgressPercent;

  let placementScore: number;
  if (interviewAverage !== null) {
    placementScore = Math.round(
      (resumeATS * 0.30) + 
      (skillMarketScore * 0.30) + 
      (interviewAverage * 0.25) + 
      (learningRate * 0.15)
    );
  } else {
    // Redistribute weight when no interviews have been completed
    placementScore = Math.round(
      (resumeATS * 0.40) + 
      (skillMarketScore * 0.40) + 
      (learningRate * 0.20)
    );
  }

  let placementTier: StudentAnalyticsOverview['placementTier'];
  if (placementScore >= 85) placementTier = 'Tier-1 FAANG Ready';
  else if (placementScore >= 72) placementTier = 'High-Growth Tech Ready';
  else if (placementScore >= 55) placementTier = 'Enterprise Ready';
  else placementTier = 'Foundational / Developing';

  const overview: StudentAnalyticsOverview = {
    placementScore,
    placementTier,
    resumeScore: resumeATS,
    skillCompetitiveness: skillMarketScore,
    interviewAverage,
    completedInterviewsCount: completedInterviews.length,
    learningProgressPercent: learningSummary.overallProgressPercent,
    completedModulesCount: learningSummary.completedModules,
    totalModulesCount: learningSummary.totalModules,
    estimatedHoursRemaining: learningSummary.estimatedHoursRemaining,
    targetRoleReadinessBoost: learningSummary.targetRoleReadinessBoost,
    topCompany: topCompany ? { name: topCompany.name, score: topCompany.score, industry: topCompany.industry } : null,
    averageCompanyReadiness,
    totalJobMatches: dynamicJobs.length,
    appliedJobsCount: dynamicJobs.filter(j => j.applied).length,
    criticalGapsCount: criticalGapsList.length,
    verifiedSkillsCount: skillIntelligence.stats.verifiedSkillsCount
  };

  // 7. Actionable Recommendations (Deterministic prioritized next steps)
  const actionItems: AnalyticsActionItem[] = [];

  // Top learning module gap
  const nextIncompleteModule = learningModules.find(m => {
    const userProg = loadUserLearningProgress(userId)[m.id];
    return !userProg || userProg.status !== 'COMPLETED';
  });

  if (nextIncompleteModule) {
    actionItems.push({
      id: 'act-learning-1',
      title: `Master ${nextIncompleteModule.skill}: ${nextIncompleteModule.title}`,
      description: `Targeted by ${nextIncompleteModule.targetCompanies.slice(0, 3).join(', ')}. Est. effort: ${nextIncompleteModule.estimatedEffort}.`,
      impact: nextIncompleteModule.expectedImpact,
      category: 'learning',
      actionLabel: 'Start Module',
      route: `/learning/${nextIncompleteModule.slug}`
    });
  }

  // Interview action
  if (completedInterviews.length === 0) {
    actionItems.push({
      id: 'act-interview-1',
      title: 'Complete First Technical Mock Interview',
      description: 'Benchmark your algorithmic explanation and core language runtime competency.',
      impact: '+15% Placement Confidence',
      category: 'interview',
      actionLabel: 'Take Interview',
      route: '/interviews'
    });
  } else {
    // Recommend round with lowest score or unattempted round
    const unattempted = interviewTypeMetrics.find(m => m.completedSessions === 0);
    if (unattempted) {
      actionItems.push({
        id: 'act-interview-2',
        title: `Simulate ${unattempted.type} Round`,
        description: `Expand beyond your existing practice into ${unattempted.targetSkills.slice(0, 3).join(', ')}.`,
        impact: '+8% Loop Versatility',
        category: 'interview',
        actionLabel: 'Prepare Round',
        route: '/interviews'
      });
    }
  }

  // Skill gap exploration
  if (criticalGapsList.length > 0) {
    actionItems.push({
      id: 'act-skill-1',
      title: `Review ${criticalGapsList[0].skill} Gap`,
      description: `Critical gap detected in ${criticalGapsList[0].category}. Resolving this increases market competitiveness by ${criticalGapsList[0].careerImpact}.`,
      impact: criticalGapsList[0].careerImpact,
      category: 'resume',
      actionLabel: 'View Skill Graph',
      route: '/skills'
    });
  }

  // Job matching action
  actionItems.push({
    id: 'act-jobs-1',
    title: 'Explore Matched Engineering Positions',
    description: `${dynamicJobs.length} active opportunities align with your verified strengths and tech stack.`,
    impact: 'Active Openings',
    category: 'job',
    actionLabel: 'View Matches',
    route: '/jobs'
  });

  return {
    overview,
    skillCategories,
    allSkillsCount: skills.length,
    topStrengths,
    criticalGaps,
    interviewTrend,
    hasEnoughInterviewHistory: interviewTrend.length >= 2,
    interviewTypeMetrics,
    companies,
    jobs: dynamicJobs,
    actionItems
  };
}

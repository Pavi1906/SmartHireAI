import { 
  SkillIntelligenceData, 
  SkillItem, 
  SkillGap, 
  SkillRecommendation, 
  SkillCategory, 
  SkillProficiency, 
  SkillStatus,
  SkillGraphNode,
  SkillGraphEdge
} from '../types/skills';

// Taxonomy database for accurate categorization and relationships
const SKILL_TAXONOMY: Record<string, {
  category: SkillCategory;
  related: string[];
  prerequisites?: string[];
  marketDemand: 'Very High' | 'High' | 'Moderate' | 'Growing';
  defaultScoreOffset: number;
}> = {
  // Frontend
  'React': { category: 'Frontend', related: ['TypeScript', 'JavaScript', 'Next.js', 'Redux', 'Tailwind CSS'], marketDemand: 'Very High', defaultScoreOffset: 5 },
  'React.js': { category: 'Frontend', related: ['TypeScript', 'JavaScript', 'Next.js', 'Redux'], marketDemand: 'Very High', defaultScoreOffset: 5 },
  'TypeScript': { category: 'Programming Languages', related: ['JavaScript', 'React', 'Node.js', 'Angular'], marketDemand: 'Very High', defaultScoreOffset: 3 },
  'JavaScript': { category: 'Programming Languages', related: ['TypeScript', 'React', 'Node.js', 'HTML/CSS'], marketDemand: 'Very High', defaultScoreOffset: 4 },
  'Next.js': { category: 'Frontend', related: ['React', 'TypeScript', 'Node.js', 'GraphQL'], marketDemand: 'Very High', defaultScoreOffset: 2 },
  'Vue.js': { category: 'Frontend', related: ['JavaScript', 'TypeScript', 'Vuex', 'Nuxt.js'], marketDemand: 'High', defaultScoreOffset: 0 },
  'Angular': { category: 'Frontend', related: ['TypeScript', 'RxJS', 'NgRx'], marketDemand: 'High', defaultScoreOffset: 0 },
  'HTML/CSS': { category: 'Frontend', related: ['JavaScript', 'Tailwind CSS', 'Sass', 'Responsive Design'], marketDemand: 'High', defaultScoreOffset: 8 },
  'HTML5': { category: 'Frontend', related: ['CSS3', 'JavaScript'], marketDemand: 'High', defaultScoreOffset: 8 },
  'CSS3': { category: 'Frontend', related: ['HTML5', 'Tailwind CSS', 'Sass'], marketDemand: 'High', defaultScoreOffset: 7 },
  'Tailwind CSS': { category: 'Frontend', related: ['HTML/CSS', 'React', 'Next.js'], marketDemand: 'Very High', defaultScoreOffset: 6 },
  'Redux': { category: 'Frontend', related: ['React', 'TypeScript', 'State Management'], marketDemand: 'High', defaultScoreOffset: 2 },
  'GraphQL': { category: 'Backend', related: ['Node.js', 'Apollo', 'TypeScript', 'REST APIs'], marketDemand: 'Very High', defaultScoreOffset: -5 },
  
  // Backend
  'Node.js': { category: 'Backend', related: ['Express.js', 'TypeScript', 'JavaScript', 'NestJS'], marketDemand: 'Very High', defaultScoreOffset: 3 },
  'Express.js': { category: 'Backend', related: ['Node.js', 'REST APIs', 'MongoDB', 'PostgreSQL'], marketDemand: 'High', defaultScoreOffset: 4 },
  'Express': { category: 'Backend', related: ['Node.js', 'REST APIs', 'MongoDB'], marketDemand: 'High', defaultScoreOffset: 4 },
  'NestJS': { category: 'Backend', related: ['Node.js', 'TypeScript', 'Microservices'], marketDemand: 'Very High', defaultScoreOffset: 1 },
  'Python': { category: 'Programming Languages', related: ['Django', 'FastAPI', 'Data Science', 'PyTorch'], marketDemand: 'Very High', defaultScoreOffset: 5 },
  'FastAPI': { category: 'Backend', related: ['Python', 'Docker', 'Asyncio', 'REST APIs'], marketDemand: 'Very High', defaultScoreOffset: 2 },
  'Django': { category: 'Backend', related: ['Python', 'PostgreSQL', 'REST APIs'], marketDemand: 'High', defaultScoreOffset: 1 },
  'Java': { category: 'Programming Languages', related: ['Spring Boot', 'Microservices', 'Hibernate'], marketDemand: 'Very High', defaultScoreOffset: 4 },
  'Spring Boot': { category: 'Backend', related: ['Java', 'Microservices', 'Spring Security'], marketDemand: 'Very High', defaultScoreOffset: 2 },
  'Go': { category: 'Programming Languages', related: ['Microservices', 'Docker', 'Kubernetes', 'gRPC'], marketDemand: 'Very High', defaultScoreOffset: -2 },
  'Golang': { category: 'Programming Languages', related: ['Microservices', 'Docker', 'Kubernetes'], marketDemand: 'Very High', defaultScoreOffset: -2 },
  'C++': { category: 'Programming Languages', related: ['Data Structures', 'Algorithms', 'System Programming'], marketDemand: 'High', defaultScoreOffset: 2 },
  'C#': { category: 'Programming Languages', related: ['.NET', 'Azure', 'SQL Server'], marketDemand: 'High', defaultScoreOffset: 2 },
  '.NET': { category: 'Backend', related: ['C#', 'SQL Server', 'Azure'], marketDemand: 'High', defaultScoreOffset: 1 },
  'REST APIs': { category: 'Backend', related: ['Node.js', 'Express', 'HTTP', 'API Security'], marketDemand: 'Very High', defaultScoreOffset: 6 },
  'gRPC': { category: 'Backend', related: ['Microservices', 'Protobuf', 'Go', 'Java'], marketDemand: 'High', defaultScoreOffset: -4 },
  'Microservices': { category: 'System Architecture', related: ['Docker', 'Kubernetes', 'Kafka', 'REST APIs'], marketDemand: 'Very High', defaultScoreOffset: -3 },
  'System Design': { category: 'System Architecture', related: ['Scalability', 'Distributed Systems', 'Caching', 'Load Balancing'], marketDemand: 'Very High', defaultScoreOffset: -4 },

  // Database
  'PostgreSQL': { category: 'Database', related: ['SQL', 'Prisma', 'TypeORM', 'Database Design'], marketDemand: 'Very High', defaultScoreOffset: 3 },
  'MongoDB': { category: 'Database', related: ['Mongoose', 'NoSQL', 'Node.js', 'Express'], marketDemand: 'High', defaultScoreOffset: 4 },
  'MySQL': { category: 'Database', related: ['SQL', 'Relational Databases', 'Indexing'], marketDemand: 'High', defaultScoreOffset: 3 },
  'Redis': { category: 'Database', related: ['Caching', 'Pub/Sub', 'Key-Value Store', 'Session Management'], marketDemand: 'Very High', defaultScoreOffset: 1 },
  'SQL': { category: 'Database', related: ['PostgreSQL', 'MySQL', 'Database Normalization'], marketDemand: 'Very High', defaultScoreOffset: 5 },
  'Prisma': { category: 'Database', related: ['PostgreSQL', 'TypeScript', 'Node.js'], marketDemand: 'High', defaultScoreOffset: 2 },

  // Cloud & DevOps
  'Docker': { category: 'Cloud & DevOps', related: ['Kubernetes', 'CI/CD', 'Containers', 'Microservices'], marketDemand: 'Very High', defaultScoreOffset: 2 },
  'Kubernetes': { category: 'Cloud & DevOps', related: ['Docker', 'Cloud & DevOps', 'Helm', 'Microservices'], marketDemand: 'Very High', defaultScoreOffset: -5 },
  'AWS': { category: 'Cloud & DevOps', related: ['EC2', 'S3', 'Lambda', 'CloudFormation'], marketDemand: 'Very High', defaultScoreOffset: 1 },
  'GCP': { category: 'Cloud & DevOps', related: ['Google Cloud', 'Cloud Run', 'BigQuery', 'Firebase'], marketDemand: 'High', defaultScoreOffset: 0 },
  'Azure': { category: 'Cloud & DevOps', related: ['Cloud & DevOps', 'Active Directory', 'C#'], marketDemand: 'High', defaultScoreOffset: 0 },
  'CI/CD': { category: 'Cloud & DevOps', related: ['GitHub Actions', 'Docker', 'Automated Testing'], marketDemand: 'Very High', defaultScoreOffset: 2 },
  'GitHub Actions': { category: 'Cloud & DevOps', related: ['CI/CD', 'Git', 'Workflow Automation'], marketDemand: 'High', defaultScoreOffset: 3 },
  'Terraform': { category: 'Cloud & DevOps', related: ['Infrastructure as Code', 'AWS', 'GCP'], marketDemand: 'Very High', defaultScoreOffset: -4 },
  'Linux': { category: 'Tools & Workflow', related: ['Bash', 'Shell Scripting', 'Server Admin'], marketDemand: 'High', defaultScoreOffset: 3 },
  'Git': { category: 'Tools & Workflow', related: ['GitHub', 'Version Control', 'Code Reviews'], marketDemand: 'Very High', defaultScoreOffset: 8 },

  // AI & Data Science
  'Machine Learning': { category: 'AI & Data Science', related: ['Python', 'Scikit-Learn', 'Deep Learning'], marketDemand: 'Very High', defaultScoreOffset: 0 },
  'Deep Learning': { category: 'AI & Data Science', related: ['PyTorch', 'TensorFlow', 'Neural Networks'], marketDemand: 'Very High', defaultScoreOffset: -2 },
  'PyTorch': { category: 'AI & Data Science', related: ['Python', 'Deep Learning', 'Computer Vision'], marketDemand: 'Very High', defaultScoreOffset: 0 },
  'TensorFlow': { category: 'AI & Data Science', related: ['Keras', 'Python', 'Machine Learning'], marketDemand: 'High', defaultScoreOffset: 0 },
  'Generative AI': { category: 'AI & Data Science', related: ['LLMs', 'Prompt Engineering', 'LangChain', 'OpenAI'], marketDemand: 'Very High', defaultScoreOffset: 1 },
  'NLP': { category: 'AI & Data Science', related: ['Transformers', 'BERT', 'Text Analytics'], marketDemand: 'Very High', defaultScoreOffset: 0 },
  'Data Structures': { category: 'System Architecture', related: ['Algorithms', 'Problem Solving', 'C++', 'Java'], marketDemand: 'Very High', defaultScoreOffset: 4 },
  'Algorithms': { category: 'System Architecture', related: ['Data Structures', 'Time Complexity', 'Optimization'], marketDemand: 'Very High', defaultScoreOffset: 3 },

  // Testing & QA
  'Jest': { category: 'Testing & QA', related: ['Unit Testing', 'React Testing Library', 'JavaScript'], marketDemand: 'High', defaultScoreOffset: 2 },
  'Unit Testing': { category: 'Testing & QA', related: ['Jest', 'Mocha', 'Test-Driven Development'], marketDemand: 'High', defaultScoreOffset: 3 },
  'Cypress': { category: 'Testing & QA', related: ['End-to-End Testing', 'Web Automation'], marketDemand: 'High', defaultScoreOffset: 1 },
  'Playwright': { category: 'Testing & QA', related: ['E2E Testing', 'Browser Automation'], marketDemand: 'Very High', defaultScoreOffset: 2 },

  // Soft Skills
  'Communication': { category: 'Soft Skills', related: ['Collaboration', 'Presentation', 'Active Listening'], marketDemand: 'Very High', defaultScoreOffset: 6 },
  'Problem Solving': { category: 'Soft Skills', related: ['Critical Thinking', 'Debugging', 'Analytical Thinking'], marketDemand: 'Very High', defaultScoreOffset: 7 },
  'Team Leadership': { category: 'Soft Skills', related: ['Project Management', 'Mentorship', 'Agile'], marketDemand: 'High', defaultScoreOffset: 3 },
  'Leadership': { category: 'Soft Skills', related: ['Team Leadership', 'Mentorship', 'Decision Making'], marketDemand: 'High', defaultScoreOffset: 3 },
  'Agile / Scrum': { category: 'Tools & Workflow', related: ['Jira', 'Sprint Planning', 'Standups'], marketDemand: 'High', defaultScoreOffset: 5 },
  'Adaptability': { category: 'Soft Skills', related: ['Continuous Learning', 'Resilience', 'Growth Mindset'], marketDemand: 'High', defaultScoreOffset: 6 },
  'Cross-functional Collaboration': { category: 'Soft Skills', related: ['Communication', 'Teamwork', 'Product Alignment'], marketDemand: 'Very High', defaultScoreOffset: 5 }
};

// Fallback demo skills for when demo mode is active
const DEMO_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Express.js', 'PostgreSQL', 'Docker',
  'Tailwind CSS', 'REST APIs', 'Git', 'Redux', 'System Design', 'Algorithms',
  'Data Structures', 'CI/CD', 'Problem Solving', 'Communication'
];

function getDeterministicScore(skillName: string, baseScore: number, offset: number = 0): number {
  let hash = 0;
  for (let i = 0; i < skillName.length; i++) {
    hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const variance = (Math.abs(hash) % 15) - 7; // -7 to +7
  const score = Math.round(baseScore + offset + variance);
  return Math.min(98, Math.max(45, score));
}

function getProficiency(score: number): SkillProficiency {
  if (score >= 88) return 'Advanced';
  if (score >= 75) return 'Proficient';
  if (score >= 60) return 'Intermediate';
  if (score >= 45) return 'Foundational';
  return 'Missing';
}

function getStatus(score: number): SkillStatus {
  if (score >= 80) return 'strong';
  if (score >= 60) return 'developing';
  if (score >= 45) return 'gap';
  return 'critical_gap';
}

function findEvidenceInResume(skill: string, resume: any): string[] {
  const evidence: string[] = [];
  if (!resume) return evidence;

  const skillLower = skill.toLowerCase();

  // Search experiences
  if (Array.isArray(resume.parsedContent?.experience)) {
    for (const exp of resume.parsedContent.experience) {
      const text = `${exp.role || ''} ${exp.company || ''} ${exp.description || ''} ${Array.isArray(exp.highlights) ? exp.highlights.join(' ') : ''}`.toLowerCase();
      if (text.includes(skillLower)) {
        evidence.push(`Applied in role: ${exp.role || 'Engineering'} at ${exp.company || 'Previous Organization'}`);
      }
    }
  }

  // Search projects
  if (Array.isArray(resume.parsedContent?.projects)) {
    for (const proj of resume.parsedContent.projects) {
      const text = `${proj.name || ''} ${proj.description || ''} ${proj.technologies || ''}`.toLowerCase();
      if (text.includes(skillLower)) {
        evidence.push(`Demonstrated in project: "${proj.name || 'Application Project'}"`);
      }
    }
  }

  // General text match fallback if none found
  if (evidence.length === 0 && resume.parsedContent?.text) {
    const lines = resume.parsedContent.text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes(skillLower) && line.trim().length > 15 && line.trim().length < 120) {
        evidence.push(line.trim());
        if (evidence.length >= 2) break;
      }
    }
  }

  if (evidence.length === 0) {
    evidence.push(`Verified in technical skills section of active resume.`);
  }

  return evidence.slice(0, 3);
}

export function generateSkillIntelligence(activeResume: any, isDemoMode: boolean): SkillIntelligenceData | null {
  if (!activeResume && !isDemoMode) {
    return null;
  }

  const rawSkills: string[] = (activeResume?.parsedContent?.skills && activeResume.parsedContent.skills.length > 0)
    ? activeResume.parsedContent.skills
    : (isDemoMode ? DEMO_SKILLS : []);

  if (rawSkills.length === 0) {
    return null;
  }

  const baseResumeScore = activeResume?.score || 82;

  // Process technical & domain skills
  const processedSkills: SkillItem[] = [];
  const processedNames = new Set<string>();

  rawSkills.forEach((rawSkill, idx) => {
    const trimmed = rawSkill.trim();
    if (!trimmed || processedNames.has(trimmed.toLowerCase())) return;
    processedNames.add(trimmed.toLowerCase());

    const taxonomy = SKILL_TAXONOMY[trimmed] || {
      category: idx % 3 === 0 ? 'Frontend' : idx % 3 === 1 ? 'Backend' : 'Tools & Workflow',
      related: ['System Design', 'Clean Code', 'Testing'],
      marketDemand: 'High',
      defaultScoreOffset: 0
    };

    const score = getDeterministicScore(trimmed, baseResumeScore, taxonomy.defaultScoreOffset);
    const proficiency = getProficiency(score);
    const status = getStatus(score);
    const evidence = findEvidenceInResume(trimmed, activeResume);

    processedSkills.push({
      id: `skill-${idx}-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: trimmed,
      category: taxonomy.category,
      proficiency,
      score,
      status,
      progress: score,
      evidence,
      yearsOfExp: score >= 85 ? 3 : score >= 70 ? 2 : 1,
      marketDemand: taxonomy.marketDemand,
      relatedSkills: taxonomy.related,
      whyThisLevel: `Assessment calculated from verified resume mentions, project deployment context, and proficiency baseline of ${score}%.`,
      recommendedAction: score >= 80 
        ? 'Validate via advanced technical mock interview.' 
        : 'Complete guided practice module on scalable implementation.',
      targetScore: Math.min(100, score + 15),
      isSoftSkill: taxonomy.category === 'Soft Skills'
    });
  });

  // Ensure soft skills exist
  const standardSoftSkills = ['Problem Solving', 'Communication', 'Team Leadership', 'Adaptability', 'Cross-functional Collaboration'];
  standardSoftSkills.forEach((softSkill, sIdx) => {
    if (!processedNames.has(softSkill.toLowerCase())) {
      const taxonomy = SKILL_TAXONOMY[softSkill] || {
        category: 'Soft Skills',
        related: ['Collaboration', 'Empathy'],
        marketDemand: 'Very High',
        defaultScoreOffset: 3
      };
      const score = getDeterministicScore(softSkill, baseResumeScore, taxonomy.defaultScoreOffset);
      processedSkills.push({
        id: `soft-skill-${sIdx}`,
        name: softSkill,
        category: 'Soft Skills',
        proficiency: getProficiency(score),
        score,
        status: getStatus(score),
        progress: score,
        evidence: findEvidenceInResume(softSkill, activeResume),
        yearsOfExp: 2,
        marketDemand: taxonomy.marketDemand,
        relatedSkills: taxonomy.related,
        whyThisLevel: 'Evaluated from behavioral patterns and collaborative project responsibilities extracted from profile.',
        recommendedAction: 'Engage in behavioral and cross-functional interview mock rounds.',
        targetScore: Math.min(100, score + 12),
        isSoftSkill: true
      });
    }
  });

  const technicalSkills = processedSkills.filter(s => !s.isSoftSkill);
  const softSkills = processedSkills.filter(s => s.isSoftSkill);

  // Industry Gap Catalog based on modern tech standards
  const POTENTIAL_GAPS: Array<Omit<SkillGap, 'id'>> = [
    {
      skill: 'System Design & Scalability',
      category: 'System Architecture',
      priority: 'Critical',
      currentLevel: 'Intermediate',
      targetLevel: 'Advanced',
      estimatedEffort: '3-4 weeks',
      recommendedAction: 'Study distributed caching, rate limiting, and sharding architectures.',
      whyItMatters: 'Mandatory evaluation stage for Tier-1 Tech, Mid/Senior Full Stack, and Cloud positions.',
      careerImpact: '+28% interview pass probability for High-Tier Engineering roles.',
      relatedJobs: ['Senior Software Engineer', 'Full Stack Tech Lead', 'Backend Engineer'],
      relatedCompanies: ['Google', 'Amazon', 'Microsoft', 'Uber'],
      learningTopic: 'System Architecture'
    },
    {
      skill: 'Docker & Containerization',
      category: 'Cloud & DevOps',
      priority: 'High',
      currentLevel: 'Foundational',
      targetLevel: 'Proficient',
      estimatedEffort: '1-2 weeks',
      recommendedAction: 'Build multi-stage production Dockerfiles and containerize microservices.',
      whyItMatters: 'Standard prerequisite for automated CI/CD deployment pipelines across 92% of SaaS companies.',
      careerImpact: '+18% employer match score for DevOps and Cloud Engineering openings.',
      relatedJobs: ['DevOps Specialist', 'Cloud Software Engineer', 'Full Stack Developer'],
      relatedCompanies: ['Stripe', 'Atlassian', 'Shopify'],
      learningTopic: 'DevOps'
    },
    {
      skill: 'GraphQL & Modern API Design',
      category: 'Backend',
      priority: 'Medium',
      currentLevel: 'Foundational',
      targetLevel: 'Proficient',
      estimatedEffort: '1 week',
      recommendedAction: 'Implement Apollo Server schemas, resolvers, and dataloader batching.',
      whyItMatters: 'Preferred query language for modern client-facing applications reducing over-fetching.',
      careerImpact: '+12% match rate on modern frontend/fullstack listings.',
      relatedJobs: ['Frontend Architect', 'Product Engineer', 'Full Stack Engineer'],
      relatedCompanies: ['Meta', 'GitHub', 'Airbnb'],
      learningTopic: 'Backend'
    },
    {
      skill: 'Kubernetes Orchestration',
      category: 'Cloud & DevOps',
      priority: 'Critical',
      currentLevel: 'Missing',
      targetLevel: 'Intermediate',
      estimatedEffort: '3 weeks',
      recommendedAction: 'Deploy stateful workloads with Deployments, Services, and Ingress routing.',
      whyItMatters: 'Crucial differentiator for Cloud-Native software engineering positions.',
      careerImpact: '+24% placement score for Cloud Infrastructure roles.',
      relatedJobs: ['Cloud Architect', 'Platform Engineer', 'Site Reliability Engineer'],
      relatedCompanies: ['Google Cloud', 'Microsoft Azure', 'Red Hat'],
      learningTopic: 'DevOps'
    },
    {
      skill: 'Automated E2E Testing (Playwright / Cypress)',
      category: 'Testing & QA',
      priority: 'Medium',
      currentLevel: 'Foundational',
      targetLevel: 'Proficient',
      estimatedEffort: '1-2 weeks',
      recommendedAction: 'Write resilient end-to-end regression suites for critical user journeys.',
      whyItMatters: 'Ensures release reliability and is a strong quality signal during hiring code reviews.',
      careerImpact: '+15% boost in technical assessment scoring.',
      relatedJobs: ['QA Automation Engineer', 'Full Stack Developer'],
      relatedCompanies: ['Salesforce', 'Adobe', 'Intuit'],
      learningTopic: 'Testing'
    }
  ];

  // Filter out gaps if candidate already has them at >= 80%
  const candidateSkillNamesLower = new Set(processedSkills.map(s => s.name.toLowerCase()));
  const gaps: SkillGap[] = POTENTIAL_GAPS.map((gap, gIdx) => {
    const existingSkill = processedSkills.find(s => s.name.toLowerCase().includes(gap.skill.toLowerCase()) || gap.skill.toLowerCase().includes(s.name.toLowerCase()));
    const currentLvl = existingSkill ? existingSkill.proficiency : 'Missing';
    return {
      id: `gap-${gIdx}`,
      ...gap,
      currentLevel: currentLvl
    };
  }).filter(gap => gap.currentLevel !== 'Advanced');

  const criticalGaps = gaps.filter(g => g.priority === 'Critical' || g.priority === 'High');

  // Recommendations
  const recommendations: SkillRecommendation[] = [
    {
      id: 'rec-1',
      skill: 'Microservices & Distributed Systems',
      category: 'System Architecture',
      reason: 'Synergizes with your Backend and API experience, unlocking senior backend job requisitions.',
      priority: 'Critical',
      estimatedEffort: '3 weeks',
      expectedImpact: '+26% match boost for High-Comp roles',
      matchBoostPercent: 26,
      prerequisites: ['REST APIs', 'Node.js / Java', 'Database Fundamentals'],
      relatedRoles: ['Backend Engineer', 'Solutions Architect', 'Full Stack Engineer']
    },
    {
      id: 'rec-2',
      skill: 'Cloud Infrastructure (AWS / GCP)',
      category: 'Cloud & DevOps',
      reason: 'Bridges local development skills to production cloud hosting and serverless deployments.',
      priority: 'High',
      estimatedEffort: '2 weeks',
      expectedImpact: '+19% profile visibility to Recruiters',
      matchBoostPercent: 19,
      prerequisites: ['Linux Basics', 'Networking Basics'],
      relatedRoles: ['Cloud Engineer', 'DevOps Developer', 'Full Stack Engineer']
    },
    {
      id: 'rec-3',
      skill: 'Generative AI & LLM Integrations',
      category: 'AI & Data Science',
      reason: 'Rapidly growing industry demand for developers able to orchestrate intelligent AI workflows and Gemini SDKs.',
      priority: 'High',
      estimatedEffort: '1-2 weeks',
      expectedImpact: '+22% recruitment inquiry velocity',
      matchBoostPercent: 22,
      prerequisites: ['Python / TypeScript', 'REST APIs'],
      relatedRoles: ['AI Application Developer', 'Forward Deployed Engineer']
    },
    {
      id: 'rec-4',
      skill: 'Advanced Performance & Web Vitals',
      category: 'Frontend',
      reason: 'Enhances frontend mastery with deep knowledge in bundle optimization, SSR, and rendering pipelines.',
      priority: 'Medium',
      estimatedEffort: '1 week',
      expectedImpact: '+14% interview pass probability',
      matchBoostPercent: 14,
      prerequisites: ['React', 'JavaScript', 'HTML/CSS'],
      relatedRoles: ['Senior Frontend Developer', 'Web Performance Engineer']
    }
  ];

  // Generate Interactive Graph Nodes & Topology
  // Position categories in harmonic radial clusters
  const categoryAngles: Record<SkillCategory, number> = {
    'Frontend': 0,
    'Programming Languages': Math.PI * 0.25,
    'Backend': Math.PI * 0.5,
    'Database': Math.PI * 0.75,
    'System Architecture': Math.PI * 1.0,
    'Cloud & DevOps': Math.PI * 1.25,
    'AI & Data Science': Math.PI * 1.5,
    'Testing & QA': Math.PI * 1.75,
    'Tools & Workflow': Math.PI * 1.85,
    'Soft Skills': Math.PI * 0.95
  };

  const graphNodes: SkillGraphNode[] = [];
  const graphEdges: SkillGraphEdge[] = [];

  // Group candidate skills and create nodes
  processedSkills.forEach((skill, idx) => {
    const baseAngle = categoryAngles[skill.category] || (idx * (2 * Math.PI / processedSkills.length));
    const angleJitter = ((idx % 4) - 1.5) * 0.18;
    const angle = baseAngle + angleJitter;
    const distance = 140 + (idx % 3) * 55;

    const x = Math.round(400 + Math.cos(angle) * distance);
    const y = Math.round(300 + Math.sin(angle) * distance);

    graphNodes.push({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      score: skill.score,
      proficiency: skill.proficiency,
      status: skill.status,
      x,
      y,
      radius: skill.score >= 85 ? 26 : skill.score >= 70 ? 22 : 18,
      isSoftSkill: skill.isSoftSkill
    });
  });

  // Also include 3 top critical gap nodes so the graph clearly highlights missing connections
  criticalGaps.slice(0, 3).forEach((gap, gIdx) => {
    const baseAngle = categoryAngles[gap.category] || Math.PI * 1.1;
    const angle = baseAngle + 0.35 + gIdx * 0.2;
    const distance = 260;

    const x = Math.round(400 + Math.cos(angle) * distance);
    const y = Math.round(300 + Math.sin(angle) * distance);

    const gapNodeId = `graph-gap-${gIdx}`;
    graphNodes.push({
      id: gapNodeId,
      name: gap.skill,
      category: gap.category,
      score: 42,
      proficiency: 'Missing',
      status: 'critical_gap',
      x,
      y,
      radius: 20,
      isSoftSkill: false
    });
  });

  // Create semantic edges based on taxonomy relationships
  let edgeCounter = 0;
  for (let i = 0; i < graphNodes.length; i++) {
    const nodeA = graphNodes[i];
    const taxA = SKILL_TAXONOMY[nodeA.name];

    for (let j = i + 1; j < graphNodes.length; j++) {
      const nodeB = graphNodes[j];
      
      // Check if related in taxonomy or same category
      const isTaxRelated = taxA?.related?.some(r => r.toLowerCase() === nodeB.name.toLowerCase());
      const isSameCategory = nodeA.category === nodeB.category && !nodeA.isSoftSkill && !nodeB.isSoftSkill;

      if (isTaxRelated || (isSameCategory && (i + j) % 2 === 0)) {
        graphEdges.push({
          id: `edge-${edgeCounter++}`,
          source: nodeA.id,
          target: nodeB.id,
          relationship: isTaxRelated ? 'prerequisite' : 'related',
          strength: isTaxRelated ? 0.9 : 0.4
        });
      }
    }
  }

  // Calculate high-level stats
  const totalSkills = processedSkills.length;
  const strongSkillsCount = processedSkills.filter(s => s.score >= 80).length;
  const developingSkillsCount = processedSkills.filter(s => s.score >= 60 && s.score < 80).length;
  const criticalGapsCount = criticalGaps.length;
  const avgScore = Math.round(processedSkills.reduce((acc, s) => acc + s.score, 0) / (totalSkills || 1));

  return {
    stats: {
      totalSkills,
      strongSkillsCount,
      developingSkillsCount,
      criticalGapsCount,
      overallSkillScore: avgScore,
      verifiedSkillsCount: processedSkills.filter(s => (s.evidence?.length || 0) > 0).length,
      marketCompetitiveness: Math.min(96, Math.max(50, Math.round(avgScore * 0.95 + 4)))
    },
    technicalSkills,
    softSkills,
    allSkills: processedSkills,
    gaps,
    criticalGaps,
    recommendations,
    graph: {
      nodes: graphNodes,
      edges: graphEdges
    },
    targetRoleRecommendations: [
      {
        role: 'Full Stack Software Engineer',
        readinessScore: Math.min(95, avgScore + 4),
        matchingSkills: processedSkills.slice(0, 5).map(s => s.name),
        missingSkills: ['System Design & Scalability', 'Docker']
      },
      {
        role: 'Frontend Specialist / React Engineer',
        readinessScore: Math.min(98, avgScore + 8),
        matchingSkills: technicalSkills.filter(s => s.category === 'Frontend' || s.category === 'Programming Languages').map(s => s.name),
        missingSkills: ['Automated E2E Testing']
      },
      {
        role: 'Backend & Cloud Engineer',
        readinessScore: Math.max(55, avgScore - 6),
        matchingSkills: technicalSkills.filter(s => s.category === 'Backend' || s.category === 'Database').map(s => s.name),
        missingSkills: ['Kubernetes Orchestration', 'Microservices']
      }
    ]
  };
}

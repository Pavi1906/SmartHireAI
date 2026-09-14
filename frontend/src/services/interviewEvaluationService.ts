import { 
  InterviewSession, 
  InterviewQuestion, 
  UserResponse, 
  QuestionEvaluation, 
  DomainScoreBreakdown, 
  InterviewReportEvaluation 
} from '../types/interview';
import { CURATED_LEARNING_MODULES } from './learningService';

export function evaluateCompletedSession(session: InterviewSession): InterviewReportEvaluation {
  const questions = session.questions || [];
  const responses = session.sessionState?.responses || {};
  
  const questionEvaluations: QuestionEvaluation[] = [];
  let totalScoreSum = 0;
  let questionsAttempted = 0;
  let questionsPassed = 0;
  let totalTimeSpentSeconds = 0;

  const totalDurationSeconds = (session.durationMinutes || 45) * 60;
  const recommendedPerQuestionSeconds = questions.length > 0 ? Math.floor(totalDurationSeconds / questions.length) : 600;

  // Domain score accumulators
  const domainBuckets: Record<string, { totalPoints: number; maxPoints: number; count: number }> = {
    'Technical Mastery': { totalPoints: 0, maxPoints: 0, count: 0 },
    'Problem Solving & Logic': { totalPoints: 0, maxPoints: 0, count: 0 },
    'Coding & Rigor': { totalPoints: 0, maxPoints: 0, count: 0 },
    'Structure & Communication': { totalPoints: 0, maxPoints: 0, count: 0 },
    'System Architecture': { totalPoints: 0, maxPoints: 0, count: 0 }
  };

  questions.forEach((q: InterviewQuestion, index: number) => {
    const resp: UserResponse | undefined = responses[q.id];
    const timeSpent = resp?.timeSpentSeconds || 0;
    totalTimeSpentSeconds += timeSpent;

    let score = 0;
    let verdict: QuestionEvaluation['verdict'] = 'Needs Practice';
    let feedback = '';
    const strengths: string[] = [];
    let improvementTip = '';
    let correctAnswerText: string | undefined = undefined;
    let explanation: string | undefined = q.explanation;

    const isSkipped = resp?.isSkipped || (!resp?.selectedOptionId && !resp?.codeAnswer && !resp?.textAnswer && !resp?.starBreakdown && !resp?.systemDesignBreakdown && !resp?.technicalBreakdown);

    if (isSkipped) {
      verdict = 'Skipped';
      score = 0;
      feedback = `Question was skipped during the timed session.`;
      improvementTip = `Allocate at least 2–3 minutes to draft initial thoughts or partial solution approaches.`;
    } else {
      questionsAttempted++;

      switch (q.format) {
        case 'mcq': {
          correctAnswerText = q.mcqOptions?.find(opt => opt.id === q.correctOptionId)?.text;
          const isCorrect = resp?.selectedOptionId === q.correctOptionId;
          if (isCorrect) {
            score = 100;
            verdict = 'Mastered';
            feedback = `Accurate conceptual reasoning on ${q.category}.`;
            strengths.push(`Identified optimal answer promptly without ambiguity.`);
            improvementTip = `Keep sharp on edge-case variations of ${q.category}.`;
          } else {
            score = 0;
            verdict = 'Needs Practice';
            feedback = `Selected alternative was incorrect. The expected answer relies on core ${q.category} principles.`;
            improvementTip = q.explanation || `Review ${q.category} mechanics and practice similar quantitative reasoning problems.`;
          }
          
          domainBuckets['Problem Solving & Logic'].totalPoints += score;
          domainBuckets['Problem Solving & Logic'].maxPoints += 100;
          domainBuckets['Problem Solving & Logic'].count++;
          break;
        }

        case 'coding': {
          if (resp?.runResults) {
            const passRatio = resp.runResults.totalTestCases > 0 
              ? resp.runResults.testCasesPassed / resp.runResults.totalTestCases 
              : (resp.runResults.passed ? 1 : 0.5);
            score = Math.round(passRatio * 100);
            
            if (score === 100) {
              verdict = 'Mastered';
              feedback = `All test cases passed cleanly with expected output and correct algorithmic complexity.`;
              strengths.push(`Clean syntax and thorough boundary edge case handling.`);
              improvementTip = `Consider if any auxiliary space allocations can be further minimized to O(1).`;
            } else if (score >= 60) {
              verdict = 'Proficient';
              feedback = `Passed ${resp.runResults.testCasesPassed} of ${resp.runResults.totalTestCases} test cases. Basic logic sound, but edge cases failed.`;
              strengths.push(`Valid initial solution flow.`);
              improvementTip = `Check edge boundaries (empty inputs, single element, large values) before finalizing.`;
            } else {
              verdict = 'Needs Practice';
              feedback = `Test cases failed or encountered runtime errors during execution.`;
              improvementTip = `Decompose algorithmic steps on scratchpad before writing code. Focus on loop invariants.`;
            }
          } else if (resp?.codeAnswer && resp.codeAnswer.trim().length > 30) {
            // Code was submitted without explicit test case run
            const codeLen = resp.codeAnswer.trim().length;
            score = Math.min(85, Math.max(45, Math.round(codeLen / 10) + 30));
            verdict = score >= 70 ? 'Proficient' : 'Needs Practice';
            feedback = `Code written covers core functionality.`;
            strengths.push(`Structured code syntax.`);
            improvementTip = `Always click "Run Code" to validate against test cases before moving on.`;
          } else {
            score = 20;
            verdict = 'Needs Practice';
            feedback = `Incomplete code implementation.`;
            improvementTip = `Practice writing boilerplate and starter code rapidly under time constraints.`;
          }

          domainBuckets['Coding & Rigor'].totalPoints += score;
          domainBuckets['Coding & Rigor'].maxPoints += 100;
          domainBuckets['Coding & Rigor'].count++;
          break;
        }

        case 'behavioral': {
          const star = resp?.starBreakdown;
          let starScore = 0;
          if (star) {
            if (star.situation && star.situation.trim().length > 10) {
              starScore += 25;
              strengths.push(`Clear business and technical context setting (Situation).`);
            }
            if (star.task && star.task.trim().length > 10) {
              starScore += 25;
              strengths.push(`Well-defined responsibility scope (Task).`);
            }
            if (star.action && star.action.trim().length > 15) {
              starScore += 30;
              strengths.push(`Specific personal engineering contributions and ownership (Action).`);
            }
            if (star.result && star.result.trim().length > 10) {
              starScore += 20;
              strengths.push(`Quantified impact and learnings (Result).`);
            }
          } else if (resp?.textAnswer && resp.textAnswer.trim().length > 40) {
            starScore = Math.min(80, Math.max(50, Math.round(resp.textAnswer.trim().length / 5)));
          }

          score = Math.max(15, Math.min(100, starScore));
          if (score >= 85) {
            verdict = 'Mastered';
            feedback = `Comprehensive STAR narrative with distinct ownership, challenge articulation, and measurable business result.`;
            improvementTip = `Keep responses concise and quantify metrics where possible (e.g. % latency reduction, sprint days saved).`;
          } else if (score >= 60) {
            verdict = 'Proficient';
            feedback = `Solid behavioral framing, though some STAR segments could benefit from deeper metrics or direct action clarity.`;
            improvementTip = `Emphasize "I did X" rather than "We did X" to showcase individual engineering leadership.`;
          } else {
            verdict = 'Needs Practice';
            feedback = `Response was brief or missed key STAR structure elements.`;
            improvementTip = `Follow the STAR framework rigorously: Context -> Challenge -> Specific Actions -> Measurable Outcome.`;
          }

          domainBuckets['Structure & Communication'].totalPoints += score;
          domainBuckets['Structure & Communication'].maxPoints += 100;
          domainBuckets['Structure & Communication'].count++;
          break;
        }

        case 'system_design': {
          const sys = resp?.systemDesignBreakdown;
          let sysScore = 0;
          if (sys) {
            if (sys.requirements && sys.requirements.trim().length > 10) {
              sysScore += 25;
              strengths.push(`Explicit functional and non-functional requirements scoping.`);
            }
            if (sys.architecture && sys.architecture.trim().length > 15) {
              sysScore += 30;
              strengths.push(`High-level service decomposition and API boundary design.`);
            }
            if (sys.dataModel && sys.dataModel.trim().length > 10) {
              sysScore += 25;
              strengths.push(`Database schema and storage technology selection.`);
            }
            if (sys.scaling && sys.scaling.trim().length > 10) {
              sysScore += 20;
              strengths.push(`Proactive caching, replication, and bottleneck mitigation.`);
            }
          } else if (resp?.textAnswer && resp.textAnswer.trim().length > 40) {
            sysScore = Math.min(80, Math.max(45, Math.round(resp.textAnswer.trim().length / 6)));
          }

          score = Math.max(15, Math.min(100, sysScore));
          if (score >= 85) {
            verdict = 'Mastered';
            feedback = `Strong architectural breakdown covering data modeling, caching layers, and distributed bottlenecks.`;
            improvementTip = `Remember to include back-of-the-envelope capacity and bandwidth estimations.`;
          } else if (score >= 60) {
            verdict = 'Proficient';
            feedback = `High-level design is sound, but deeper trade-offs (e.g., SQL vs NoSQL, cache eviction policies) should be articulated.`;
            improvementTip = `Detail failure modes: what happens when downstream service nodes crash?`;
          } else {
            verdict = 'Needs Practice';
            feedback = `System architecture lacked modular detail or explicit component interactions.`;
            improvementTip = `Practice the 4-step System Design blueprint: Requirements -> High-Level -> Deep Dive -> Bottlenecks.`;
          }

          domainBuckets['System Architecture'].totalPoints += score;
          domainBuckets['System Architecture'].maxPoints += 100;
          domainBuckets['System Architecture'].count++;
          break;
        }

        case 'technical':
        default: {
          const tech = resp?.technicalBreakdown;
          let techScore = 0;
          if (tech) {
            if (tech.concept && tech.concept.trim().length > 10) {
              techScore += 40;
              strengths.push(`Precise core concept explanation and definition.`);
            }
            if (tech.tradeoffs && tech.tradeoffs.trim().length > 10) {
              techScore += 30;
              strengths.push(`Nuanced trade-off evaluation and performance consideration.`);
            }
            if (tech.example && tech.example.trim().length > 10) {
              techScore += 30;
              strengths.push(`Concrete real-world code/system implementation scenario.`);
            }
          } else if (resp?.textAnswer && resp.textAnswer.trim().length > 30) {
            techScore = Math.min(85, Math.max(40, Math.round(resp.textAnswer.trim().length / 4)));
          }

          score = Math.max(15, Math.min(100, techScore));
          if (score >= 80) {
            verdict = 'Mastered';
            feedback = `Clear technical explanation demonstrating depth, trade-off understanding, and practical execution.`;
            improvementTip = `Incorporate framework internals and compiler lifecycle mechanics when answering senior technical rounds.`;
          } else if (score >= 60) {
            verdict = 'Proficient';
            feedback = `Covers core definition well. Bolster answer with concrete production examples and edge-case behaviors.`;
            improvementTip = `Explain WHY a pattern is chosen over alternative approaches.`;
          } else {
            verdict = 'Needs Practice';
            feedback = `Answer was brief or lacked technical precision.`;
            improvementTip = `Structure technical responses: Definition -> How it works under the hood -> Trade-offs & Production example.`;
          }

          domainBuckets['Technical Mastery'].totalPoints += score;
          domainBuckets['Technical Mastery'].maxPoints += 100;
          domainBuckets['Technical Mastery'].count++;
          break;
        }
      }
    }

    if (score >= 70) {
      questionsPassed++;
    }

    totalScoreSum += score;

    questionEvaluations.push({
      questionId: q.id,
      questionNumber: q.number || index + 1,
      title: q.title,
      category: q.category,
      format: q.format,
      difficulty: q.difficulty,
      score,
      verdict,
      feedback,
      strengths: strengths.length > 0 ? strengths : [`Attempted question under timed conditions.`],
      improvementTip,
      userResponse: resp,
      correctAnswerText,
      explanation,
      timeSpentSeconds: timeSpent,
      recommendedTimeSeconds: q.timeLimitSeconds || recommendedPerQuestionSeconds
    });
  });

  // Calculate Overall Score (average of question scores)
  const overallScore = questions.length > 0 ? Math.round(totalScoreSum / questions.length) : 70;

  // Performance Band
  let performanceBand: InterviewReportEvaluation['performanceBand'] = 'Developing';
  let summaryVerdict = '';

  if (overallScore >= 85) {
    performanceBand = 'Exceptional';
    summaryVerdict = `Outstanding interview performance! Your answers displayed deep architectural mastery, structured problem-solving, and clean execution. You are well-positioned for Tier-1 engineering loops.`;
  } else if (overallScore >= 72) {
    performanceBand = 'Strong';
    summaryVerdict = `Solid technical performance across core rounds. You demonstrated clear fundamentals and structured delivery. Focusing on the identified edge-case and architecture gaps below will elevate you to the top quartile.`;
  } else if (overallScore >= 55) {
    performanceBand = 'Developing';
    summaryVerdict = `Good baseline proficiency. You grasped fundamental concepts but lost points on edge-case testing, structural completeness, or time allocation. Targeted learning modules will accelerate your readiness.`;
  } else {
    performanceBand = 'Needs Targeted Practice';
    summaryVerdict = `Identified significant gaps in test execution, conceptual explanations, or skipped problems. Complete the foundational learning modules below before scheduling another interview loop.`;
  }

  // Domain score breakdown
  const domainBreakdown: DomainScoreBreakdown[] = Object.entries(domainBuckets).map(([domain, data]) => {
    let score = data.maxPoints > 0 ? Math.round((data.totalPoints / data.maxPoints) * 100) : Math.max(60, overallScore);
    const weight = data.count > 0 ? Math.round((data.count / questions.length) * 100) : 20;
    
    let status: DomainScoreBreakdown['status'] = 'proficient';
    if (score >= 80) status = 'excellent';
    else if (score < 65) status = 'needs_work';

    let description = '';
    switch (domain) {
      case 'Technical Mastery':
        description = 'Framework internals, language mechanics, and async execution.';
        break;
      case 'Problem Solving & Logic':
        description = 'Quantitative deduction, probability, and rapid problem decomposition.';
        break;
      case 'Coding & Rigor':
        description = 'Algorithmic efficiency, test case coverage, and Big-O optimization.';
        break;
      case 'Structure & Communication':
        description = 'STAR narrative precision, engineering ownership, and leadership principles.';
        break;
      case 'System Architecture':
        description = 'Scalability, microservices decomposition, caching, and distributed trade-offs.';
        break;
    }

    return {
      domain,
      score,
      weight,
      description,
      status
    };
  });

  // Top Strengths extraction
  const topStrengths: InterviewReportEvaluation['topStrengths'] = [];
  questionEvaluations
    .filter(qe => qe.score >= 70)
    .forEach(qe => {
      topStrengths.push({
        skill: qe.category,
        category: qe.format.toUpperCase(),
        evidence: qe.strengths[0] || `Scored ${qe.score}% on ${qe.title}.`,
        score: qe.score
      });
    });

  if (topStrengths.length === 0) {
    topStrengths.push({
      skill: 'Time Management',
      category: 'SESSION',
      evidence: `Completed ${questionsAttempted} interview questions under strict countdown limits.`,
      score: 70
    });
  }

  // Critical Weaknesses & Skill Gaps extraction
  const criticalWeaknesses: InterviewReportEvaluation['criticalWeaknesses'] = [];
  questionEvaluations
    .filter(qe => qe.score < 70 || qe.verdict === 'Skipped')
    .forEach(qe => {
      const isCritical = qe.score < 50 || qe.verdict === 'Skipped';
      
      // Match with curated module
      const matchedModule = CURATED_LEARNING_MODULES.find(m => 
        m.skill.toLowerCase().includes(qe.category.toLowerCase()) || 
        qe.category.toLowerCase().includes(m.skill.toLowerCase()) ||
        m.relatedSkills.some(rs => rs.toLowerCase().includes(qe.category.toLowerCase()))
      );

      criticalWeaknesses.push({
        skill: qe.category,
        priority: isCritical ? 'Critical' : 'High',
        gapDescription: qe.feedback || `Scored ${qe.score}% on ${qe.title}.`,
        remediationTip: qe.improvementTip,
        linkedModuleId: matchedModule?.id || 'dsa-dynamic-programming',
        linkedModuleName: matchedModule?.title || 'Data Structures & Algorithms'
      });
    });

  if (criticalWeaknesses.length === 0) {
    criticalWeaknesses.push({
      skill: 'Advanced Optimization',
      priority: 'Medium',
      gapDescription: 'Keep practicing extreme edge cases and micro-optimizations under sub-20 minute constraints.',
      remediationTip: 'Explore distributed systems bottlenecks and high-concurrency memory profiles.',
      linkedModuleId: 'system-design-microservices',
      linkedModuleName: 'Microservices & Distributed Systems'
    });
  }

  // Recommended Learning Modules
  const recommendedModules: InterviewReportEvaluation['recommendedModules'] = [];
  
  // Pick modules matching weak skills or interview type
  const targetModuleIds = new Set<string>();
  criticalWeaknesses.forEach(cw => {
    if (cw.linkedModuleId) targetModuleIds.add(cw.linkedModuleId);
  });

  // Default fallbacks based on session type if no weak modules identified
  if (session.type === 'Coding' || session.type === 'Aptitude') {
    targetModuleIds.add('dsa-dynamic-programming');
  }
  if (session.type === 'System Design' || session.type === 'Mixed') {
    targetModuleIds.add('system-design-microservices');
  }
  if (session.type === 'Technical') {
    targetModuleIds.add('advanced-react-performance');
    targetModuleIds.add('database-indexing-optimization');
  }

  CURATED_LEARNING_MODULES.forEach(m => {
    if (targetModuleIds.has(m.id) || (recommendedModules.length < 3 && !targetModuleIds.has(m.id))) {
      if (recommendedModules.length < 3) {
        recommendedModules.push({
          moduleId: m.id,
          title: m.title,
          skill: m.skill,
          difficulty: m.difficulty,
          duration: m.estimatedEffort,
          expectedImpact: m.expectedImpact,
          priority: targetModuleIds.has(m.id) ? 'Critical' : 'High',
          reason: targetModuleIds.has(m.id) 
            ? `Directly addresses identified performance gap in ${m.skill}.`
            : `Recommended companion module for ${session.type} round preparation.`
        });
      }
    }
  });

  return {
    interviewId: session.id,
    sessionTitle: session.title,
    interviewType: session.type,
    role: session.role,
    company: session.company,
    completedAt: session.completedAt || new Date().toISOString(),
    overallScore,
    performanceBand,
    summaryVerdict,
    totalTimeSpentSeconds,
    totalDurationSeconds,
    questionsTotal: questions.length,
    questionsAttempted,
    questionsPassed,
    domainBreakdown,
    questionEvaluations,
    topStrengths: topStrengths.slice(0, 4),
    criticalWeaknesses: criticalWeaknesses.slice(0, 4),
    recommendedModules
  };
}

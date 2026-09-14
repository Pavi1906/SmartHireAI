import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  InterviewSession, 
  InterviewReportEvaluation 
} from '../../types/interview';
import { 
  getInterviewById, 
  retakeInterviewSession, 
  updateInterviewStatus 
} from '../../services/interviewService';
import { evaluateCompletedSession } from '../../services/interviewEvaluationService';

import { ReportHeader } from '../../components/interview/report/ReportHeader';
import { OverallScoreCard } from '../../components/interview/report/OverallScoreCard';
import { DomainBreakdownCard } from '../../components/interview/report/DomainBreakdownCard';
import { StrengthsWeaknessesSection } from '../../components/interview/report/StrengthsWeaknessesSection';
import { QuestionReviewList } from '../../components/interview/report/QuestionReviewList';
import { RecommendedLearningCard } from '../../components/interview/report/RecommendedLearningCard';

import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  AlertCircle, 
  Play, 
  RotateCcw, 
  ChevronLeft, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';

export function MockInterviewReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewId } = useParams<{ interviewId: string }>();
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);
  const { user } = useSelector((state: RootState) => state.auth);

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session from storage or passed state
  useEffect(() => {
    if (!interviewId) {
      setIsLoading(false);
      return;
    }

    const current = getInterviewById(
      interviewId,
      user?.id,
      activeResume,
      Boolean(isDemoMode)
    );

    if (current) {
      // If navigating directly from session completion or if state had COMPLETED
      if (location.state?.interview?.status === 'COMPLETED' && current.status !== 'COMPLETED') {
        current.status = 'COMPLETED';
        updateInterviewStatus(user?.id, current.id, 'COMPLETED');
      }

      setSession(current);
    }
    setIsLoading(false);
  }, [interviewId, user?.id, activeResume, isDemoMode, location.state]);

  // Compute deterministic evaluation
  const evaluation: InterviewReportEvaluation | null = useMemo(() => {
    if (!session || session.status !== 'COMPLETED') return null;
    const computed = evaluateCompletedSession(session);
    
    // Persist score back into session record if changed
    if (session.score !== computed.overallScore) {
      session.score = computed.overallScore;
      updateInterviewStatus(user?.id, session.id, 'COMPLETED', computed.overallScore);
    }

    return computed;
  }, [session, user?.id]);

  // Handle Retake Interview Round
  const handleRetake = () => {
    if (!session) return;
    const newSession = retakeInterviewSession(
      user?.id,
      session,
      activeResume,
      Boolean(isDemoMode)
    );

    navigate(`/interviews/${newSession.id}/prepare`, {
      state: {
        type: newSession.type,
        company: newSession.company,
        role: newSession.role
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Evaluating interview results...</p>
      </div>
    );
  }

  // Not Found State
  if (!session) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 text-center space-y-4 rounded-xl border bg-card">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Interview Session Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested interview session record does not exist or has expired.
        </p>
        <Button onClick={() => navigate('/interviews')} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Interviews
        </Button>
      </div>
    );
  }

  // Handle Incomplete Interview States
  if (session.status !== 'COMPLETED') {
    const isInProgress = session.status === 'IN_PROGRESS';
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 space-y-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.03] text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {isInProgress ? 'Interview Session In Progress' : 'Interview Not Yet Completed'}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isInProgress
              ? 'This interview session is currently active. You must complete and submit your answers to generate an evaluation report.'
              : 'You have not submitted this interview session yet. Please finish the session to review your score and feedback.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/interviews')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Interview Hub
          </Button>

          <Button 
            variant="default" 
            onClick={() => navigate(isInProgress ? `/interviews/${session.id}/session` : `/interviews/${session.id}/prepare`)}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Play className="h-4 w-4" />
            {isInProgress ? 'Resume Interview' : 'Start Preparation'}
          </Button>
        </div>
      </div>
    );
  }

  // Normal Evaluated Report View
  if (!evaluation) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      
      {/* 1. Header & Navigation */}
      <ReportHeader 
        evaluation={evaluation} 
        onRetake={handleRetake} 
      />

      {/* 2. Overall Score & High-Level Metrics */}
      <OverallScoreCard 
        evaluation={evaluation} 
        readinessScore={session.readinessScore} 
      />

      {/* 3. Domain Competency Breakdown */}
      <DomainBreakdownCard 
        breakdown={evaluation.domainBreakdown} 
      />

      {/* 4. Strengths vs Weaknesses & Skill Gaps */}
      <StrengthsWeaknessesSection 
        topStrengths={evaluation.topStrengths}
        criticalWeaknesses={evaluation.criticalWeaknesses}
      />

      {/* 5. Question-by-Question Deep Dive & Code Review */}
      <QuestionReviewList 
        evaluations={evaluation.questionEvaluations} 
      />

      {/* 6. Curated Actionable Learning Recommendations */}
      <RecommendedLearningCard 
        modules={evaluation.recommendedModules} 
      />

      {/* 7. Bottom Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border bg-card/60 print:hidden">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/interviews')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Interviews
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/readiness')}
            className="text-muted-foreground hover:text-foreground"
          >
            Check Company Readiness
          </Button>
        </div>

        <Button 
          variant="default" 
          onClick={handleRetake}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Retake This Interview Round
        </Button>
      </div>

    </div>
  );
}

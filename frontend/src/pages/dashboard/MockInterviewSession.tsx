import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Card, CardContent } from '../../components/ui/card';
import { 
  InterviewType, 
  InterviewSession, 
  InterviewQuestion, 
  UserResponse 
} from '../../types/interview';
import { 
  INTERVIEW_TYPE_METADATA, 
  getInterviewById, 
  updateInterviewStatus, 
  updateSessionState,
  saveQuestionResponse,
  saveInterviewSession
} from '../../services/interviewService';
import { CodingWorkspace } from '../../components/interview/CodingWorkspace';
import { MCQWorkspace } from '../../components/interview/MCQWorkspace';
import { BehavioralWorkspace } from '../../components/interview/BehavioralWorkspace';
import { SystemDesignWorkspace } from '../../components/interview/SystemDesignWorkspace';
import { TechnicalWorkspace } from '../../components/interview/TechnicalWorkspace';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Pause, 
  Play, 
  StopCircle, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Building2, 
  Sparkles, 
  FileCode2, 
  SkipForward, 
  Send,
  ShieldCheck,
  RotateCcw,
  ListOrdered
} from 'lucide-react';

export function MockInterviewSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewId } = useParams<{ interviewId: string }>();
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);
  const { user } = useSelector((state: RootState) => state.auth);

  const passedType: InterviewType | undefined = location.state?.type;
  const passedCompany: string | undefined = location.state?.company;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState<boolean>(false);
  const [timeSpentOnCurrentQ, setTimeSpentOnCurrentQ] = useState<number>(0);

  // Initialize or restore session
  useEffect(() => {
    if (!activeResume && !isDemoMode) {
      navigate('/interviews');
      return;
    }

    const current = getInterviewById(
      interviewId || 'new',
      user?.id,
      activeResume,
      Boolean(isDemoMode),
      passedType || 'Technical',
      passedCompany
    );

    // Ensure session status is IN_PROGRESS
    if (current.status !== 'IN_PROGRESS' && current.status !== 'COMPLETED') {
      current.status = 'IN_PROGRESS';
      saveInterviewSession(user?.id, current);
    }

    setSession(current);
    if (current.sessionState?.currentQuestionIndex !== undefined) {
      setCurrentIndex(current.sessionState.currentQuestionIndex);
    }
  }, [interviewId, user?.id, activeResume, isDemoMode, passedType, passedCompany, navigate]);

  // Session timer countdown effect
  useEffect(() => {
    if (!session || isTimerPaused || session.status === 'COMPLETED') return;

    const timer = setInterval(() => {
      setSession(prev => {
        if (!prev || !prev.sessionState) return prev;
        const currentSeconds = prev.sessionState.timeRemainingSeconds;
        if (currentSeconds <= 1) {
          clearInterval(timer);
          handleFinishInterview();
          return prev;
        }

        const nextSeconds = currentSeconds - 1;
        const updated = {
          ...prev,
          sessionState: {
            ...prev.sessionState,
            timeRemainingSeconds: nextSeconds
          }
        };

        // Periodically persist to localStorage every 5 seconds
        if (nextSeconds % 5 === 0) {
          saveInterviewSession(user?.id, updated);
        }

        return updated;
      });

      setTimeSpentOnCurrentQ(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.id, isTimerPaused, session?.status, user?.id]);

  // Handle saving question answer updates
  const handleUpdateResponse = (updates: Partial<UserResponse>) => {
    if (!session || !session.questions) return;
    const currentQ = session.questions[currentIndex];
    if (!currentQ) return;

    const existingResp = session.sessionState?.responses?.[currentQ.id] || {
      questionId: currentQ.id,
      format: currentQ.format,
      timeSpentSeconds: 0
    };

    const newResponse: UserResponse = {
      ...existingResp,
      ...updates,
      timeSpentSeconds: (existingResp.timeSpentSeconds || 0) + timeSpentOnCurrentQ
    };

    const updatedSession = saveQuestionResponse(user?.id, session.id, currentQ.id, newResponse);
    if (updatedSession) {
      setSession({ ...updatedSession });
    }
  };

  // Switch questions
  const handleNavigateQuestion = (targetIndex: number) => {
    if (!session || !session.questions || targetIndex < 0 || targetIndex >= session.questions.length) {
      return;
    }

    // Save time spent on current question before switching
    const currentQ = session.questions[currentIndex];
    if (currentQ) {
      const existingResp = session.sessionState?.responses?.[currentQ.id] || {
        questionId: currentQ.id,
        format: currentQ.format,
        timeSpentSeconds: 0
      };
      saveQuestionResponse(user?.id, session.id, currentQ.id, {
        timeSpentSeconds: (existingResp.timeSpentSeconds || 0) + timeSpentOnCurrentQ
      });
    }

    setTimeSpentOnCurrentQ(0);
    setCurrentIndex(targetIndex);
    updateSessionState(user?.id, session.id, prev => ({
      currentQuestionIndex: targetIndex
    }));
  };

  // Handle Skip current question
  const handleSkipQuestion = () => {
    if (!session || !session.questions) return;
    const currentQ = session.questions[currentIndex];
    if (!currentQ) return;

    handleUpdateResponse({ isSkipped: true });
    if (currentIndex < session.questions.length - 1) {
      handleNavigateQuestion(currentIndex + 1);
    }
  };

  // Finish and Submit interview session
  const handleFinishInterview = () => {
    if (!session) return;
    updateInterviewStatus(user?.id, session.id, 'COMPLETED');
    navigate(`/interviews/${session.id}/report`, {
      state: {
        interview: session,
        type: session.type,
        company: session.company
      }
    });
  };

  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-xl font-bold">Loading Interview Session...</h2>
        <Button variant="outline" onClick={() => navigate('/interviews')}>
          Back to Interviews
        </Button>
      </div>
    );
  }

  const questions = session.questions;
  const currentQuestion = questions[currentIndex] || questions[0];
  const meta = INTERVIEW_TYPE_METADATA[session.type] || INTERVIEW_TYPE_METADATA.Technical;
  const responses = session.sessionState?.responses || {};
  const currentResponse: UserResponse = responses[currentQuestion.id] || {
    questionId: currentQuestion.id,
    format: currentQuestion.format,
    codeAnswer: currentQuestion.initialCode || '',
    codeLanguage: currentQuestion.language || 'typescript',
    timeSpentSeconds: 0
  };

  const timeRemaining = session.sessionState?.timeRemainingSeconds ?? (session.durationMinutes * 60);
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const answeredCount = Object.values(responses).filter((r: UserResponse) => {
    if (r.isSkipped) return false;
    if (r.selectedOptionId) return true;
    if (r.codeAnswer && r.codeAnswer.trim().length > 20) return true;
    if (r.textAnswer && r.textAnswer.trim().length > 10) return true;
    if (r.starBreakdown && Object.values(r.starBreakdown).some(v => typeof v === 'string' && v.trim().length > 5)) return true;
    if (r.systemDesignBreakdown && Object.values(r.systemDesignBreakdown).some(v => typeof v === 'string' && v.trim().length > 5)) return true;
    if (r.technicalBreakdown && Object.values(r.technicalBreakdown).some(v => typeof v === 'string' && v.trim().length > 5)) return true;
    return false;
  }).length;

  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  // Render question-specific workspace
  const renderWorkspace = () => {
    switch (currentQuestion.format) {
      case 'coding':
        return (
          <CodingWorkspace
            question={currentQuestion}
            response={currentResponse}
            onUpdateResponse={handleUpdateResponse}
          />
        );
      case 'mcq':
        return (
          <MCQWorkspace
            question={currentQuestion}
            response={currentResponse}
            onUpdateResponse={handleUpdateResponse}
          />
        );
      case 'behavioral':
        return (
          <BehavioralWorkspace
            question={currentQuestion}
            response={currentResponse}
            onUpdateResponse={handleUpdateResponse}
          />
        );
      case 'system_design':
        return (
          <SystemDesignWorkspace
            question={currentQuestion}
            response={currentResponse}
            onUpdateResponse={handleUpdateResponse}
          />
        );
      case 'technical':
      default:
        return (
          <TechnicalWorkspace
            question={currentQuestion}
            response={currentResponse}
            onUpdateResponse={handleUpdateResponse}
          />
        );
    }
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-7xl mx-auto pb-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/interviews/${session.id}/prepare`)}
            className="h-9 w-9 rounded-xl border border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {session.title}
              </h1>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                {session.type} Round
              </span>
              {session.company && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-primary" /> {session.company}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Candidate: <span className="text-foreground font-medium">{session.role}</span> • Proctor: <span className="text-foreground font-medium">Active Simulation</span>
            </p>
          </div>
        </div>

        {/* Timer, Progress & End Session Actions */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/40 border border-border">
            <Clock className={`h-4 w-4 ${timeRemaining < 300 ? 'text-rose-400 animate-pulse' : 'text-primary'}`} />
            <span className="font-mono text-sm font-bold text-foreground">
              {formattedTime}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isTimerPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3" />}
            </Button>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmEnd(true)}
            className="h-9 px-3 text-xs font-semibold gap-1.5"
          >
            <StopCircle className="h-4 w-4" /> End Interview
          </Button>
        </div>
      </div>

      {/* Progress and Question Tabs Strip */}
      <div className="p-3 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mr-1 shrink-0">
            Questions:
          </span>
          {questions.map((q, idx) => {
            const resp: UserResponse | undefined = responses[q.id];
            const isAnswered = Boolean(
              resp?.selectedOptionId || 
              (resp?.codeAnswer && resp.codeAnswer.trim().length > 20) ||
              (resp?.textAnswer && resp.textAnswer.trim().length > 10) ||
              (resp?.starBreakdown && Object.values(resp.starBreakdown).some(v => typeof v === 'string' && v.trim().length > 5)) ||
              (resp?.systemDesignBreakdown && Object.values(resp.systemDesignBreakdown).some(v => typeof v === 'string' && v.trim().length > 5)) ||
              (resp?.technicalBreakdown && Object.values(resp.technicalBreakdown).some(v => typeof v === 'string' && v.trim().length > 5))
            );
            const isCurrent = idx === currentIndex;
            const isSkipped = resp?.isSkipped;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleNavigateQuestion(idx)}
                className={`h-8 px-3 rounded-lg font-mono text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/40'
                    : isAnswered
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : isSkipped
                    ? 'bg-secondary text-muted-foreground line-through opacity-70'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span>Q{idx + 1}</span>
                {isAnswered && <CheckCircle2 className="h-3 w-3" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground font-mono">
            Answered: <strong className="text-foreground">{answeredCount}</strong> / {questions.length}
          </span>
          <div className="w-24">
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Main Interview Body Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Details & AI Proctor Panel (4 Cols on Desktop) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Question Details Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 uppercase">
                  {currentQuestion.category}
                </Badge>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  currentQuestion.difficulty === 'Hard'
                    ? 'bg-rose-500/10 text-rose-400'
                    : currentQuestion.difficulty === 'Medium'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono text-muted-foreground font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <h2 className="text-base font-bold text-foreground leading-snug">
                  {currentQuestion.title}
                </h2>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentQuestion.prompt}
              </p>

              {currentQuestion.contextOrScenario && (
                <div className="p-3 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block mb-0.5">Scenario Context:</strong>
                  {currentQuestion.contextOrScenario}
                </div>
              )}

              {/* Constraints if applicable */}
              {currentQuestion.constraints && currentQuestion.constraints.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-foreground font-mono block">
                    Constraints & Requirements:
                  </span>
                  <ul className="space-y-1 text-xs text-muted-foreground font-mono">
                    {currentQuestion.constraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-primary">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hint accordions */}
              {currentQuestion.hint && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                  <span className="text-primary font-bold block mb-0.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Interviewer Hint
                  </span>
                  {currentQuestion.hint}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Proctor Simulation & AV Controls */}
          <Card className="bg-card border-border flex-1 flex flex-col justify-between">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Multi-Modal Proctor
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>

              {/* Mock Video Canvas */}
              <div className="aspect-video bg-slate-950 rounded-xl border border-border relative overflow-hidden flex flex-col items-center justify-center text-center p-4">
                {isVideoOn ? (
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto ring-4 ring-primary/10">
                      <Video className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono block">
                      Candidate Feed Active
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 text-muted-foreground">
                    <VideoOff className="h-8 w-8 mx-auto opacity-50" />
                    <span className="text-xs font-mono block">Camera Paused</span>
                  </div>
                )}

                {/* Candidate name tag */}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${isMicOn ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {user?.name || 'Candidate'}
                </div>
              </div>

              {/* AV Toggles */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  variant={isMicOn ? 'secondary' : 'destructive'}
                  size="sm"
                  onClick={() => setIsMicOn(!isMicOn)}
                  className="h-8 px-3 text-xs gap-1.5"
                >
                  {isMicOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                  {isMicOn ? 'Mute' : 'Unmute'}
                </Button>

                <Button
                  variant={isVideoOn ? 'secondary' : 'destructive'}
                  size="sm"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="h-8 px-3 text-xs gap-1.5"
                >
                  {isVideoOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                  {isVideoOn ? 'Stop Video' : 'Start Video'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Round Workspace (8 Cols on Desktop) */}
        <div className="lg:col-span-8 space-y-4 flex flex-col justify-between">
          <div className="flex-1">
            {renderWorkspace()}
          </div>

          {/* Bottom Question Navigation Footer */}
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => handleNavigateQuestion(currentIndex - 1)}
              className="h-9 px-4 text-xs font-semibold gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipQuestion}
                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <SkipForward className="h-3.5 w-3.5" /> Skip
              </Button>

              {currentIndex < questions.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => handleNavigateQuestion(currentIndex + 1)}
                  className="h-9 px-5 text-xs font-bold gap-1.5"
                >
                  Next Question <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowConfirmEnd(true)}
                  className="h-9 px-6 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/20"
                >
                  <Send className="h-3.5 w-3.5" /> Submit & View Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm End Modal Dialog */}
      {showConfirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md bg-card border-border shadow-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                  <StopCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    End Interview Simulation?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your answers will be evaluated and compiled into your final diagnostic report.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answered Questions:</span>
                  <span className="text-foreground font-bold">{answeredCount} / {questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Remaining:</span>
                  <span className="text-foreground font-bold">{formattedTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmEnd(false)}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Continue Interview
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleFinishInterview}
                  className="h-9 px-5 text-xs font-bold"
                >
                  Submit & Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

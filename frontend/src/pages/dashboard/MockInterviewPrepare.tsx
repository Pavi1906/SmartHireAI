import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { PreFlightChecklist } from '../../components/interview/PreFlightChecklist';
import { StrengthsGapsSummary } from '../../components/interview/StrengthsGapsSummary';
import { 
  InterviewType, 
  InterviewSession, 
  InterviewTypeMetadata 
} from '../../types/interview';
import { 
  INTERVIEW_TYPE_METADATA, 
  getInterviewById, 
  updateChecklistItem,
  updateInterviewStatus,
  saveInterviewSession
} from '../../services/interviewService';
import { 
  ChevronLeft, 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  Building2, 
  BookOpen, 
  ArrowRight, 
  Award, 
  ShieldCheck, 
  Video, 
  Mic,
  Code2,
  Terminal,
  BrainCircuit,
  Users,
  Settings2,
  Layers,
  FileUp
} from 'lucide-react';

const TYPE_ICONS: Record<InterviewType, any> = {
  Technical: Code2,
  Coding: Terminal,
  Aptitude: BrainCircuit,
  Behavioral: Users,
  'System Design': Settings2,
  Mixed: Layers
};

export function MockInterviewPrepare() {
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewId } = useParams<{ interviewId: string }>();
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);
  const { user } = useSelector((state: RootState) => state.auth);

  // Read location state overrides if passed from selection
  const passedType: InterviewType | undefined = location.state?.type;
  const passedCompany: string | undefined = location.state?.company;

  const [session, setSession] = useState<InterviewSession | null>(null);

  // Initialize or fetch session
  useEffect(() => {
    if (!activeResume && !isDemoMode) {
      setSession(null);
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

    setSession(current);
  }, [interviewId, user?.id, activeResume, isDemoMode, passedType, passedCompany]);

  // Handle checklist toggle
  const handleToggleChecklist = (checkId: string, completed: boolean) => {
    if (!session) return;
    const updated = updateChecklistItem(user?.id, session.id, checkId, completed);
    if (updated) {
      setSession({ ...updated });
    }
  };

  // Handle mark all checklist items done
  const handleMarkAllDone = () => {
    if (!session) return;
    const updatedChecklist = session.checklist.map(item => ({ ...item, completed: true }));
    const updatedSession: InterviewSession = {
      ...session,
      checklist: updatedChecklist,
      status: 'READY'
    };
    saveInterviewSession(user?.id, updatedSession);
    setSession(updatedSession);
  };

  // Start interview session handler
  const handleStartSimulation = () => {
    if (!session) return;
    updateInterviewStatus(user?.id, session.id, 'IN_PROGRESS');
    navigate(`/interviews/${session.id}/session`, {
      state: {
        interview: session,
        type: session.type,
        company: session.company,
        role: session.role
      }
    });
  };

  // Resume Dependency Guard
  if (!activeResume && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card rounded-2xl border border-border mt-6 max-w-2xl mx-auto shadow-sm">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-primary">
          <Mic className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
          Upload Resume to Calibrate Interview
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Pre-flight interview preparation adapts to your verified competencies and identifies high-priority gaps from your active master resume.
        </p>
        <Button className="gap-2 px-6" onClick={() => navigate('/resume')}>
          <FileUp className="h-4 w-4" /> Upload Resume
        </Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Initializing Interview Environment...</h2>
        <Button variant="outline" onClick={() => navigate('/interviews')}>
          Back to Interviews
        </Button>
      </div>
    );
  }

  const meta: InterviewTypeMetadata = INTERVIEW_TYPE_METADATA[session.type] || INTERVIEW_TYPE_METADATA.Technical;
  const IconComponent = TYPE_ICONS[session.type] || Code2;
  const isReady = session.status === 'READY' || session.checklist.every(c => c.completed);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Top Navigation & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/interviews')}
            className="h-10 w-10 rounded-xl border border-border bg-card shrink-0 hover:bg-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {session.title}
              </h1>
              <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${meta.badgeColor}`}>
                {session.type} Round
              </span>
              {session.company && (
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-primary" /> {session.company}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target Role: <span className="text-foreground font-medium">{session.role}</span> • AI Proctor: <span className="text-foreground font-medium">Gemini 2.5 Multi-Modal</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`font-mono text-xs px-3 py-1.5 ${
              isReady
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-primary/10 text-primary border-primary/30'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            {isReady ? 'READY TO LAUNCH' : 'PRE-FLIGHT CALIBRATION'}
          </Badge>
        </div>
      </div>

      {/* Hero Calibration & Readiness Overview Banner */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Readiness Score Column */}
          <div className="p-6 flex flex-col justify-between space-y-4 bg-primary/5">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Candidate Readiness
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-foreground font-mono">
                  {session.readinessScore}%
                </span>
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  + {session.previousLearningProgress.readinessBoostPercent}% from Roadmap
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Calibration Progress</span>
                <span className="font-mono text-foreground">{session.checklist.filter(c => c.completed).length} / {session.checklist.length}</span>
              </div>
              <Progress
                value={Math.round((session.checklist.filter(c => c.completed).length / session.checklist.length) * 100)}
                className="h-1.5"
              />
            </div>
          </div>

          {/* Session Format & Duration Column */}
          <div className="p-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Session Configuration
            </span>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-mono block">Estimated Time</span>
                <span className="text-base font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-4 w-4 text-primary" /> {session.durationMinutes} mins
                </span>
              </div>

              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground font-mono block">Question Volume</span>
                <span className="text-base font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                  <HelpCircle className="h-4 w-4 text-primary" /> {session.questionCount} Questions
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {meta.shortDesc}
            </p>
          </div>

          {/* AI Proctor Mode Column */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Multi-Modal Feedback
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluates response conciseness, technical depth, Big-O calculation, and STAR structure in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/60">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-foreground">
                Audio, Code Sandbox & AI Proctor Ready
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Round Focus Areas & Question Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <IconComponent className="h-5 w-5 text-primary" />
            {session.type} Evaluation Structure
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            What will be assessed by the interviewer during this simulation.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question breakdown list */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground block font-mono">
              Question Distribution
            </span>
            <div className="space-y-2">
              {session.questionTypes.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground font-medium flex items-center gap-2.5"
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Competency Focus Areas */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground block font-mono">
              Core Competencies Assessed
            </span>
            <div className="space-y-2">
              {meta.focusAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-secondary/30 border border-border text-xs text-muted-foreground flex items-center gap-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-foreground">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Critical Gaps Summary */}
      <StrengthsGapsSummary
        strengths={session.strengths}
        criticalGaps={session.criticalGaps}
        interviewType={session.type}
      />

      {/* Recommended Preparation Actions */}
      {session.recommendedPreparation.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              Recommended Pre-Flight Study Links
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Deepen your preparation with connected modules on the Learning Roadmap and Skill Graph.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {session.recommendedPreparation.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                      {rec.badge}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(rec.route, { state: rec.state })}
                  className="w-full text-xs font-semibold h-8 gap-1.5"
                >
                  Open {rec.badge} <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pre-Flight Calibration Checklist */}
      <PreFlightChecklist
        checklist={session.checklist}
        onToggleItem={handleToggleChecklist}
        onMarkAllDone={handleMarkAllDone}
      />

      {/* Previous Learning & Performance Track Record */}
      <Card className="bg-card border-border">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Award className="h-5 w-5 text-primary" />
            Learning & Historical Progress Record
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Continuity metrics linking your active learning accomplishments to this interview round.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <span className="text-xs text-muted-foreground font-mono block">Completed Modules</span>
            <span className="text-2xl font-black text-foreground font-mono mt-1 block">
              {session.previousLearningProgress.totalCompletedModules}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Directly aligned with curriculum
            </span>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <span className="text-xs text-muted-foreground font-mono block">Historical Simulation Score</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {session.previousPerformance?.avgScore || 78}%
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Average across previous rounds
            </span>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <span className="text-xs text-muted-foreground font-mono block">Primary Growth Focus</span>
            <span className="text-xs font-bold text-foreground mt-2 block leading-snug">
              {session.previousPerformance?.improvementArea || 'Algorithmic time complexity & structured STAR answers'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Launch Interview Bottom Action Bar */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-md bg-card/95">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-foreground">
              Ready to begin your {session.type} Simulation?
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Your camera, microphone, and code sandbox will initialize upon launch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/interviews')}
            className="h-11 px-5 text-xs font-semibold"
          >
            Change Round
          </Button>

          <Button
            size="lg"
            className="h-11 px-8 gap-2 font-bold shadow-lg shadow-primary/20 text-sm"
            onClick={handleStartSimulation}
          >
            <PlayCircle className="h-5 w-5" /> Start Interview
          </Button>
        </div>
      </div>
    </div>
  );
}

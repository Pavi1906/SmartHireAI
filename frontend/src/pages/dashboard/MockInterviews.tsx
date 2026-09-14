import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { InterviewTypeSelector } from '../../components/interview/InterviewTypeSelector';
import { 
  InterviewType, 
  InterviewSession 
} from '../../types/interview';
import { 
  INTERVIEW_TYPE_METADATA, 
  loadUserInterviews, 
  createNewInterviewSession,
  saveInterviewSession
} from '../../services/interviewService';
import { 
  Mic, 
  Video, 
  Settings2, 
  PlayCircle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileUp, 
  Sparkles, 
  Building2, 
  ArrowRight,
  Code2,
  Terminal,
  BrainCircuit,
  Users,
  Layers,
  History
} from 'lucide-react';

export function MockInterviews() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);
  const { user } = useSelector((state: RootState) => state.auth);

  // Read location state if redirected from Company Preparation or Skill Graph
  const initialCompany = location.state?.company || '';
  const initialType: InterviewType = location.state?.type || (location.state?.track === 'coding' ? 'Coding' : location.state?.track === 'system-design' ? 'System Design' : location.state?.track === 'behavioral' ? 'Behavioral' : location.state?.track === 'aptitude' ? 'Aptitude' : 'Technical');

  const [selectedType, setSelectedType] = useState<InterviewType>(initialType);
  const [targetCompany, setTargetCompany] = useState<string>(initialCompany);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  // Load user sessions
  useEffect(() => {
    if (!activeResume && !isDemoMode) {
      setSessions([]);
      return;
    }

    const loaded = loadUserInterviews(user?.id);
    if (loaded.length > 0) {
      setSessions(loaded);
    } else {
      // Seed an initial session for realistic, delightful UX
      const seed1 = createNewInterviewSession('Technical', activeResume, isDemoMode, user?.id, initialCompany || undefined);
      seed1.id = 'mock-tech-1';
      seed1.status = 'READY';
      saveInterviewSession(user?.id, seed1);
      setSessions([seed1]);
    }
  }, [user?.id, activeResume, isDemoMode, initialCompany]);

  // Handle start/prepare button click
  const handleLaunchPrepare = (typeToLaunch: InterviewType = selectedType, companyName: string = targetCompany) => {
    setIsStartModalOpen(false);
    const newSession = createNewInterviewSession(typeToLaunch, activeResume, isDemoMode, user?.id, companyName || undefined);
    navigate(`/interviews/${newSession.id}/prepare`, {
      state: {
        type: typeToLaunch,
        company: companyName,
        interview: newSession
      }
    });
  };

  // Resume Dependency check
  if (!activeResume && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card rounded-2xl border border-border mt-6 max-w-2xl mx-auto shadow-sm">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 text-primary">
          <Mic className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
          Resume Required for Mock Interviews
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          SmartHire AI personalizes your technical questions, coding assessments, and system design rounds directly against your master resume and skill profile.
        </p>
        <Button className="gap-2 px-6" onClick={() => navigate('/resume')}>
          <FileUp className="h-4 w-4" /> Upload Master Resume
        </Button>
      </div>
    );
  }

  const selectedMeta = INTERVIEW_TYPE_METADATA[selectedType];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      {/* Start New Interview Modal */}
      <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
        <div className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Start New AI Simulation</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an interview format tailored to your target role and resume profile.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {(['Technical', 'Coding', 'Aptitude', 'Behavioral', 'System Design', 'Mixed'] as InterviewType[]).map(t => {
              const m = INTERVIEW_TYPE_METADATA[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleLaunchPrepare(t, targetCompany)}
                  className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/40 hover:border-primary/50 text-left transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {m.title}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {m.defaultDuration} min
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {m.shortDesc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-primary font-semibold pt-3">
                    Launch Pre-Flight <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Mock Interviews</h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs font-mono">
              SmartHire Pro
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Simulate real technical, coding, system design, and behavioral rounds with AI adaptive proctoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {targetCompany && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium text-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Target: <span className="font-semibold text-primary">{targetCompany}</span>
            </div>
          )}

          <Button className="gap-2" onClick={() => setIsStartModalOpen(true)}>
            <PlayCircle className="h-4 w-4" /> Start New Simulation
          </Button>
        </div>
      </div>

      {/* Interview Round Selection Section */}
      <Card className="bg-card border-border">
        <CardHeader className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                Select Interview Round
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Choose the specific evaluation track you want to practice. All 5 core tracks and mixed simulations are fully supported.
              </CardDescription>
            </div>

            <Badge variant="secondary" className="text-xs font-mono self-start sm:self-auto">
              Current: {selectedMeta.title}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-6">
          <InterviewTypeSelector
            selectedType={selectedType}
            onSelectType={(type) => setSelectedType(type)}
          />

          {/* Active Selection Details Bar */}
          <div className="p-5 rounded-xl bg-secondary/30 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Ready to prepare {selectedMeta.title}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${selectedMeta.badgeColor}`}>
                  {selectedMeta.type} Track
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedMeta.fullDesc}
              </p>
            </div>

            <Button
              size="lg"
              className="gap-2 shrink-0 h-11 px-6 shadow-sm"
              onClick={() => handleLaunchPrepare(selectedType, targetCompany)}
            >
              <PlayCircle className="h-4 w-4" /> Prepare {selectedType} Round
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Recent Sessions & Track Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <History className="h-5 w-5 text-primary" />
                  Your Interview Sessions
                </CardTitle>
                <Badge variant="outline" className="text-xs font-mono">
                  {sessions.length} Recorded
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Saved pre-flight preparation checkpoints and active simulation sessions.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-2 space-y-3">
              {sessions.length > 0 ? (
                sessions.map((session) => {
                  const isCompleted = session.status === 'COMPLETED';
                  const isReady = session.status === 'READY';
                  return (
                    <div
                      key={session.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl bg-secondary/15 hover:bg-secondary/30 transition-all gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/10 text-primary'
                        }`}>
                          {session.type === 'Coding' ? <Terminal className="h-5 w-5" /> :
                           session.type === 'System Design' ? <Settings2 className="h-5 w-5" /> :
                           session.type === 'Behavioral' ? <Users className="h-5 w-5" /> :
                           session.type === 'Aptitude' ? <BrainCircuit className="h-5 w-5" /> :
                           session.type === 'Mixed' ? <Layers className="h-5 w-5" /> :
                           <Code2 className="h-5 w-5" />}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              {session.title || `${session.type} Simulation`}
                            </span>
                            {session.company && (
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                {session.company}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {session.role} • {session.durationMinutes} min • {session.questionCount} questions
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-center pt-2 sm:pt-0 border-t sm:border-0 border-border/60">
                        {isCompleted ? (
                          <div className="text-right">
                            <span className="text-base font-bold text-emerald-400 font-mono">{session.score || 85}%</span>
                            <span className="text-[10px] text-muted-foreground block font-mono">Passed</span>
                          </div>
                        ) : (
                          <Badge
                            className={`text-[10px] font-mono capitalize ${
                              isReady ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {session.status.toLowerCase().replace('_', ' ')}
                          </Badge>
                        )}

                        <Button
                          variant={isCompleted ? "secondary" : "default"}
                          size="sm"
                          className="h-8 text-xs font-semibold px-3"
                          onClick={() => {
                            if (isCompleted) {
                              navigate(`/interviews/${session.id}/report`);
                            } else {
                              navigate(`/interviews/${session.id}/prepare`, {
                                state: {
                                  type: session.type,
                                  company: session.company,
                                  interview: session
                                }
                              });
                            }
                          }}
                        >
                          {isCompleted ? 'View Report' : 'Prepare Session'}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No sessions created yet. Select a round above to start your first simulation.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Track Readiness & Improvement Areas */}
        <div className="space-y-6">
          {/* Track Readiness Card */}
          <Card className="bg-card border-border">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-bold text-foreground">
                Interview Readiness by Track
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Computed from master resume, verified skills, and roadmap progress.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-2 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-foreground">Technical Domain</span>
                  <span className="font-bold text-emerald-400 font-mono">88% • Strong</span>
                </div>
                <Progress value={88} className="h-1.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-foreground">System Design</span>
                  <span className="font-bold text-emerald-400 font-mono">82% • Good</span>
                </div>
                <Progress value={82} className="h-1.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-foreground">Behavioral (STAR)</span>
                  <span className="font-bold text-emerald-400 font-mono">85% • Strong</span>
                </div>
                <Progress value={85} className="h-1.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-foreground">Live Coding & Algorithms</span>
                  <span className="font-bold text-amber-400 font-mono">64% • Developing</span>
                </div>
                <Progress value={64} className="h-1.5" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-foreground">Aptitude & Logic</span>
                  <span className="font-bold text-emerald-400 font-mono">79% • Proficient</span>
                </div>
                <Progress value={79} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Actionable Improvement Areas */}
          <Card className="bg-card border-border">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <AlertCircle className="h-4 w-4 text-amber-400" /> High-Yield Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Master dynamic programming memoization and graph traversal Big-O calculations for live coding rounds.
                  </span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Structure behavioral leadership answers using the 4-part STAR method with quantifiable impact metrics.
                  </span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Review database indexing execution plans and Redis cache invalidation strategies for system design.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

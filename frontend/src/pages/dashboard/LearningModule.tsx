import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  CURATED_LEARNING_MODULES, 
  loadUserLearningProgress, 
  saveUserModuleProgress 
} from '../../services/learningService';
import { LearningModuleData, UserModuleProgress } from '../../types/learning';
import { StageConceptLesson } from '../../components/learning/StageConceptLesson';
import { StageInteractiveExample } from '../../components/learning/StageInteractiveExample';
import { StageCodingPractice } from '../../components/learning/StageCodingPractice';
import { StageKnowledgeCheck } from '../../components/learning/StageKnowledgeCheck';
import { StageFinalAssessment } from '../../components/learning/StageFinalAssessment';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  ChevronLeft, 
  CheckCircle2, 
  PlayCircle, 
  BookOpen, 
  Code2, 
  BrainCircuit, 
  Award,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export function LearningModule() {
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { user } = useSelector((state: RootState) => state.auth);

  // Find module by ID or state
  const module: LearningModuleData | undefined = useMemo(() => {
    if (location.state?.module) {
      return location.state.module;
    }
    return CURATED_LEARNING_MODULES.find(m => m.id === moduleId || m.slug === moduleId);
  }, [moduleId, location.state]);

  // Load user progress
  const [userProgress, setUserProgress] = useState<UserModuleProgress | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

  useEffect(() => {
    if (!module) return;
    const allProgress = loadUserLearningProgress(user?.id);
    const modProg = allProgress[module.id];
    if (modProg) {
      setUserProgress(modProg);
      // Auto-navigate to highest unlocked or current stage
      setActiveStageIndex(Math.min(4, modProg.currentStage || 0));
    } else {
      const initial: UserModuleProgress = {
        moduleId: module.id,
        status: 'IN_PROGRESS',
        currentStage: 0,
        completedStages: [],
        stageProgress: {
          lessonCompleted: false,
          exampleCompleted: false,
          practiceCompleted: false,
          quizCompleted: false,
          assessmentCompleted: false,
        },
        lastAccessedAt: new Date().toISOString(),
        progressPercent: 0
      };
      setUserProgress(initial);
      setActiveStageIndex(0);
    }
  }, [module, user?.id]);

  // If module not found
  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card rounded-2xl border border-border max-w-lg mx-auto space-y-4 my-12 animate-fade-in">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Module Not Found</h2>
          <p className="text-xs text-muted-foreground">
            The requested learning module ID "{moduleId}" does not exist or has been relocated.
          </p>
        </div>
        <Button onClick={() => navigate('/learning')} className="text-xs gap-1.5 mt-2">
          <ChevronLeft className="h-4 w-4" /> Back to Learning Roadmap
        </Button>
      </div>
    );
  }

  const completedStages = userProgress?.completedStages || [];

  const stages = [
    { type: 'lesson', title: '1. Concept Lesson', icon: BookOpen, index: 0 },
    { type: 'example', title: '2. Interactive Example', icon: PlayCircle, index: 1 },
    { type: 'practice', title: '3. Coding Practice', icon: Code2, index: 2 },
    { type: 'quiz', title: '4. Knowledge Check', icon: BrainCircuit, index: 3 },
    { type: 'assessment', title: '5. Final Assessment', icon: Award, index: 4 }
  ];

  // Stage unlocking rule: Stage N requires Stage N-1 in completedStages
  const isStageUnlocked = (stageIdx: number) => {
    if (stageIdx === 0) return true;
    return completedStages.includes(stageIdx - 1);
  };

  const handleStageSelect = (stageIdx: number) => {
    if (isStageUnlocked(stageIdx)) {
      setActiveStageIndex(stageIdx);
    }
  };

  // Completion handlers for each stage
  const handleCompleteLesson = () => {
    const updatedCompleted = Array.from(new Set([...completedStages, 0]));
    const updated = saveUserModuleProgress(user?.id, module.id, {
      completedStages: updatedCompleted,
      currentStage: Math.max(1, userProgress?.currentStage || 1),
      stageProgress: {
        ...(userProgress?.stageProgress || {
          exampleCompleted: false,
          practiceCompleted: false,
          quizCompleted: false,
          assessmentCompleted: false,
        }),
        lessonCompleted: true
      }
    });
    setUserProgress(updated);
    setActiveStageIndex(1); // Advance to Stage 2
  };

  const handleCompleteExample = () => {
    const updatedCompleted = Array.from(new Set([...completedStages, 1]));
    const updated = saveUserModuleProgress(user?.id, module.id, {
      completedStages: updatedCompleted,
      currentStage: Math.max(2, userProgress?.currentStage || 2),
      stageProgress: {
        ...(userProgress?.stageProgress || {
          lessonCompleted: true,
          practiceCompleted: false,
          quizCompleted: false,
          assessmentCompleted: false,
        }),
        exampleCompleted: true
      }
    });
    setUserProgress(updated);
    setActiveStageIndex(2); // Advance to Stage 3
  };

  const handleCompletePractice = (code?: string) => {
    const updatedCompleted = Array.from(new Set([...completedStages, 2]));
    const updated = saveUserModuleProgress(user?.id, module.id, {
      completedStages: updatedCompleted,
      currentStage: Math.max(3, userProgress?.currentStage || 3),
      submittedCode: code,
      stageProgress: {
        ...(userProgress?.stageProgress || {
          lessonCompleted: true,
          exampleCompleted: true,
          quizCompleted: false,
          assessmentCompleted: false,
        }),
        practiceCompleted: true
      }
    });
    setUserProgress(updated);
    setActiveStageIndex(3); // Advance to Stage 4
  };

  const handleCompleteQuiz = (score: number) => {
    const updatedCompleted = Array.from(new Set([...completedStages, 3]));
    const updated = saveUserModuleProgress(user?.id, module.id, {
      completedStages: updatedCompleted,
      currentStage: Math.max(4, userProgress?.currentStage || 4),
      stageProgress: {
        ...(userProgress?.stageProgress || {
          lessonCompleted: true,
          exampleCompleted: true,
          practiceCompleted: true,
          assessmentCompleted: false,
        }),
        quizCompleted: true,
        quizScore: score
      }
    });
    setUserProgress(updated);
    setActiveStageIndex(4); // Advance to Stage 5
  };

  const handleCompleteAssessment = (score: number) => {
    const updatedCompleted = Array.from(new Set([...completedStages, 4]));
    const updated = saveUserModuleProgress(user?.id, module.id, {
      completedStages: updatedCompleted,
      currentStage: 4,
      status: 'COMPLETED',
      stageProgress: {
        ...(userProgress?.stageProgress || {
          lessonCompleted: true,
          exampleCompleted: true,
          practiceCompleted: true,
          quizCompleted: true,
        }),
        assessmentCompleted: true,
        assessmentScore: score
      }
    });
    setUserProgress(updated);
  };

  const progressPercent = userProgress?.progressPercent || 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/learning')}
            className="h-9 w-9 rounded-full bg-secondary hover:bg-secondary/80 text-foreground"
            aria-label="Back to Roadmap"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary/30 text-[10px] uppercase font-mono">
                {module.category}
              </Badge>
              <span className="text-xs text-muted-foreground">• Target Skill: <strong>{module.skill}</strong></span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {module.title}
            </h1>
          </div>
        </div>

        {/* Status Badge */}
        <Badge
          className={`font-mono text-xs ${
            userProgress?.status === 'COMPLETED'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-primary/20 text-primary border-primary/30'
          }`}
        >
          {userProgress?.status === 'COMPLETED' ? 'Module Certified' : `${progressPercent}% Completed`}
        </Badge>
      </div>

      {/* Main 5-Stage Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: 5-Stage Step Navigation (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-card border-border sticky top-20">
            <CardHeader className="p-4 pb-3 border-b border-border/50">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Learning Stages</span>
                <span className="text-primary font-mono">{completedStages.length}/5</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <Progress value={progressPercent} className="h-1.5 mb-3" />

              <div className="space-y-1.5">
                {stages.map((st) => {
                  const isDone = completedStages.includes(st.index);
                  const isCurrent = activeStageIndex === st.index;
                  const isUnlocked = isStageUnlocked(st.index);

                  return (
                    <button
                      key={st.index}
                      onClick={() => handleStageSelect(st.index)}
                      disabled={!isUnlocked}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-all text-left ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : isDone
                          ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 font-medium'
                          : isUnlocked
                          ? 'bg-secondary/40 text-foreground hover:bg-secondary'
                          : 'bg-secondary/15 text-muted-foreground/50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <st.icon className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-primary-foreground' : isDone ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                        <span className="truncate">{st.title}</span>
                      </div>

                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 ml-1" />
                      ) : !isUnlocked ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 ml-1" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Area: Active Stage Component (9 cols) */}
        <div className="lg:col-span-9">
          {activeStageIndex === 0 && (
            <StageConceptLesson
              module={module}
              isCompleted={completedStages.includes(0)}
              onCompleteStage={handleCompleteLesson}
            />
          )}

          {activeStageIndex === 1 && (
            <StageInteractiveExample
              module={module}
              isCompleted={completedStages.includes(1)}
              onCompleteStage={handleCompleteExample}
            />
          )}

          {activeStageIndex === 2 && (
            <StageCodingPractice
              module={module}
              isCompleted={completedStages.includes(2)}
              onCompleteStage={handleCompletePractice}
              savedCode={userProgress?.submittedCode}
            />
          )}

          {activeStageIndex === 3 && (
            <StageKnowledgeCheck
              module={module}
              isCompleted={completedStages.includes(3)}
              onCompleteStage={handleCompleteQuiz}
              savedScore={userProgress?.stageProgress?.quizScore}
            />
          )}

          {activeStageIndex === 4 && (
            <StageFinalAssessment
              module={module}
              isCompleted={completedStages.includes(4)}
              onCompleteStage={handleCompleteAssessment}
              savedScore={userProgress?.stageProgress?.assessmentScore}
            />
          )}
        </div>
      </div>
    </div>
  );
}

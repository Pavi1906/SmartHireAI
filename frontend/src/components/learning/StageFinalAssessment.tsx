import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningModuleData } from '../../types/learning';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  CheckCircle2, 
  Award, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  BrainCircuit,
  Building2,
  Mic,
  GraduationCap,
  TrendingUp,
  XCircle
} from 'lucide-react';

interface StageFinalAssessmentProps {
  module: LearningModuleData;
  isCompleted: boolean;
  onCompleteStage: (score: number) => void;
  savedScore?: number;
}

export function StageFinalAssessment({
  module,
  isCompleted,
  onCompleteStage,
  savedScore
}: StageFinalAssessmentProps) {
  const navigate = useNavigate();
  const assessment = module.finalAssessment;
  const questions = assessment.questions;

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [hasSubmitted, setHasSubmitted] = useState(isCompleted);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (hasSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const calculateScore = () => {
    let totalWeight = 0;
    let earnedWeight = 0;
    questions.forEach((q, idx) => {
      const weight = q.domainScoreWeight || 25;
      totalWeight += weight;
      if (selectedAnswers[idx] === q.correctIndex) {
        earnedWeight += weight;
      }
    });
    return Math.round((earnedWeight / (totalWeight || 1)) * 100);
  };

  const score = isCompleted ? (savedScore || 92) : calculateScore();
  const isPassing = score >= assessment.passingScorePercent;
  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  const handleSubmit = () => {
    setHasSubmitted(true);
    const calculated = calculateScore();
    if (calculated >= assessment.passingScorePercent) {
      onCompleteStage(calculated);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setHasSubmitted(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-secondary/30 rounded-xl p-5 border border-border/60">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-primary border-primary/30 text-xs">
            Final Competency Assessment
          </Badge>
          <span className="text-xs text-muted-foreground">
            Passing threshold: {assessment.passingScorePercent}%
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {module.title}: Industry Scenario Evaluation
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apply production-level architectural principles to pass this final certification milestone.
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selectedOpt = selectedAnswers[qIdx];

          return (
            <Card key={q.id} className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Scenario #{qIdx + 1}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Weight: {q.domainScoreWeight || 25} pts
                  </Badge>
                </div>

                {/* Scenario Context */}
                <div className="bg-secondary/30 p-3.5 rounded-lg border border-border/60 text-xs text-muted-foreground italic font-mono leading-relaxed">
                  "{q.scenario}"
                </div>

                {/* Question */}
                <h4 className="text-sm font-semibold text-foreground">
                  {q.question}
                </h4>

                {/* Options */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const isCorrect = optIdx === q.correctIndex;
                    const isWrongSelection = hasSubmitted && isSelected && !isCorrect;

                    let btnClasses = 'w-full justify-start text-left text-xs p-3.5 rounded-xl transition-all border ';

                    if (hasSubmitted) {
                      if (isCorrect) {
                        btnClasses += 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold';
                      } else if (isWrongSelection) {
                        btnClasses += 'bg-destructive/15 border-destructive/50 text-destructive';
                      } else {
                        btnClasses += 'bg-secondary/20 border-border/40 text-muted-foreground opacity-60';
                      }
                    } else if (isSelected) {
                      btnClasses += 'bg-primary/15 border-primary text-foreground font-medium';
                    } else {
                      btnClasses += 'bg-secondary/30 hover:bg-secondary/60 border-border text-foreground/90';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        disabled={hasSubmitted}
                        className={btnClasses}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <span className="h-5 w-5 rounded-full border border-current text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                          {hasSubmitted && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          {hasSubmitted && isWrongSelection && (
                            <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {hasSubmitted && (
                  <div className="text-[11px] text-muted-foreground font-mono bg-secondary/40 p-3 rounded-lg border border-border/40 mt-2">
                    <strong className="text-foreground font-semibold">Evaluation Insight: </strong>
                    {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submission Action or Success Celebration */}
      {!hasSubmitted ? (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Stage 5 of 5 • Final Assessment
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-2 h-10 px-6"
          >
            Submit Final Assessment <Award className="h-4 w-4" />
          </Button>
        </div>
      ) : isPassing ? (
        <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 text-center space-y-6">
          <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs uppercase font-mono">
              Module Mastery Certified
            </Badge>
            <h3 className="text-2xl font-bold text-foreground">
              Congratulations! Module Successfully Completed
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You scored <strong className="text-emerald-400 text-sm font-mono">{score}%</strong> on the {module.title} final assessment. Your verified competency has been updated across your SmartHireAI profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <Button
              variant="outline"
              onClick={() => navigate('/learning')}
              className="text-xs gap-2 h-10"
            >
              <GraduationCap className="h-4 w-4 text-primary" /> Roadmap
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/skills')}
              className="text-xs gap-2 h-10"
            >
              <BrainCircuit className="h-4 w-4 text-primary" /> Skill Graph
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/readiness')}
              className="text-xs gap-2 h-10"
            >
              <Building2 className="h-4 w-4 text-primary" /> Company Readiness
            </Button>
            <Button
              onClick={() => navigate('/interviews', { state: { targetSkill: module.skill } })}
              className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-2 h-10"
            >
              <Mic className="h-4 w-4" /> Mock Interview
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-destructive/30 bg-destructive/10 p-6 text-center space-y-4">
          <div className="h-14 w-14 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Assessment Not Passed</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Your score was <strong className="text-destructive font-mono">{score}%</strong> (Passing requirement is {assessment.passingScorePercent}%).
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRetry}
            className="text-xs gap-1.5 mx-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retake Assessment
          </Button>
        </Card>
      )}
    </div>
  );
}

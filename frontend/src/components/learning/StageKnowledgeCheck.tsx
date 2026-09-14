import React, { useState } from 'react';
import { LearningModuleData } from '../../types/learning';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface StageKnowledgeCheckProps {
  module: LearningModuleData;
  isCompleted: boolean;
  onCompleteStage: (score: number) => void;
  savedScore?: number;
}

export function StageKnowledgeCheck({
  module,
  isCompleted,
  onCompleteStage,
  savedScore
}: StageKnowledgeCheckProps) {
  const quiz = module.knowledgeCheck;
  const questions = quiz.questions;

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [hasSubmitted, setHasSubmitted] = useState(isCompleted);
  const [showExplanation, setShowExplanation] = useState(isCompleted);

  const currentQ = questions[currentQuestionIdx];
  const selectedOption = selectedAnswers[currentQuestionIdx];

  const handleSelectOption = (optIdx: number) => {
    if (hasSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: optIdx
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const score = isCompleted ? (savedScore || 100) : calculateScore();
  const isPassing = score >= quiz.passingScorePercent;

  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  const handleSubmitQuiz = () => {
    setHasSubmitted(true);
    setShowExplanation(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setHasSubmitted(false);
    setShowExplanation(false);
    setCurrentQuestionIdx(0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-secondary/30 rounded-xl p-5 border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary border-primary/30 text-xs">
              Knowledge Check
            </Badge>
            <span className="text-xs text-muted-foreground">
              Passing threshold: {quiz.passingScorePercent}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Conceptual Verification Quiz
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Validate your mastery of {module.skill} principles before taking the final assessment.
          </p>
        </div>

        {/* Question Counter Pill */}
        <div className="bg-background px-4 py-2 rounded-xl border border-border text-center shrink-0">
          <span className="text-xs text-muted-foreground block">Question</span>
          <span className="text-lg font-bold text-foreground font-mono">
            {currentQuestionIdx + 1} of {questions.length}
          </span>
        </div>
      </div>

      {/* Quiz Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" /> Question {currentQuestionIdx + 1}
            </div>
            <h3 className="text-base font-semibold text-foreground leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrect = optIdx === currentQ.correctIndex;
              const isWrongSelection = hasSubmitted && isSelected && !isCorrect;

              let btnClasses = 'w-full justify-start text-left text-xs p-4 h-auto whitespace-normal rounded-xl transition-all border ';

              if (hasSubmitted) {
                if (isCorrect) {
                  btnClasses += 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold';
                } else if (isWrongSelection) {
                  btnClasses += 'bg-destructive/15 border-destructive/50 text-destructive';
                } else {
                  btnClasses += 'bg-secondary/20 border-border/40 text-muted-foreground opacity-60';
                }
              } else if (isSelected) {
                btnClasses += 'bg-primary/15 border-primary text-foreground font-medium shadow-sm';
              } else {
                btnClasses += 'bg-secondary/30 hover:bg-secondary/60 border-border text-foreground/90';
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
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

          {/* Explanation Box */}
          {hasSubmitted && (
            <div className="bg-secondary/40 rounded-xl p-4 border border-border/60 space-y-1.5 animate-fade-in text-xs">
              <strong className="text-foreground font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Explanation:
              </strong>
              <p className="text-muted-foreground leading-relaxed font-mono">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Question Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="text-xs gap-1 h-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </Button>

            <div className="flex items-center gap-2">
              {!hasSubmitted && currentQuestionIdx === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                  className="bg-primary hover:bg-primary/90 text-xs font-semibold h-8 px-4"
                >
                  Grade Quiz
                </Button>
              ) : currentQuestionIdx < questions.length - 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className="text-xs gap-1 h-8"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Submission Result Banner */}
      {hasSubmitted && (
        <Card className={`border ${isPassing ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-destructive/10 border-destructive/30'}`}>
          <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isPassing ? (
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
              )}
              <div>
                <div className="text-base font-bold text-foreground">
                  {isPassing ? 'Knowledge Check Passed!' : 'Threshold Not Met'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Score: <strong className={isPassing ? 'text-emerald-400' : 'text-destructive'}>{score}%</strong> (Passing requirement: {quiz.passingScorePercent}%)
                </div>
              </div>
            </div>

            {!isPassing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stage Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Stage 4 of 5 • Knowledge Check
        </div>
        <Button
          onClick={() => onCompleteStage(score)}
          disabled={!isPassing && !isCompleted}
          className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-2 h-10 px-5"
        >
          {isCompleted ? 'Next: Final Assessment' : 'Proceed to Final Assessment'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

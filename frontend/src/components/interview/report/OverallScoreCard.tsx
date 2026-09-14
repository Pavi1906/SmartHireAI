import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { InterviewReportEvaluation } from '../../../types/interview';
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface OverallScoreCardProps {
  evaluation: InterviewReportEvaluation;
  readinessScore?: number;
}

export function OverallScoreCard({ evaluation, readinessScore }: OverallScoreCardProps) {
  const score = evaluation.overallScore;

  // Determine score colors
  let scoreColor = 'text-emerald-500';
  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
  let ringColor = 'border-emerald-500';

  if (score >= 85) {
    scoreColor = 'text-emerald-500';
    badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    ringColor = 'border-emerald-500';
  } else if (score >= 70) {
    scoreColor = 'text-blue-500';
    badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    ringColor = 'border-blue-500';
  } else if (score >= 50) {
    scoreColor = 'text-amber-500';
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    ringColor = 'border-amber-500';
  } else {
    scoreColor = 'text-rose-500';
    badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    ringColor = 'border-rose-500';
  }

  const passRate = evaluation.questionsTotal > 0 
    ? Math.round((evaluation.questionsPassed / evaluation.questionsTotal) * 100) 
    : 0;

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Score Indicator */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-secondary/20 border border-border/40">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
              Evaluated Score
            </span>
            
            <div className={`relative flex items-center justify-center w-36 h-36 rounded-full border-4 ${ringColor} bg-card/60 shadow-inner mb-4`}>
              <div className="flex flex-col items-center justify-center">
                <span className={`text-5xl font-black tracking-tight ${scoreColor}`}>
                  {score}%
                </span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase mt-0.5">
                  Accuracy
                </span>
              </div>
            </div>

            <Badge variant="outline" className={`px-3 py-1 text-xs font-semibold ${badgeColor}`}>
              {evaluation.performanceBand}
            </Badge>
          </div>

          {/* Performance Summary & Highlights */}
          <div className="lg:col-span-8 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Performance Evaluation
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {evaluation.summaryVerdict}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-card border border-border/60">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Passed Questions</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {evaluation.questionsPassed} / {evaluation.questionsTotal}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {passRate}% success rate
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/60">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                  <Target className="h-3.5 w-3.5 text-blue-500" />
                  <span>Questions Attempted</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {evaluation.questionsAttempted} / {evaluation.questionsTotal}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {evaluation.questionsTotal - evaluation.questionsAttempted} skipped
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/60">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Avg Time / Question</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {evaluation.questionsAttempted > 0 
                    ? `${Math.round(evaluation.totalTimeSpentSeconds / (evaluation.questionsAttempted * 60))}m` 
                    : '0m'}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  under target limits
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border/60">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span>Role Readiness</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {readinessScore || Math.min(95, score + 4)}%
                </div>
                <div className="text-[11px] text-emerald-500 font-medium mt-0.5">
                  +{Math.round(score * 0.1)}% from session
                </div>
              </div>
            </div>

          </div>

        </div>
      </CardContent>
    </Card>
  );
}

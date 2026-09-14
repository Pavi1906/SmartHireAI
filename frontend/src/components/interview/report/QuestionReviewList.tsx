import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { QuestionEvaluation, UserResponse } from '../../../types/interview';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Code2, 
  BrainCircuit, 
  Users, 
  Settings2, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Terminal,
  HelpCircle,
  Sparkles,
  Zap,
  Filter
} from 'lucide-react';

interface QuestionReviewListProps {
  evaluations: QuestionEvaluation[];
}

export function QuestionReviewList({ evaluations }: QuestionReviewListProps) {
  const [filter, setFilter] = useState<'all' | 'mastered' | 'practice' | 'skipped'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    // Expand the first question by default
    const initial: Record<string, boolean> = {};
    if (evaluations.length > 0) {
      initial[evaluations[0].questionId] = true;
    }
    return initial;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredEvaluations = evaluations.filter(q => {
    if (filter === 'mastered') return q.verdict === 'Mastered' || q.verdict === 'Proficient';
    if (filter === 'practice') return q.verdict === 'Needs Practice';
    if (filter === 'skipped') return q.verdict === 'Skipped';
    return true;
  });

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'coding':
        return <Terminal className="h-4 w-4 text-emerald-500" />;
      case 'mcq':
        return <BrainCircuit className="h-4 w-4 text-amber-500" />;
      case 'behavioral':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'system_design':
        return <Settings2 className="h-4 w-4 text-rose-500" />;
      case 'technical':
      default:
        return <Code2 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getVerdictBadge = (verdict: QuestionEvaluation['verdict'], score: number) => {
    switch (verdict) {
      case 'Mastered':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Mastered ({score}%)
          </Badge>
        );
      case 'Proficient':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Proficient ({score}%)
          </Badge>
        );
      case 'Skipped':
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30 font-semibold gap-1">
            <AlertCircle className="h-3 w-3" />
            Skipped (0%)
          </Badge>
        );
      case 'Needs Practice':
      default:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1">
            <AlertCircle className="h-3 w-3" />
            Needs Review ({score}%)
          </Badge>
        );
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Detailed Question-by-Question Review
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Inspect submitted code, test case results, STAR breakdowns, and deterministic examiner feedback.
            </CardDescription>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-secondary/30 rounded-lg border border-border/50 self-start sm:self-auto">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs h-7 px-2.5"
            >
              All ({evaluations.length})
            </Button>
            <Button
              variant={filter === 'mastered' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('mastered')}
              className="text-xs h-7 px-2.5"
            >
              Passed ({evaluations.filter(e => e.verdict === 'Mastered' || e.verdict === 'Proficient').length})
            </Button>
            <Button
              variant={filter === 'practice' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('practice')}
              className="text-xs h-7 px-2.5"
            >
              Review ({evaluations.filter(e => e.verdict === 'Needs Practice').length})
            </Button>
            <Button
              variant={filter === 'skipped' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('skipped')}
              className="text-xs h-7 px-2.5"
            >
              Skipped ({evaluations.filter(e => e.verdict === 'Skipped').length})
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredEvaluations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
            No questions match the selected filter criteria.
          </div>
        ) : (
          filteredEvaluations.map((q) => {
            const isExpanded = Boolean(expandedIds[q.questionId]);
            const timeMin = Math.floor(q.timeSpentSeconds / 60);
            const timeSec = q.timeSpentSeconds % 60;
            const recMin = Math.round(q.recommendedTimeSeconds / 60);
            const resp = q.userResponse;

            return (
              <div 
                key={q.questionId}
                className={`rounded-xl border transition-all ${
                  isExpanded ? 'border-primary/40 bg-card shadow-xs' : 'border-border/60 bg-card/60 hover:bg-card'
                }`}
              >
                {/* Collapsible Header */}
                <div 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(q.questionId)}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary shrink-0 font-bold text-xs">
                      Q{q.questionNumber}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm sm:text-base text-foreground">
                          {q.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {getFormatIcon(q.format)}
                          <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                            {q.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {q.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Time spent: {timeMin}m {timeSec}s</span>
                          <span className="text-muted-foreground/60">(budget: {recMin}m)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {getVerdictBadge(q.verdict, q.score)}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-border/40 space-y-5 animate-in fade-in duration-200">
                    
                    {/* Feedback & Examiner Takeaway */}
                    <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Examiner Assessment & Feedback
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {q.feedback}
                      </p>
                      <div className="pt-2 border-t border-border/40 flex items-start gap-2 text-xs text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>Actionable Next Step:</strong> {q.improvementTip}</span>
                      </div>
                    </div>

                    {/* Format-Specific Candidate Submissions */}
                    
                    {/* 1. MCQ Answer Review */}
                    {q.format === 'mcq' && (
                      <div className="space-y-3 p-4 rounded-xl bg-card border border-border/60">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Option Review
                        </h4>
                        {q.correctAnswerText && (
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                            <strong>Expected Correct Option:</strong> {q.correctAnswerText}
                          </div>
                        )}
                        {q.explanation && (
                          <div className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Coding Response & Test Case Execution */}
                    {q.format === 'coding' && (
                      <div className="space-y-4">
                        {/* Submitted Code Block */}
                        <div className="rounded-xl overflow-hidden border border-border/70 bg-zinc-950 dark:bg-black font-mono text-xs">
                          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                            <div className="flex items-center gap-2">
                              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Submitted Solution ({resp?.codeLanguage || 'typescript'})</span>
                            </div>
                            <span className="text-[11px] text-zinc-500">
                              {resp?.codeAnswer ? `${resp.codeAnswer.split('\n').length} lines` : 'No code'}
                            </span>
                          </div>
                          <pre className="p-4 overflow-x-auto text-zinc-200 leading-relaxed max-h-72">
                            <code>{resp?.codeAnswer || '// No code was submitted for this question.'}</code>
                          </pre>
                        </div>

                        {/* Test Cases Results */}
                        {resp?.runResults && (
                          <div className="p-4 rounded-xl bg-secondary/20 border border-border/50 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span>Test Case Execution Results</span>
                              <Badge variant="outline" className={resp.runResults.passed ? 'text-emerald-500 border-emerald-500/30' : 'text-amber-500 border-amber-500/30'}>
                                {resp.runResults.testCasesPassed} / {resp.runResults.totalTestCases} Tests Passed
                              </Badge>
                            </div>
                            <pre className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                              {resp.runResults.output || (resp.runResults.passed ? '✓ All test assertions passed successfully.' : 'Some assertions failed.')}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Behavioral STAR Breakdown */}
                    {q.format === 'behavioral' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Candidate STAR Structure Breakdown
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Situation</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.starBreakdown?.situation || resp?.textAnswer || 'Context not provided.'}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Task</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.starBreakdown?.task || 'Objective scope not provided.'}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Action</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.starBreakdown?.action || 'Actions not provided.'}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Result & Impact</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.starBreakdown?.result || 'Measurable outcome not provided.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. System Design Breakdown */}
                    {q.format === 'system_design' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          System Design Components
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Requirements & Scoping</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.systemDesignBreakdown?.requirements || resp?.textAnswer || 'Requirements not specified.'}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">High-Level Architecture</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.systemDesignBreakdown?.architecture || 'Architecture not specified.'}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Data Model & Storage</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.systemDesignBreakdown?.dataModel || 'Data model not specified.'}
                            </p>
                          </div>
                          <div className="p-3.5 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Scaling & Bottlenecks</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.systemDesignBreakdown?.scaling || 'Scaling strategy not specified.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. Technical Structured Breakdown */}
                    {q.format === 'technical' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Technical Articulation Breakdown
                        </h4>
                        <div className="space-y-2">
                          <div className="p-3 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Core Concept & Lifecycle</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.technicalBreakdown?.concept || resp?.textAnswer || 'Concept definition not provided.'}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Trade-Offs & Alternatives</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.technicalBreakdown?.tradeoffs || 'Trade-off comparison not provided.'}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/20 border border-border/50 space-y-1">
                            <span className="text-[11px] font-bold text-primary uppercase">Practical Production Scenario</span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {resp?.technicalBreakdown?.example || 'Production example not provided.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

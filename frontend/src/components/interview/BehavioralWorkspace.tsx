import React from 'react';
import { InterviewQuestion, UserResponse } from '../../types/interview';
import { Badge } from '../ui/badge';
import { Users, Sparkles, MessageSquare, CheckCircle2 } from 'lucide-react';

interface BehavioralWorkspaceProps {
  question: InterviewQuestion;
  response: UserResponse;
  onUpdateResponse: (updates: Partial<UserResponse>) => void;
  disabled?: boolean;
}

export function BehavioralWorkspace({
  question,
  response,
  onUpdateResponse,
  disabled = false
}: BehavioralWorkspaceProps) {
  const breakdown = response.starBreakdown || {
    situation: '',
    task: '',
    action: '',
    result: ''
  };

  const starPrompts = question.starPrompts || {
    situation: 'Describe the project context, timeline, and background.',
    task: 'What was your specific responsibility or challenge?',
    action: 'What specific steps and technical initiatives did you take?',
    result: 'What were the quantifiable business metrics and takeaways?'
  };

  const handleFieldChange = (field: keyof typeof breakdown, value: string) => {
    const updated = {
      ...breakdown,
      [field]: value
    };
    onUpdateResponse({
      starBreakdown: updated,
      textAnswer: `[SITUATION]\n${updated.situation}\n\n[TASK]\n${updated.task}\n\n[ACTION]\n${updated.action}\n\n[RESULT]\n${updated.result}`
    });
  };

  return (
    <div className="space-y-6">
      {/* STAR Guidance Header */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
        <Users className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-foreground block">
            STAR Behavioral Response Framework
          </span>
          <p className="text-muted-foreground leading-relaxed">
            Structure your response using the 4-part STAR method. Highlight high agency, quantified business metrics, and constructive team leadership.
          </p>
        </div>
      </div>

      {/* 4-Part STAR Input Grid */}
      <div className="space-y-4">
        {/* Situation */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-purple-500/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center">
                S
              </span>
              <label className="text-xs font-bold text-foreground font-mono">
                Situation & Context
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Context & Setting</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {starPrompts.situation}
          </p>
          <textarea
            value={breakdown.situation}
            onChange={(e) => handleFieldChange('situation', e.target.value)}
            disabled={disabled}
            placeholder="E.g., At my previous role, our team was preparing for Black Friday traffic when..."
            rows={3}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed resize-y"
          />
        </div>

        {/* Task */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-purple-500/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center">
                T
              </span>
              <label className="text-xs font-bold text-foreground font-mono">
                Task & Challenge
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Specific Objective</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {starPrompts.task}
          </p>
          <textarea
            value={breakdown.task}
            onChange={(e) => handleFieldChange('task', e.target.value)}
            disabled={disabled}
            placeholder="E.g., My responsibility was to identify bottlenecks in the checkout API and reduce latency..."
            rows={3}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed resize-y"
          />
        </div>

        {/* Action */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-purple-500/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center">
                A
              </span>
              <label className="text-xs font-bold text-foreground font-mono">
                Action Taken & Strategy
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Your Key Contributions</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {starPrompts.action}
          </p>
          <textarea
            value={breakdown.action}
            onChange={(e) => handleFieldChange('action', e.target.value)}
            disabled={disabled}
            placeholder="E.g., I implemented a Redis caching layer with optimistic concurrency and orchestrated daily cross-functional standups..."
            rows={4}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed resize-y"
          />
        </div>

        {/* Result */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                R
              </span>
              <label className="text-xs font-bold text-foreground font-mono">
                Result & Business Impact
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Quantified Impact</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {starPrompts.result}
          </p>
          <textarea
            value={breakdown.result}
            onChange={(e) => handleFieldChange('result', e.target.value)}
            disabled={disabled}
            placeholder="E.g., P99 latency dropped by 48%, zero downtime was observed during peak traffic, and we saved $12k in monthly compute..."
            rows={3}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed resize-y"
          />
        </div>
      </div>
    </div>
  );
}

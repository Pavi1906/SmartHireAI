import React from 'react';
import { InterviewQuestion, UserResponse } from '../../types/interview';
import { Code2, BookOpen, Layers, CheckCircle2, Lightbulb } from 'lucide-react';

interface TechnicalWorkspaceProps {
  question: InterviewQuestion;
  response: UserResponse;
  onUpdateResponse: (updates: Partial<UserResponse>) => void;
  disabled?: boolean;
}

export function TechnicalWorkspace({
  question,
  response,
  onUpdateResponse,
  disabled = false
}: TechnicalWorkspaceProps) {
  const breakdown = response.technicalBreakdown || {
    concept: '',
    tradeoffs: '',
    example: ''
  };

  const prompts = question.technicalPrompts || {
    coreConcept: 'Explain the internal execution mechanics, framework runtime, or underlying concept.',
    tradeoffs: 'Detail performance trade-offs, space/time complexity, and when NOT to use this approach.',
    practicalExample: 'Provide a real-world code snippet or architecture scenario illustrating this in production.'
  };

  const handleFieldChange = (field: keyof typeof breakdown, value: string) => {
    const updated = {
      ...breakdown,
      [field]: value
    };
    onUpdateResponse({
      technicalBreakdown: updated,
      textAnswer: `[CORE CONCEPT]\n${updated.concept}\n\n[TRADE-OFFS & COMPLEXITY]\n${updated.tradeoffs}\n\n[PRACTICAL IMPLEMENTATION]\n${updated.example}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Technical Banner */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <Code2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-foreground block">
            Technical Architecture & Deep-Dive Workspace
          </span>
          <p className="text-muted-foreground leading-relaxed">
            Provide comprehensive conceptual explanations, trade-off comparisons, and concrete production code examples for your interviewer.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Core Concepts */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center">
                1
              </span>
              <label className="text-xs font-bold text-foreground font-mono">
                Core Concept & Runtime Execution
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Theory & Mechanics</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prompts.coreConcept}
          </p>
          <textarea
            value={breakdown.concept}
            onChange={(e) => handleFieldChange('concept', e.target.value)}
            disabled={disabled}
            placeholder="Explain the foundational theory, reconciliation cycle, virtual DOM diffing, or event loop behavior..."
            rows={3}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-400 leading-relaxed resize-y"
          />
        </div>

        {/* Trade-offs & Profiling */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center">
                2
              </span>
              <label className="text-xs font-bold text-foreground font-mono flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5" /> Performance Trade-offs & Asymptotic Limits
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Trade-offs</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prompts.tradeoffs}
          </p>
          <textarea
            value={breakdown.tradeoffs}
            onChange={(e) => handleFieldChange('tradeoffs', e.target.value)}
            disabled={disabled}
            placeholder="Discuss memory overhead, cache invalidation risks, premature memoization penalties, and Big-O impact..."
            rows={3}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-400 leading-relaxed resize-y"
          />
        </div>

        {/* Practical Example & Code Snippet */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                3
              </span>
              <label className="text-xs font-bold text-foreground font-mono flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Practical Code / Architecture Example
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Implementation</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prompts.practicalExample}
          </p>
          <textarea
            value={breakdown.example}
            onChange={(e) => handleFieldChange('example', e.target.value)}
            disabled={disabled}
            placeholder="Write TypeScript / SQL / pseudo-code demonstrating custom hooks, indexing queries, or middleware orchestration..."
            rows={4}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed resize-y font-mono"
          />
        </div>
      </div>
    </div>
  );
}

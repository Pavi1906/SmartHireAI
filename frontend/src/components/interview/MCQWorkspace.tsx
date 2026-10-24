import React from 'react';
import { InterviewQuestion, UserResponse } from '../../types/interview';
import { Badge } from '../ui/badge';
import { CheckCircle2, Circle, HelpCircle, Info } from 'lucide-react';

interface MCQWorkspaceProps {
  question: InterviewQuestion;
  response: UserResponse;
  onUpdateResponse: (updates: Partial<UserResponse>) => void;
  disabled?: boolean;
}

export function MCQWorkspace({
  question,
  response,
  onUpdateResponse,
  disabled = false
}: MCQWorkspaceProps) {
  const options = question.mcqOptions || [];
  const selectedId = response.selectedOptionId;

  const handleSelect = (optionId: string) => {
    if (disabled) return;
    onUpdateResponse({
      selectedOptionId: optionId,
      isSkipped: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Aptitude Question Card Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-foreground block">
            Aptitude & Quantitative Problem Solving
          </span>
          <p className="text-muted-foreground leading-relaxed">
            Select the most accurate mathematical or logical answer choice below. You can update your choice anytime before finalizing the session.
          </p>
        </div>
      </div>

      {/* Multiple Choice Options Grid */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
          Select One Option
        </label>

        <div className="grid grid-cols-1 gap-3">
          {options.map((opt, index) => {
            const isSelected = selectedId === opt.id;
            const letter = String.fromCharCode(65 + index); // A, B, C, D

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                disabled={disabled}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-foreground ring-1 ring-amber-500 shadow-sm'
                    : 'bg-card border-border hover:border-amber-500/50 hover:bg-secondary/40 text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`h-8 w-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow'
                        : 'bg-secondary text-foreground group-hover:bg-amber-500/20 group-hover:text-amber-300'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-foreground font-semibold' : 'text-foreground/90'}`}>
                    {opt.text}
                  </span>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scratchpad or reasoning notes */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground font-mono">
            Candidate Scratchpad / Step-by-Step Logic (Optional)
          </label>
          <span className="text-[10px] text-muted-foreground font-mono">
            Saved with submission
          </span>
        </div>
        <textarea
          value={response.textAnswer || ''}
          onChange={(e) => onUpdateResponse({ textAnswer: e.target.value })}
          disabled={disabled}
          placeholder="Write down your calculation steps, formulas, or logical breakdown here..."
          rows={4}
          className="w-full p-3.5 rounded-xl bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y font-mono"
        />
      </div>
    </div>
  );
}

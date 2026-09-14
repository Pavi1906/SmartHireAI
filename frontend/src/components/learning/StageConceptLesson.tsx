import React, { useState } from 'react';
import { LearningModuleData } from '../../types/learning';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  Code2, 
  ArrowRight,
  Sparkles,
  Target,
  Copy,
  Check
} from 'lucide-react';

interface StageConceptLessonProps {
  module: LearningModuleData;
  isCompleted: boolean;
  onCompleteStage: () => void;
}

export function StageConceptLesson({
  module,
  isCompleted,
  onCompleteStage
}: StageConceptLessonProps) {
  const [hasAcknowledgedKeyPoints, setHasAcknowledgedKeyPoints] = useState(isCompleted);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const canProceed = hasAcknowledgedKeyPoints || isCompleted;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-secondary/30 rounded-xl p-5 border border-border/60">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-primary border-primary/30 text-xs">
            {module.category}
          </Badge>
          <span className="text-xs text-muted-foreground">• Lesson Duration: ~25 mins</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {module.title}: Core Architectural Fundamentals
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {module.lesson.overview}
        </p>

        {/* Key Learning Objectives */}
        <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-2">
          {module.learningObjectives.map((obj, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-foreground/90">
              <Target className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6">
        {module.lesson.sections.map((section, idx) => (
          <div key={idx} className="bg-card rounded-xl p-6 border border-border space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-mono flex items-center justify-center">
                {idx + 1}
              </span>
              {section.title}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>

            {/* Code Snippet if present */}
            {section.codeSnippet && (
              <div className="rounded-lg overflow-hidden border border-border bg-black/80 font-mono text-xs">
                <div className="bg-secondary/60 px-4 py-2 flex items-center justify-between border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] text-muted-foreground">
                      {section.codeSnippet.caption || `${section.codeSnippet.language.toUpperCase()} Example`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(section.codeSnippet!.code, idx)}
                    className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-emerald-300 leading-relaxed">
                  <code>{section.codeSnippet.code}</code>
                </pre>
              </div>
            )}

            {/* Key Takeaway Box */}
            {section.keyTakeaway && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3.5 flex items-start gap-2.5">
                <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-foreground font-semibold">Key Takeaway: </strong>
                  <span className="text-muted-foreground">{section.keyTakeaway}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lesson Summary & Comprehension Check */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Lesson Checkpoint & Verification
        </h4>
        <p className="text-xs text-muted-foreground">
          {module.lesson.summary}
        </p>

        <label className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/60 cursor-pointer hover:bg-secondary/50 transition-colors">
          <input
            type="checkbox"
            checked={hasAcknowledgedKeyPoints}
            onChange={(e) => setHasAcknowledgedKeyPoints(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <span className="text-xs text-foreground font-medium select-none">
            I have reviewed the architectural principles, code samples, and key takeaways for this lesson.
          </span>
        </label>
      </div>

      {/* Stage Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Stage 1 of 5 • Concept Lesson
        </div>
        <Button
          onClick={onCompleteStage}
          disabled={!canProceed}
          className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-2 h-10 px-5"
        >
          {isCompleted ? 'Next: Interactive Example' : 'Complete Lesson & Continue'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

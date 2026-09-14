import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillItem } from '../../types/skills';
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  GraduationCap, 
  PlayCircle, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  FileCheck, 
  Layers, 
  Sparkles, 
  ArrowRight,
  Target,
  X
} from 'lucide-react';

interface SkillDetailsModalProps {
  skill: SkillItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectRelatedSkill: (skillName: string) => void;
}

export function SkillDetailsModal({
  skill,
  isOpen,
  onClose,
  onSelectRelatedSkill
}: SkillDetailsModalProps) {
  const navigate = useNavigate();

  if (!skill) return null;

  const handleLearn = () => {
    onClose();
    navigate('/learning', { state: { targetSkill: skill.name, category: skill.category } });
  };

  const handlePractice = () => {
    onClose();
    navigate('/interviews', { state: { practiceSkill: skill.name } });
  };

  const handleViewJobs = () => {
    onClose();
    navigate('/jobs', { state: { filterSkill: skill.name } });
  };

  const handleViewCompanyReqs = () => {
    onClose();
    navigate('/readiness', { state: { targetSkill: skill.name } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="relative max-h-[85vh] overflow-y-auto pr-1">
        <button
          onClick={onClose}
          className="absolute right-0 top-0 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="pb-3 border-b border-border text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {skill.name.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  {skill.name}
                </DialogTitle>
                <DialogDescription className="text-xs flex items-center gap-2 mt-0.5">
                  <span className="text-primary font-medium">{skill.category}</span>
                  <span>•</span>
                  <span>Market Demand: <strong className="text-foreground font-semibold">{skill.marketDemand}</strong></span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  skill.status === 'strong' ? 'default' : 
                  skill.status === 'developing' ? 'secondary' : 'destructive'
                }
                className="text-xs font-semibold px-2.5 py-1"
              >
                {skill.proficiency} ({skill.score}%)
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Proficiency Breakdown Metric */}
          <div className="bg-secondary/40 p-3.5 rounded-xl border border-border/60 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Proficiency Benchmark
              </span>
              <span className="font-bold text-foreground">{skill.score} / 100</span>
            </div>
            <Progress value={skill.score} className="h-1.5" />
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Foundational (45%)</span>
              <span>Intermediate (60%)</span>
              <span>Proficient (75%)</span>
              <span>Advanced (88%+)</span>
            </div>
          </div>

          {/* Assessment Explanation */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Why this level?
            </h4>
            <p className="text-xs text-foreground/90 bg-muted/30 p-2.5 rounded-lg border border-border/50 leading-relaxed">
              {skill.whyThisLevel}
            </p>
          </div>

          {/* Resume Evidence */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-emerald-400" /> Evidence from Active Resume
            </h4>
            {skill.evidence && skill.evidence.length > 0 ? (
              <ul className="space-y-1.5">
                {skill.evidence.map((ev, i) => (
                  <li key={i} className="text-xs text-muted-foreground bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic bg-muted/20 p-2 rounded-lg border border-border/40">
                Inferred from technical domain context and related skills baseline.
              </p>
            )}
          </div>

          {/* Related Skills */}
          {skill.relatedSkills && skill.relatedSkills.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" /> Related & Synergistic Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skill.relatedSkills.map((relSkill, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectRelatedSkill(relSkill)}
                    className="text-xs px-2 py-1 rounded-md bg-secondary/80 hover:bg-secondary text-foreground border border-border/80 transition-colors flex items-center gap-1"
                  >
                    <span>{relSkill}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Next Step */}
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl space-y-1">
            <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Recommended Next Step
            </h4>
            <p className="text-xs text-foreground/90">
              {skill.recommendedAction}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="border-t border-border pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLearn}
            className="flex items-center gap-1 text-xs w-full h-8 px-2"
          >
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">Learn</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePractice}
            className="flex items-center gap-1 text-xs w-full h-8 px-2"
          >
            <PlayCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span className="truncate">Practice</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewJobs}
            className="flex items-center gap-1 text-xs w-full h-8 px-2"
          >
            <Briefcase className="h-3.5 w-3.5 text-amber-400" />
            <span className="truncate">Jobs</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewCompanyReqs}
            className="flex items-center gap-1 text-xs w-full h-8 px-2"
          >
            <Building2 className="h-3.5 w-3.5 text-blue-400" />
            <span className="truncate">Readiness</span>
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}

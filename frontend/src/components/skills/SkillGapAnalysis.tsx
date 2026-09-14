import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillGap, SkillItem } from '../../types/skills';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  GraduationCap, 
  PlayCircle, 
  Briefcase, 
  Building2,
  CheckCircle2,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SkillGapAnalysisProps {
  gaps: SkillGap[];
  criticalGaps: SkillGap[];
  strongSkills: SkillItem[];
  developingSkills: SkillItem[];
  onSelectSkill: (skillName: string) => void;
}

export function SkillGapAnalysis({
  gaps,
  criticalGaps,
  strongSkills,
  developingSkills,
  onSelectSkill
}: SkillGapAnalysisProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Critical Gaps Spotlight Banner */}
      {criticalGaps.length > 0 && (
        <Card className="border-red-500/30 bg-gradient-to-br from-red-950/20 via-card to-card relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 via-amber-500 to-primary" />
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Critical Career Gaps ({criticalGaps.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Highest-priority missing capabilities required for Tier-1 Tech and Senior Engineering tracks.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="destructive" className="text-xs px-2.5 py-1">
                Immediate Action Recommended
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalGaps.map((gap) => (
                <div 
                  key={gap.id}
                  className="bg-secondary/40 rounded-xl p-4 border border-border/80 hover:border-red-500/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                        <span>{gap.skill}</span>
                        <Badge 
                          variant={gap.priority === 'Critical' ? 'destructive' : 'secondary'}
                          className="text-[10px] px-1.5 py-0 uppercase"
                        >
                          {gap.priority}
                        </Badge>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Domain: <span className="text-foreground font-medium">{gap.category}</span> • Target: <span className="text-emerald-400 font-semibold">{gap.targetLevel}</span>
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 bg-background/60 px-2 py-1 rounded-md border border-border/60 shrink-0">
                      <Clock className="h-3 w-3 text-primary" /> {gap.estimatedEffort}
                    </span>
                  </div>

                  {/* Why it matters & Career Impact */}
                  <div className="space-y-1.5 text-xs">
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground font-medium">Why it matters:</strong> {gap.whyItMatters}
                    </p>
                    <div className="bg-primary/5 p-2 rounded-lg border border-primary/20 text-primary font-medium flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{gap.careerImpact}</span>
                    </div>
                  </div>

                  {/* Target Companies & Roles */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <span>High demand at:</span>
                    {gap.relatedCompanies.map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-foreground font-medium text-[11px]">
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Quick CTAs */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => navigate('/learning', { state: { targetSkill: gap.skill } })}
                      className="text-xs gap-1.5 h-8"
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>Start Roadmap</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/interviews', { state: { practiceSkill: gap.skill } })}
                      className="text-xs gap-1.5 h-8"
                    >
                      <PlayCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Practice Round</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Skill Gap Breakdown Table / Cards */}
      <Card className="bg-card">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Comprehensive Skill Gap Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed comparison of current candidate competencies against market requirements.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> {strongSkills.length} Strong</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> {developingSkills.length} Developing</span>
              <span>•</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> {gaps.length} Gaps</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <th className="pb-3 px-3">Skill / Gap</th>
                  <th className="pb-3 px-3">Domain</th>
                  <th className="pb-3 px-3">Priority</th>
                  <th className="pb-3 px-3">Current vs Target</th>
                  <th className="pb-3 px-3">Est. Effort</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {gaps.map((gap) => (
                  <tr key={gap.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground">{gap.skill}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{gap.whyItMatters}</div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-[11px]">
                        {gap.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge 
                        variant={gap.priority === 'Critical' ? 'destructive' : gap.priority === 'High' ? 'default' : 'secondary'}
                        className="text-[11px] font-semibold"
                      >
                        {gap.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">{gap.currentLevel}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-emerald-400 font-semibold">{gap.targetLevel}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-medium">
                      {gap.estimatedEffort}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/learning', { state: { targetSkill: gap.skill } })}
                        className="text-xs h-7 px-2.5"
                      >
                        Learn
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate('/jobs', { state: { filterSkill: gap.skill } })}
                        className="text-xs h-7 px-2"
                        title="View Jobs Requiring this Skill"
                      >
                        <Briefcase className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

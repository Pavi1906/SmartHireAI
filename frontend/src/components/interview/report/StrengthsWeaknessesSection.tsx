import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { InterviewReportEvaluation } from '../../../types/interview';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Zap,
  TrendingUp 
} from 'lucide-react';

interface StrengthsWeaknessesSectionProps {
  topStrengths: InterviewReportEvaluation['topStrengths'];
  criticalWeaknesses: InterviewReportEvaluation['criticalWeaknesses'];
}

export function StrengthsWeaknessesSection({ 
  topStrengths, 
  criticalWeaknesses 
}: StrengthsWeaknessesSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Verified Strengths Card */}
      <Card className="border border-emerald-500/30 bg-emerald-500/[0.02] shadow-sm flex flex-col">
        <CardHeader className="pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                Demonstrated Strengths
              </CardTitle>
              <CardDescription className="text-xs">
                Areas where your answers exhibited mastery and thorough technical articulation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4 flex-1">
          {topStrengths.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Complete more questions in the next session to populate confirmed strengths.
            </p>
          ) : (
            topStrengths.map((st, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl bg-card border border-emerald-500/20 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    {st.skill}
                  </span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                    {st.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {st.evidence}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Critical Weaknesses & Skill Gaps Card */}
      <Card className="border border-amber-500/30 bg-amber-500/[0.02] shadow-sm flex flex-col">
        <CardHeader className="pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold text-amber-600 dark:text-amber-400">
                Identified Skill Gaps & Weaknesses
              </CardTitle>
              <CardDescription className="text-xs">
                Critical areas where responses were incomplete, incorrect, or skipped.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4 flex-1">
          {criticalWeaknesses.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No critical skill gaps identified in this round. Great job!
            </p>
          ) : (
            criticalWeaknesses.map((gw, idx) => {
              const isCrit = gw.priority === 'Critical';
              return (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-xl bg-card border border-amber-500/20 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      {gw.skill}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${
                        isCrit 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {gw.priority} Priority
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {gw.gapDescription}
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-border/40">
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      💡 {gw.remediationTip}
                    </p>

                    {gw.linkedModuleId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/learning/${gw.linkedModuleId}`)}
                        className="text-xs h-7 px-2 text-primary hover:text-primary gap-1 shrink-0"
                      >
                        <BookOpen className="h-3 w-3" />
                        Study Module
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

    </div>
  );
}

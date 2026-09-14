import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { DomainScoreBreakdown } from '../../../types/interview';
import { BarChart3, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface DomainBreakdownCardProps {
  breakdown: DomainScoreBreakdown[];
}

export function DomainBreakdownCard({ breakdown }: DomainBreakdownCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Domain Competency Breakdown
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Deterministic evaluation across technical, problem-solving, coding rigor, and architectural criteria.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {breakdown.map((domain, index) => {
          let indicatorColor = 'bg-emerald-500';
          let badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
          let statusText = 'Proficient';

          if (domain.score >= 80) {
            indicatorColor = 'bg-emerald-500';
            badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
            statusText = 'Excellent';
          } else if (domain.score >= 65) {
            indicatorColor = 'bg-blue-500';
            badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
            statusText = 'Proficient';
          } else {
            indicatorColor = 'bg-amber-500';
            badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
            statusText = 'Needs Work';
          }

          return (
            <div key={domain.domain || index} className="space-y-2 p-3.5 rounded-lg bg-secondary/15 border border-border/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{domain.domain}</span>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.2 ${badgeColor}`}>
                    {statusText}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Weight: {domain.weight}%</span>
                  <span className="text-sm font-bold text-foreground min-w-[3rem] text-right">
                    {domain.score}%
                  </span>
                </div>
              </div>

              <Progress 
                value={domain.score} 
                className="h-2 bg-secondary" 
                indicatorClassName={indicatorColor} 
              />

              <p className="text-xs text-muted-foreground pt-0.5">
                {domain.description}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

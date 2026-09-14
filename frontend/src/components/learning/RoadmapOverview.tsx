import React from 'react';
import { LearningRoadmapSummary } from '../../types/learning';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface RoadmapOverviewProps {
  summary: LearningRoadmapSummary;
  onFilterStatus?: (status: string) => void;
}

export function RoadmapOverview({ summary, onFilterStatus }: RoadmapOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Overall Progress */}
      <Card className="bg-card hover:border-primary/40 transition-colors cursor-pointer group" onClick={() => onFilterStatus?.('ALL')}>
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Progress</span>
            <GraduationCap className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground flex items-baseline gap-1.5">
              <span>{summary.overallProgressPercent}%</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({summary.completedModules}/{summary.totalModules} done)
              </span>
            </div>
            <Progress value={summary.overallProgressPercent} className="h-1.5 mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card className="bg-card hover:border-amber-500/40 transition-colors cursor-pointer group" onClick={() => onFilterStatus?.('IN_PROGRESS')}>
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">In Progress</span>
            <BookOpen className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{summary.inProgressModules}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Active learning tracks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Completed Modules */}
      <Card className="bg-card hover:border-emerald-500/40 transition-colors cursor-pointer group" onClick={() => onFilterStatus?.('COMPLETED')}>
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{summary.completedModules}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Gaps resolved
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Est. Effort Remaining */}
      <Card className="bg-card border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Readiness Boost</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">+{summary.targetRoleReadinessBoost}%</div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" /> ~{summary.estimatedHoursRemaining} hrs total effort
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

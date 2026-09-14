import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentAnalyticsOverview } from '../../types/analytics';

interface LearningMilestonesSectionProps {
  overview: StudentAnalyticsOverview;
}

export function LearningMilestonesSection({ overview }: LearningMilestonesSectionProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Learning Roadmap Milestones
            </CardTitle>
            <CardDescription className="text-xs">
              Curated architectural deep dives and skill gap remediation progress.
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary gap-1 self-start sm:self-auto h-8 hover:bg-primary/10"
            onClick={() => navigate('/learning')}
          >
            View Roadmap <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Progress Indicator */}
        <div className="p-4 rounded-xl border border-border/70 bg-card/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Roadmap Mastery Completion</span>
            <span className="font-bold text-emerald-400 text-sm">{overview.learningProgressPercent}%</span>
          </div>
          <Progress value={overview.learningProgressPercent} className="h-2.5" />
          
          <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-border/40">
            <div>
              <span className="text-[10px] text-muted-foreground block">Completed</span>
              <span className="text-sm font-bold text-emerald-400">
                {overview.completedModulesCount}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Total Modules</span>
              <span className="text-sm font-bold text-foreground">
                {overview.totalModulesCount}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Hours Remaining</span>
              <span className="text-sm font-bold text-amber-400">
                {overview.estimatedHoursRemaining} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Impact Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">Placement Boost Gained</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                +{overview.targetRoleReadinessBoost}% alignment with Tier-1 engineering criteria
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/50 bg-background/50 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">Pacing Recommendation</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Target 1 module per week to reduce critical skill gaps before recruiting loops.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

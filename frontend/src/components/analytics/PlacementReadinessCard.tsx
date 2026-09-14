import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { 
  Target, 
  TrendingUp, 
  FileText, 
  BrainCircuit, 
  Video, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentAnalyticsOverview } from '../../types/analytics';

interface PlacementReadinessCardProps {
  overview: StudentAnalyticsOverview;
}

export function PlacementReadinessCard({ overview }: PlacementReadinessCardProps) {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <Card className="border-border/80 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Composite Placement Probability
            </CardTitle>
            <CardDescription className="text-xs">
              Mathematically computed readiness index weighting resume quality, technical taxonomy depth, interview evaluations, and milestone completion.
            </CardDescription>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto text-xs px-2 py-0.5 font-medium border-primary/30 text-primary bg-primary/10">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Deterministic Algorithm
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Big Score Hero Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-xl border border-border/70 bg-background/50">
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-3 border-b md:border-b-0 md:border-r border-border/70">
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-extrabold tracking-tight ${getScoreColor(overview.placementScore)}`}>
                {overview.placementScore}%
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground mt-1.5">{overview.placementTier}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Overall hiring market readiness</p>
          </div>

          {/* 4 Component Pillars */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Resume ATS */}
            <div className="p-3 rounded-lg border border-border/60 bg-card/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Resume ATS Score
                </span>
                <span className="font-bold text-foreground">{overview.resumeScore} / 100</span>
              </div>
              <Progress value={overview.resumeScore} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground">Weight: 30%</p>
            </div>

            {/* 2. Skill Competitiveness */}
            <div className="p-3 rounded-lg border border-border/60 bg-card/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5 text-blue-400" />
                  Market Competitiveness
                </span>
                <span className="font-bold text-foreground">{overview.skillCompetitiveness}%</span>
              </div>
              <Progress value={overview.skillCompetitiveness} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground">Weight: 30%</p>
            </div>

            {/* 3. Mock Interview Average */}
            <div className="p-3 rounded-lg border border-border/60 bg-card/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-amber-400" />
                  Interview Rating
                </span>
                <span className="font-bold text-foreground">
                  {overview.interviewAverage !== null ? `${overview.interviewAverage}%` : 'Pending'}
                </span>
              </div>
              <Progress 
                value={overview.interviewAverage !== null ? overview.interviewAverage : 0} 
                className="h-1.5" 
              />
              <p className="text-[10px] text-muted-foreground">
                {overview.completedInterviewsCount > 0 
                  ? `${overview.completedInterviewsCount} round(s) evaluated (Weight: 25%)` 
                  : 'Complete 1st round to establish rating'}
              </p>
            </div>

            {/* 4. Learning Progress */}
            <div className="p-3 rounded-lg border border-border/60 bg-card/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                  Roadmap Milestone
                </span>
                <span className="font-bold text-foreground">{overview.learningProgressPercent}%</span>
              </div>
              <Progress value={overview.learningProgressPercent} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground">
                {overview.completedModulesCount} of {overview.totalModulesCount} modules completed
              </p>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-card/40 border border-border/50 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Target Companies</span>
            <span className="text-base font-bold text-foreground">
              {overview.topCompany ? `${overview.topCompany.name} (${overview.topCompany.score}%)` : '—'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-card/40 border border-border/50 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Critical Skill Gaps</span>
            <span className={`text-base font-bold ${overview.criticalGapsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {overview.criticalGapsCount} gap{overview.criticalGapsCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-card/40 border border-border/50 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Roadmap Readiness Boost</span>
            <span className="text-base font-bold text-emerald-400">
              +{overview.targetRoleReadinessBoost}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-card/40 border border-border/50 text-center">
            <span className="text-xs text-muted-foreground block mb-1">Matched Positions</span>
            <span className="text-base font-bold text-foreground">
              {overview.totalJobMatches} active
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

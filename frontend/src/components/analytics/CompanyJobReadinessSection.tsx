import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CompanyReadinessOverview, JobMatchOverview } from '../../types/analytics';

interface CompanyJobReadinessSectionProps {
  companies: CompanyReadinessOverview[];
  jobs: JobMatchOverview[];
  averageCompanyReadiness: number;
}

export function CompanyJobReadinessSection({
  companies,
  jobs,
  averageCompanyReadiness
}: CompanyJobReadinessSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Target Companies Matrix */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Target Company Readiness
              </CardTitle>
              <CardDescription className="text-xs">
                Profile compatibility evaluated against company hiring rubrics.
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary gap-1 self-start sm:self-auto h-8 hover:bg-primary/10"
              onClick={() => navigate('/readiness')}
            >
              All Companies <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border/60 text-xs">
            <span className="text-muted-foreground">Average Target Readiness</span>
            <span className="font-bold text-foreground text-sm">{averageCompanyReadiness}%</span>
          </div>

          <div className="space-y-2.5">
            {companies.slice(0, 4).map(company => (
              <div 
                key={company.name} 
                className="p-3 rounded-lg border border-border/50 bg-card/30 space-y-2 hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigate('/readiness')}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {company.logo}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{company.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">({company.industry})</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${
                    company.score >= 80 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : company.score >= 65 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {company.score}% Match
                  </Badge>
                </div>
                <Progress value={company.score} className="h-1.5" />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="text-emerald-400">{company.matchedSkillsCount} matched criteria</span>
                  <span className="text-amber-400">{company.missingSkillsCount} missing skills</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matched Job Positions */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Matched Job Opportunities
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time role alignment matching your verified skill stack.
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary gap-1 self-start sm:self-auto h-8 hover:bg-primary/10"
              onClick={() => navigate('/jobs')}
            >
              View All Jobs <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border/60 text-xs">
            <span className="text-muted-foreground">Active Matched Openings</span>
            <span className="font-bold text-foreground text-sm">{jobs.length} Positions</span>
          </div>

          <div className="space-y-2.5">
            {jobs.map(job => (
              <div 
                key={job.id} 
                className="p-3 rounded-lg border border-border/50 bg-card/30 space-y-2 hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => navigate('/jobs')}
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground block">{job.title}</span>
                    <span className="text-[10px] text-muted-foreground">{job.company} • {job.location}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/30">
                    {job.matchScore}% Match
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <span className="font-medium text-foreground">{job.salary}</span>
                  <span className="text-primary hover:underline flex items-center gap-1">
                    Apply on Jobs Board <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

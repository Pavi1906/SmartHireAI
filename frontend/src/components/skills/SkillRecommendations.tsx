import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillRecommendation } from '../../types/skills';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Sparkles, 
  Clock, 
  TrendingUp, 
  GraduationCap, 
  PlayCircle, 
  Briefcase, 
  Building2,
  ArrowUpRight,
  Layers
} from 'lucide-react';

interface SkillRecommendationsProps {
  recommendations: SkillRecommendation[];
  onSelectSkill: (skillName: string) => void;
}

export function SkillRecommendations({
  recommendations,
  onSelectSkill
}: SkillRecommendationsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI-Curated Skill Recommendations
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            High-leverage competencies tailored to boost your profile match across target employers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="bg-card hover:border-primary/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-foreground">
                      {rec.skill}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                      {rec.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1 leading-relaxed">
                    {rec.reason}
                  </CardDescription>
                </div>

                <Badge 
                  variant={rec.priority === 'Critical' ? 'destructive' : rec.priority === 'High' ? 'default' : 'secondary'}
                  className="text-[10px] shrink-0 uppercase font-semibold"
                >
                  {rec.priority} Priority
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {/* Expected Impact & Effort Pill Bar */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-secondary/40 p-2 rounded-lg border border-border/50 flex items-center gap-1.5 text-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate font-medium">{rec.expectedImpact}</span>
                </div>
                <div className="bg-secondary/40 p-2 rounded-lg border border-border/50 flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Effort: <strong className="text-foreground">{rec.estimatedEffort}</strong></span>
                </div>
              </div>

              {/* Prerequisites & Target Roles */}
              {rec.prerequisites && rec.prerequisites.length > 0 && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-foreground">Prerequisites:</span>
                  {rec.prerequisites.map((p, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-foreground">
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-border/50">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => navigate('/learning', { state: { targetSkill: rec.skill } })}
                  className="text-xs h-8 px-2 flex items-center justify-center gap-1"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Learn</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/interviews', { state: { practiceSkill: rec.skill } })}
                  className="text-xs h-8 px-2 flex items-center justify-center gap-1"
                >
                  <PlayCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Practice</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/jobs', { state: { filterSkill: rec.skill } })}
                  className="text-xs h-8 px-2 flex items-center justify-center gap-1"
                >
                  <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Jobs</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/readiness', { state: { targetSkill: rec.skill } })}
                  className="text-xs h-8 px-2 flex items-center justify-center gap-1"
                >
                  <Building2 className="h-3.5 w-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Readiness</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

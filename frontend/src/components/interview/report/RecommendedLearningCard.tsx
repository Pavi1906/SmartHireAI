import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { InterviewReportEvaluation } from '../../../types/interview';
import { 
  GraduationCap, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  BookOpen 
} from 'lucide-react';

interface RecommendedLearningCardProps {
  modules: InterviewReportEvaluation['recommendedModules'];
}

export function RecommendedLearningCard({ modules }: RecommendedLearningCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="border border-primary/20 bg-primary/[0.02] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Targeted Learning Roadmap Recommendations
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Remediate identified interview weaknesses with tailored interactive lessons, simulations, and coding exercises.
            </CardDescription>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/learning')}
            className="gap-1.5 text-xs self-start sm:self-auto"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            Explore All Modules
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map((m) => {
            const isCrit = m.priority === 'Critical';
            return (
              <div 
                key={m.moduleId}
                className="flex flex-col justify-between p-4 rounded-xl bg-card border border-border/70 shadow-2xs hover:border-primary/40 transition-all space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${
                        isCrit 
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' 
                          : 'bg-primary/10 text-primary border-primary/30'
                      }`}
                    >
                      {m.priority} Priority
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {m.duration}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                    {m.title}
                  </h4>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {m.reason}
                  </p>

                  <div className="pt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {m.skill}
                    </Badge>
                    <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {m.expectedImpact}
                    </span>
                  </div>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/learning/${m.moduleId}`)}
                  className="w-full gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                >
                  Start Module
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

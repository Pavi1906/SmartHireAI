import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningModuleData, UserModuleProgress } from '../../types/learning';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  BarChart, 
  Flame,
  CheckCircle,
  Play
} from 'lucide-react';

interface ModuleCardProps {
  key?: string | number;
  module: LearningModuleData;
  progress?: UserModuleProgress;
}

export function ModuleCard({ module, progress }: ModuleCardProps) {
  const navigate = useNavigate();

  const status = progress?.status || 'NOT_STARTED';
  const progressPercent = progress?.progressPercent || 0;
  const completedStages = progress?.completedStages || [];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <Badge variant="destructive" className="text-[10px] font-semibold gap-1"><Flame className="h-3 w-3" /> Critical Gap</Badge>;
      case 'High':
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">High Priority</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Standard</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'COMPLETED':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-semibold gap-1"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] font-semibold">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground text-[10px]">Not Started</Badge>;
    }
  };

  const stagesList = [
    { label: 'Lesson', index: 0 },
    { label: 'Interactive', index: 1 },
    { label: 'Coding', index: 2 },
    { label: 'Quiz', index: 3 },
    { label: 'Assessment', index: 4 },
  ];

  const handleAction = () => {
    navigate(`/learning/${module.id}`, { state: { module } });
  };

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all duration-200 group bg-card shadow-sm hover:shadow-md">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getPriorityBadge(module.priority)}
            {getStatusBadge(status)}
          </div>
          <span className="text-xs text-muted-foreground flex items-center font-mono">
            <Clock className="h-3 w-3 mr-1" /> {module.estimatedEffort}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider text-primary border-primary/30">
              {module.category}
            </Badge>
            <span className="text-xs text-muted-foreground">• {module.difficulty}</span>
          </div>
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
            {module.title}
          </CardTitle>
          <CardDescription className="text-xs line-clamp-2 leading-relaxed mt-1">
            {module.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        {/* Expected Impact Tag */}
        <div className="bg-secondary/40 rounded-lg p-2.5 border border-border/50 flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Target Skill: <strong className="text-foreground">{module.skill}</strong>
          </span>
          <span className="text-emerald-400 font-semibold text-[11px]">{module.expectedImpact}</span>
        </div>

        {/* 5-Stage Step Progress Dots */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">5-Stage Completion</span>
            <span className="font-semibold text-foreground">{progressPercent}%</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {stagesList.map((st) => {
              const isDone = completedStages.includes(st.index);
              return (
                <div
                  key={st.index}
                  className={`h-1.5 rounded-full transition-colors ${
                    isDone 
                      ? 'bg-emerald-500' 
                      : status === 'IN_PROGRESS' && st.index === (progress?.currentStage || 0)
                      ? 'bg-primary animate-pulse'
                      : 'bg-secondary'
                  }`}
                  title={`${st.label}: ${isDone ? 'Completed' : 'Pending'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleAction}
          variant={status === 'COMPLETED' ? 'outline' : 'default'}
          className={`w-full text-xs font-semibold h-9 ${
            status === 'COMPLETED'
              ? 'hover:bg-primary/10 hover:text-primary'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {status === 'COMPLETED' ? (
            <span className="flex items-center gap-1.5">
              Review Module <ArrowRight className="h-3.5 w-3.5" />
            </span>
          ) : status === 'IN_PROGRESS' ? (
            <span className="flex items-center gap-1.5">
              Continue Module <ArrowRight className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Start Learning <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

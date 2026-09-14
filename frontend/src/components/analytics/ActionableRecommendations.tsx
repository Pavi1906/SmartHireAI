import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  Video, 
  BrainCircuit, 
  Briefcase 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnalyticsActionItem } from '../../types/analytics';

interface ActionableRecommendationsProps {
  actionItems: AnalyticsActionItem[];
}

export function ActionableRecommendations({ actionItems }: ActionableRecommendationsProps) {
  const navigate = useNavigate();

  const getCategoryIcon = (category: AnalyticsActionItem['category']) => {
    switch (category) {
      case 'learning':
        return <GraduationCap className="h-4 w-4 text-emerald-400" />;
      case 'interview':
        return <Video className="h-4 w-4 text-amber-400" />;
      case 'resume':
        return <BrainCircuit className="h-4 w-4 text-blue-400" />;
      default:
        return <Briefcase className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <Card className="border-border/80 shadow-sm bg-gradient-to-br from-card to-secondary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-lg font-semibold">
            Recommended High-ROI Next Actions
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Targeted actions calculated to produce the highest incremental boost to your placement score.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actionItems.map(item => (
            <div 
              key={item.id}
              className="p-4 rounded-xl border border-border/70 bg-card/60 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all shadow-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-muted/60">
                      {getCategoryIcon(item.category)}
                    </div>
                    <span className="font-semibold text-xs text-foreground leading-tight">
                      {item.title}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0 font-bold">
                    {item.impact}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                  {item.description}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <Button 
                  size="sm" 
                  className="text-xs h-7 gap-1.5"
                  onClick={() => navigate(item.route, { state: item.routeState })}
                >
                  {item.actionLabel}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

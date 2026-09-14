import React, { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChecklistItem } from '../../types/interview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

interface PreFlightChecklistProps {
  checklist: ChecklistItem[];
  onToggleItem: (id: string, completed: boolean) => void;
  onMarkAllDone?: () => void;
}

export function PreFlightChecklist({
  checklist,
  onToggleItem,
  onMarkAllDone
}: PreFlightChecklistProps) {
  const navigate = useNavigate();

  const completedCount = checklist.filter(c => c.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;
  const isAllReady = completedCount === checklist.length;

  const handleActionClick = (e: React.MouseEvent, item: ChecklistItem) => {
    e.stopPropagation();
    if (item.actionRoute && item.actionRoute !== '#') {
      navigate(item.actionRoute, { state: item.actionState });
    } else {
      onToggleItem(item.id, !item.completed);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Pre-Flight Preparation Checklist
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Complete these calibration milestones before starting the live simulation.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-muted-foreground">
              {completedCount} of {checklist.length} Ready
            </span>
            {onMarkAllDone && !isAllReady && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllDone}
                className="text-xs text-primary hover:text-primary/80 h-7 px-2"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1" /> Mark All Done
              </Button>
            )}
          </div>
        </div>

        <Progress value={progressPercent} className="h-1.5 mt-3" />
      </CardHeader>

      <CardContent className="p-6 pt-2 space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleItem(item.id, !item.completed)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              item.completed
                ? 'bg-emerald-500/5 border-emerald-500/30 text-foreground'
                : 'bg-secondary/30 hover:bg-secondary/50 border-border'
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <button
                type="button"
                className="mt-0.5 text-muted-foreground shrink-0 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleItem(item.id, !item.completed);
                }}
              >
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/60 hover:text-primary" />
                )}
              </button>

              <div className="space-y-0.5">
                <p className={`text-sm font-semibold leading-tight ${item.completed ? 'text-foreground font-medium' : 'text-foreground'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {item.actionLabel && (
              <Button
                variant={item.completed ? "outline" : "secondary"}
                size="sm"
                onClick={(e) => handleActionClick(e, item)}
                className="text-xs gap-1.5 h-8 shrink-0 self-end sm:self-center"
              >
                {item.actionLabel}
                {item.actionRoute && item.actionRoute !== '#' ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                )}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

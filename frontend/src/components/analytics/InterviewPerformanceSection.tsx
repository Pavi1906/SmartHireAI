import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Video, 
  TrendingUp, 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InterviewTrendPoint, InterviewTypeMetric } from '../../types/analytics';

interface InterviewPerformanceSectionProps {
  trendPoints: InterviewTrendPoint[];
  hasEnoughHistory: boolean;
  typeMetrics: InterviewTypeMetric[];
  averageScore: number | null;
  completedCount: number;
}

export function InterviewPerformanceSection({
  trendPoints,
  hasEnoughHistory,
  typeMetrics,
  averageScore,
  completedCount
}: InterviewPerformanceSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Mock Interview Performance Trajectory
              </CardTitle>
              <CardDescription className="text-xs">
                Historical score progression from evaluated mock interview sessions.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {completedCount} Completed Session{completedCount === 1 ? '' : 's'}
              </Badge>
              {averageScore !== null && (
                <Badge variant="success" className="text-xs">
                  Avg: {averageScore}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Chart or Meaningful Empty State */}
          {hasEnoughHistory ? (
            <div className="space-y-2">
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInterviewScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="formattedDate" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))', 
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: any) => [`${value}% Score`, 'Overall Evaluation']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      name="Score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorInterviewScore)" 
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-center text-muted-foreground">
                Chronological evaluations mapped directly from completed mock sessions.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border/80 bg-card/30 text-center space-y-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Video className="h-6 w-6" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  {completedCount === 1 
                    ? '1 Interview Recorded — Need 1 More for Trend' 
                    : 'No Mock Interview Data Yet'}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {completedCount === 1 
                    ? 'You have completed 1 interview session. Complete another round to visualize your performance trajectory and improvement curve.'
                    : 'Progress history will appear as you complete mock interview rounds. Simulate technical, coding, or behavioral rounds to evaluate your interview readiness.'}
                </p>
              </div>
              <Button 
                size="sm" 
                className="gap-2 text-xs"
                onClick={() => navigate('/interviews')}
              >
                <PlayCircle className="h-4 w-4" />
                {completedCount === 1 ? 'Take Next Interview' : 'Start First Mock Interview'}
              </Button>
            </div>
          )}

          {/* Round-by-Round Type Breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
              Interview Track Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {typeMetrics.map(track => {
                const isAttempted = track.completedSessions > 0;
                return (
                  <div 
                    key={track.type} 
                    className="p-3.5 rounded-lg border border-border/60 bg-card/40 space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">{track.type}</span>
                        {isAttempted ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold">
                            Avg: {track.averageScore}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                            Not Attempted
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {track.completedSessions} completed ({track.totalSessions} sessions created)
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {track.targetSkills.slice(0, 3).map(skill => (
                          <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-7 gap-1 mt-2 text-primary border-primary/20 hover:bg-primary/10"
                      onClick={() => navigate('/interviews')}
                    >
                      {isAttempted ? 'Retake Round' : 'Simulate Round'}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { PreparationStrength, PreparationGap } from '../../types/interview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BrainCircuit, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface StrengthsGapsSummaryProps {
  strengths: PreparationStrength[];
  criticalGaps: PreparationGap[];
  interviewType: string;
}

export function StrengthsGapsSummary({
  strengths,
  criticalGaps,
  interviewType
}: StrengthsGapsSummaryProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths Card */}
      <Card className="bg-card border-border">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Verified Strengths for {interviewType}
            </CardTitle>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs font-mono">
              {strengths.length} Verified
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Proven proficiencies identified from your resume and previous assessments.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-3">
          {strengths.length > 0 ? (
            strengths.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {item.skill}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] text-muted-foreground font-mono">
                      {item.category}
                    </Badge>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {item.score}%
                    </span>
                  </div>
                </div>

                {item.evidence && (
                  <p className="text-[11px] text-muted-foreground italic font-mono pl-3.5 leading-relaxed">
                    "{item.evidence}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No matching strengths recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Gaps Card */}
      <Card className="bg-card border-border">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Critical Focus Areas for {interviewType}
            </CardTitle>
            <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs font-mono">
              {criticalGaps.length} Action Items
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            High-yield technical and conceptual gaps to review prior to simulation.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-3">
          {criticalGaps.length > 0 ? (
            criticalGaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {gap.skill}
                  </span>
                  <Badge
                    className={`text-[10px] uppercase font-mono ${
                      gap.priority === 'Critical'
                        ? 'bg-destructive/20 text-destructive border-destructive/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {gap.priority} Gap
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">
                  {gap.recommendation}
                </p>

                <div className="pl-3.5 pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground/80 font-mono">
                    {gap.whyItMatters}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate('/learning', {
                        state: {
                          targetSkill: gap.skill,
                          targetGap: gap.skill
                        }
                      })
                    }
                    className="text-[11px] gap-1 h-7 px-2 shrink-0 ml-2"
                  >
                    <BookOpen className="h-3 w-3 text-primary" /> Study Topic
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No critical gaps identified for this round.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

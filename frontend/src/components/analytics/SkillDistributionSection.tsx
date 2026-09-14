import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkillCategoryMetric } from '../../types/analytics';

interface SkillDistributionSectionProps {
  categories: SkillCategoryMetric[];
  topStrengths: { name: string; score: number; category: string }[];
  criticalGaps: { name: string; score: number; category: string; impact: string }[];
  selectedDomain: string;
}

export function SkillDistributionSection({
  categories,
  topStrengths,
  criticalGaps,
  selectedDomain
}: SkillDistributionSectionProps) {
  const navigate = useNavigate();

  const filteredCategories = selectedDomain === 'All Domains'
    ? categories
    : categories.filter(c => c.category.toLowerCase().includes(selectedDomain.toLowerCase()) || selectedDomain.toLowerCase().includes(c.category.toLowerCase()));

  const filteredStrengths = selectedDomain === 'All Domains'
    ? topStrengths
    : topStrengths.filter(s => s.category.toLowerCase().includes(selectedDomain.toLowerCase()) || selectedDomain.toLowerCase().includes(s.category.toLowerCase()));

  const filteredGaps = selectedDomain === 'All Domains'
    ? criticalGaps
    : criticalGaps.filter(g => g.category.toLowerCase().includes(selectedDomain.toLowerCase()) || selectedDomain.toLowerCase().includes(g.category.toLowerCase()));

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              Skill Intelligence & Taxonomy Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Proficiency and market demand breakdown across domain disciplines parsed from your resume and evaluations.
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary gap-1 self-start sm:self-auto h-8 hover:bg-primary/10"
            onClick={() => navigate('/skills')}
          >
            Explore Skill Graph <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Breakdown Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(cat => (
              <div key={cat.category} className="p-3.5 rounded-lg border border-border/60 bg-card/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{cat.category}</span>
                    <span className="text-[10px] text-muted-foreground">({cat.total} skills)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-400 font-medium">{cat.strong} strong</span>
                    {cat.gaps > 0 && (
                      <span className="text-[11px] text-amber-400 font-medium">{cat.gaps} gap{cat.gaps === 1 ? '' : 's'}</span>
                    )}
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold">
                      {cat.averageScore}%
                    </Badge>
                  </div>
                </div>
                <Progress value={cat.averageScore} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                  <span>Foundational</span>
                  <span>Proficient</span>
                  <span>Advanced</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-6 text-center text-xs text-muted-foreground">
              No skills found for category "{selectedDomain}". Try selecting "All Domains".
            </div>
          )}
        </div>

        {/* Top Strengths & Critical Gaps Dual Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          {/* Strengths */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Verified Top Strengths ({filteredStrengths.length})
            </h4>
            {filteredStrengths.length > 0 ? (
              <div className="space-y-2">
                {filteredStrengths.map(skill => (
                  <div 
                    key={skill.name} 
                    className="flex items-center justify-between p-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <span className="text-[10px] text-muted-foreground">({skill.category})</span>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                      {skill.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                No high-scoring strengths detected in this domain.
              </p>
            )}
          </div>

          {/* Critical Gaps */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              High-Impact Skill Gaps ({filteredGaps.length})
            </h4>
            {filteredGaps.length > 0 ? (
              <div className="space-y-2">
                {filteredGaps.map(gap => (
                  <div 
                    key={gap.name} 
                    className="flex items-center justify-between p-2 rounded-md bg-amber-500/5 border border-amber-500/20 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{gap.name}</span>
                      <span className="text-[10px] text-amber-400/90 font-medium">({gap.impact})</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 text-[10px] px-2 text-primary hover:bg-primary/10"
                      onClick={() => navigate('/learning')}
                    >
                      Learn
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                No critical gaps identified in this selected domain.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

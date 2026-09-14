import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../../pages/settings/components/Switch';
import { Label } from '../../pages/settings/components/Label';
import { 
  BarChart3, 
  Sparkles, 
  ArrowUpRight, 
  FileText, 
  Video, 
  GraduationCap, 
  Network 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentAnalyticsOverview } from '../../types/analytics';

interface AnalyticsHeaderProps {
  userName?: string;
  overview: StudentAnalyticsOverview;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  availableDomains: string[];
}

export function AnalyticsHeader({
  userName,
  overview,
  isDemoMode,
  onToggleDemoMode,
  selectedDomain,
  onSelectDomain,
  availableDomains
}: AnalyticsHeaderProps) {
  const navigate = useNavigate();

  const getTierColor = (tier: StudentAnalyticsOverview['placementTier']) => {
    switch (tier) {
      case 'Tier-1 FAANG Ready':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'High-Growth Tech Ready':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Enterprise Ready':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Performance & Placement Analytics
                </h1>
                <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-medium ${getTierColor(overview.placementTier)}`}>
                  {overview.placementTier}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Deterministic placement readiness synthesizing your resume ATS, verified skills, learning roadmap, and mock interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode Toggle & Quick Shortcuts */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60 text-xs text-muted-foreground shadow-sm">
            <Switch 
              id="analytics-demo-mode" 
              checked={isDemoMode} 
              onCheckedChange={onToggleDemoMode} 
            />
            <Label htmlFor="analytics-demo-mode" className="cursor-pointer font-medium text-foreground">
              Demo Mode
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1.5 text-xs h-8"
              onClick={() => navigate('/resume')}
            >
              <FileText className="h-3.5 w-3.5" />
              Resume
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1.5 text-xs h-8"
              onClick={() => navigate('/learning')}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Roadmap
            </Button>
            <Button 
              size="sm" 
              className="gap-1.5 text-xs h-8"
              onClick={() => navigate('/interviews')}
            >
              <Video className="h-3.5 w-3.5" />
              Mock Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Domain Category Filter Tabs */}
      <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/60">
          {availableDomains.map(domain => {
            const isSelected = selectedDomain === domain;
            return (
              <button
                key={domain}
                type="button"
                onClick={() => onSelectDomain(domain)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  isSelected 
                    ? 'bg-card text-foreground shadow-sm font-semibold border border-border/80' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                {domain}
              </button>
            );
          })}
        </div>
        
        <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
          Profile verified against 12+ industry benchmarks
        </span>
      </div>
    </div>
  );
}

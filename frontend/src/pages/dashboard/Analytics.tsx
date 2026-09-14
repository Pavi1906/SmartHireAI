import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { toggleDemoMode } from '../../store/slices/resumeSlice';
import { computeStudentAnalytics } from '../../services/analyticsService';

import { AnalyticsHeader } from '../../components/analytics/AnalyticsHeader';
import { PlacementReadinessCard } from '../../components/analytics/PlacementReadinessCard';
import { SkillDistributionSection } from '../../components/analytics/SkillDistributionSection';
import { InterviewPerformanceSection } from '../../components/analytics/InterviewPerformanceSection';
import { LearningMilestonesSection } from '../../components/analytics/LearningMilestonesSection';
import { CompanyJobReadinessSection } from '../../components/analytics/CompanyJobReadinessSection';
import { ActionableRecommendations } from '../../components/analytics/ActionableRecommendations';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  FileText, 
  Sparkles, 
  UploadCloud, 
  ArrowRight,
  BarChart3,
  Video,
  GraduationCap
} from 'lucide-react';

export function Analytics() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);

  const [selectedDomain, setSelectedDomain] = useState<string>('All Domains');

  // Compute analytics dynamically from current state
  const analyticsData = useMemo(() => {
    return computeStudentAnalytics(activeResume, Boolean(isDemoMode), user?.id);
  }, [activeResume, isDemoMode, user?.id]);

  const handleToggleDemo = (enabled: boolean) => {
    dispatch(toggleDemoMode(enabled));
  };

  // If no resume and demo mode is OFF, render a clear empty state with actionable CTAs
  if (!analyticsData) {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Performance Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your placement probability, skill growth, and interview benchmark metrics.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 self-start sm:self-auto text-xs"
            onClick={() => handleToggleDemo(true)}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Enable Demo Mode
          </Button>
        </div>

        <Card className="border-dashed border-2 border-border/80 bg-card/40 py-12 px-6 text-center">
          <CardContent className="max-w-md mx-auto space-y-5 p-0">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary border border-primary/20">
              <BarChart3 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                No Career Data Available Yet
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload your resume to instantly generate ATS scores, skill gap taxonomy, tailored roadmap milestones, and mock interview performance tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button 
                className="w-full sm:w-auto gap-2 text-xs"
                onClick={() => navigate('/resume')}
              >
                <UploadCloud className="h-4 w-4" />
                Upload Resume
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto gap-2 text-xs"
                onClick={() => handleToggleDemo(true)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Explore Demo Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableDomains = [
    'All Domains',
    ...analyticsData.skillCategories.map(c => c.category)
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header with Title, Tier Badge, Domain Filters, and Shortcuts */}
      <AnalyticsHeader 
        userName={user?.name}
        overview={analyticsData.overview}
        isDemoMode={Boolean(isDemoMode)}
        onToggleDemoMode={handleToggleDemo}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
        availableDomains={availableDomains}
      />

      {/* Main Placement Readiness Scorecard */}
      <PlacementReadinessCard overview={analyticsData.overview} />

      {/* Actionable Recommendations Section */}
      <ActionableRecommendations actionItems={analyticsData.actionItems} />

      {/* Grid: Skill Distribution & Learning Milestones */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SkillDistributionSection 
            categories={analyticsData.skillCategories}
            topStrengths={analyticsData.topStrengths}
            criticalGaps={analyticsData.criticalGaps}
            selectedDomain={selectedDomain}
          />
        </div>
        <div>
          <LearningMilestonesSection overview={analyticsData.overview} />
        </div>
      </div>

      {/* Interview Performance Section */}
      <InterviewPerformanceSection 
        trendPoints={analyticsData.interviewTrend}
        hasEnoughHistory={analyticsData.hasEnoughInterviewHistory}
        typeMetrics={analyticsData.interviewTypeMetrics}
        averageScore={analyticsData.overview.interviewAverage}
        completedCount={analyticsData.overview.completedInterviewsCount}
      />

      {/* Target Companies & Job Opportunities */}
      <CompanyJobReadinessSection 
        companies={analyticsData.companies}
        jobs={analyticsData.jobs}
        averageCompanyReadiness={analyticsData.overview.averageCompanyReadiness}
      />
    </div>
  );
}

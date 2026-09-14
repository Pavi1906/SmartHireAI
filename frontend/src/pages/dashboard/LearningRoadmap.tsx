import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { 
  getTailoredRoadmapModules, 
  loadUserLearningProgress 
} from '../../services/learningService';
import { LearningModuleData, ModuleCategory } from '../../types/learning';
import { RoadmapOverview } from '../../components/learning/RoadmapOverview';
import { RoadmapFilterBar } from '../../components/learning/RoadmapFilterBar';
import { ModuleCard } from '../../components/learning/ModuleCard';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  FileText, 
  Sparkles, 
  SearchX, 
  GraduationCap, 
  ArrowRight,
  BrainCircuit,
  Building2,
  RefreshCw
} from 'lucide-react';

export function LearningRoadmap() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);

  // Deep linking initial filter state from other pages (Skill Intelligence, Readiness, etc.)
  const deepLinkSkill = location.state?.targetSkill || location.state?.targetGap || '';
  const deepLinkCategory = location.state?.category || '';

  // Filter States
  const [searchQuery, setSearchQuery] = useState(deepLinkSkill);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>(deepLinkCategory || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Load tailored modules & user progress
  const [userProgressMap, setUserProgressMap] = useState(() => loadUserLearningProgress(user?.id));

  useEffect(() => {
    setUserProgressMap(loadUserLearningProgress(user?.id));
  }, [user?.id, activeResume]);

  const { modules, summary } = useMemo(() => {
    return getTailoredRoadmapModules(activeResume, isDemoMode, user?.id);
  }, [activeResume, isDemoMode, user?.id, userProgressMap]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<ModuleCategory>();
    modules.forEach(m => set.add(m.category));
    return Array.from(set);
  }, [modules]);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      const progress = userProgressMap[module.id];
      const status = progress?.status || 'NOT_STARTED';

      // Status filter
      if (selectedStatus !== 'ALL' && status !== selectedStatus) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && module.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && module.priority !== selectedPriority) {
        return false;
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = module.title.toLowerCase().includes(q);
        const matchesSkill = module.skill.toLowerCase().includes(q);
        const matchesDesc = module.description.toLowerCase().includes(q);
        const matchesRelated = module.relatedSkills.some(r => r.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSkill && !matchesDesc && !matchesRelated) {
          return false;
        }
      }

      return true;
    });
  }, [modules, userProgressMap, selectedStatus, selectedCategory, selectedPriority, searchQuery]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || 
    selectedStatus !== 'ALL' || 
    selectedCategory !== 'ALL' || 
    selectedPriority !== 'ALL'
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
  };

  // EMPTY STATE: No active resume and demo mode OFF
  if (!activeResume && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card rounded-2xl border border-border max-w-2xl mx-auto space-y-4 animate-fade-in my-8">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-foreground">No Resume Available</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Upload your resume to generate an AI-tailored learning roadmap calibrated specifically to your target roles and critical skill gaps.
          </p>
        </div>
        <Button onClick={() => navigate('/resume')} className="gap-2 text-xs font-semibold h-10 px-5">
          <FileText className="h-4 w-4" /> Upload Resume
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Personalized Curriculum
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Learning Roadmap
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Master high-yield technical and architectural proficiencies targeting Tier-1 software engineering standards.
          </p>
        </div>

        {/* Quick Navigation Links */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/skills')}
            className="text-xs gap-1.5 h-9"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-primary" /> Skill Graph
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/readiness')}
            className="text-xs gap-1.5 h-9"
          >
            <Building2 className="h-3.5 w-3.5 text-primary" /> Company Readiness
          </Button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <RoadmapOverview
        summary={summary}
        onFilterStatus={(status) => setSelectedStatus(status)}
      />

      {/* Filter and Search Bar */}
      <RoadmapFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        categories={categories}
      />

      {/* Modules Grid */}
      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              progress={userProgressMap[module.id]}
            />
          ))}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-border space-y-3">
          <SearchX className="h-10 w-10 text-muted-foreground/60" />
          <h3 className="text-base font-semibold text-foreground">
            No matching learning modules found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try adjusting your search query, priority, or category filters to explore other modules.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs gap-1.5 mt-2"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

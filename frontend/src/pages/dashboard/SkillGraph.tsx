import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { 
  generateSkillIntelligence 
} from '../../services/skillIntelligenceService';
import { 
  SkillIntelligenceData, 
  SkillItem, 
  SkillCategory 
} from '../../types/skills';
import { SkillGraphCanvas } from '../../components/skills/SkillGraphCanvas';
import { SkillDetailsModal } from '../../components/skills/SkillDetailsModal';
import { SkillGapAnalysis } from '../../components/skills/SkillGapAnalysis';
import { SkillRecommendations } from '../../components/skills/SkillRecommendations';
import { SkillFilters } from '../../components/skills/SkillFilters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { 
  BrainCircuit, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  UploadCloud, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight,
  Info,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';

export function SkillGraph() {
  const navigate = useNavigate();
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'graph' | 'technical' | 'soft' | 'gaps' | 'recommendations'>('graph');

  // Loading & Error States
  const [hasError, setHasError] = useState<boolean>(false);

  // Selected Skill for Drawer/Modal
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProficiency, setSelectedProficiency] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('score_desc');

  // Generate / Compute skill intelligence from active resume
  const intelligenceData: SkillIntelligenceData | null = useMemo(() => {
    try {
      return generateSkillIntelligence(activeResume, isDemoMode);
    } catch (e) {
      console.error('Failed to compute skill intelligence:', e);
      return null;
    }
  }, [activeResume, isDemoMode]);

  // Open modal handler
  const handleSelectSkillByName = (skillName: string) => {
    if (!intelligenceData) return;
    const found = intelligenceData.allSkills.find(
      s => s.name.toLowerCase() === skillName.toLowerCase()
    );
    if (found) {
      setSelectedSkill(found);
      setIsModalOpen(true);
    } else {
      // Create temporary item for gap / external skills
      const tempItem: SkillItem = {
        id: `temp-${skillName.toLowerCase()}`,
        name: skillName,
        category: 'System Architecture',
        proficiency: 'Missing',
        score: 45,
        status: 'gap',
        progress: 45,
        evidence: [],
        marketDemand: 'Very High',
        relatedSkills: ['Distributed Systems', 'Cloud & DevOps'],
        whyThisLevel: 'Recommended target skill identified from role requirements and industry benchmarks.',
        recommendedAction: 'Start dedicated learning roadmap and practice technical interview scenarios.',
        targetScore: 80,
        isSoftSkill: false
      };
      setSelectedSkill(tempItem);
      setIsModalOpen(true);
    }
  };

  // Filter & Sort Logic for Technical Skills
  const filteredTechnicalSkills = useMemo(() => {
    if (!intelligenceData) return [];
    let list = [...intelligenceData.technicalSkills];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q) ||
        (s.evidence && s.evidence.some(e => e.toLowerCase().includes(q)))
      );
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter(s => s.category === selectedCategory);
    }

    if (selectedProficiency !== 'ALL') {
      list = list.filter(s => s.proficiency === selectedProficiency);
    }

    if (selectedStatus !== 'ALL') {
      list = list.filter(s => s.status === selectedStatus);
    }

    list.sort((a, b) => {
      if (sortBy === 'score_desc') return b.score - a.score;
      if (sortBy === 'score_asc') return a.score - b.score;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });

    return list;
  }, [intelligenceData, searchQuery, selectedCategory, selectedProficiency, selectedStatus, sortBy]);

  // Unique categories for technical skills filter
  const technicalCategories = useMemo(() => {
    if (!intelligenceData) return [];
    const set = new Set<SkillCategory>();
    intelligenceData.technicalSkills.forEach(s => set.add(s.category));
    return Array.from(set);
  }, [intelligenceData]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'ALL' || selectedProficiency !== 'ALL' || selectedStatus !== 'ALL';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedProficiency('ALL');
    setSelectedStatus('ALL');
    setSortBy('score_desc');
  };

  // 1. EMPTY STATE: When no active resume exists and demo mode is OFF
  if (!activeResume && !isDemoMode) {
    return (
      <div className="space-y-8 animate-fade-in max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Skill Intelligence</h1>
            <p className="text-muted-foreground mt-1">
              AI-driven skill graph, gap analysis, and competency mapping.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-12 bg-card rounded-2xl border border-border space-y-5">
          <div className="h-16 w-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary">
            <UploadCloud className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold text-foreground">No Resume Available</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your resume to generate your personalized Skill Intelligence profile, interactive skill graph, and targeted industry gap analysis.
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => navigate('/resume')}
            className="gap-2 font-semibold shadow-lg shadow-primary/20"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Resume</span>
          </Button>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (hasError || !intelligenceData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-card rounded-xl border border-destructive/40 space-y-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h3 className="text-xl font-bold text-foreground">Unable to load Skill Intelligence</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There was an issue processing your skill topology. Please try refreshing or re-uploading your resume.
        </p>
        <Button 
          variant="outline"
          onClick={() => {
            setHasError(false);
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  const { stats, technicalSkills, softSkills, gaps, criticalGaps, recommendations, graph, targetRoleRecommendations } = intelligenceData;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      {/* Skill Details Modal / Drawer */}
      <SkillDetailsModal
        skill={selectedSkill}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectRelatedSkill={(name) => handleSelectSkillByName(name)}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <BrainCircuit className="h-8 w-8 text-primary" /> Skill Intelligence
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            AI-extracted competencies, interactive relationship graph, and industry gap benchmark for {activeResume?.name ? `"${activeResume.name}"` : 'Active Resume'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/resume')}
            className="text-xs gap-1.5 h-9"
          >
            <FileText className="h-4 w-4 text-primary" />
            <span>Update Resume</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/learning')}
            className="text-xs gap-1.5 h-9 font-semibold"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Learning Roadmap</span>
          </Button>
        </div>
      </div>

      {/* 1. Skill Intelligence Overview Metrics (Interactive) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Skills Card */}
        <Card 
          onClick={() => { setActiveTab('technical'); setSelectedStatus('ALL'); }}
          className="bg-card cursor-pointer hover:border-primary/50 transition-all group"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Skills</span>
              <Layers className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.totalSkills}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> {stats.verifiedSkillsCount} verified
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Strong Skills Card */}
        <Card 
          onClick={() => { setActiveTab('technical'); setSelectedStatus('strong'); }}
          className="bg-card cursor-pointer hover:border-emerald-500/50 transition-all group"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Strong Skills</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{stats.strongSkillsCount}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Proficiency &gt;= 80%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Developing Skills Card */}
        <Card 
          onClick={() => { setActiveTab('technical'); setSelectedStatus('developing'); }}
          className="bg-card cursor-pointer hover:border-amber-500/50 transition-all group"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Developing</span>
              <TrendingUp className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{stats.developingSkillsCount}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Proficiency 60% – 79%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Critical Gaps Card */}
        <Card 
          onClick={() => setActiveTab('gaps')}
          className="bg-card cursor-pointer hover:border-red-500/50 transition-all group"
        >
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Critical Gaps</span>
              <AlertTriangle className="h-4 w-4 text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{stats.criticalGapsCount}</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Top missing prerequisites
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Overall Skill Score Card */}
        <Card className="bg-card col-span-2 sm:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Skill Score</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{stats.overallSkillScore}%</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Market Index: <strong className="text-foreground">{stats.marketCompetitiveness}%</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Roles Quick Readiness Bar */}
      <Card className="bg-card/70 border-border/80">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <h4 className="text-sm font-bold text-foreground">Target Role Competency Alignment</h4>
                <p className="text-[11px] text-muted-foreground">Based on your evaluated technical skill topology</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto flex-1 lg:max-w-3xl">
              {targetRoleRecommendations.map((role, rIdx) => (
                <div 
                  key={rIdx} 
                  onClick={() => navigate('/jobs', { state: { targetRole: role.role } })}
                  className="bg-secondary/40 hover:bg-secondary/80 cursor-pointer p-2.5 rounded-lg border border-border/60 transition-colors space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground truncate">{role.role}</span>
                    <span className="text-primary font-bold text-xs">{role.readinessScore}%</span>
                  </div>
                  <Progress value={role.readinessScore} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === 'graph' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('graph')}
          className="text-xs font-semibold gap-2"
        >
          <BrainCircuit className="h-4 w-4" />
          <span>Interactive Skill Graph</span>
        </Button>

        <Button
          variant={activeTab === 'technical' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('technical')}
          className="text-xs font-semibold gap-2"
        >
          <Layers className="h-4 w-4" />
          <span>Technical Skills ({technicalSkills.length})</span>
        </Button>

        <Button
          variant={activeTab === 'soft' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('soft')}
          className="text-xs font-semibold gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>Soft Skills ({softSkills.length})</span>
        </Button>

        <Button
          variant={activeTab === 'gaps' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('gaps')}
          className="text-xs font-semibold gap-2"
        >
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span>Skill Gap Analysis ({gaps.length})</span>
        </Button>

        <Button
          variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('recommendations')}
          className="text-xs font-semibold gap-2"
        >
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span>AI Recommendations</span>
        </Button>
      </div>

      {/* TAB CONTENT 1: INTERACTIVE SKILL GRAPH */}
      {activeTab === 'graph' && (
        <div className="space-y-6">
          <SkillGraphCanvas
            nodes={graph.nodes}
            edges={graph.edges}
            onSelectSkill={handleSelectSkillByName}
            selectedSkillName={selectedSkill?.name}
          />

          {/* Quick Guidance Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="bg-card p-3.5 rounded-xl border border-border/80 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">Explore Nodes & Connections</strong>
                Click any node to open evidence, related technologies, and targeted practice workflows.
              </div>
            </div>

            <div className="bg-card p-3.5 rounded-xl border border-border/80 flex items-start gap-2.5">
              <Layers className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">Domain Clustering</strong>
                Skills are grouped radially into Frontend, Backend, DevOps, Data Science, and Soft Skills.
              </div>
            </div>

            <div className="bg-card p-3.5 rounded-xl border border-border/80 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">Dashed Red Nodes</strong>
                Indicate critical missing industry prerequisites identified by AI analysis.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TECHNICAL SKILLS */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <SkillFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedProficiency={selectedProficiency}
            onProficiencyChange={setSelectedProficiency}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            categories={technicalCategories}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Technical Skills Grid */}
          {filteredTechnicalSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTechnicalSkills.map((skill) => (
                <Card 
                  key={skill.id}
                  onClick={() => { setSelectedSkill(skill); setIsModalOpen(true); }}
                  className="bg-card hover:border-primary/50 transition-all cursor-pointer group space-y-3"
                >
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {skill.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {skill.category}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          skill.status === 'strong' ? 'default' : 
                          skill.status === 'developing' ? 'secondary' : 'destructive'
                        }
                        className="text-[10px] px-2 py-0.5 font-semibold"
                      >
                        {skill.proficiency}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-muted-foreground">Competency Score</span>
                        <span className="font-bold text-foreground">{skill.score}%</span>
                      </div>
                      <Progress value={skill.score} className="h-1.5" />
                    </div>

                    {skill.evidence && skill.evidence.length > 0 && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 italic bg-muted/20 p-1.5 rounded border border-border/40">
                        "{skill.evidence[0]}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>Demand: <strong className="text-foreground">{skill.marketDemand}</strong></span>
                      <span className="text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Details &rarr;
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border space-y-3">
              <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="text-base font-semibold text-foreground">No matching skills found</h4>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search query, domain filters, or reset to view all competencies.
              </p>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-xs">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: SOFT SKILLS */}
      {activeTab === 'soft' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {softSkills.map((skill) => (
              <Card 
                key={skill.id}
                onClick={() => { setSelectedSkill(skill); setIsModalOpen(true); }}
                className="bg-card hover:border-primary/50 transition-all cursor-pointer group"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {skill.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Behavioral Competency
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold">
                      {skill.proficiency} ({skill.score}%)
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  <Progress value={skill.score} className="h-1.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {skill.whyThisLevel}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <span className="text-[11px] text-muted-foreground">Market Demand: High</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs h-7 gap-1 text-primary p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/interviews', { state: { practiceSkill: skill.name } });
                      }}
                    >
                      <span>Practice Behavioral</span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SKILL GAP ANALYSIS */}
      {activeTab === 'gaps' && (
        <SkillGapAnalysis
          gaps={gaps}
          criticalGaps={criticalGaps}
          strongSkills={intelligenceData.allSkills.filter(s => s.score >= 80)}
          developingSkills={intelligenceData.allSkills.filter(s => s.score >= 60 && s.score < 80)}
          onSelectSkill={handleSelectSkillByName}
        />
      )}

      {/* TAB CONTENT 5: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-8">
          <SkillRecommendations
            recommendations={recommendations}
            onSelectSkill={handleSelectSkillByName}
          />
        </div>
      )}
    </div>
  );
}

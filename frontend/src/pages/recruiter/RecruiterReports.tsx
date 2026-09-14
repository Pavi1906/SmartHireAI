import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { calculateMatchScore } from '../../utils/matchScore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Users, Briefcase, TrendingUp, Filter, CheckCircle2, 
  AlertCircle, ArrowRight, FileText, Sparkles, Clock, Layers,
  Search, X, RotateCcw, Check, UserCheck, Target, BarChart2,
  Calendar, Award, PieChart, ShieldAlert, ArrowUpRight
} from 'lucide-react';

export function RecruiterReports() {
  const navigate = useNavigate();
  const { candidates, jobs, campaigns } = useSelector((state: RootState) => state.recruiter);

  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter jobs based on selection
  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (selectedJobId !== 'ALL') {
      result = result.filter(j => j.id === selectedJobId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }
    return result;
  }, [jobs, selectedJobId, searchQuery]);

  // Filter candidates based on selected job and search query
  const filteredCandidates = useMemo(() => {
    let result = candidates;
    if (selectedJobId !== 'ALL') {
      result = result.filter(c => c.jobId === selectedJobId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        const inName = c.name.toLowerCase().includes(q);
        const inRole = c.role.toLowerCase().includes(q);
        const inLoc = c.location ? c.location.toLowerCase().includes(q) : false;
        const skills = c.resumeData?.skills || c.matchedSkills || [];
        const inSkills = skills.some(s => s.toLowerCase().includes(q));
        return inName || inRole || inLoc || inSkills;
      });
    }
    return result;
  }, [candidates, selectedJobId, searchQuery]);

  // Empty state if workspace has no data at all
  if (candidates.length === 0 && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4 animate-fade-in max-w-xl mx-auto">
        <div className="p-4 rounded-full bg-secondary/30 text-muted-foreground">
          <TrendingUp className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">No hiring data available yet</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Create job requisitions and source candidates in your talent pipeline to unlock comprehensive recruitment analytics, stage funnels, and skill demand reports.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button onClick={() => navigate('/recruiter/jobs')} className="text-xs">
            <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Create Job Requisition
          </Button>
          <Button variant="outline" onClick={() => navigate('/candidates')} className="text-xs">
            <Layers className="h-3.5 w-3.5 mr-1.5" /> View Talent Pipeline
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. SUMMARY METRICS (Derived 100% from State)
  // ==========================================
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'published').length;
  const draftJobs = jobs.filter(j => j.status === 'draft').length;
  const closedJobs = jobs.filter(j => j.status === 'closed').length;
  const archivedJobs = jobs.filter(j => j.status === 'archived').length;

  const totalCandidates = filteredCandidates.length;
  const activeCandidates = filteredCandidates.filter(c => c.pipelineStage !== 'Hired' && c.pipelineStage !== 'Rejected').length;
  
  // Pipeline Stage Counts for Active Filter Scope
  const getStageCount = (stage: string) => filteredCandidates.filter(c => c.pipelineStage === stage).length;
  const sourced = getStageCount('Sourced');
  const screening = getStageCount('Screening');
  const shortlisted = getStageCount('Shortlisted');
  const interview = getStageCount('Interview');
  const selected = getStageCount('Selected');
  const offer = getStageCount('Offer');
  const hired = getStageCount('Hired');
  const rejected = getStageCount('Rejected');

  // ==========================================
  // 2. CONVERSION RATES (Safe zero-denominator)
  // ==========================================
  const shortlistRate = totalCandidates > 0 ? Math.round((shortlisted / totalCandidates) * 100) : 0;
  const interviewRate = shortlisted > 0 ? Math.round((interview / shortlisted) * 100) : 0;
  const offerRate = interview > 0 ? Math.round((offer / interview) * 100) : 0;
  const hireRate = totalCandidates > 0 ? Math.round((hired / totalCandidates) * 100) : 0;

  // ==========================================
  // 3. MATCH QUALITY (Canonical calculateMatchScore)
  // ==========================================
  const candidateMatchScores = useMemo(() => {
    if (filteredCandidates.length === 0 || jobs.length === 0) return [];
    return filteredCandidates.map(c => {
      const targetJob = jobs.find(j => j.id === c.jobId) || (selectedJobId !== 'ALL' ? jobs.find(j => j.id === selectedJobId) : null) || jobs[0];
      const match = targetJob ? calculateMatchScore(c, targetJob) : { matchScore: 0, confidence: 0, matchedSkills: [], missingSkills: [] };
      return {
        candidateId: c.id,
        candidateName: c.name,
        score: match.matchScore,
        confidence: match.confidence,
        jobTitle: targetJob?.title || 'Unknown'
      };
    });
  }, [filteredCandidates, jobs, selectedJobId]);

  const avgMatchScore = useMemo(() => {
    if (candidateMatchScores.length === 0) return 0;
    const sum = candidateMatchScores.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / candidateMatchScores.length);
  }, [candidateMatchScores]);

  const highMatchCount = candidateMatchScores.filter(s => s.score >= 80).length;
  const moderateMatchCount = candidateMatchScores.filter(s => s.score >= 60 && s.score < 80).length;
  const lowMatchCount = candidateMatchScores.filter(s => s.score < 60).length;

  const highMatchPct = candidateMatchScores.length > 0 ? Math.round((highMatchCount / candidateMatchScores.length) * 100) : 0;
  const moderateMatchPct = candidateMatchScores.length > 0 ? Math.round((moderateMatchCount / candidateMatchScores.length) * 100) : 0;
  const lowMatchPct = candidateMatchScores.length > 0 ? Math.round((lowMatchCount / candidateMatchScores.length) * 100) : 0;

  // ==========================================
  // 4. SKILL DEMAND (From real job requirements)
  // ==========================================
  const skillDemandMap = useMemo(() => {
    const map = new Map<string, { required: number; preferred: number }>();
    filteredJobs.forEach(job => {
      (job.requiredSkills || []).forEach(skill => {
        const s = skill.trim();
        if (s) {
          const current = map.get(s) || { required: 0, preferred: 0 };
          map.set(s, { ...current, required: current.required + 1 });
        }
      });
      (job.preferredSkills || []).forEach(skill => {
        const s = skill.trim();
        if (s) {
          const current = map.get(s) || { required: 0, preferred: 0 };
          map.set(s, { ...current, preferred: current.preferred + 1 });
        }
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => (b[1].required + b[1].preferred) - (a[1].required + a[1].preferred));
  }, [filteredJobs]);

  // ==========================================
  // 5. CANDIDATE SKILL SUPPLY (From real candidate resumes)
  // ==========================================
  const candidateSkillMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredCandidates.forEach(c => {
      const skills = c.resumeData?.skills || c.matchedSkills || [];
      skills.forEach(s => {
        const trimmed = s.trim();
        if (trimmed) {
          map.set(trimmed, (map.get(trimmed) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredCandidates]);

  // ==========================================
  // 6. ACTIONABLE INSIGHTS (Deterministic from State)
  // ==========================================
  const actionableInsights = useMemo(() => {
    const list: { title: string; desc: string; type: 'info' | 'warning' | 'success' }[] = [];

    if (interview > 0) {
      list.push({
        title: 'Interview Stage Action Required',
        desc: `${interview} candidate${interview === 1 ? '' : 's'} currently in the interview stage awaiting post-interview scoring or decision.`,
        type: 'info'
      });
    }

    const unassignedCandidates = candidates.filter(c => !c.jobId);
    if (unassignedCandidates.length > 0) {
      list.push({
        title: 'Unassigned Candidates in Pipeline',
        desc: `${unassignedCandidates.length} candidate profile${unassignedCandidates.length === 1 ? '' : 's'} not linked to a specific job requisition.`,
        type: 'warning'
      });
    }

    const emptyJobs = jobs.filter(j => j.status === 'published' && candidates.filter(c => c.jobId === j.id).length === 0);
    if (emptyJobs.length > 0) {
      list.push({
        title: 'Published Requisitions With Zero Applicants',
        desc: `${emptyJobs.length} active job posting${emptyJobs.length === 1 ? '' : 's'} have zero candidates in pipeline (${emptyJobs.map(j => j.title).slice(0, 2).join(', ')}${emptyJobs.length > 2 ? '...' : ''}).`,
        type: 'warning'
      });
    }

    if (shortlisted > 0) {
      list.push({
        title: 'Shortlisted Pool Ready',
        desc: `${shortlisted} candidate${shortlisted === 1 ? '' : 's'} shortlisted and eligible for interview scheduling.`,
        type: 'info'
      });
    }

    if (hired > 0) {
      list.push({
        title: 'Successful Hires',
        desc: `${hired} candidate${hired === 1 ? '' : 's'} marked as hired across current requisitions.`,
        type: 'success'
      });
    }

    if (list.length === 0) {
      list.push({
        title: 'Healthy Pipeline Equilibrium',
        desc: `Operating with ${totalCandidates} candidates across ${activeJobs} published requisitions with an average match score of ${avgMatchScore}%.`,
        type: 'info'
      });
    }

    return list;
  }, [interview, candidates, jobs, shortlisted, hired, totalCandidates, activeJobs, avgMatchScore]);

  const clearFilters = () => {
    setSelectedJobId('ALL');
    setSearchQuery('');
  };

  const isFiltered = selectedJobId !== 'ALL' || searchQuery.trim() !== '';

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl pb-16">
      
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Recruiting Reports & Analytics</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 font-medium">
              State-Driven Intelligence
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Audited hiring metrics, pipeline stage funnels, canonical match distributions, and real skill telemetry.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              id="reports-search-input"
              aria-label="Search reports data"
              placeholder="Search jobs, skills, roles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 h-9 text-xs w-[180px] sm:w-[220px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger id="reports-job-select" aria-label="Filter report by Job" className="w-[200px] h-9 text-xs font-semibold">
              <SelectValue placeholder="All Job Requisitions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs font-medium">
                All Jobs ({jobs.length})
              </SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id} className="text-xs">
                  {job.title} ({job.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-9 gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Scope Callout */}
      {isFiltered && (
        <div className="bg-secondary/20 border border-border p-3 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Showing metrics for:</span>
            <span className="font-semibold text-foreground">
              {selectedJobId !== 'ALL' ? (jobs.find(j => j.id === selectedJobId)?.title || selectedJobId) : 'All Jobs'}
            </span>
            {searchQuery && (
              <span className="text-muted-foreground font-mono">matching "{searchQuery}"</span>
            )}
          </div>
          <span className="text-muted-foreground font-medium">
            {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? '' : 's'} in scope
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SUMMARY KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" /> Executive Summary KPIs
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {/* Total Jobs */}
          <Card className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm" onClick={() => navigate('/recruiter/jobs')}>
            <CardHeader className="p-3.5 pb-1">
              <CardTitle className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
                Total Jobs <Briefcase className="h-3.5 w-3.5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-2xl font-extrabold text-foreground">{totalJobs}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {activeJobs} active • {draftJobs} draft • {closedJobs + archivedJobs} closed
              </p>
            </CardContent>
          </Card>

          {/* Total Candidates */}
          <Card className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm" onClick={() => navigate('/candidates')}>
            <CardHeader className="p-3.5 pb-1">
              <CardTitle className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
                Candidates <Users className="h-3.5 w-3.5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-2xl font-extrabold text-foreground">{totalCandidates}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {activeCandidates} active in pipeline
              </p>
            </CardContent>
          </Card>

          {/* Shortlisted */}
          <Card className="shadow-sm">
            <CardHeader className="p-3.5 pb-1">
              <CardTitle className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
                Shortlisted <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-2xl font-extrabold text-indigo-400">{shortlisted}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {shortlistRate}% of candidates
              </p>
            </CardContent>
          </Card>

          {/* Interviews */}
          <Card className="shadow-sm">
            <CardHeader className="p-3.5 pb-1">
              <CardTitle className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
                Interviews <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-2xl font-extrabold text-amber-400">{interview}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {interviewRate}% of shortlisted
              </p>
            </CardContent>
          </Card>

          {/* Offers & Selected */}
          <Card className="shadow-sm">
            <CardHeader className="p-3.5 pb-1">
              <CardTitle className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
                Selected / Offer <Award className="h-3.5 w-3.5 text-teal-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-2xl font-extrabold text-teal-400">{selected + offer}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {selected} selected • {offer} offered
              </p>
            </CardContent>
          </Card>

          {/* Hired */}
          <Card className="shadow-sm">
            <CardHeader className="p-3.5 pb-1">
              <CardTitle className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
                Hired <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-2xl font-extrabold text-purple-400">{hired}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {hireRate}% overall hire rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Detailed Metrics Pill Bar */}
        <div className="bg-card border border-border rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
          <div className="p-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Sourced</span>
            <span className="font-bold text-foreground">{sourced}</span>
          </div>
          <div className="p-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Screening</span>
            <span className="font-bold text-foreground">{screening}</span>
          </div>
          <div className="p-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Shortlisted</span>
            <span className="font-bold text-indigo-400">{shortlisted}</span>
          </div>
          <div className="p-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Interview</span>
            <span className="font-bold text-amber-400">{interview}</span>
          </div>
          <div className="p-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Selected</span>
            <span className="font-bold text-teal-400">{selected}</span>
          </div>
          <div className="p-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Offer</span>
            <span className="font-bold text-emerald-400">{offer}</span>
          </div>
          <div className="p-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Hired</span>
            <span className="font-bold text-purple-400">{hired}</span>
          </div>
          <div className="p-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Rejected</span>
            <span className="font-bold text-destructive">{rejected}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIONABLE INSIGHTS CALLOUT */}
      {/* ========================================================================= */}
      {actionableInsights.length > 0 && (
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Deterministic Recruitment Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Derived directly from real pipeline state and candidate progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {actionableInsights.map((insight, idx) => (
                <div key={idx} className="bg-card/70 border border-border/80 p-3 rounded-lg space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    {insight.type === 'warning' ? (
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    ) : insight.type === 'success' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    {insight.title}
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{insight.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 2. HIRING FUNNEL & MATCH QUALITY ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hiring Funnel Stage Progression */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Hiring Funnel & Stage Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Exact candidate counts across all 8 pipeline lifecycle stages
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {totalCandidates} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {[
              { label: 'Sourced', count: sourced, color: 'bg-slate-500' },
              { label: 'Screening', count: screening, color: 'bg-blue-500' },
              { label: 'Shortlisted', count: shortlisted, color: 'bg-indigo-500' },
              { label: 'Interview', count: interview, color: 'bg-amber-500' },
              { label: 'Selected', count: selected, color: 'bg-teal-500' },
              { label: 'Offer', count: offer, color: 'bg-emerald-500' },
              { label: 'Hired', count: hired, color: 'bg-purple-500' },
              { label: 'Rejected', count: rejected, color: 'bg-destructive' }
            ].map((stage) => {
              const pct = totalCandidates > 0 ? Math.round((stage.count / totalCandidates) * 100) : 0;
              return (
                <div key={stage.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground">{stage.label}</span>
                    <span className="text-muted-foreground">
                      {stage.count} candidate{stage.count === 1 ? '' : 's'} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} indicatorClassName={stage.color} className="h-2 bg-secondary/50" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Conversion Ratios & Canonical Match Analytics */}
        <Card className="flex flex-col justify-between shadow-sm">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Conversion & Match Quality</CardTitle>
                  <CardDescription className="text-xs">
                    Safe-zero conversion ratios and canonical algorithm score brackets
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-400 bg-emerald-500/10 border-emerald-500/30 text-xs">
                  Avg {avgMatchScore}%
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Funnel Efficiency Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-secondary/15 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[11px]">Shortlist Rate</span>
                  <span className="text-lg font-bold text-foreground">{shortlistRate}%</span>
                  <span className="text-[10px] text-muted-foreground block">Shortlisted / Total</span>
                </div>
                <div className="bg-secondary/15 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[11px]">Interview Rate</span>
                  <span className="text-lg font-bold text-foreground">{interviewRate}%</span>
                  <span className="text-[10px] text-muted-foreground block">Interview / Shortlisted</span>
                </div>
                <div className="bg-secondary/15 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[11px]">Offer Rate</span>
                  <span className="text-lg font-bold text-foreground">{offerRate}%</span>
                  <span className="text-[10px] text-muted-foreground block">Offer / Interview</span>
                </div>
                <div className="bg-secondary/15 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[11px]">Overall Hire Rate</span>
                  <span className="text-lg font-bold text-purple-400">{hireRate}%</span>
                  <span className="text-[10px] text-muted-foreground block">Hired / Total</span>
                </div>
              </div>

              {/* Match Score Distribution */}
              <div className="space-y-3 pt-1 border-t border-border">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Match Score Brackets (calculateMatchScore)</span>
                  <span className="font-normal normal-case text-[11px]">Evaluated across {candidateMatchScores.length} candidates</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> High Match (≥80%)
                    </span>
                    <span className="text-muted-foreground font-semibold">{highMatchCount} candidates ({highMatchPct}%)</span>
                  </div>
                  <Progress value={highMatchPct} indicatorClassName="bg-emerald-500" className="h-1.5 bg-secondary/50" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                      <Target className="h-3.5 w-3.5" /> Moderate Match (60–79%)
                    </span>
                    <span className="text-muted-foreground font-semibold">{moderateMatchCount} candidates ({moderateMatchPct}%)</span>
                  </div>
                  <Progress value={moderateMatchPct} indicatorClassName="bg-amber-500" className="h-1.5 bg-secondary/50" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-destructive font-medium">
                      <AlertCircle className="h-3.5 w-3.5" /> Low Match (&lt;60%)
                    </span>
                    <span className="text-muted-foreground font-semibold">{lowMatchCount} candidates ({lowMatchPct}%)</span>
                  </div>
                  <Progress value={lowMatchPct} indicatorClassName="bg-destructive" className="h-1.5 bg-secondary/50" />
                </div>
              </div>
            </CardContent>
          </div>

          <div className="p-6 pt-0">
            <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/campaigns')} className="text-xs">
                Sourcing Campaigns <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/candidates')} className="text-xs">
                Talent Pipeline <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 3. JOB PERFORMANCE & SKILL INTELLIGENCE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Job Performance Breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Job Requisition Performance</CardTitle>
                <CardDescription className="text-xs">
                  Candidate pipeline progression per job requisition
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredJobs.length} Requisition{filteredJobs.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredJobs.map(job => {
                const jobCandidates = candidates.filter(c => c.jobId === job.id);
                const jShortlisted = jobCandidates.filter(c => c.pipelineStage === 'Shortlisted').length;
                const jInterview = jobCandidates.filter(c => c.pipelineStage === 'Interview').length;
                const jSelected = jobCandidates.filter(c => c.pipelineStage === 'Selected').length;
                const jOffer = jobCandidates.filter(c => c.pipelineStage === 'Offer').length;
                const jHired = jobCandidates.filter(c => c.pipelineStage === 'Hired').length;
                const jRejected = jobCandidates.filter(c => c.pipelineStage === 'Rejected').length;

                const jobAvgMatch = jobCandidates.length > 0 
                  ? Math.round(jobCandidates.reduce((acc, c) => acc + calculateMatchScore(c, job).matchScore, 0) / jobCandidates.length)
                  : 0;

                return (
                  <div key={job.id} className="bg-secondary/15 border border-border p-3.5 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 
                          className="font-bold text-sm text-foreground hover:text-primary cursor-pointer transition-colors"
                          onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                        >
                          {job.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {job.department} • {job.location} • {job.workplaceType}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {jobCandidates.length > 0 && (
                          <Badge variant="outline" className="text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-medium">
                            {jobAvgMatch}% Match
                          </Badge>
                        )}
                        <Badge 
                          variant={job.status === 'published' ? 'default' : 'secondary'} 
                          className="text-[10px] uppercase font-mono"
                        >
                          {job.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-border/60 text-center text-xs">
                      <div className="bg-card/50 p-1.5 rounded-lg border border-border/40">
                        <span className="text-muted-foreground block text-[10px]">Applicants</span>
                        <span className="font-bold text-foreground">{jobCandidates.length}</span>
                      </div>
                      <div className="bg-card/50 p-1.5 rounded-lg border border-border/40">
                        <span className="text-muted-foreground block text-[10px]">Shortlist</span>
                        <span className="font-bold text-indigo-400">{jShortlisted}</span>
                      </div>
                      <div className="bg-card/50 p-1.5 rounded-lg border border-border/40">
                        <span className="text-muted-foreground block text-[10px]">Interview</span>
                        <span className="font-bold text-amber-400">{jInterview}</span>
                      </div>
                      <div className="bg-card/50 p-1.5 rounded-lg border border-border/40">
                        <span className="text-muted-foreground block text-[10px]">Offers</span>
                        <span className="font-bold text-teal-400">{jSelected + jOffer}</span>
                      </div>
                      <div className="bg-card/50 p-1.5 rounded-lg border border-border/40">
                        <span className="text-muted-foreground block text-[10px]">Hired</span>
                        <span className="font-bold text-purple-400">{jHired}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredJobs.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No job requisitions found matching current filter.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skill Demand vs Candidate Skill Supply */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Skill Intelligence & Telemetry</CardTitle>
            <CardDescription className="text-xs">
              Direct telemetry from job requisition criteria vs candidate resume supply
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Requisition Skill Demand */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" /> Requisition Skill Demand ({skillDemandMap.length})
                </h4>
                <span className="text-[10px] text-muted-foreground">From active job specifications</span>
              </div>
              
              <div className="space-y-2">
                {skillDemandMap.slice(0, 6).map(([skill, counts]) => (
                  <div key={skill} className="flex items-center justify-between bg-secondary/15 px-3 py-2 rounded-lg text-xs border border-border/50">
                    <span className="font-semibold text-foreground">{skill}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
                        {counts.required} required
                      </Badge>
                      {counts.preferred > 0 && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          +{counts.preferred} bonus
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {skillDemandMap.length === 0 && (
                  <p className="text-xs text-muted-foreground italic py-2">No skill requirements defined in selected job requisitions.</p>
                )}
              </div>
            </div>

            {/* Candidate Resume Skill Supply */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Candidate Skill Supply ({candidateSkillMap.length})
                </h4>
                <span className="text-[10px] text-muted-foreground">From parsed candidate resumes</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {candidateSkillMap.slice(0, 12).map(([skill, count]) => (
                  <Badge key={skill} variant="secondary" className="text-xs font-medium py-1 px-2.5 bg-secondary/40 border border-border">
                    {skill} <span className="ml-1 text-primary font-bold">({count})</span>
                  </Badge>
                ))}
                {candidateSkillMap.length === 0 && (
                  <p className="text-xs text-muted-foreground italic py-2">No candidate skill profiles available.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 4. HONEST SOURCE & TIME-TO-HIRE EMPTY STATES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Source Analytics - Honest Unpopulated State */}
        <Card className="border-dashed border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" /> Candidate Source Attribution
            </CardTitle>
            <CardDescription className="text-xs">
              Channel distribution (LinkedIn, Referral, Direct, Indeed)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-secondary/40 flex items-center justify-center text-muted-foreground">
              <FileText className="h-5 w-5 opacity-60" />
            </div>
            <p className="text-xs text-foreground font-semibold">Source Attribution Unpopulated</p>
            <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed">
              Candidate acquisition channels are currently not recorded on uploaded resume profiles. In accordance with data integrity guidelines, no synthetic attribution data is generated.
            </p>
          </CardContent>
        </Card>

        {/* Time-to-Hire Analytics - Honest State */}
        <Card className="border-dashed border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Time-to-Hire Velocity
            </CardTitle>
            <CardDescription className="text-xs">
              Duration from initial application to offer acceptance
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-secondary/40 flex items-center justify-center text-muted-foreground">
              <Clock className="h-5 w-5 opacity-60" />
            </div>
            <p className="text-xs text-foreground font-semibold">Insufficient Lifecycle Timestamps</p>
            <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed">
              Accurate duration calculation requires verified start-to-hire timestamp pairs. No synthetic time-to-hire metrics are fabricated.
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

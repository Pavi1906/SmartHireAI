import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { updateCandidateStage } from '../../store/slices/recruiterSlice';
import { Candidate, CandidatePipelineStage } from '../../types/recruiter';
import { calculateMatchScore, MatchResult } from '../../utils/matchScore';
import { candidateService } from '../../services/candidateService';
import { applicationService } from '../../services/applicationService';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  Search, 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  CheckSquare, 
  Square, 
  UserCheck, 
  UserX, 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  Users, 
  Download, 
  ExternalLink, 
  X, 
  GraduationCap, 
  Clock, 
  Mail, 
  Phone, 
  Globe, 
  Github, 
  Linkedin, 
  RotateCcw,
  Check,
  Building,
  Target
} from 'lucide-react';

export function JobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { jobs, campaigns } = useAppSelector((state: RootState) => state.recruiter);
  const { user } = useAppSelector((state: RootState) => state.auth);

  // Local state for API candidates
  const [localCandidates, setLocalCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (jobId) {
      setLoading(true);
      candidateService.listCandidates(jobId)
        .then(data => {
          setLocalCandidates(data);
          setError(null);
        })
        .catch(err => {
          console.error("Failed to fetch candidates:", err);
          setError("Failed to load applicants for this job.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [jobId]);

  // Exact job lookup
  const job = useMemo(() => {
    return jobs.find(j => j.id === jobId);
  }, [jobs, jobId]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');
  const [scoreFilter, setScoreFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('match-desc');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Profile modal state
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'resume' | 'matching'>('overview');

  // CRITICAL: Job-specific candidate isolation.
  // Since we fetch by jobId, localCandidates are already isolated.
  const jobCandidates = localCandidates;

  // Derive active candidate strictly from live state
  const activeCandidate = useMemo(() => {
    if (!activeCandidateId) return null;
    return localCandidates.find(c => c.id === activeCandidateId) || null;
  }, [localCandidates, activeCandidateId]);

  // Calculate canonical match result for the active candidate against the current job
  const activeCandidateMatch: MatchResult | null = useMemo(() => {
    if (!job || !activeCandidate) return null;
    return calculateMatchScore(activeCandidate, job);
  }, [activeCandidate, job]);

  // Extract all unique skills across applicants for this specific job
  const availableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    jobCandidates.forEach(c => {
      const skills = c.resumeData?.skills || c.matchedSkills || [];
      skills.forEach(s => {
        if (s && s.trim()) skillSet.add(s.trim());
      });
    });
    return Array.from(skillSet).sort();
  }, [jobCandidates]);

  // Filter & Sort candidates
  const filteredCandidates = useMemo(() => {
    let result = [...jobCandidates];

    // Search query: name, role, location, skills
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        const inName = c.name.toLowerCase().includes(q);
        const inRole = c.role.toLowerCase().includes(q);
        const inLoc = c.location ? c.location.toLowerCase().includes(q) : false;
        const skills = c.resumeData?.skills || c.matchedSkills || [];
        const inSkills = skills.some(s => s.toLowerCase().includes(q));
        const inEmail = c.email ? c.email.toLowerCase().includes(q) : false;
        return inName || inRole || inLoc || inSkills || inEmail;
      });
    }

    // Stage filter
    if (stageFilter !== 'ALL') {
      result = result.filter(c => c.pipelineStage === stageFilter);
    }

    // Skill filter
    if (selectedSkillFilter !== 'ALL') {
      result = result.filter(c => {
        const skills = c.resumeData?.skills || c.matchedSkills || [];
        return skills.some(s => s.toLowerCase() === selectedSkillFilter.toLowerCase());
      });
    }

    // Match Score filter
    if (scoreFilter !== 'ALL' && job) {
      result = result.filter(c => {
        const score = calculateMatchScore(c, job).matchScore;
        if (scoreFilter === 'high') return score >= 80;
        if (scoreFilter === 'medium') return score >= 60 && score < 80;
        if (scoreFilter === 'low') return score < 60;
        return true;
      });
    }

    // Sorting without mutating source array
    result.sort((a, b) => {
      if (sortBy === 'match-desc') {
        const scoreA = job ? calculateMatchScore(a, job).matchScore : 0;
        const scoreB = job ? calculateMatchScore(b, job).matchScore : 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'match-asc') {
        const scoreA = job ? calculateMatchScore(a, job).matchScore : 0;
        const scoreB = job ? calculateMatchScore(b, job).matchScore : 0;
        return scoreA - scoreB;
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'newest') {
        const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }, [jobCandidates, searchQuery, stageFilter, selectedSkillFilter, scoreFilter, sortBy, job]);

  // Action: Shortlist candidate
  const handleShortlist = async (id: string) => {
    const candidate = localCandidates.find(c => c.id === id);
    if (!candidate || !candidate.applicationId) return;
    try {
      await applicationService.updateApplicationStage(candidate.applicationId, 'Shortlisted');
      setLocalCandidates(prev => prev.map(c => c.id === id ? { ...c, pipelineStage: 'Shortlisted' as CandidatePipelineStage } : c));
    } catch (err) {
      console.error("Failed to shortlist:", err);
      alert("Failed to shortlist candidate.");
    }
  };

  // Action: Reject candidate
  const handleReject = async (id: string) => {
    const candidate = localCandidates.find(c => c.id === id);
    if (!candidate || !candidate.applicationId) return;
    try {
      await applicationService.rejectApplication(candidate.applicationId);
      setLocalCandidates(prev => prev.map(c => c.id === id ? { ...c, pipelineStage: 'Rejected' as CandidatePipelineStage } : c));
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject candidate.");
    }
  };

  // Action: Move candidate to Pipeline Board
  const handleMoveToPipeline = async (candidateId: string) => {
    const candidate = localCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    let nextStage: CandidatePipelineStage = candidate.pipelineStage;
    if (candidate.pipelineStage === 'Sourced') {
      nextStage = 'Screening';
      if (candidate.applicationId) {
        try {
          await applicationService.updateApplicationStage(candidate.applicationId, nextStage);
          setLocalCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, pipelineStage: nextStage } : c));
        } catch (err) {
          console.error("Failed to advance to Screening:", err);
        }
      }
    }

    // Navigate to pipeline with job and candidate context
    navigate('/candidates', { 
      state: { 
        jobId: job?.id, 
        candidateId: candidateId 
      } 
    });
  };

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map(c => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      setSelectedCandidateIds(selectedCandidateIds.filter(item => item !== id));
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const handleBulkShortlist = async () => {
    for (const id of selectedCandidateIds) {
      const candidate = localCandidates.find(c => c.id === id);
      if (candidate?.applicationId) {
        try {
          await applicationService.updateApplicationStage(candidate.applicationId, 'Shortlisted');
        } catch (err) {
          console.error("Failed bulk shortlist for", id, err);
        }
      }
    }
    setLocalCandidates(prev => prev.map(c => selectedCandidateIds.includes(c.id) ? { ...c, pipelineStage: 'Shortlisted' as CandidatePipelineStage } : c));
    setSelectedCandidateIds([]);
  };

  const handleBulkReject = async () => {
    for (const id of selectedCandidateIds) {
      const candidate = localCandidates.find(c => c.id === id);
      if (candidate?.applicationId) {
        try {
          await applicationService.rejectApplication(candidate.applicationId);
        } catch (err) {
          console.error("Failed bulk reject for", id, err);
        }
      }
    }
    setLocalCandidates(prev => prev.map(c => selectedCandidateIds.includes(c.id) ? { ...c, pipelineStage: 'Rejected' as CandidatePipelineStage } : c));
    setSelectedCandidateIds([]);
  };

  // Download parsed resume as genuine formatted text summary file
  const handleDownloadResume = (candidate: Candidate) => {
    const resume = candidate.resumeData;
    if (!resume) return;

    const sections: string[] = [];
    sections.push(`=======================================================`);
    sections.push(`RESUME SUMMARY: ${candidate.name.toUpperCase()}`);
    sections.push(`Target Requisition: ${job?.title || candidate.role}`);
    sections.push(`Status: ${candidate.pipelineStage}`);
    sections.push(`=======================================================\n`);

    sections.push(`CONTACT INFORMATION`);
    sections.push(`Email: ${resume.personalInfo?.email || candidate.email || 'Not provided'}`);
    sections.push(`Location: ${resume.personalInfo?.location || candidate.location || 'Not provided'}`);
    if (resume.personalInfo?.phone) sections.push(`Phone: ${resume.personalInfo.phone}`);
    if (resume.personalInfo?.github) sections.push(`GitHub: ${resume.personalInfo.github}`);
    if (resume.personalInfo?.linkedin) sections.push(`LinkedIn: ${resume.personalInfo.linkedin}`);
    sections.push('');

    if (resume.skills && resume.skills.length > 0) {
      sections.push(`TECHNICAL SKILLS`);
      sections.push(resume.skills.join(', '));
      sections.push('');
    }

    if (resume.experience && resume.experience.length > 0) {
      sections.push(`WORK EXPERIENCE`);
      resume.experience.forEach(exp => {
        sections.push(`• ${exp.role} | ${exp.company} (${exp.duration})`);
        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach(ach => sections.push(`    - ${ach}`));
        }
      });
      sections.push('');
    }

    if (resume.education && resume.education.length > 0) {
      sections.push(`EDUCATION`);
      resume.education.forEach(edu => {
        sections.push(`• ${edu.degree} - ${edu.school} (${edu.year})${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
      });
      sections.push('');
    }

    if (resume.projects && resume.projects.length > 0) {
      sections.push(`PROJECTS`);
      resume.projects.forEach(proj => {
        sections.push(`• ${proj.name}: ${proj.description}`);
        if (proj.technologies && proj.technologies.length > 0) {
          sections.push(`    Technologies: ${proj.technologies.join(', ')}`);
        }
      });
      sections.push('');
    }

    const blob = new Blob([sections.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${candidate.name.replace(/\s+/g, '_')}_Resume_Summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStageFilter('ALL');
    setSelectedSkillFilter('ALL');
    setScoreFilter('ALL');
    setSortBy('match-desc');
  };

  const activeFiltersCount = (stageFilter !== 'ALL' ? 1 : 0) + 
    (selectedSkillFilter !== 'ALL' ? 1 : 0) + 
    (scoreFilter !== 'ALL' ? 1 : 0) + 
    (searchQuery.trim() ? 1 : 0);

  // INVALID JOB REQUISITION STATE
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card rounded-xl border border-border max-w-xl mx-auto my-12 space-y-4 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Job Requisition Not Found</h2>
          <p className="text-muted-foreground text-sm">
            The requested requisition (ID: <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{jobId}</code>) could not be located in your recruiter workspace.
          </p>
        </div>
        <Button onClick={() => navigate('/recruiter/jobs')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Return to Job Posts
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl pb-16">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <button 
            type="button"
            onClick={() => navigate('/recruiter/jobs')} 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> 
            Back to Job Posts
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
            <Badge 
              variant="outline"
              className={`text-xs font-semibold ${
                job.status === 'published' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : job.status === 'draft' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : job.status === 'closed'
                  ? 'bg-destructive/10 text-destructive border-destructive/30'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
              }`}
            >
              {job.status.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="text-xs">{job.department}</Badge>
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {job.location} ({job.workplaceType})
            </span>
            {job.salary && (
              <>
                <span>•</span>
                <span className="text-foreground font-medium">{job.salary}</span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Users className="h-3.5 w-3.5 text-primary" /> {jobCandidates.length} Requisition Applicants
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/campaigns', { state: { jobId: job.id } })}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-4 w-4 text-primary" /> Sourcing Campaign
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate('/candidates', { state: { jobId: job.id } })}
            className="gap-1.5 text-xs"
          >
            <Building className="h-4 w-4 text-primary" /> Pipeline Board
          </Button>
        </div>
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search applicants by name, role, technical skill, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Filter */}
          <select
            aria-label="Pipeline Stage Filter"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
          >
            <option value="ALL">All Stages</option>
            <option value="Sourced">Sourced</option>
            <option value="Screening">Screening</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Offer">Offer</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Skill Filter */}
          <select
            aria-label="Technical Skill Filter"
            value={selectedSkillFilter}
            onChange={(e) => setSelectedSkillFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
          >
            <option value="ALL">All Candidate Skills</option>
            {availableSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>

          {/* Match Score Filter */}
          <select
            aria-label="Match Score Filter"
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
          >
            <option value="ALL">All Match Scores</option>
            <option value="high">High Match (≥ 80%)</option>
            <option value="medium">Moderate Match (60-79%)</option>
            <option value="low">Low Match (&lt; 60%)</option>
          </select>

          {/* Sort By */}
          <select
            aria-label="Sort Candidates"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[150px]"
          >
            <option value="match-desc">Match: High to Low</option>
            <option value="match-asc">Match: Low to High</option>
            <option value="newest">Newest Application</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>

          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-9 gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedCandidateIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center justify-between animate-fade-in">
          <span className="text-xs font-semibold pl-2 text-foreground">
            {selectedCandidateIds.length} applicant{selectedCandidateIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleBulkShortlist} className="h-8 text-xs gap-1.5">
              <UserCheck className="h-3.5 w-3.5" /> Shortlist Selected
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkReject} className="h-8 text-xs gap-1.5">
              <UserX className="h-3.5 w-3.5" /> Reject Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedCandidateIds([])} className="h-8 text-xs">
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Candidate List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Requisition Applicants ({filteredCandidates.length})
          </h2>
          {filteredCandidates.length > 0 && (
            <button 
              type="button"
              onClick={handleSelectAll} 
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors font-medium"
            >
              {selectedCandidateIds.length === filteredCandidates.length ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Select All
            </button>
          )}
        </div>

        {/* Empty States */}
        {jobCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[35vh] text-center p-8 bg-card rounded-xl border border-border space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No Applicants Yet</h3>
              <p className="text-muted-foreground max-w-md text-xs">
                No candidates have applied or been linked to this requisition yet. You can launch a sourcing campaign or review candidates from the talent database.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/campaigns', { state: { jobId: job.id } })} className="gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" /> Launch Sourcing Campaign
              </Button>
              <Button variant="outline" onClick={() => navigate('/recruiter/jobs')} className="text-xs">
                Back to Job Posts
              </Button>
            </div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] text-center p-8 bg-card rounded-xl border border-border space-y-3">
            <Filter className="h-8 w-8 text-muted-foreground opacity-60" />
            <h3 className="text-lg font-semibold">No Matching Applicants</h3>
            <p className="text-muted-foreground text-xs max-w-md">
              No applicants matched your current filter criteria or search query.
            </p>
            <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map(candidate => {
              const isSelected = selectedCandidateIds.includes(candidate.id);
              const skills = candidate.resumeData?.skills || candidate.matchedSkills || [];
              const match = calculateMatchScore(candidate, job);
              
              return (
                <Card 
                  key={candidate.id} 
                  className={`transition-all hover:border-primary/40 ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-5">
                      
                      {/* Candidate Avatar & Core Information */}
                      <div className="flex items-start gap-3.5 flex-1">
                        <button 
                          type="button"
                          onClick={() => handleToggleSelect(candidate.id)} 
                          className="mt-1 text-muted-foreground hover:text-primary transition-colors shrink-0"
                          aria-label={`Select candidate ${candidate.name}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-primary" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                        
                        <Avatar className="h-12 w-12 border border-border shrink-0">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">
                            {candidate.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 
                              className="font-bold text-base hover:text-primary cursor-pointer transition-colors"
                              onClick={() => {
                                setActiveCandidateId(candidate.id);
                                setProfileTab('overview');
                              }}
                            >
                              {candidate.name}
                            </h3>
                            
                            {/* Pipeline Stage Badge */}
                            <Badge 
                              variant="outline" 
                              className={`text-[11px] font-semibold ${
                                candidate.pipelineStage === 'Shortlisted' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                  : candidate.pipelineStage === 'Interview'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : candidate.pipelineStage === 'Offer' || candidate.pipelineStage === 'Hired'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                  : candidate.pipelineStage === 'Rejected'
                                  ? 'bg-destructive/10 text-destructive border-destructive/30'
                                  : 'bg-secondary text-muted-foreground'
                              }`}
                            >
                              {candidate.pipelineStage}
                            </Badge>

                            {/* Canonical Match Score */}
                            <Badge 
                              variant="secondary" 
                              className={`text-[11px] font-bold ${
                                match.matchScore >= 80 
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                  : match.matchScore >= 60 
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                                  : 'bg-destructive/15 text-destructive border-destructive/30'
                              }`}
                            >
                              {match.matchScore}% Match
                            </Badge>
                          </div>
                          
                          <p className="text-xs font-medium text-muted-foreground truncate">{candidate.role}</p>
                          
                          {/* Location & Time */}
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-primary shrink-0" /> 
                              {candidate.location || candidate.resumeData?.personalInfo?.location || 'Location unavailable'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary shrink-0" /> 
                              Applied {candidate.appliedAt || candidate.time || 'recently'}
                            </span>
                          </div>

                          {/* Candidate Skills preview */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {skills.slice(0, 6).map(skill => {
                              const isRequired = job.requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase());
                              return (
                                <Badge 
                                  key={skill} 
                                  variant="outline" 
                                  className={`text-[10px] py-0 px-2 ${
                                    isRequired 
                                      ? 'bg-primary/10 border-primary/30 text-primary font-medium' 
                                      : 'bg-secondary/40 text-muted-foreground'
                                  }`}
                                >
                                  {skill}
                                </Badge>
                              );
                            })}
                            {skills.length > 6 && (
                              <span className="text-[10px] text-muted-foreground font-medium pl-1">
                                +{skills.length - 6} more
                              </span>
                            )}
                            {skills.length === 0 && (
                              <span className="text-[10px] text-muted-foreground italic">No skills listed</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setActiveCandidateId(candidate.id);
                            setProfileTab('overview');
                          }}
                          className="text-xs h-8"
                        >
                          View Profile
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setActiveCandidateId(candidate.id);
                            setProfileTab('matching');
                          }}
                          className="text-xs h-8 gap-1 text-primary hover:text-primary"
                        >
                          <Target className="h-3.5 w-3.5" /> Match Breakdown
                        </Button>

                        {candidate.pipelineStage !== 'Shortlisted' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleShortlist(candidate.id)}
                            className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> Shortlist
                          </Button>
                        )}

                        {candidate.pipelineStage !== 'Rejected' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleReject(candidate.id)}
                            className="text-xs h-8 gap-1.5"
                          >
                            <UserX className="h-3.5 w-3.5" /> Reject
                          </Button>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Candidate Profile / Details / Resume Modal Drawer */}
      {activeCandidate && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="candidate-modal-title"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-secondary/20 shrink-0">
              <div className="flex items-center gap-3.5">
                <Avatar className="h-14 w-14 border border-border shrink-0">
                  <AvatarImage src={activeCandidate.avatar} alt={activeCandidate.name} />
                  <AvatarFallback className="font-bold text-lg bg-primary/10 text-primary">
                    {activeCandidate.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 id="candidate-modal-title" className="text-xl font-bold text-foreground">
                      {activeCandidate.name}
                    </h2>
                    <Badge variant="outline" className="text-xs">{activeCandidate.pipelineStage}</Badge>
                    {activeCandidateMatch && (
                      <Badge 
                        className={`text-xs font-bold ${
                          activeCandidateMatch.matchScore >= 80 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                            : activeCandidateMatch.matchScore >= 60 
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                            : 'bg-destructive/15 text-destructive border-destructive/30'
                        }`}
                      >
                        {activeCandidateMatch.matchScore}% Match
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {activeCandidate.role} • {activeCandidate.location || activeCandidate.resumeData?.personalInfo?.location || 'Location unavailable'}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setActiveCandidateId(null)}
                className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                aria-label="Close candidate modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-border px-6 bg-secondary/10 shrink-0">
              <button 
                type="button"
                onClick={() => setProfileTab('overview')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
                  profileTab === 'overview' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Profile Overview
              </button>
              <button 
                type="button"
                onClick={() => setProfileTab('resume')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
                  profileTab === 'resume' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Resume & Credentials
              </button>
              <button 
                type="button"
                onClick={() => setProfileTab('matching')}
                className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors ${
                  profileTab === 'matching' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Skill Matching Breakdown
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              
              {/* TAB 1: OVERVIEW */}
              {profileTab === 'overview' && (
                <div className="space-y-6">
                  {/* Canonical Recommendation Card */}
                  {activeCandidateMatch?.recommendation && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-1.5">
                      <h4 className="font-semibold text-xs text-primary flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" /> Recommendation Assessment
                      </h4>
                      <p className="text-xs text-foreground leading-relaxed">
                        {activeCandidateMatch.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Contact Information & Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 bg-secondary/10 p-4 rounded-xl border border-border">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Contact Details
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium text-foreground">
                            {activeCandidate.email || activeCandidate.resumeData?.personalInfo?.email || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium text-foreground">
                            {activeCandidate.location || activeCandidate.resumeData?.personalInfo?.location || 'Not provided'}
                          </span>
                        </div>
                        {activeCandidate.resumeData?.personalInfo?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="font-medium text-foreground">
                              {activeCandidate.resumeData.personalInfo.phone}
                            </span>
                          </div>
                        )}
                        {activeCandidate.resumeData?.personalInfo?.github && (
                          <div className="flex items-center gap-2">
                            <Github className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground">GitHub:</span>
                            <span className="font-medium text-foreground truncate">
                              {activeCandidate.resumeData.personalInfo.github}
                            </span>
                          </div>
                        )}
                        {activeCandidate.resumeData?.personalInfo?.linkedin && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground">LinkedIn:</span>
                            <span className="font-medium text-foreground truncate">
                              {activeCandidate.resumeData.personalInfo.linkedin}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 bg-secondary/10 p-4 rounded-xl border border-border">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Requisition Application
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-muted-foreground">Requisition:</span>
                          <span className="font-semibold text-foreground">{job.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium text-foreground">{job.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-muted-foreground">Applied:</span>
                          <span className="font-medium text-foreground">
                            {activeCandidate.appliedAt || activeCandidate.time || 'Recent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-muted-foreground">Pipeline Stage:</span>
                          <span className="font-bold text-foreground">{activeCandidate.pipelineStage}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Experience History */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-foreground">Work Experience</h4>
                    {activeCandidate.resumeData?.experience && activeCandidate.resumeData.experience.length > 0 ? (
                      <div className="space-y-3">
                        {activeCandidate.resumeData.experience.map((exp, idx) => (
                          <div key={idx} className="bg-secondary/10 p-4 rounded-xl border border-border space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h5 className="font-bold text-xs text-foreground">{exp.role}</h5>
                              <span className="text-[11px] font-medium text-muted-foreground">{exp.duration}</span>
                            </div>
                            <p className="text-xs font-semibold text-primary">{exp.company}</p>
                            {exp.achievements && exp.achievements.length > 0 && (
                              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pt-1">
                                {exp.achievements.map((ach, i) => (
                                  <li key={i}>{ach}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-secondary/10 border border-border text-xs text-muted-foreground italic">
                        No structured work experience records attached to this profile.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: RESUME & CREDENTIALS */}
              {profileTab === 'resume' && (
                <div className="space-y-6">
                  {activeCandidate.resumeData ? (
                    <div className="space-y-6 bg-card border border-border p-6 rounded-xl">
                      {/* Resume Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                        <div>
                          <h3 className="font-bold text-lg text-foreground">
                            {activeCandidate.resumeData.personalInfo?.name || activeCandidate.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {activeCandidate.resumeData.personalInfo?.email || activeCandidate.email || 'Email unavailable'}
                            {activeCandidate.resumeData.personalInfo?.location && ` • ${activeCandidate.resumeData.personalInfo.location}`}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadResume(activeCandidate)}
                          className="gap-2 text-xs shrink-0"
                        >
                          <Download className="h-3.5 w-3.5" /> Download Resume Summary (.txt)
                        </Button>
                      </div>

                      {/* Technical Skills Inventory */}
                      {activeCandidate.resumeData.skills && activeCandidate.resumeData.skills.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                            Technical Skills Inventory
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {activeCandidate.resumeData.skills.map(s => {
                              const isRequired = job.requiredSkills.some(req => req.toLowerCase() === s.toLowerCase());
                              return (
                                <Badge 
                                  key={s} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    isRequired 
                                      ? 'bg-primary/10 border-primary/30 text-primary font-semibold' 
                                      : 'bg-secondary/20'
                                  }`}
                                >
                                  {s}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Education Credentials */}
                      {activeCandidate.resumeData.education && activeCandidate.resumeData.education.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                            Education
                          </h4>
                          <div className="space-y-2">
                            {activeCandidate.resumeData.education.map((edu, idx) => (
                              <div key={idx} className="bg-secondary/10 p-3 rounded-lg text-xs space-y-0.5 border border-border">
                                <div className="flex justify-between items-center">
                                  <strong className="text-foreground">{edu.degree}</strong>
                                  <span className="text-muted-foreground">{edu.year}</span>
                                </div>
                                <p className="text-muted-foreground">
                                  {edu.school} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience Credentials */}
                      {activeCandidate.resumeData.experience && activeCandidate.resumeData.experience.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                            Experience Details
                          </h4>
                          <div className="space-y-3">
                            {activeCandidate.resumeData.experience.map((exp, idx) => (
                              <div key={idx} className="bg-secondary/10 p-3.5 rounded-lg border border-border space-y-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <strong className="text-xs text-foreground block">{exp.role}</strong>
                                    <span className="text-xs text-primary font-medium">{exp.company}</span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground font-medium">{exp.duration}</span>
                                </div>
                                {exp.achievements && exp.achievements.length > 0 && (
                                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pt-1">
                                    {exp.achievements.map((ach, i) => (
                                      <li key={i}>{ach}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects Credentials */}
                      {activeCandidate.resumeData.projects && activeCandidate.resumeData.projects.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                            Key Projects
                          </h4>
                          <div className="space-y-2">
                            {activeCandidate.resumeData.projects.map((proj, idx) => (
                              <div key={idx} className="bg-secondary/10 p-3.5 rounded-lg border border-border space-y-1 text-xs">
                                <strong className="text-foreground">{proj.name}</strong>
                                <p className="text-muted-foreground">{proj.description}</p>
                                {proj.technologies && proj.technologies.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {proj.technologies.map(t => (
                                      <Badge key={t} variant="secondary" className="text-[10px] py-0 px-1.5">
                                        {t}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-border space-y-3">
                      <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                      <h4 className="font-bold text-base">Resume not available</h4>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        This candidate has not attached a parsed resume document or uploaded portfolio.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SKILL MATCHING BREAKDOWN */}
              {profileTab === 'matching' && activeCandidateMatch && (
                <div className="space-y-6">
                  {/* Top Level Metric Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-secondary/10 p-3.5 rounded-xl border border-border space-y-1">
                      <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                        Canonical Match
                      </span>
                      <p className="text-2xl font-bold text-foreground">
                        {activeCandidateMatch.matchScore}%
                      </p>
                    </div>

                    <div className="bg-secondary/10 p-3.5 rounded-xl border border-border space-y-1">
                      <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                        Evaluation Confidence
                      </span>
                      <p className="text-2xl font-bold text-primary">
                        {activeCandidateMatch.confidence}%
                      </p>
                    </div>

                    <div className="bg-secondary/10 p-3.5 rounded-xl border border-border space-y-1">
                      <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                        Required Match Rate
                      </span>
                      <p className="text-2xl font-bold text-foreground">
                        {job.requiredSkills.filter(req => 
                          (activeCandidate.resumeData?.skills || []).some(cs => cs.toLowerCase() === req.toLowerCase())
                        ).length} / {job.requiredSkills.length}
                      </p>
                    </div>
                  </div>

                  {/* Required Skills Analysis */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Required Skills Breakdown ({job.requiredSkills.length})
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {job.requiredSkills.map(reqSkill => {
                        const candidateSkills = activeCandidate.resumeData?.skills || activeCandidate.matchedSkills || [];
                        const isMatched = candidateSkills.some(cs => 
                          cs.toLowerCase() === reqSkill.toLowerCase() ||
                          cs.toLowerCase().includes(reqSkill.toLowerCase()) ||
                          reqSkill.toLowerCase().includes(cs.toLowerCase())
                        );

                        return (
                          <div 
                            key={reqSkill} 
                            className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                              isMatched 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : 'bg-destructive/10 border-destructive/30'
                            }`}
                          >
                            <span className="font-semibold text-foreground">{reqSkill}</span>
                            {isMatched ? (
                              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                                <Check className="h-3.5 w-3.5" /> Matched
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 font-semibold text-destructive">
                                <X className="h-3.5 w-3.5" /> Missing
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Skills Analysis */}
                  {job.preferredSkills && job.preferredSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Preferred Skills Breakdown ({job.preferredSkills.length})
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {job.preferredSkills.map(prefSkill => {
                          const candidateSkills = activeCandidate.resumeData?.skills || activeCandidate.matchedSkills || [];
                          const isMatched = candidateSkills.some(cs => 
                            cs.toLowerCase() === prefSkill.toLowerCase() ||
                            cs.toLowerCase().includes(prefSkill.toLowerCase()) ||
                            prefSkill.toLowerCase().includes(cs.toLowerCase())
                          );

                          return (
                            <div 
                              key={prefSkill} 
                              className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                                isMatched 
                                  ? 'bg-blue-500/10 border-blue-500/30' 
                                  : 'bg-secondary/20 border-border'
                              }`}
                            >
                              <span className="font-medium text-foreground">{prefSkill}</span>
                              {isMatched ? (
                                <span className="flex items-center gap-1 font-semibold text-blue-400">
                                  <Check className="h-3.5 w-3.5" /> Matched Bonus
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">
                                  Not found
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Experience and Education Fit Check */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-secondary/10 p-4 rounded-xl border border-border space-y-1.5 text-xs">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">
                        Experience Criteria
                      </span>
                      <p className="text-foreground">
                        <strong className="text-muted-foreground">Required:</strong> {job.experience || 'Not specified'}
                      </p>
                      <p className="text-foreground">
                        <strong className="text-muted-foreground">Candidate Roles:</strong> {activeCandidate.resumeData?.experience?.length || 0} documented positions
                      </p>
                    </div>

                    <div className="bg-secondary/10 p-4 rounded-xl border border-border space-y-1.5 text-xs">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">
                        Education Criteria
                      </span>
                      <p className="text-foreground">
                        <strong className="text-muted-foreground">Required:</strong> {job.education || 'Not specified'}
                      </p>
                      <p className="text-foreground">
                        <strong className="text-muted-foreground">Candidate Degree:</strong> {activeCandidate.resumeData?.education?.[0]?.degree || 'Self-taught / Portfolio'}
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-border flex flex-wrap justify-between items-center gap-3 bg-secondary/20 shrink-0">
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMoveToPipeline(activeCandidate.id)}
                  className="gap-1.5 text-xs"
                >
                  <Building className="h-3.5 w-3.5 text-primary" /> Move to Pipeline Board
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {activeCandidate.pipelineStage !== 'Shortlisted' && (
                  <Button 
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    onClick={() => {
                      handleShortlist(activeCandidate.id);
                    }}
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Shortlist Candidate
                  </Button>
                )}

                {activeCandidate.pipelineStage !== 'Rejected' && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => {
                      handleReject(activeCandidate.id);
                    }}
                  >
                    <UserX className="h-3.5 w-3.5" /> Reject Candidate
                  </Button>
                )}

                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setActiveCandidateId(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

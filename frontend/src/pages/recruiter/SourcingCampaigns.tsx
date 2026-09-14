import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { updateCandidateStage } from '../../store/slices/recruiterSlice';
import { Candidate, Campaign, Job, CandidatePipelineStage } from '../../types/recruiter';
import { campaignService } from '../../services/campaignService';
import { applicationService } from '../../services/applicationService';
import { apiClient } from '../../services/api';
import { calculateMatchScore, MatchResult } from '../../utils/matchScore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { 
  Search, Bot, CheckCircle2, AlertCircle, Loader2, ArrowRight, 
  Plus, Play, Pause, Check, X, FileText, Sparkles, Users, 
  Briefcase, MapPin, Calendar, SlidersHorizontal, RotateCcw, 
  Download, Phone, Mail, Github, Linkedin, UserCheck, UserX, 
  ExternalLink, Layers, Trash2, ArrowUpDown, Clock
} from 'lucide-react';

export function SourcingCampaigns() {
  const { jobs, candidates } = useAppSelector((state: RootState) => state.recruiter);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await campaignService.listCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load campaigns');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Published jobs list
  const publishedJobs = useMemo(() => {
    return jobs.filter(j => j.status === 'published');
  }, [jobs]);

  // Active view mode: 'campaigns' (list of campaigns) or 'sourcing' (matching execution view)
  const [viewMode, setViewMode] = useState<'sourcing' | 'campaigns'>('sourcing');

  // Selected job for sourcing matching
  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    return (location.state as any)?.jobId || (publishedJobs.length > 0 ? publishedJobs[0].id : (jobs[0]?.id || ''));
  });

  // Selected active campaign (if opened from campaigns list)
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'name-asc' | 'name-desc'>('score-desc');

  // Candidate review drawer / modal state (driven by ID to eliminate stale state)
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'resume' | 'matching'>('overview');

  // New Campaign Modal state
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignJobId, setNewCampaignJobId] = useState('');
  const [newCampaignMinScore, setNewCampaignMinScore] = useState('60');

  useEffect(() => {
    if ((location.state as any)?.jobId) {
      setSelectedJobId((location.state as any).jobId);
    }
  }, [location.state]);

  // persistRecruiterState removed per Phase 7 requirements

  const selectedJob = useMemo(() => {
    return jobs.find(j => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  // Deterministic Matching Execution
  // Uses calculateMatchScore from src/utils/matchScore.ts
  const matchedCandidates = useMemo(() => {
    if (!selectedJob) return [];

    return candidates.map(candidate => {
      const match = calculateMatchScore(candidate, selectedJob);
      return {
        ...candidate,
        ...match,
        activeJobId: selectedJob.id
      };
    });
  }, [candidates, selectedJob]);

  // Extract all unique skills across candidates for the skill filter dropdown
  const availableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    candidates.forEach(c => {
      const skills = c.resumeData?.skills || c.matchedSkills || [];
      skills.forEach(s => {
        if (s && s.trim()) skillSet.add(s.trim());
      });
    });
    return Array.from(skillSet).sort();
  }, [candidates]);

  // Filtered and Sorted Candidate Results
  const filteredResults = useMemo(() => {
    let result = [...matchedCandidates];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        const inName = c.name.toLowerCase().includes(q);
        const inRole = c.role.toLowerCase().includes(q);
        const inLoc = c.location ? c.location.toLowerCase().includes(q) : false;
        const inEmail = c.email ? c.email.toLowerCase().includes(q) : false;
        const skills = c.resumeData?.skills || c.matchedSkills || [];
        const inSkills = skills.some(s => s.toLowerCase().includes(q));
        return inName || inRole || inLoc || inEmail || inSkills;
      });
    }

    // Match Score Threshold Filter
    if (scoreFilter === 'HIGH') {
      result = result.filter(c => (c.matchScore || 0) >= 80);
    } else if (scoreFilter === 'MODERATE') {
      result = result.filter(c => (c.matchScore || 0) >= 60 && (c.matchScore || 0) < 80);
    } else if (scoreFilter === 'LOW') {
      result = result.filter(c => (c.matchScore || 0) < 60);
    }

    // Pipeline Stage Filter
    if (stageFilter !== 'ALL') {
      result = result.filter(c => c.pipelineStage === stageFilter);
    }

    // Technical Skill Filter
    if (skillFilter !== 'ALL') {
      result = result.filter(c => {
        const skills = c.resumeData?.skills || c.matchedSkills || [];
        return skills.some(s => s.toLowerCase() === skillFilter.toLowerCase());
      });
    }

    // Non-mutating sorting
    return result.sort((a, b) => {
      if (sortBy === 'score-desc') return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === 'score-asc') return (a.matchScore || 0) - (b.matchScore || 0);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [matchedCandidates, searchQuery, scoreFilter, stageFilter, skillFilter, sortBy]);

  // Active candidate live reference for detail modal
  const activeCandidate = useMemo(() => {
    if (!activeCandidateId) return null;
    return candidates.find(c => c.id === activeCandidateId) || null;
  }, [candidates, activeCandidateId]);

  // Shortlist action
  const handleShortlist = async (candidateId: string) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate?.applicationId) {
        await applicationService.updateApplicationStage(candidate.applicationId, 'Shortlisted');
      } else {
        await apiClient.put(`/candidates/${candidateId}`, { pipelineStage: 'Shortlisted' });
      }
      dispatch(updateCandidateStage({ id: candidateId, stage: 'Shortlisted' }));
    } catch (err) {
      console.error('Failed to shortlist', err);
    }
  };

  // Reject action
  const handleReject = async (candidateId: string) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate?.applicationId) {
        await applicationService.updateApplicationStage(candidate.applicationId, 'Rejected');
      } else {
        await apiClient.put(`/candidates/${candidateId}`, { pipelineStage: 'Rejected' });
      }
      dispatch(updateCandidateStage({ id: candidateId, stage: 'Rejected' }));
    } catch (err) {
      console.error('Failed to reject', err);
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim() || !newCampaignJobId) return;
    setIsLoading(true);

    try {
      const results = candidates
        .filter(c => {
          const targetJob = jobs.find(j => j.id === newCampaignJobId);
          if (!targetJob) return false;
          const score = calculateMatchScore(c, targetJob).matchScore;
          return score >= (parseInt(newCampaignMinScore, 10) || 60);
        })
        .map(c => c.id);

      const created = await campaignService.createCampaign({
        name: newCampaignName.trim(),
        jobId: newCampaignJobId,
        criteria: { minScore: parseInt(newCampaignMinScore, 10) || 60 },
        status: 'active',
        results
      });

      setCampaigns(prev => [created, ...prev]);
      setNewCampaignName('');
      setNewCampaignJobId('');
      setIsNewCampaignOpen(false);
    } catch (err) {
      console.error('Failed to create campaign', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Campaign Status
  const handleToggleStatus = async (campId: string) => {
    const campaign = campaigns.find(c => c.id === campId);
    if (!campaign) return;
    const newStatus = campaign.status === 'active' ? 'completed' : 'active';
    try {
      const updated = await campaignService.updateCampaign(campId, { status: newStatus });
      setCampaigns(prev => prev.map(c => c.id === campId ? updated : c));
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (campId: string) => {
    try {
      await campaignService.deleteCampaign(campId);
      setCampaigns(prev => prev.filter(c => c.id !== campId));
    } catch (err) {
      console.error('Failed to delete campaign', err);
    }
  };

  // Open Campaign in Sourcing View
  const handleOpenCampaignInSourcing = (camp: Campaign) => {
    if (camp.jobId) {
      setSelectedJobId(camp.jobId);
    }
    setActiveCampaignId(camp.id);
    setViewMode('sourcing');
  };

  // Download parsed resume as truthful formatted text summary file
  const handleDownloadResume = (candidate: Candidate) => {
    const resume = candidate.resumeData;
    if (!resume) return;

    const sections: string[] = [];
    sections.push(`=======================================================`);
    sections.push(`RESUME SUMMARY: ${candidate.name.toUpperCase()}`);
    sections.push(`Role / Title: ${candidate.role}`);
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
    setScoreFilter('ALL');
    setStageFilter('ALL');
    setSkillFilter('ALL');
    setSortBy('score-desc');
  };

  const activeFiltersCount = (searchQuery.trim() ? 1 : 0) + 
    (scoreFilter !== 'ALL' ? 1 : 0) + 
    (stageFilter !== 'ALL' ? 1 : 0) + 
    (skillFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Sourcing & Talent Discovery</h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 font-medium">
              Deterministic Matching Engine
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Evaluate candidate profiles deterministically against job requisitions using semantic skill matching.
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary/30 p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setViewMode('sourcing')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'sourcing' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Candidate Matcher
            </button>
            <button
              type="button"
              onClick={() => setViewMode('campaigns')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'campaigns' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Campaigns ({campaigns.length})
            </button>
          </div>

          <Button 
            onClick={() => {
              setNewCampaignJobId(selectedJobId || (jobs[0]?.id || ''));
              setIsNewCampaignOpen(true);
            }} 
            className="gap-1.5 text-xs h-9"
          >
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: CAMPAIGNS LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Sourcing Campaigns ({campaigns.length})</h2>
              <p className="text-xs text-muted-foreground">Manage and track candidate discovery campaigns.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="border-dashed border-border p-12 text-center">
              <CardContent className="space-y-4 p-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground">No Active Sourcing Campaigns</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Create a candidate discovery campaign linked to a published job requisition to evaluate candidate pools.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setNewCampaignJobId(publishedJobs[0]?.id || jobs[0]?.id || '');
                    setIsNewCampaignOpen(true);
                  }}
                  className="text-xs gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Create First Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(camp => {
                const linkedJob = jobs.find(j => j.id === camp.jobId);
                const matchedCount = candidates.filter(c => {
                  if (!linkedJob) return false;
                  return calculateMatchScore(c, linkedJob).matchScore >= (camp.criteria?.minScore || 60);
                }).length;

                return (
                  <Card key={camp.id} className="border-border hover:border-primary/40 transition-all shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-bold text-foreground hover:text-primary cursor-pointer" onClick={() => handleOpenCampaignInSourcing(camp)}>
                            {camp.name}
                          </CardTitle>
                          {linkedJob && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5 text-primary" />
                              <span className="font-medium text-foreground">{linkedJob.title}</span>
                              <Badge variant="outline" className="text-[10px] uppercase font-mono ml-1">
                                {linkedJob.status}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <Badge 
                          variant={camp.status === 'active' ? 'default' : 'secondary'}
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            camp.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {camp.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-2 bg-secondary/15 p-3 rounded-lg border border-border/50">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Matched Candidates</span>
                          <span className="text-sm font-bold text-foreground">{matchedCount} qualified</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Match Threshold</span>
                          <span className="text-sm font-bold text-primary">≥ {camp.criteria?.minScore || 60}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Created {camp.createdAt ? new Date(camp.createdAt).toLocaleDateString() : 'Recently'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleStatus(camp.id)}
                            className="h-7 text-xs px-2"
                            title={camp.status === 'active' ? 'Mark Completed' : 'Activate Campaign'}
                          >
                            {camp.status === 'active' ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                            {camp.status === 'active' ? 'Pause' : 'Activate'}
                          </Button>

                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleOpenCampaignInSourcing(camp)}
                            className="h-7 text-xs px-2.5 gap-1"
                          >
                            <Bot className="h-3 w-3" /> Run Sourcing
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label={`Delete campaign ${camp.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SOURCING MATCHING VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'sourcing' && (
        <div className="space-y-6">
          {/* Requisition Context & Matching Controls Card */}
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="job-requisition-select" className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> Target Job Requisition
                    </Label>
                    {selectedJob && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] font-mono uppercase ${
                          selectedJob.status === 'published' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {selectedJob.status}
                      </Badge>
                    )}
                  </div>

                  <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                    <SelectTrigger id="job-requisition-select" aria-label="Select Job Requisition for Sourcing" className="h-10 text-xs font-semibold bg-card">
                      <SelectValue placeholder="Select a job requisition to evaluate" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map(job => (
                        <SelectItem key={job.id} value={job.id} className="text-xs font-medium">
                          {job.title} ({job.status}) • {job.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedJob && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/recruiter/jobs/${selectedJob.id}/applicants`)}
                      className="text-xs gap-1.5 h-10 bg-card"
                    >
                      <Users className="h-3.5 w-3.5 text-primary" /> View Applicants ({candidates.filter(c => c.jobId === selectedJob.id).length})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/candidates', { state: { jobId: selectedJob.id } })}
                      className="text-xs gap-1.5 h-10 bg-card"
                    >
                      <Layers className="h-3.5 w-3.5 text-primary" /> Pipeline Board
                    </Button>
                  </div>
                )}
              </div>

              {/* Job Criteria Summary Banner */}
              {selectedJob ? (
                <div className="bg-card/70 border border-border/80 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                    <span className="font-bold text-foreground text-sm">{selectedJob.title}</span>
                    <span className="text-muted-foreground">{selectedJob.department} • {selectedJob.experience} • {selectedJob.workplaceType}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                      Required Technical Criteria:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.requiredSkills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary font-medium">
                          {skill}
                        </Badge>
                      ))}
                      {selectedJob.preferredSkills && selectedJob.preferredSkills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs bg-secondary/40 text-muted-foreground">
                          {skill} (Bonus)
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-xs">
                  No job selected. Please select a job requisition to evaluate candidate matches.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search, Filter & Sort Toolbar */}
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="sourcing-search-input"
                aria-label="Search sourced candidates"
                placeholder="Search candidates by name, role, skill, location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Match Score Filter */}
              <Select value={scoreFilter} onValueChange={(val: any) => setScoreFilter(val)}>
                <SelectTrigger aria-label="Filter candidates by match score" className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs font-medium">All Match Scores</SelectItem>
                  <SelectItem value="HIGH" className="text-xs text-emerald-400 font-semibold">High Match (≥80%)</SelectItem>
                  <SelectItem value="MODERATE" className="text-xs text-amber-400 font-semibold">Moderate (60-79%)</SelectItem>
                  <SelectItem value="LOW" className="text-xs text-destructive font-semibold">Low Match (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>

              {/* Stage Filter */}
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger aria-label="Filter candidates by pipeline stage" className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs font-medium">All Stages</SelectItem>
                  <SelectItem value="Sourced" className="text-xs">Sourced</SelectItem>
                  <SelectItem value="Screening" className="text-xs">Screening</SelectItem>
                  <SelectItem value="Shortlisted" className="text-xs">Shortlisted</SelectItem>
                  <SelectItem value="Interview" className="text-xs">Interview</SelectItem>
                  <SelectItem value="Selected" className="text-xs">Selected</SelectItem>
                  <SelectItem value="Offer" className="text-xs">Offer</SelectItem>
                  <SelectItem value="Hired" className="text-xs">Hired</SelectItem>
                  <SelectItem value="Rejected" className="text-xs">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Skill Filter */}
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger aria-label="Filter candidates by technical skill" className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs font-medium">All Skills</SelectItem>
                  {availableSkills.map(skill => (
                    <SelectItem key={skill} value={skill} className="text-xs">{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger aria-label="Sort candidate matches" className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="Sort Results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score-desc" className="text-xs">Score: High to Low</SelectItem>
                  <SelectItem value="score-asc" className="text-xs">Score: Low to High</SelectItem>
                  <SelectItem value="name-asc" className="text-xs">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc" className="text-xs">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>

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

          {/* Sourcing Candidate Matches Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">
                Ranked Candidates for {selectedJob?.title || 'Selected Job'} ({filteredResults.length})
              </h3>
              <span className="text-xs text-muted-foreground">
                Canonical Matching: <code className="font-mono text-[11px] text-primary">calculateMatchScore()</code>
              </span>
            </div>

            {filteredResults.length === 0 ? (
              <Card className="border-dashed border-border p-12 text-center">
                <CardContent className="space-y-3 p-0">
                  <AlertCircle className="h-10 w-10 text-muted-foreground opacity-40 mx-auto" />
                  <h4 className="font-bold text-sm text-foreground">No Candidates Match Active Criteria</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Try adjusting the search query, match score threshold, or skill filters to view candidate evaluations.
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs">
                      Reset All Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredResults.map(result => {
                  const skills = result.resumeData?.skills || result.matchedSkills || [];

                  return (
                    <Card key={result.id} className="overflow-hidden border-border hover:border-primary/40 transition-all shadow-sm">
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">
                          {/* Score & Profile Header Column */}
                          <div className="bg-secondary/15 p-6 lg:w-1/4 flex flex-col items-center justify-center border-r border-border text-center space-y-2">
                            <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                              Canonical Match Score
                            </span>
                            <div className={`text-4xl font-extrabold ${
                              (result.matchScore || 0) >= 80 
                                ? 'text-emerald-400' 
                                : (result.matchScore || 0) >= 60 
                                ? 'text-amber-400' 
                                : 'text-destructive'
                            }`}>
                              {result.matchScore}%
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium">
                              Confidence: {result.confidence}%
                            </span>

                            <div className="pt-2 flex flex-col items-center space-y-1">
                              <Avatar className="h-12 w-12 border border-border">
                                <AvatarImage src={result.avatar} alt={result.name} />
                                <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">
                                  {result.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <h4 
                                className="font-bold text-sm text-foreground hover:text-primary cursor-pointer transition-colors"
                                onClick={() => {
                                  setActiveCandidateId(result.id);
                                  setProfileTab('overview');
                                }}
                              >
                                {result.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">{result.role}</p>
                              <Badge variant="outline" className="text-[10px] font-medium mt-1">
                                {result.pipelineStage}
                              </Badge>
                            </div>
                          </div>

                          {/* Matching Breakdown & Actions Column */}
                          <div className="p-6 lg:w-3/4 flex flex-col justify-between space-y-4">
                            <div className="space-y-4">
                              {/* Skills Comparison Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-xs font-bold flex items-center gap-1.5 text-emerald-400 uppercase tracking-wider">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" /> Matched Skills ({result.matchedSkills?.length || 0})
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {result.matchedSkills && result.matchedSkills.length > 0 ? (
                                      result.matchedSkills.map(skill => (
                                        <Badge key={skill} variant="outline" className="text-[11px] bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium">
                                          {skill}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-xs text-muted-foreground italic">No matching skills</span>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs font-bold flex items-center gap-1.5 text-destructive uppercase tracking-wider">
                                    <AlertCircle className="h-4 w-4 shrink-0" /> Missing Requirements ({result.missingSkills?.length || 0})
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {result.missingSkills && result.missingSkills.length > 0 ? (
                                      result.missingSkills.map(skill => (
                                        <Badge key={skill} variant="outline" className="text-[11px] bg-destructive/10 border-destructive/20 text-destructive font-medium">
                                          {skill}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-xs text-emerald-400 font-medium">All requirements satisfied!</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* AI Recommendation Box */}
                              {result.recommendation && (
                                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 space-y-1">
                                  <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                                    <Sparkles className="h-3.5 w-3.5" /> Recommendation Assessment
                                  </div>
                                  <p className="text-xs text-foreground leading-relaxed">
                                    {result.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actions Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => {
                                    setActiveCandidateId(result.id);
                                    setProfileTab('overview');
                                  }}
                                  className="text-xs h-8 px-2.5"
                                >
                                  View Full Profile & Resume
                                </Button>
                              </div>

                              <div className="flex items-center gap-2">
                                {result.pipelineStage !== 'Shortlisted' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleShortlist(result.id)}
                                    className="text-xs h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    <UserCheck className="h-3.5 w-3.5" /> Shortlist Candidate
                                  </Button>
                                )}

                                {result.pipelineStage !== 'Rejected' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleReject(result.id)}
                                    className="text-xs h-8 gap-1 text-destructive hover:bg-destructive/10 border-destructive/30"
                                  >
                                    <UserX className="h-3.5 w-3.5" /> Reject
                                  </Button>
                                )}

                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={() => navigate('/candidates', { state: { jobId: selectedJob?.id, candidateId: result.id } })}
                                  className="text-xs h-8 gap-1"
                                >
                                  <Layers className="h-3.5 w-3.5 text-primary" /> View in Pipeline
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANDIDATE DETAIL MODAL DRAWER */}
      {/* ========================================================================= */}
      {activeCandidate && (() => {
        const activeJob = selectedJob || (activeCandidate.jobId ? jobs.find(j => j.id === activeCandidate.jobId) : jobs[0]);
        const activeMatch: MatchResult | null = activeJob ? calculateMatchScore(activeCandidate, activeJob) : null;

        return (
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-sourcing-modal-title"
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
                      <h2 id="candidate-sourcing-modal-title" className="text-xl font-bold text-foreground">
                        {activeCandidate.name}
                      </h2>
                      <Badge variant="outline" className="text-xs font-semibold">{activeCandidate.pipelineStage}</Badge>
                      {activeMatch && (
                        <Badge 
                          className={`text-xs font-bold ${
                            activeMatch.matchScore >= 80 
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                              : activeMatch.matchScore >= 60 
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                              : 'bg-destructive/15 text-destructive border-destructive/30'
                          }`}
                        >
                          {activeMatch.matchScore}% Match
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

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                
                {/* TAB 1: OVERVIEW */}
                {profileTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Recommendation Assessment */}
                    {(activeMatch?.recommendation || activeCandidate.recommendation) && (
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-1.5">
                        <h4 className="font-semibold text-xs text-primary flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" /> Recommendation Assessment
                        </h4>
                        <p className="text-xs text-foreground leading-relaxed">
                          {activeMatch ? activeMatch.recommendation : activeCandidate.recommendation}
                        </p>
                      </div>
                    )}

                    {/* Contact & Status Details */}
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
                          Application & Evaluation Context
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground">Current Stage:</span>
                            <span className="font-bold text-foreground">{activeCandidate.pipelineStage}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground">Applied / Sourced Date:</span>
                            <span className="font-medium text-foreground">
                              {activeCandidate.appliedAt || activeCandidate.time || 'Recent'}
                            </span>
                          </div>
                          {activeJob && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-muted-foreground">Target Job:</span>
                              <span className="font-semibold text-foreground">{activeJob.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Work Experience */}
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
                                  {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
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
                                const isRequired = activeJob?.requiredSkills.some(req => req.toLowerCase() === s.toLowerCase());
                                return (
                                  <Badge 
                                    key={s} 
                                    variant="outline" 
                                    className={`text-xs ${
                                      isRequired 
                                        ? 'bg-primary/10 border-primary/30 text-primary font-medium' 
                                        : 'bg-secondary/40 text-muted-foreground'
                                    }`}
                                  >
                                    {s}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {activeCandidate.resumeData.education && activeCandidate.resumeData.education.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                              Education & Degrees
                            </h4>
                            <div className="space-y-2">
                              {activeCandidate.resumeData.education.map((edu, idx) => (
                                <div key={idx} className="bg-secondary/10 p-3 rounded-lg text-xs space-y-0.5 border border-border">
                                  <p className="font-bold text-foreground">{edu.degree}</p>
                                  <p className="text-muted-foreground">{edu.school} ({edu.year}) {edu.gpa ? `• GPA: ${edu.gpa}` : ''}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {activeCandidate.resumeData.projects && activeCandidate.resumeData.projects.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                              Key Projects
                            </h4>
                            <div className="space-y-2">
                              {activeCandidate.resumeData.projects.map((proj, idx) => (
                                <div key={idx} className="bg-secondary/10 p-3 rounded-lg text-xs space-y-1 border border-border">
                                  <p className="font-bold text-foreground">{proj.name}</p>
                                  <p className="text-muted-foreground">{proj.description}</p>
                                  {proj.technologies && proj.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {proj.technologies.map(t => (
                                        <span key={t} className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border font-mono text-muted-foreground">
                                          {t}
                                        </span>
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
                      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-xl border border-border space-y-2">
                        <FileText className="h-10 w-10 text-muted-foreground opacity-40" />
                        <h3 className="font-bold text-sm">Resume Document Not Attached</h3>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          This candidate has not attached a parsed resume document or profile inventory.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: MATCHING BREAKDOWN */}
                {profileTab === 'matching' && (
                  <div className="space-y-6">
                    <div className="border-b border-border pb-3">
                      <h3 className="font-bold text-sm text-foreground">Skill Matching Analysis</h3>
                      <p className="text-xs text-muted-foreground">
                        {activeJob ? `Candidate profile evaluation against ${activeJob.title} criteria.` : 'Candidate profile evaluation.'}
                      </p>
                    </div>

                    {/* Matched Required Skills */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Matched Skills ({(activeMatch?.matchedSkills || []).length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(activeMatch?.matchedSkills || activeCandidate.matchedSkills || []).map(skill => (
                          <div key={skill} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-400">
                            <Check className="h-3 w-3" /> {skill}
                          </div>
                        ))}
                        {(activeMatch?.matchedSkills || activeCandidate.matchedSkills || []).length === 0 && (
                          <p className="text-xs text-muted-foreground italic">No matching skills identified.</p>
                        )}
                      </div>
                    </div>

                    {/* Missing Required Skills */}
                    {activeMatch && activeMatch.missingSkills.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="font-bold text-xs text-destructive flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertCircle className="h-3.5 w-3.5" /> Missing Requirements ({activeMatch.missingSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {activeMatch.missingSkills.map(skill => (
                            <div key={skill} className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-md text-xs font-semibold text-destructive">
                              <X className="h-3 w-3" /> {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferred Skills */}
                    {activeJob?.preferredSkills && activeJob.preferredSkills.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                          Preferred / Bonus Skills
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {activeJob.preferredSkills.map(ps => {
                            const candidateSkills = activeCandidate.resumeData?.skills || activeCandidate.matchedSkills || [];
                            const hasSkill = candidateSkills.some(s => s.toLowerCase() === ps.toLowerCase());
                            return (
                              <Badge 
                                key={ps} 
                                variant="outline" 
                                className={`text-xs ${
                                  hasSkill 
                                    ? 'bg-primary/10 border-primary/30 text-primary font-medium' 
                                    : 'bg-secondary/20 text-muted-foreground'
                                }`}
                              >
                                {ps} {hasSkill ? '✓' : ''}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-border flex flex-wrap justify-between items-center gap-3 bg-secondary/20 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Current Stage:</span>
                  <Badge variant="outline" className="text-xs font-bold">{activeCandidate.pipelineStage}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  {activeCandidate.pipelineStage !== 'Shortlisted' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleShortlist(activeCandidate.id)}
                      className="text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Shortlist
                    </Button>
                  )}

                  {activeCandidate.pipelineStage !== 'Rejected' && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleReject(activeCandidate.id)}
                      className="text-xs h-8 gap-1"
                    >
                      <UserX className="h-3.5 w-3.5" /> Reject
                    </Button>
                  )}

                  <Button variant="secondary" size="sm" onClick={() => setActiveCandidateId(null)} className="text-xs h-8">
                    Close
                  </Button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* NEW SOURCING CAMPAIGN MODAL */}
      {/* ========================================================================= */}
      {isNewCampaignOpen && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-campaign-modal-title"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h3 id="new-campaign-modal-title" className="font-bold text-lg text-foreground">
                  Create Sourcing Campaign
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsNewCampaignOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close new campaign modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="new-campaign-name" className="text-xs font-bold text-foreground">
                  Campaign Name *
                </Label>
                <Input 
                  id="new-campaign-name"
                  required
                  placeholder="e.g., Full Stack Talent Discovery Q4" 
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-campaign-job" className="text-xs font-bold text-foreground">
                  Target Job Requisition *
                </Label>
                <Select value={newCampaignJobId} onValueChange={setNewCampaignJobId} required>
                  <SelectTrigger id="new-campaign-job" className="h-9 text-xs">
                    <SelectValue placeholder="Select a job requisition" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map(j => (
                      <SelectItem key={j.id} value={j.id} className="text-xs font-medium">
                        {j.title} ({j.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-campaign-min-score" className="text-xs font-bold text-foreground">
                  Minimum Match Score Threshold (%)
                </Label>
                <Input 
                  id="new-campaign-min-score"
                  type="number"
                  min="0"
                  max="100"
                  value={newCampaignMinScore}
                  onChange={(e) => setNewCampaignMinScore(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="p-3 bg-secondary/20 rounded-lg border border-border/80 text-muted-foreground">
                This campaign will evaluate all candidate resumes against the job requirements and track qualified candidates who meet the score threshold.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsNewCampaignOpen(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!newCampaignName.trim() || !newCampaignJobId}
                  className="text-xs h-9 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

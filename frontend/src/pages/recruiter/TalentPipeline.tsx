import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { updateCandidateStage } from '../../store/slices/recruiterSlice';
import { Candidate, CandidatePipelineStage } from '../../types/recruiter';
import { calculateMatchScore, MatchResult } from '../../utils/matchScore';
import { candidateService } from '../../services/candidateService';
import { applicationService } from '../../services/applicationService';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { 
  Search, Briefcase, MapPin, Calendar, 
  CheckCircle2, XCircle, FileText, Sparkles, Users, 
  ChevronRight, ChevronLeft, ArrowUpDown, Filter, Clock,
  X, Download, Phone, Mail, Github, Linkedin, RotateCcw,
  Target, Building, UserCheck, UserX, Check
} from 'lucide-react';

const STAGES: CandidatePipelineStage[] = [
  'Sourced',
  'Screening',
  'Shortlisted',
  'Interview',
  'Selected',
  'Offer',
  'Hired',
  'Rejected'
];

export function TalentPipeline() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { jobs, campaigns } = useAppSelector((state: RootState) => state.recruiter);
  const { user } = useAppSelector((state: RootState) => state.auth);

  // Local state for candidates from API
  const [pipelineCandidates, setPipelineCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    return (location.state as any)?.jobId || 'ALL';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');

  // Candidate detail modal state (driven by ID to prevent stale state references)
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(() => {
    return (location.state as any)?.candidateId || null;
  });
  const [profileTab, setProfileTab] = useState<'overview' | 'resume' | 'matching'>('overview');

  useEffect(() => {
    if ((location.state as any)?.jobId) {
      setSelectedJobId((location.state as any).jobId);
    }
    if ((location.state as any)?.candidateId) {
      setActiveCandidateId((location.state as any).candidateId);
    }
  }, [location.state]);

  // Fetch Candidates from API
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const jobIdParam = selectedJobId !== 'ALL' ? selectedJobId : undefined;
        const data = await candidateService.listCandidates(jobIdParam);
        setPipelineCandidates(data);
      } catch (err: any) {
        console.error("Failed to fetch candidates:", err);
        setError(err.message || "Failed to load candidates");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, [selectedJobId]);

  // Derive active candidate live from API state
  const activeCandidate = useMemo(() => {
    if (!activeCandidateId) return null;
    return pipelineCandidates.find(c => c.id === activeCandidateId) || null;
  }, [pipelineCandidates, activeCandidateId]);

  // Drag and drop state
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Extract all unique skills across all candidates for filter dropdown
  const availableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    pipelineCandidates.forEach(c => {
      const skills = c.resumeData?.skills || c.matchedSkills || [];
      skills.forEach(s => {
        if (s && s.trim()) skillSet.add(s.trim());
      });
    });
    return Array.from(skillSet).sort();
  }, [pipelineCandidates]);

  // Filtered candidates list
  const filteredCandidates = useMemo(() => {
    let result = [...pipelineCandidates];

    // Job filter: strictly filter by jobId when a specific job is selected
    if (selectedJobId !== 'ALL') {
      result = result.filter(c => c.jobId === selectedJobId);
    }

    // Search query: name, role, location, email, and skills
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

    return result;
  }, [pipelineCandidates, selectedJobId, searchQuery, stageFilter, selectedSkillFilter]);

  // State Transition Action (Drag/Drop or Select) - Pessimistic API Update
  const handleStageChange = async (id: string, newStage: CandidatePipelineStage) => {
    const candidate = pipelineCandidates.find(c => c.id === id);
    if (!candidate) return;
    
    if (!candidate.applicationId) {
      console.warn("Candidate lacks applicationId, cannot update stage via API.");
      return;
    }

    setIsLoading(true);
    try {
      if (newStage === 'Rejected') {
        await applicationService.rejectApplication(candidate.applicationId);
      } else {
        await applicationService.updateApplicationStage(candidate.applicationId, newStage);
      }
      
      // On success, update local state
      setPipelineCandidates(prev => prev.map(c => c.id === id ? { ...c, pipelineStage: newStage } : c));
    } catch (err: any) {
      console.error("Failed to update stage:", err);
      alert("Failed to update candidate stage. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData("candidateId", id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, stage: CandidatePipelineStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("candidateId") || e.dataTransfer.getData("text/plain") || draggingId;
    if (id) {
      handleStageChange(id, stage);
      setDraggingId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    setDraggingId(null);
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
    setSelectedJobId('ALL');
    setSearchQuery('');
    setStageFilter('ALL');
    setSelectedSkillFilter('ALL');
  };

  const activeFiltersCount = (selectedJobId !== 'ALL' ? 1 : 0) + 
    (searchQuery.trim() ? 1 : 0) + 
    (stageFilter !== 'ALL' ? 1 : 0) + 
    (selectedSkillFilter !== 'ALL' ? 1 : 0);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="space-y-6 animate-fade-in max-w-full pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Talent Pipeline</h1>
            {selectedJob && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 font-medium">
                {selectedJob.title}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage candidate lifecycle across recruitment stages with drag-and-drop or stage selectors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1 font-medium bg-secondary/30">
            Total Pipeline: {filteredCandidates.length} Candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            id="pipeline-search-input"
            aria-label="Search candidates"
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
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Job Filter */}
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger aria-label="Filter candidates by job requisition" className="w-[190px] h-9 text-xs">
              <SelectValue placeholder="All Job Requisitions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs font-medium">All Job Requisitions</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id} className="text-xs">{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stage Filter */}
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger aria-label="Filter by stage" className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs font-medium">All Stages</SelectItem>
              {STAGES.map(s => (
                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Skill Filter */}
          <Select value={selectedSkillFilter} onValueChange={setSelectedSkillFilter}>
            <SelectTrigger aria-label="Filter by technical skill" className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs font-medium">All Skills</SelectItem>
              {availableSkills.map(skill => (
                <SelectItem key={skill} value={skill} className="text-xs">{skill}</SelectItem>
              ))}
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

      {/* Kanban Board Container */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium mb-4">
          {error}
        </div>
      )}
      <div className={`flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-280px)] items-start transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {STAGES.map(stage => {
          const stageCandidates = filteredCandidates.filter(c => c.pipelineStage === stage);

          return (
            <div 
              key={stage} 
              id={`pipeline-column-${stage.toLowerCase()}`}
              className={`flex flex-col gap-3 min-w-[300px] max-w-[300px] bg-secondary/15 rounded-xl p-3 border shrink-0 transition-colors ${
                stage === 'Hired' 
                  ? 'border-purple-500/30 bg-purple-500/5' 
                  : stage === 'Rejected'
                  ? 'border-destructive/20 bg-destructive/5'
                  : stage === 'Shortlisted'
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-border/60'
              }`}
              onDrop={(e) => handleDrop(e, stage)}
              onDragOver={handleDragOver}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-foreground">{stage}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs font-bold ${
                      stage === 'Hired' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : stage === 'Rejected'
                        ? 'bg-destructive/20 text-destructive'
                        : stage === 'Shortlisted'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {stageCandidates.length}
                  </Badge>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-3 flex-1 min-h-[220px] max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
                {stageCandidates.map(candidate => {
                  const job = candidate.jobId ? jobs.find(j => j.id === candidate.jobId) : (selectedJob || jobs[0]);
                  const skills = candidate.resumeData?.skills || candidate.matchedSkills || [];
                  const match = job ? calculateMatchScore(candidate, job) : null;
                  const isBeingDragged = draggingId === candidate.id;

                  return (
                    <div 
                      key={candidate.id}
                      id={`candidate-card-${candidate.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-card border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all shadow-sm space-y-3 group ${
                        isBeingDragged ? 'opacity-40 scale-95 border-dashed border-primary' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center min-w-0">
                          <Avatar className="h-9 w-9 border border-border shrink-0">
                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                              {candidate.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 
                              className="text-sm font-bold text-foreground hover:text-primary cursor-pointer leading-tight truncate transition-colors"
                              onClick={() => { 
                                setActiveCandidateId(candidate.id); 
                                setProfileTab('overview'); 
                              }}
                            >
                              {candidate.name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{candidate.role}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        {job && (
                          <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                            <Briefcase className="h-3 w-3 shrink-0 text-primary" />
                            <span className="truncate">{job.title}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          {match ? (
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] font-bold ${
                                match.matchScore >= 80 
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                  : match.matchScore >= 60 
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                                  : 'bg-destructive/15 text-destructive border-destructive/30'
                              }`}
                            >
                              {match.matchScore}% Match
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Match unavailable</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {candidate.appliedAt || candidate.time || 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Candidate Skills preview */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="outline" className="text-[9px] py-0 px-1.5 bg-secondary/30 text-muted-foreground">
                              {skill}
                            </Badge>
                          ))}
                          {skills.length > 3 && (
                            <span className="text-[9px] text-muted-foreground">+{skills.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Quick Stage Switcher & View Profile Button */}
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => { 
                            setActiveCandidateId(candidate.id); 
                            setProfileTab('overview'); 
                          }}
                        >
                          View Profile
                        </Button>

                        <Select 
                          value={candidate.pipelineStage} 
                          onValueChange={(val) => handleStageChange(candidate.id, val as CandidatePipelineStage)}
                        >
                          <SelectTrigger 
                            aria-label={`Change stage for ${candidate.name}`}
                            className="h-7 text-[11px] w-[120px] px-2"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map(s => (
                              <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                    </div>
                  );
                })}

                {stageCandidates.length === 0 && (
                  <div className="flex items-center justify-center h-32 border border-dashed border-border/60 rounded-xl text-xs text-muted-foreground/60">
                    No candidates in {stage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Profile / Details / Resume Modal Drawer */}
      {activeCandidate && (() => {
        const activeJob = activeCandidate.jobId 
          ? jobs.find(j => j.id === activeCandidate.jobId) 
          : (selectedJob || jobs[0]);
        const activeMatch: MatchResult | null = activeJob ? calculateMatchScore(activeCandidate, activeJob) : null;

        return (
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-pipeline-modal-title"
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
                      <h2 id="candidate-pipeline-modal-title" className="text-xl font-bold text-foreground">
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

                    {/* Contact & Pipeline Status Details */}
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
                          Application & Requisition
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground">Pipeline Stage:</span>
                            <span className="font-bold text-foreground">{activeCandidate.pipelineStage}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-muted-foreground">Applied Date:</span>
                            <span className="font-medium text-foreground">
                              {activeCandidate.appliedAt || activeCandidate.time || 'Recent'}
                            </span>
                          </div>
                          {activeJob && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-muted-foreground">Requisition:</span>
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
                          <XCircle className="h-3.5 w-3.5" /> Missing Requirements ({activeMatch.missingSkills.length})
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
                  <span className="text-xs text-muted-foreground">Move Stage:</span>
                  <Select 
                    value={activeCandidate.pipelineStage} 
                    onValueChange={(val) => handleStageChange(activeCandidate.id, val as CandidatePipelineStage)}
                  >
                    <SelectTrigger aria-label="Change candidate stage" className="w-[150px] text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map(s => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {activeCandidate.pipelineStage !== 'Shortlisted' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStageChange(activeCandidate.id, 'Shortlisted')}
                      className="text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Shortlist
                    </Button>
                  )}

                  {activeCandidate.pipelineStage !== 'Rejected' && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleStageChange(activeCandidate.id, 'Rejected')}
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
    </div>
  );
}

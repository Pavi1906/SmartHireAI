import * as React from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Users, 
  Filter, 
  Star, 
  Clock, 
  MapPin, 
  Search, 
  CheckCircle2, 
  X, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  SlidersHorizontal,
  BrainCircuit
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import { updateCandidateStage, seedRecruiterDemoData } from '../../store/slices/recruiterSlice';
import { CandidatePipelineStage } from '../../types/recruiter';
import { calculateMatchScore, MatchResult } from '../../utils/matchScore';
import { useNavigate } from 'react-router-dom';

const PIPELINE_STAGES: CandidatePipelineStage[] = [
  'Sourced',
  'Screening',
  'Shortlisted',
  'Interview',
  'Selected',
  'Offer',
  'Hired',
  'Rejected'
];

export function RecruiterDashboard() {
  const { candidates, jobs, campaigns } = useAppSelector((state: RootState) => state.recruiter);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [reviewCandidateId, setReviewCandidateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSemanticSearch, setShowSemanticSearch] = useState(false);
  const [semanticQuery, setSemanticQuery] = useState('');
  
  // Advanced Filter states
  const [jobFilter, setJobFilter] = useState<string>('ALL');
  const [minScoreFilter, setMinScoreFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Persistence helper
  const persistRecruiterState = (updatedCandidates: typeof candidates) => {
    if (user && user.id) {
      const currentState = { jobs, candidates: updatedCandidates, campaigns };
      localStorage.setItem(`smarthireai_user_${user.id}_recruiter`, JSON.stringify(currentState));
    }
  };

  const handleStageUpdate = (id: string, stage: CandidatePipelineStage) => {
    dispatch(updateCandidateStage({ id, stage }));
    const updated = candidates.map(c => c.id === id ? { ...c, pipelineStage: stage } : c);
    persistRecruiterState(updated);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("candidateId", id);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("candidateId");
    if (id) {
      handleStageUpdate(id, status as CandidatePipelineStage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getCandidatesByStatus = (status: string) => {
    return candidates.filter(c => c.pipelineStage === status);
  };

  // Extract all unique skills across candidates
  const availableSkills = useMemo(() => {
    const skillSet = new Set<string>();
    candidates.forEach(c => {
      c.resumeData?.skills?.forEach(s => skillSet.add(s));
      c.matchedSkills?.forEach(s => skillSet.add(s));
    });
    return Array.from(skillSet).sort();
  }, [candidates]);

  // Extract all unique locations
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    candidates.forEach(c => {
      if (c.location) locSet.add(c.location);
    });
    return Array.from(locSet).sort();
  }, [candidates]);

  // Determine active default job for scoring
  const activePublishedJob = useMemo(() => {
    return jobs.find(j => j.status === 'published') || jobs[0] || null;
  }, [jobs]);

  // Compute matched score and object for every candidate deterministically
  const candidateScores = useMemo(() => {
    const map = new Map<string, MatchResult>();
    candidates.forEach(candidate => {
      let targetJob = null;
      if (jobFilter !== 'ALL') {
        targetJob = jobs.find(j => j.id === jobFilter);
      } else if (candidate.jobId) {
        targetJob = jobs.find(j => j.id === candidate.jobId);
      }
      if (!targetJob) {
        targetJob = activePublishedJob;
      }

      if (targetJob) {
        map.set(candidate.id, calculateMatchScore(candidate, targetJob));
      } else {
        map.set(candidate.id, {
          matchScore: 50,
          confidence: 50,
          matchedSkills: candidate.resumeData?.skills || [],
          missingSkills: [],
          recommendation: 'Candidate profile active in workspace.'
        });
      }
    });
    return map;
  }, [candidates, jobs, jobFilter, activePublishedJob]);

  // Filter and rank candidates
  const filteredRankedCandidates = useMemo(() => {
    let list = [...candidates];

    // Job Filter
    if (jobFilter !== 'ALL') {
      list = list.filter(c => c.jobId === jobFilter || !c.jobId);
    }

    // Pipeline Stage Filter
    if (stageFilter !== 'ALL') {
      list = list.filter(c => c.pipelineStage === stageFilter);
    }

    // Minimum Score Filter
    if (minScoreFilter !== 'ALL') {
      const minVal = parseInt(minScoreFilter, 10);
      list = list.filter(c => {
        const score = candidateScores.get(c.id)?.matchScore || 0;
        return score >= minVal;
      });
    }

    // Skill Filter
    if (skillFilter !== 'ALL') {
      list = list.filter(c => {
        const skills = c.resumeData?.skills || [];
        return skills.some(s => s.toLowerCase() === skillFilter.toLowerCase());
      });
    }

    // Location Filter
    if (locationFilter !== 'ALL') {
      list = list.filter(c => c.location && c.location.toLowerCase() === locationFilter.toLowerCase());
    }

    // Search Query (name, role, skills, location)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const roleMatch = c.role.toLowerCase().includes(q);
        const locationMatch = c.location?.toLowerCase().includes(q);
        const skillMatch = c.resumeData?.skills?.some(s => s.toLowerCase().includes(q));
        return nameMatch || roleMatch || locationMatch || skillMatch;
      });
    }

    // Sort descending by calculated canonical match score
    list.sort((a, b) => {
      const scoreA = candidateScores.get(a.id)?.matchScore || 0;
      const scoreB = candidateScores.get(b.id)?.matchScore || 0;
      return scoreB - scoreA;
    });

    return list;
  }, [candidates, jobFilter, stageFilter, minScoreFilter, skillFilter, locationFilter, searchQuery, candidateScores]);

  // Semantic search results (deterministic keyword & profile vector intersection)
  const semanticSearchResults = useMemo(() => {
    if (!semanticQuery.trim()) return [];
    const queryTokens = semanticQuery.toLowerCase().split(/[\s,+/]+/).filter(t => t.length > 1);
    
    return candidates.map(c => {
      const skills = (c.resumeData?.skills || []).map(s => s.toLowerCase());
      const role = c.role.toLowerCase();
      const expText = (c.resumeData?.experience || []).flatMap(e => [e.company, e.role, ...(e.achievements || [])]).join(' ').toLowerCase();

      let matchedTokens = 0;
      queryTokens.forEach(token => {
        if (skills.some(s => s.includes(token) || token.includes(s)) || role.includes(token) || expText.includes(token)) {
          matchedTokens++;
        }
      });

      const semanticMatchRate = queryTokens.length > 0 ? Math.round((matchedTokens / queryTokens.length) * 100) : 0;

      return {
        candidate: c,
        semanticScore: semanticMatchRate,
        matchedTokenCount: matchedTokens,
        totalTokens: queryTokens.length
      };
    }).filter(res => res.matchedTokenCount > 0)
      .sort((a, b) => b.semanticScore - a.semanticScore);
  }, [candidates, semanticQuery]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (jobFilter !== 'ALL') count++;
    if (minScoreFilter !== 'ALL') count++;
    if (stageFilter !== 'ALL') count++;
    if (skillFilter !== 'ALL') count++;
    if (locationFilter !== 'ALL') count++;
    return count;
  }, [jobFilter, minScoreFilter, stageFilter, skillFilter, locationFilter]);

  const clearAllFilters = () => {
    setJobFilter('ALL');
    setMinScoreFilter('ALL');
    setStageFilter('ALL');
    setSkillFilter('ALL');
    setLocationFilter('ALL');
    setSearchQuery('');
  };

  // Selected candidate for review modal
  const selectedCandidate = candidates.find(c => c.id === reviewCandidateId);
  const selectedCandidateJob = useMemo(() => {
    if (!selectedCandidate) return null;
    if (jobFilter !== 'ALL') return jobs.find(j => j.id === jobFilter) || null;
    if (selectedCandidate.jobId) return jobs.find(j => j.id === selectedCandidate.jobId) || null;
    return activePublishedJob;
  }, [selectedCandidate, jobFilter, jobs, activePublishedJob]);

  const selectedCandidateMatch = useMemo(() => {
    if (!selectedCandidate || !selectedCandidateJob) return null;
    return calculateMatchScore(selectedCandidate, selectedCandidateJob);
  }, [selectedCandidate, selectedCandidateJob]);

  // Dynamic count of strong matches in pool (score >= 75%)
  const strongMatchesCount = useMemo(() => {
    const scores = Array.from(candidateScores.values()) as MatchResult[];
    return scores.filter(m => m.matchScore >= 75).length;
  }, [candidateScores]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Candidate Review Modal */}
      <Dialog open={!!reviewCandidateId} onOpenChange={(open) => !open && setReviewCandidateId(null)}>
        {selectedCandidate && (
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={selectedCandidate.avatar || `https://i.pravatar.cc/150?u=${selectedCandidate.id}`} />
                    <AvatarFallback>{selectedCandidate.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-xl font-bold">{selectedCandidate.name}</DialogTitle>
                      <Badge variant="outline" className="text-xs">{selectedCandidate.pipelineStage}</Badge>
                    </div>
                    <DialogDescription className="flex items-center gap-3 text-xs mt-0.5">
                      <span>{selectedCandidate.role}</span>
                      {selectedCandidate.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedCandidate.location}</span>
                      )}
                    </DialogDescription>
                  </div>
                </div>
                {selectedCandidateMatch && (
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold px-2.5 py-1">
                      {selectedCandidateMatch.matchScore}% Match
                    </Badge>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{selectedCandidateMatch.confidence}% Confidence</div>
                  </div>
                )}
              </div>
            </DialogHeader>

            <div className="py-4 border-y border-border max-h-[55vh] overflow-y-auto pr-2 space-y-6">
              {/* Evaluated Job Requisition */}
              {selectedCandidateJob && (
                <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-lg border border-border text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" /> Evaluated Requisition:
                  </span>
                  <span className="font-semibold text-foreground">{selectedCandidateJob.title}</span>
                </div>
              )}

              {/* AI Recommendation */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Match Recommendation
                </h4>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedCandidateMatch ? selectedCandidateMatch.recommendation : (selectedCandidate.recommendation || "Candidate's profile is active in workspace.")}
                  </p>
                </div>
              </div>

              {/* Requirement Match Analysis */}
              {selectedCandidateMatch && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Requirement Match Analysis</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-emerald-500/[0.03] border border-emerald-500/10 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Matched Skills ({selectedCandidateMatch.matchedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidateMatch.matchedSkills.map((s: string) => (
                          <Badge key={s} variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{s}</Badge>
                        ))}
                        {selectedCandidateMatch.matchedSkills.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">None identified</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 bg-destructive/[0.03] border border-destructive/10 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                        <X className="h-3.5 w-3.5" /> Missing Skills ({selectedCandidateMatch.missingSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidateMatch.missingSkills.map((s: string) => (
                          <Badge key={s} variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">{s}</Badge>
                        ))}
                        {selectedCandidateMatch.missingSkills.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">All core requirements met</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidate Resume Data */}
              {selectedCandidate.resumeData && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Profile Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.resumeData.skills?.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                      {!selectedCandidate.resumeData.skills?.length && <span className="text-sm text-muted-foreground">No skills listed</span>}
                    </div>
                  </div>

                  {selectedCandidate.resumeData.experience && selectedCandidate.resumeData.experience.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Work History</h4>
                      <div className="space-y-3">
                        {selectedCandidate.resumeData.experience.map((exp: any, i: number) => (
                          <div key={i} className="text-sm space-y-1 bg-white/[0.02] p-3 rounded-lg border border-border">
                            <div className="flex justify-between items-center">
                              <h5 className="font-semibold text-foreground">{exp.role} <span className="text-muted-foreground font-normal">at {exp.company}</span></h5>
                              <span className="text-xs text-muted-foreground">{exp.duration}</span>
                            </div>
                            {exp.achievements && exp.achievements.length > 0 && (
                              <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-0.5 mt-1">
                                {exp.achievements.map((ach: string, j: number) => (
                                  <li key={j}>{ach}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCandidate.resumeData.education && selectedCandidate.resumeData.education.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Education</h4>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        {selectedCandidate.resumeData.education.map((edu: any, i: number) => (
                          <div key={i} className="flex justify-between bg-white/[0.02] p-2.5 rounded-lg border border-border">
                            <span className="font-medium text-foreground">{edu.degree} - {edu.school}</span>
                            <span>{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Stage Transition Selector */}
              <div className="bg-secondary/30 p-3 rounded-lg border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">Current Stage:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PIPELINE_STAGES.map(stage => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => handleStageUpdate(selectedCandidate.id, stage)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        selectedCandidate.pipelineStage === stage
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'bg-white/5 hover:bg-white/10 text-muted-foreground'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setReviewCandidateId(null)}>Close</Button>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    handleStageUpdate(selectedCandidate.id, 'Rejected');
                    setReviewCandidateId(null);
                  }}
                >
                  Reject
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    handleStageUpdate(selectedCandidate.id, 'Interview');
                    setReviewCandidateId(null);
                  }}
                >
                  Schedule Interview
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    handleStageUpdate(selectedCandidate.id, 'Shortlisted');
                    setReviewCandidateId(null);
                  }}
                >
                  Shortlist
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Semantic Search Dialog */}
      <Dialog open={showSemanticSearch} onOpenChange={setShowSemanticSearch}>
        <div className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <DialogTitle>Deterministic Vector & Keyword Search</DialogTitle>
            </div>
            <DialogDescription>
              Query candidate profiles and work experience by natural language requirements using deterministic token and skill matching.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g., Senior Full Stack developer with React, Node.js, and AWS microservices..."
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
                className="pl-9 pr-8"
              />
              {semanticQuery && (
                <button
                  type="button"
                  onClick={() => setSemanticQuery('')}
                  className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold">Quick Queries:</span>
              {['Full Stack Engineer React', 'AI Machine Learning PyTorch', 'Cloud SRE Kubernetes', 'Frontend UI/UX Tailwind'].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSemanticQuery(q)}
                  className="bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11px] text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 max-h-[50vh] overflow-y-auto space-y-3 pr-1">
            {!semanticQuery.trim() ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Enter target qualifications, technical skills, or role descriptions above to scan candidate resumes.
              </div>
            ) : semanticSearchResults.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No candidates matched the query tokens. Try adjusting or broadening keywords.
              </div>
            ) : (
              semanticSearchResults.map(({ candidate, semanticScore, matchedTokenCount, totalTokens }) => (
                <div key={candidate.id} className="p-3.5 rounded-lg border border-border bg-white/[0.02] flex items-center justify-between gap-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={candidate.avatar || `https://i.pravatar.cc/150?u=${candidate.id}`} />
                      <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{candidate.name}</h4>
                        <Badge variant="outline" className="text-[10px]">{candidate.pipelineStage}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{candidate.role}</span>
                        {candidate.location && <span>• {candidate.location}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {candidate.resumeData?.skills?.slice(0, 4).map(s => (
                          <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{semanticScore}%</div>
                      <div className="text-[10px] text-muted-foreground">{matchedTokenCount}/{totalTokens} tokens</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setShowSemanticSearch(false);
                        setReviewCandidateId(candidate.id);
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setShowSemanticSearch(false)}>Close</Button>
          </div>
        </div>
      </Dialog>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Workspace</h1>
          <p className="text-muted-foreground mt-1">Manage your pipeline and discover top talent.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant={showAdvancedFilters || activeFilterCount > 0 ? "secondary" : "outline"} 
            className="gap-2 relative"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button 
            className="gap-2"
            onClick={() => setShowSemanticSearch(true)}
          >
            <Search className="h-4 w-4" />
            Semantic Search
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card className="bg-secondary/20 border-border p-4 animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Advanced Candidate Filters</h3>
            </div>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1">
                <RotateCcw className="h-3 w-3" /> Clear All Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Job Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Target Requisition</label>
              <select
                aria-label="Target Requisition"
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Jobs ({jobs.length})</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            {/* Minimum Match Score Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Minimum Match Score</label>
              <select
                aria-label="Minimum Match Score"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Scores</option>
                <option value="90">90%+ Strong Match</option>
                <option value="80">80%+ Good Match</option>
                <option value="70">70%+ Qualified</option>
              </select>
            </div>

            {/* Pipeline Stage Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Pipeline Stage</label>
              <select
                aria-label="Pipeline Stage"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Stages</option>
                {PIPELINE_STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Skill Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Technical Skill</label>
              <select
                aria-label="Technical Skill"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Skills</option>
                {availableSkills.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <select
                aria-label="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Locations</option>
                {availableLocations.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Matched Candidates Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
            <div>
              <CardTitle>Top Matched Candidates</CardTitle>
              <CardDescription>
                AI-scored deterministically against {jobFilter !== 'ALL' ? jobs.find(j => j.id === jobFilter)?.title : activePublishedJob?.title || 'active requisitions'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-semibold">
                {strongMatchesCount} Strong Matches
              </Badge>
            </div>
          </CardHeader>

          {/* Candidate Search Bar */}
          <div className="p-4 border-b border-white/5 bg-white/[0.01]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, role, skill, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {candidates.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No candidates found in the database.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => dispatch(seedRecruiterDemoData())}>
                    Seed Demo Candidates
                  </Button>
                </div>
              ) : filteredRankedCandidates.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No candidates match the selected filters or search query.
                  </p>
                  <Button size="sm" variant="outline" onClick={clearAllFilters} className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
                  </Button>
                </div>
              ) : (
                filteredRankedCandidates.map((candidate) => {
                  const match = candidateScores.get(candidate.id);
                  const score = match ? match.matchScore : 0;

                  return (
                    <div 
                      key={candidate.id} 
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-border">
                          <AvatarImage src={candidate.avatar || `https://i.pravatar.cc/150?u=${candidate.id}`} />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-base">{candidate.name}</h4>
                            <Badge variant="outline" className="text-[10px]">{candidate.pipelineStage}</Badge>
                            {score >= 90 && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><BriefcaseIcon className="h-3 w-3" /> {candidate.role}</span>
                            {candidate.location && (
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {candidate.location}</span>
                            )}
                          </div>
                          {candidate.resumeData?.skills && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {candidate.resumeData.skills.slice(0, 4).map(skill => (
                                <Badge key={skill} variant="secondary" className="text-[9px] px-1.5 py-0">
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.resumeData.skills.length > 4 && (
                                <span className="text-[10px] text-muted-foreground self-center">
                                  +{candidate.resumeData.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-5 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">{score}%</div>
                          <div className="text-[10px] text-muted-foreground">Match Score</div>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => setReviewCandidateId(candidate.id)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {filteredRankedCandidates.length > 0 && (
              <div className="p-3.5 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground bg-white/[0.01]">
                <span>Showing {filteredRankedCandidates.length} of {candidates.length} candidates</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary hover:text-primary gap-1 p-0 h-auto"
                  onClick={() => navigate('/candidates')}
                >
                  View in Talent Pipeline <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Analytics & Auto-Sourcing */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Active Pipeline
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground hover:text-foreground h-7 p-1"
                onClick={() => navigate('/candidates')}
              >
                Pipeline <ArrowRight className="h-3 w-3 ml-0.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div 
                onDragOver={handleDragOver} 
                onDrop={(e) => handleDrop(e, 'Sourced')}
                onClick={() => navigate('/candidates?stage=Sourced')}
                className="cursor-pointer hover:bg-white/[0.02] p-1.5 rounded transition-colors"
              >
                <PipelineItem stage="Sourced" count={getCandidatesByStatus('Sourced').length} color="bg-blue-500" />
              </div>
              <div 
                onDragOver={handleDragOver} 
                onDrop={(e) => handleDrop(e, 'Screening')}
                onClick={() => navigate('/candidates?stage=Screening')}
                className="cursor-pointer hover:bg-white/[0.02] p-1.5 rounded transition-colors"
              >
                <PipelineItem stage="Screening" count={getCandidatesByStatus('Screening').length} color="bg-amber-500" />
              </div>
              <div 
                onDragOver={handleDragOver} 
                onDrop={(e) => handleDrop(e, 'Shortlisted')}
                onClick={() => navigate('/candidates?stage=Shortlisted')}
                className="cursor-pointer hover:bg-white/[0.02] p-1.5 rounded transition-colors"
              >
                <PipelineItem stage="Shortlisted" count={getCandidatesByStatus('Shortlisted').length} color="bg-cyan-500" />
              </div>
              <div 
                onDragOver={handleDragOver} 
                onDrop={(e) => handleDrop(e, 'Interview')}
                onClick={() => navigate('/candidates?stage=Interview')}
                className="cursor-pointer hover:bg-white/[0.02] p-1.5 rounded transition-colors"
              >
                <PipelineItem stage="Interview" count={getCandidatesByStatus('Interview').length} color="bg-purple-500" />
              </div>
              <div 
                onDragOver={handleDragOver} 
                onDrop={(e) => handleDrop(e, 'Offer')}
                onClick={() => navigate('/candidates?stage=Offer')}
                className="cursor-pointer hover:bg-white/[0.02] p-1.5 rounded transition-colors"
              >
                <PipelineItem stage="Offer" count={getCandidatesByStatus('Offer').length} color="bg-emerald-500" />
              </div>
              <div 
                onDragOver={handleDragOver} 
                onDrop={(e) => handleDrop(e, 'Hired')}
                onClick={() => navigate('/candidates?stage=Hired')}
                className="cursor-pointer hover:bg-white/[0.02] p-1.5 rounded transition-colors"
              >
                <PipelineItem stage="Hired" count={getCandidatesByStatus('Hired').length} color="bg-green-400" />
              </div>
            </CardContent>
          </Card>

          {/* Auto-Sourcing Status Panel */}
          {activePublishedJob ? (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between text-primary">
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-primary" /> Auto-Sourcing Active
                  </span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  The SmartHireAI sourcing engine is continuously scoring candidate vectors for <strong className="text-foreground">"{activePublishedJob.title}"</strong>.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Clock className="h-3.5 w-3.5 animate-spin" /> Scanning {candidates.length} candidate profiles in workspace...
                </div>
                <div className="pt-2 border-t border-primary/10 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{campaigns.length} Active Campaigns</span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-primary text-xs"
                    onClick={() => navigate('/campaigns')}
                  >
                    Manage Campaigns &rarr;
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" /> No Active Requisitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Publish a job requisition to activate automated candidate matching and sourcing campaigns.
                </p>
                <Button size="sm" variant="outline" onClick={() => navigate('/recruiter/jobs')}>
                  View Job Posts
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineItem({ stage, count, color }: { stage: string, count: number, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-sm font-medium">{stage}</span>
      </div>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
}

function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

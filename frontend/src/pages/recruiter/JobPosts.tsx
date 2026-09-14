import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { RootState } from '../../store';
import {
  addJob,
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
  archiveJob,
  reopenJob,
  duplicateJob,
  fetchJobs,
} from '../../store/slices/recruiterSlice';
// jobService imports removed; using Redux thunks instead
import { 
  Job, 
  JobStatus, 
  WorkplaceType, 
  EmploymentType 
} from '../../types/recruiter';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { 
  Plus, 
  Briefcase, 
  Users, 
  BrainCircuit, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Copy, 
  Trash2, 
  Archive, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  RotateCcw, 
  ArrowRight, 
  X, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WORKPLACE_TYPES: WorkplaceType[] = ['Remote', 'Hybrid', 'On-site'];
const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Contract', 'Part-time', 'Internship'];
const COMMON_DEPARTMENTS = [
  'Core Product Engineering',
  'Applied Intelligence',
  'Platform Operations',
  'Design Systems',
  'Mobile Engineering',
  'Data Engineering',
  'Security & Compliance'
];

interface FormErrors {
  title?: string;
  department?: string;
  location?: string;
  description?: string;
  requiredSkills?: string;
}

export function JobPosts() {
  const { jobs, candidates, campaigns } = useAppSelector((state: RootState) => state.recruiter);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [workplaceFilter, setWorkplaceFilter] = useState<string>('ALL');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [deleteConfirmJobId, setDeleteConfirmJobId] = useState<string | null>(null);

  // Loading/Error states
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Core Product Engineering');
  const [formLocation, setFormLocation] = useState('San Francisco, CA');
  const [formWorkplaceType, setFormWorkplaceType] = useState<WorkplaceType>('Hybrid');
  const [formEmploymentType, setFormEmploymentType] = useState<EmploymentType>('Full-time');
  const [formSalary, setFormSalary] = useState('$140,000 - $180,000');
  const [formExperience, setFormExperience] = useState('3-5 years');
  const [formEducation, setFormEducation] = useState("Bachelor's in Computer Science or equivalent");
  const [formDescription, setFormDescription] = useState('');
  const [formResponsibilities, setFormResponsibilities] = useState('');
  
  // Skills form state
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');

  // Parser / Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionFeedback, setExtractionFeedback] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Initial load
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        await dispatch(fetchJobs()).unwrap();
      } catch (err) {
        setIsError('Failed to load jobs');
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, [dispatch]);

  // Helper for localStorage persistence (Legacy)
  const persistJobsState = (updatedJobs: Job[]) => {
    if (user && user.id) {
      const currentState = { jobs: updatedJobs, candidates, campaigns };
      localStorage.setItem(`smarthireai_user_${user.id}_recruiter`, JSON.stringify(currentState));
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingJobId(null);
    setFormTitle('');
    setFormDepartment('Core Product Engineering');
    setFormLocation('San Francisco, CA');
    setFormWorkplaceType('Hybrid');
    setFormEmploymentType('Full-time');
    setFormSalary('$140,000 - $180,000');
    setFormExperience('3-5 years');
    setFormEducation("Bachelor's in Computer Science or equivalent");
    setFormDescription('');
    setFormResponsibilities('');
    setRequiredSkills([]);
    setPreferredSkills([]);
    setNewRequiredSkill('');
    setNewPreferredSkill('');
    setExtractionFeedback(null);
    setFormErrors({});
  };

  // Open Create Job Modal
  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Open Edit Job Modal
  const handleOpenEdit = (job: Job) => {
    setEditingJobId(job.id);
    setFormTitle(job.title);
    setFormDepartment(job.department || 'Engineering');
    setFormLocation(job.location || 'Remote');
    setFormWorkplaceType(job.workplaceType || 'Hybrid');
    setFormEmploymentType((job.type as EmploymentType) || 'Full-time');
    setFormSalary(job.salary || '');
    setFormExperience(job.experience || '');
    setFormEducation(job.education || '');
    setFormDescription(job.description || '');
    setFormResponsibilities(Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '');
    setRequiredSkills([...job.requiredSkills]);
    setPreferredSkills([...(job.preferredSkills || [])]);
    setNewRequiredSkill('');
    setNewPreferredSkill('');
    setExtractionFeedback(null);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Deterministic rule-based requirement extraction
  const handleExtractRequirements = () => {
    if (!formDescription.trim()) {
      setFormErrors(prev => ({ ...prev, description: 'Please enter a job description to extract requirements from.' }));
      return;
    }

    setIsExtracting(true);
    setExtractionFeedback(null);

    // Run deterministic regex parser across job description text
    const text = formDescription;

    // Technical skills dictionary
    const knownSkills = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'PyTorch', 'TensorFlow', 
      'AWS', 'Kubernetes', 'Docker', 'PostgreSQL', 'GraphQL', 'FastAPI', 'Go', 'Rust', 
      'Java', 'C++', 'Redis', 'MongoDB', 'Terraform', 'Next.js', 'Tailwind CSS', 'Figma', 
      'CI/CD', 'Linux', 'Microservices', 'SQL', 'LLMs', 'Vector Databases', 'LangChain', 
      'OpenTelemetry', 'Grafana', 'Prometheus', 'HTML5', 'CSS3', 'REST APIs', 'Spring Boot'
    ];

    const extractedReqSkills = new Set<string>();
    knownSkills.forEach(skill => {
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        extractedReqSkills.add(skill);
      }
    });

    // Detect experience
    const expMatch = text.match(/(\d+\s*(?:-\s*\d+)?\+?\s*(?:years|yrs|year))/i);
    if (expMatch) {
      setFormExperience(`${expMatch[1]} of relevant experience`);
    }

    // Detect education
    if (/master'?s|phd|doctorate/i.test(text)) {
      setFormEducation("Master's or Ph.D. in Computer Science, Engineering, or related field");
    } else if (/bachelor'?s|b\.s\.|b\.e\.|b\.tech/i.test(text)) {
      setFormEducation("Bachelor's in Computer Science, Software Engineering, or equivalent");
    }

    // Detect workplace type
    if (/\bremote\b/i.test(text)) {
      setFormWorkplaceType('Remote');
    } else if (/\bhybrid\b/i.test(text)) {
      setFormWorkplaceType('Hybrid');
    } else if (/\bon-site|onsite|in-office\b/i.test(text)) {
      setFormWorkplaceType('On-site');
    }

    // Detect salary
    const salaryMatch = text.match(/(\$\s*\d{2,3}(?:,\d{3}|k)?\s*(?:-|to)\s*\$?\s*\d{2,3}(?:,\d{3}|k)?)/i);
    if (salaryMatch) {
      setFormSalary(salaryMatch[1]);
    }

    // Populate skills into form
    if (extractedReqSkills.size > 0) {
      const skillsArray = Array.from(extractedReqSkills);
      // Split into required vs preferred
      const req = skillsArray.slice(0, 6);
      const pref = skillsArray.slice(6, 10);
      
      setRequiredSkills(prev => Array.from(new Set([...prev, ...req])));
      if (pref.length > 0) {
        setPreferredSkills(prev => Array.from(new Set([...prev, ...pref])));
      }
      setExtractionFeedback(`Successfully extracted ${extractedReqSkills.size} technical skills and requisition parameters.`);
    } else {
      setExtractionFeedback('Analysis complete: No standardized tech keywords identified. You can add skills manually.');
    }

    setIsExtracting(false);
  };

  // Skill input management with duplicate & whitespace normalization
  const handleAddRequiredSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const normalized = newRequiredSkill.trim();
    if (!normalized) return;

    // Case-insensitive duplicate check
    const isDuplicate = requiredSkills.some(s => s.toLowerCase() === normalized.toLowerCase());
    if (!isDuplicate) {
      setRequiredSkills(prev => [...prev, normalized]);
      setFormErrors(prev => ({ ...prev, requiredSkills: undefined }));
    }
    setNewRequiredSkill('');
  };

  const handleRemoveRequiredSkill = (skillToRemove: string) => {
    setRequiredSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddPreferredSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const normalized = newPreferredSkill.trim();
    if (!normalized) return;

    const isDuplicate = preferredSkills.some(s => s.toLowerCase() === normalized.toLowerCase()) ||
      requiredSkills.some(s => s.toLowerCase() === normalized.toLowerCase());
    if (!isDuplicate) {
      setPreferredSkills(prev => [...prev, normalized]);
    }
    setNewPreferredSkill('');
  };

  const handleRemovePreferredSkill = (skillToRemove: string) => {
    setPreferredSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  // Validate form
  const validateForm = (isPublishing: boolean): boolean => {
    const errors: FormErrors = {};

    if (!formTitle.trim()) {
      errors.title = 'Job title is required.';
    } else if (formTitle.trim().length < 3) {
      errors.title = 'Job title must be at least 3 characters.';
    }

    if (!formDepartment.trim()) {
      errors.department = 'Department is required.';
    }

    if (!formLocation.trim()) {
      errors.location = 'Location is required.';
    }

    if (!formDescription.trim()) {
      errors.description = 'Job description is required.';
    } else if (formDescription.trim().length < 15) {
      errors.description = 'Job description must be at least 15 characters.';
    }

    if (requiredSkills.length === 0) {
      errors.requiredSkills = 'At least 1 required skill must be added.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Job (Draft or Publish)
  const handleSave = (targetStatus: JobStatus) => {
    const isValid = validateForm(targetStatus === 'published');
    if (!isValid) return;

    const responsibilitiesArray = formResponsibilities
      .split('\n')
      .map(r => r.trim().replace(/^[-*•]\s*/, ''))
      .filter(r => r.length > 0);

    const jobData = {
      title: formTitle.trim(),
      department: formDepartment.trim(),
      description: formDescription.trim(),
      responsibilities: responsibilitiesArray,
      requiredSkills: requiredSkills,
      preferredSkills: preferredSkills,
      experience: formExperience.trim(),
      education: formEducation.trim(),
      location: formLocation.trim(),
      workplaceType: formWorkplaceType,
      type: formEmploymentType,
      salary: formSalary.trim(),
      status: targetStatus
    };
    if (editingJobId) {
      // Update existing job via thunk
      dispatch(updateJob({ id: editingJobId, dto: jobData }));
      setIsFormOpen(false);
      resetForm();
    } else {
      // Create new job via thunk
      dispatch(createJob(jobData));
      setIsFormOpen(false);
      resetForm();
    }
  };

  // Job Status Action Handlers
  const handlePublish = (id: string) => {
    dispatch(publishJob(id))
      .unwrap()
      .catch(() => {
        setIsError('Failed to publish job');
      });
  };

// Job Status Action Handlers
const handleClose = (id: string) => {
  dispatch(closeJob(id))
    .unwrap()
    .catch(() => setIsError('Failed to close job'));
};

const handleArchive = (id: string) => {
  dispatch(archiveJob(id))
    .unwrap()
    .catch(() => setIsError('Failed to archive job'));
};

const handleReopen = (id: string) => {
  dispatch(reopenJob(id))
    .unwrap()
    .catch(() => setIsError('Failed to reopen job'));
};

const handleDuplicate = (id: string) => {
  dispatch(duplicateJob(id))
    .unwrap()
    .then((dup) => {
      dispatch(addJob(dup));
    })
    .catch(() => setIsError('Failed to duplicate job'));
};

const handleDelete = (id: string) => {
  dispatch(deleteJob(id))
    .unwrap()
    .catch(() => setIsError('Failed to delete job'));
  setDeleteConfirmJobId(null);
};

  // Dynamic applicant counts per job
  const getJobApplicantCount = (jobId: string) => {
    const linkedCandidates = candidates.filter(c => c.jobId === jobId);
    if (linkedCandidates.length > 0) {
      return linkedCandidates.length;
    }
    const job = jobs.find(j => j.id === jobId);
    return job?.applicantCount || 0;
  };

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => {
      if (j.department) set.add(j.department);
    });
    return Array.from(set).sort();
  }, [jobs]);

  // Counts by status
  const statusCounts = useMemo(() => {
    return {
      all: jobs.length,
      published: jobs.filter(j => j.status === 'published').length,
      draft: jobs.filter(j => j.status === 'draft').length,
      closed: jobs.filter(j => j.status === 'closed').length,
      archived: jobs.filter(j => j.status === 'archived').length,
    };
  }, [jobs]);

  // Filtered and searched jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Status Filter
      if (statusFilter !== 'ALL' && job.status !== statusFilter) {
        return false;
      }

      // Department Filter
      if (departmentFilter !== 'ALL' && job.department !== departmentFilter) {
        return false;
      }

      // Workplace Type Filter
      if (workplaceFilter !== 'ALL' && job.workplaceType !== workplaceFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = job.title.toLowerCase().includes(q);
        const inDept = job.department?.toLowerCase().includes(q);
        const inLoc = job.location?.toLowerCase().includes(q);
        const inDesc = job.description?.toLowerCase().includes(q);
        const inReqSkills = job.requiredSkills?.some(s => s.toLowerCase().includes(q));
        const inPrefSkills = job.preferredSkills?.some(s => s.toLowerCase().includes(q));
        return inTitle || inDept || inLoc || inDesc || inReqSkills || inPrefSkills;
      }

      return true;
    });
  }, [jobs, statusFilter, departmentFilter, workplaceFilter, searchQuery]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setWorkplaceFilter('ALL');
  };

  const activeFiltersCount = (statusFilter !== 'ALL' ? 1 : 0) + 
    (departmentFilter !== 'ALL' ? 1 : 0) + 
    (workplaceFilter !== 'ALL' ? 1 : 0) + 
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Requisitions</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and publish job postings to match with verified candidates.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Create Requisition
        </Button>
      </div>

      {/* Status Badges Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {[
          { key: 'ALL', label: 'All Requisitions', count: statusCounts.all },
          { key: 'published', label: 'Published', count: statusCounts.published, color: 'text-emerald-400' },
          { key: 'draft', label: 'Drafts', count: statusCounts.draft, color: 'text-amber-400' },
          { key: 'closed', label: 'Closed', count: statusCounts.closed, color: 'text-muted-foreground' },
          { key: 'archived', label: 'Archived', count: statusCounts.archived, color: 'text-slate-400' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              statusFilter === tab.key 
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm' 
                : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === tab.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/80 text-foreground'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Secondary Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-secondary/10 p-3 rounded-lg border border-border">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requisitions by title, skill, department, or location..."
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

        {/* Department Filter */}
        <div className="w-full md:w-56">
          <select
            aria-label="Department Filter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Workplace Type Filter */}
        <div className="w-full md:w-44">
          <select
            aria-label="Workplace Type Filter"
            value={workplaceFilter}
            onChange={(e) => setWorkplaceFilter(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Workplace Types</option>
            {WORKPLACE_TYPES.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters} 
            className="text-xs text-muted-foreground hover:text-foreground h-9 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
          </Button>
        )}
      </div>

      {/* Jobs List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-card rounded-xl border border-border space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No job requisitions created yet</h3>
              <p className="text-muted-foreground max-w-md text-sm">
                Create your first job requisition to start matching qualified candidates from the database.
              </p>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Create First Job
            </Button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] text-center p-8 bg-card rounded-xl border border-border space-y-3">
            <Filter className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No matching requisitions</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              No jobs matched your current filter criteria or search query.
            </p>
            <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          </div>
        ) : (
          filteredJobs.map(job => {
            const applicantCount = getJobApplicantCount(job.id);
            const isExpanded = expandedJobId === job.id;

            return (
              <Card key={job.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6">
                    {/* Job Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
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

                      {/* Meta information tags */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> 
                          {job.location} ({job.workplaceType})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-primary" /> 
                          {job.type}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1.5 text-foreground font-medium">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> 
                            {job.salary}
                          </span>
                        )}
                        {job.experience && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" /> 
                            {job.experience}
                          </span>
                        )}
                        {job.education && (
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" /> 
                            {job.education}
                          </span>
                        )}
                      </div>

                      {/* Skills Badges */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-muted-foreground mr-1">Required:</span>
                          {job.requiredSkills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                              {skill}
                            </Badge>
                          ))}
                          {job.requiredSkills.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">None specified</span>
                          )}
                        </div>

                        {job.preferredSkills && job.preferredSkills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-muted-foreground mr-1">Preferred:</span>
                            {job.preferredSkills.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs text-muted-foreground">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Description preview / full toggle */}
                      <div className="text-sm text-muted-foreground pt-1">
                        <p className={isExpanded ? '' : 'line-clamp-2'}>{job.description}</p>
                        
                        {isExpanded && job.responsibilities && job.responsibilities.length > 0 && (
                          <div className="mt-3 space-y-1.5 pl-2 border-l-2 border-primary/30">
                            <span className="text-xs font-semibold text-foreground block">Key Responsibilities:</span>
                            <ul className="list-disc pl-4 text-xs space-y-1">
                              {job.responsibilities.map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                          className="text-xs text-primary hover:underline mt-1.5 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>Show less <ChevronUp className="h-3 w-3" /></>
                          ) : (
                            <>Read more <ChevronDown className="h-3 w-3" /></>
                          )}
                        </button>
                      </div>

                      {/* Timestamps */}
                      <div className="text-[11px] text-muted-foreground flex items-center gap-3 pt-1">
                        <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Updated: {new Date(job.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions & Applicant Controls */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-between lg:justify-start lg:w-48 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                      {/* Applicants Indicator */}
                      <Button 
                        variant="outline" 
                        className="w-full justify-between gap-2"
                        onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                      >
                        <span className="flex items-center gap-1.5 text-xs">
                          <Users className="h-4 w-4 text-primary" /> Applicants
                        </span>
                        <Badge className="bg-primary text-primary-foreground font-bold text-xs h-5 px-1.5">
                          {applicantCount}
                        </Badge>
                      </Button>

                      {/* Find Matches in Sourcing Campaigns */}
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="w-full justify-start gap-2 text-xs"
                        onClick={() => navigate(`/campaigns`, { state: { jobId: job.id } })}
                      >
                        <Search className="h-3.5 w-3.5 text-primary" /> Find Matches
                      </Button>

                      {/* Status Transition Buttons */}
                      {job.status === 'draft' && (
                        <Button 
                          size="sm" 
                          className="w-full justify-start gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handlePublish(job.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Publish Job
                        </Button>
                      )}

                      {job.status === 'published' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start gap-2 text-xs text-amber-400 hover:text-amber-300"
                          onClick={() => handleClose(job.id)}
                        >
                          <Clock className="h-3.5 w-3.5" /> Close Job
                        </Button>
                      )}

                      {(job.status === 'closed' || job.status === 'archived') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start gap-2 text-xs text-emerald-400 hover:text-emerald-300"
                          onClick={() => handleReopen(job.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Reopen Job
                        </Button>
                      )}

                      {/* Secondary Actions Toolbar */}
                      <div className="flex items-center gap-1 pt-1 border-t border-border mt-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(job)}
                          title="Edit Requisition"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleDuplicate(job.id)}
                          title="Duplicate Requisition"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                        </Button>
                        {job.status !== 'archived' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-muted-foreground hover:text-slate-300"
                            onClick={() => handleArchive(job.id)}
                            title="Archive Requisition"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirmJobId(job.id)}
                          title="Delete Requisition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create / Edit Job Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && setIsFormOpen(false)}>
        <div className="space-y-5 max-h-[85vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle>{editingJobId ? 'Edit Job Requisition' : 'Create Job Requisition'}</DialogTitle>
            <DialogDescription>
              {editingJobId 
                ? 'Update requisition requirements, skills, and compensation parameters.' 
                : 'Define role requirements or paste a full description to parse parameters automatically.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="job-title" className="text-xs font-semibold">Job Title *</Label>
                <Input
                  id="job-title"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (formErrors.title) setFormErrors(prev => ({ ...prev, title: undefined }));
                  }}
                  placeholder="e.g., Senior Full Stack Engineer"
                  className={formErrors.title ? 'border-destructive' : ''}
                />
                {formErrors.title && <p className="text-[11px] text-destructive">{formErrors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-department" className="text-xs font-semibold">Department *</Label>
                <select
                  id="job-department"
                  value={formDepartment}
                  onChange={(e) => {
                    setFormDepartment(e.target.value);
                    if (formErrors.department) setFormErrors(prev => ({ ...prev, department: undefined }));
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {COMMON_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {formErrors.department && <p className="text-[11px] text-destructive">{formErrors.department}</p>}
              </div>
            </div>

            {/* Location, Workplace Type, Employment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="job-location" className="text-xs font-semibold">Location *</Label>
                <Input
                  id="job-location"
                  value={formLocation}
                  onChange={(e) => {
                    setFormLocation(e.target.value);
                    if (formErrors.location) setFormErrors(prev => ({ ...prev, location: undefined }));
                  }}
                  placeholder="e.g. San Francisco, CA"
                  className={formErrors.location ? 'border-destructive' : ''}
                />
                {formErrors.location && <p className="text-[11px] text-destructive">{formErrors.location}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-workplace" className="text-xs font-semibold">Workplace Type</Label>
                <select
                  id="job-workplace"
                  value={formWorkplaceType}
                  onChange={(e) => setFormWorkplaceType(e.target.value as WorkplaceType)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {WORKPLACE_TYPES.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-employment" className="text-xs font-semibold">Employment Type</Label>
                <select
                  id="job-employment"
                  value={formEmploymentType}
                  onChange={(e) => setFormEmploymentType(e.target.value as EmploymentType)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {EMPLOYMENT_TYPES.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary, Experience, Education */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="job-salary" className="text-xs font-semibold">Salary Range</Label>
                <Input
                  id="job-salary"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  placeholder="e.g. $140,000 - $180,000"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-experience" className="text-xs font-semibold">Experience Requirement</Label>
                <Input
                  id="job-experience"
                  value={formExperience}
                  onChange={(e) => setFormExperience(e.target.value)}
                  placeholder="e.g. 3-5 years"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="job-education" className="text-xs font-semibold">Education Requirement</Label>
                <Input
                  id="job-education"
                  value={formEducation}
                  onChange={(e) => setFormEducation(e.target.value)}
                  placeholder="e.g. Bachelor's in CS"
                />
              </div>
            </div>

            {/* Job Description Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="job-desc" className="text-xs font-semibold">Full Job Description *</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleExtractRequirements} 
                  disabled={!formDescription.trim() || isExtracting}
                  className="h-7 text-xs text-primary hover:text-primary gap-1"
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  {isExtracting ? 'Extracting...' : 'Auto-Extract Requirements'}
                </Button>
              </div>
              <Textarea
                id="job-desc"
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  if (formErrors.description) setFormErrors(prev => ({ ...prev, description: undefined }));
                }}
                placeholder="Paste the full job requisition description here to parse technical requirements automatically..."
                className={`h-28 text-sm ${formErrors.description ? 'border-destructive' : ''}`}
              />
              {formErrors.description && <p className="text-[11px] text-destructive">{formErrors.description}</p>}
              {extractionFeedback && (
                <div className="p-2 rounded bg-primary/10 text-primary text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{extractionFeedback}</span>
                </div>
              )}
            </div>

            {/* Key Responsibilities */}
            <div className="space-y-1.5">
              <Label htmlFor="job-responsibilities" className="text-xs font-semibold">
                Key Responsibilities <span className="text-muted-foreground font-normal">(one per line)</span>
              </Label>
              <Textarea
                id="job-responsibilities"
                value={formResponsibilities}
                onChange={(e) => setFormResponsibilities(e.target.value)}
                placeholder="Architect resilient microservices in Node.js&#10;Lead frontend accessibility audits&#10;Partner with product design teams..."
                className="h-20 text-sm"
              />
            </div>

            {/* Required Skills Manager */}
            <div className="space-y-2 bg-secondary/10 p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Required Skills * <span className="text-muted-foreground font-normal">(essential for matching)</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">{requiredSkills.length} added</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequiredSkill();
                    }
                  }}
                  placeholder="Type skill & press Enter (e.g. React, TypeScript)..."
                  className="h-8 text-xs flex-1"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddRequiredSkill} className="h-8 text-xs">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {requiredSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveRequiredSkill(skill)}
                      className="hover:text-destructive text-muted-foreground ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {requiredSkills.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No required skills added yet.</span>
                )}
              </div>
              {formErrors.requiredSkills && <p className="text-[11px] text-destructive">{formErrors.requiredSkills}</p>}
            </div>

            {/* Preferred Skills Manager */}
            <div className="space-y-2 bg-secondary/10 p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Preferred Skills <span className="text-muted-foreground font-normal">(nice to have bonus factors)</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">{preferredSkills.length} added</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newPreferredSkill}
                  onChange={(e) => setNewPreferredSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPreferredSkill();
                    }
                  }}
                  placeholder="Type preferred skill & press Enter (e.g. Docker, GraphQL)..."
                  className="h-8 text-xs flex-1"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddPreferredSkill} className="h-8 text-xs">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {preferredSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemovePreferredSkill(skill)}
                      className="hover:text-destructive text-muted-foreground ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {preferredSkills.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No preferred skills specified.</span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => handleSave('draft')}
              >
                Save as Draft
              </Button>
              <Button 
                onClick={() => handleSave('published')}
              >
                Publish Job
              </Button>
            </div>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmJobId} onOpenChange={(open) => !open && setDeleteConfirmJobId(null)}>
        <div className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle>Delete Job Requisition</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete this job requisition? Candidates and applicants associated with this job will be safely preserved in the database.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmJobId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => deleteConfirmJobId && handleDelete(deleteConfirmJobId)}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

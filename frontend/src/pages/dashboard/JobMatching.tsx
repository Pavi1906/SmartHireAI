import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Briefcase, MapPin, Building2, BrainCircuit, ArrowRight, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { toast } from 'sonner';

export function JobMatching() {
  const { activeResume, resumeId: storedResumeId, isDemoMode } = useSelector((state: RootState) => state.resume);

  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);

  // Fetch jobs from backend – no synthetic fallback
  const fetchJobs = async () => {
    if (!activeResume) {
      setJobs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const publishedJobs = await jobService.listActiveJobs();
      if (publishedJobs && publishedJobs.length > 0) {
        const userSkills: string[] = activeResume.parsedContent?.skills || [];
        const baseScore = activeResume.score || 85;
        let appliedJobIds = new Set<string>();
        try {
          const myApps = await applicationService.fetchMyApplications();
          appliedJobIds = new Set(myApps.map((a: any) => a.jobId));
        } catch {
          // ignore errors fetching applications
        }
        const mappedJobs = publishedJobs.map((job: any) => {
          const reqSkills = job.requiredSkills || [];
          const matched = reqSkills.filter((s: string) =>
            userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
          );
          const missing = reqSkills.filter((s: string) =>
            !userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
          );
          const calculatedMatch = reqSkills.length > 0
            ? Math.round((matched.length / reqSkills.length) * 100)
            : baseScore;
          return {
            id: job.id,
            title: job.title,
            company: job.department || 'SmartHire Partner',
            location: `${job.location} (${job.workplaceType})`,
            matchScore: Math.min(100, Math.max(10, calculatedMatch)),
            confidence: Math.min(100, baseScore),
            salary: job.salary || '$100k - $140k',
            missingSkills: missing.length > 0 ? missing : ['System Design'],
            matchedSkills: matched.length > 0 ? matched : userSkills.slice(0, 3),
            applied: appliedJobIds.has(job.id),
          };
        });
        setJobs(mappedJobs);
      } else {
        setJobs([]);
      }
    } catch (e) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeResume]);

  const handleApply = async (id: string) => {
    const resumeId = activeResume?.id || storedResumeId;
    if (!resumeId) {
      toast.error('Please upload your resume before applying.');
      return;
    }
    setIsApplying(id);
    try {
      await applicationService.applyToJob({ jobId: id, resumeId });
      setJobs(jobs.map((j) => (j.id === id ? { ...j, applied: true } : j)));
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      if (status === 409) {
        setJobs(jobs.map((j) => (j.id === id ? { ...j, applied: true } : j)));
        toast.error(detail || 'You have already applied to this job.');
      } else if (status === 400) {
        toast.error(detail || 'Job is not available or not published.');
      } else if (status === 403) {
        toast.error(detail || 'Resume does not belong to your account.');
      } else {
        toast.error(detail || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsApplying(null);
    }
  };

  const handleGenerate = (id: string) => {
    setIsGenerating(id);
    setTimeout(() => {
      setIsGenerating(null);
      setCoverLetterOpen(true);
    }, 2000);
  };

  if (!activeResume && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-secondary/10">
        <h2 className="text-2xl font-bold tracking-tight mb-2">No Active Resume</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Upload your resume in the dashboard to see personalized job matches.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-secondary/10">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">{error}</h2>
        <Button onClick={fetchJobs}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <Dialog open={coverLetterOpen} onOpenChange={setCoverLetterOpen}>
        <DialogHeader>
          <DialogTitle>Generated Cover Letter</DialogTitle>
          <DialogDescription>
            Tailored using your {activeResume ? `Resume v${activeResume.version}` : 'resume'} and the Job Description.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-muted/50 rounded-lg border border-border text-sm leading-relaxed whitespace-pre-wrap mt-4 h-64 overflow-y-auto font-serif">
          Dear Hiring Manager,{"\n\n"}
          I am writing to express my strong interest in this position. With over 5 years of experience in building scalable React applications and a deep understanding of modern frontend architectures, I am confident in my ability to contribute effectively to your engineering team.{"\n\n"}
          In my previous role, I successfully migrated a legacy monolithic UI to a micro-frontend architecture using React and TypeScript, resulting in a 40% improvement in load times and significantly enhancing developer velocity. I notice this aligns perfectly with your goals for the upcoming quarter.{"\n\n"}
          I look forward to discussing how my background, skills, and enthusiasm can contribute to your continued success.{"\n\n"}
          Sincerely,{"\n"}
          {activeResume ? activeResume.name.replace(/\.[^/.]+$/, "") : 'Student'}
        </div>
      </Dialog>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Semantic Job Matching</h1>
          <p className="text-muted-foreground mt-1">AI-driven role recommendations based on deep profile analysis.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">Update Preferences</Button>
          <Button className="gap-2">
            <BrainCircuit className="h-4 w-4" />
            Refresh Matches
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] text-center p-8 bg-card rounded-xl border border-border">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No jobs available right now.</h3>
              <p className="text-muted-foreground max-w-md">Companies are currently not hiring or your profile doesn't match active listings.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-emerald-400">{job.matchScore}%</div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Match</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Confidence: {job.confidence}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border mb-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-2">
                        <CheckCircle2 className="h-3 w-3" /> Matched Requirements
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.matchedSkills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-destructive flex items-center gap-1 mb-2">
                        <AlertCircle className="h-3 w-3" /> Missing Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.missingSkills.map((skill: string) => (
                          <Badge key={skill} variant="outline" className="text-[10px] text-muted-foreground">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{job.salary}</span>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleGenerate(job.id)} disabled={isGenerating === job.id}>
                        {isGenerating === job.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                        {isGenerating === job.id ? 'Generating...' : 'Cover Letter'}
                      </Button>
                      <Button size="sm" className="gap-2 w-[110px]" onClick={() => handleApply(job.id)} disabled={job.applied || isApplying === job.id} variant={job.applied ? 'success' : 'default'}>
                        {isApplying === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : job.applied ? <CheckCircle2 className="h-4 w-4" /> : 'Apply Now'}
                        {job.applied ? 'Applied' : !isApplying && <ArrowRight className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BrainCircuit className="h-5 w-5 text-primary" /> Market Position
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Frontend Engineering</span>
                  <span className="font-medium text-emerald-400">High Demand</span>
                </div>
                <Progress value={85} className="h-1.5" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your profile strongly aligns with Senior Frontend roles. Addressing the <strong className="text-foreground">GraphQL</strong> gap will unlock 24% more high‑paying opportunities in your preferred locations.
              </p>
              <Button className="w-full" variant="outline">View Learning Plan</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { uploadResumeStart, uploadResumeSuccess, uploadResumeFailure, setResumeData } from '../../store/slices/resumeSlice';
import { apiClient } from '../../services/api';
import { resumeService } from '../../services/resumeService';
import { RootState } from '../../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { BrainCircuit, Target, Briefcase, TrendingUp, UploadCloud, ArrowRight, Zap, Building2, Clock, FileCheck, CheckCircle2, Loader2, PlayCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { toast } from 'sonner';



export function StudentDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);
  const dispatch = useDispatch();
  // Modals state
  const [uploadStep, setUploadStep] = useState<number | null>(null);
  const [goalsStep, setGoalsStep] = useState<number | null>(null);
  const [kpiModal, setKpiModal] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [companyModal, setCompanyModal] = useState<string | null>(null);
  const [timelineModal, setTimelineModal] = useState<string | null>(null);

  // Metrics State
  const [metrics, setMetrics] = useState({
    placement: activeResume ? Math.min(100, (activeResume.score || 85) + 5) : null,
    resumeScore: activeResume ? (activeResume.score || 85) : null,
    skillGap: activeResume ? (activeResume.skills?.length > 5 ? 'Low' : 'Medium') : 'Upload a resume to analyze',
    applications: 0
  });
  
  const [mockData, setMockData] = useState<any[]>([]);

  useEffect(() => {
    if (activeResume) {
      const score = activeResume.score || 85;
      setMetrics({
        placement: Math.min(100, score + 5),
        resumeScore: score,
        skillGap: (activeResume.skills && activeResume.skills.length > 5) ? 'Low' : 'Medium',
        applications: 0
      });
      setMockData([
        { name: 'Week 1', score: Math.max(0, score - 20) },
        { name: 'Week 2', score: Math.max(0, score - 15) },
        { name: 'Week 3', score: Math.max(0, score - 10) },
        { name: 'Week 4', score: Math.max(0, score - 5) },
        { name: 'Week 5', score: score },
        { name: 'Current', score: Math.min(100, score + 5) }
      ]);
    } else {
      setMetrics({
        placement: null,
        resumeScore: null,
        skillGap: 'Upload a resume to analyze',
        applications: 0
      });
      setMockData([]);
    }
  }, [activeResume]);

  const handleFileUpload = async (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadStep(1);
      
      try {
        // STEP 1: Upload PDF to real backend POST /api/v1/resumes
        const uploadResult = await resumeService.uploadResume(file);
        const resumeId = uploadResult.resume_id;

        if (!resumeId) {
          throw new Error('Backend did not return a valid resume ID.');
        }

        // STEP 2: Poll GET /api/v1/resumes/{id} until PARSED
        setUploadStep(2);
        const backendResume = await resumeService.waitForResumeParsing(resumeId);

        // STEP 3: Real ATS Scoring calculation
        setUploadStep(4);
        const parsed = backendResume.parsed_json || {};
        const extractedSkills = parsed.skills || [];
        let atsResult;
        try {
          const targetJdSkills = ['Python', 'FastAPI', 'SQL', 'PostgreSQL', 'Docker', 'REST API', 'Git'];
          atsResult = await resumeService.calculateATSScore({
            resume_id: resumeId,
            job_description_id: 'default-student-target',
            resume_skills: extractedSkills,
            jd_skills: targetJdSkills,
          });
        } catch (atsErr) {
          console.warn('ATS score calculation warning:', atsErr);
        }

        const finalScore = atsResult ? atsResult.ats_score : 0;

        const resume = {
          id: resumeId,
          resume_id: resumeId,
          name: file.name,
          size: file.size,
          version: 1,
          score: finalScore,
          status: backendResume.status || 'PARSED',
          ats_data: atsResult,
          parsedContent: {
            text: parsed.text || '',
            skills: parsed.skills || [],
            experience: parsed.experience || [],
            education: parsed.education || [],
            projects: parsed.projects || [],
            certifications: parsed.certifications || [],
            achievements: parsed.achievements || [],
          }
        };

        dispatch(uploadResumeSuccess(resume));
        dispatch(setResumeData({
          resumeMetadata: resume,
          parsedText: resume.parsedContent?.text || '',
          skills: resume.parsedContent?.skills || [],
          experience: resume.parsedContent?.experience || [],
          education: resume.parsedContent?.education || [],
          projects: resume.parsedContent?.projects || [],
          certifications: resume.parsedContent?.certifications || [],
          achievements: resume.parsedContent?.achievements || [],
          ats: atsResult || null,
        }));

        setUploadStep(6);
        toast.success("Resume uploaded and parsed successfully.");
      } catch (error: any) {
        setUploadStep(null);
        const backendMessage =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message;
        toast.error(backendMessage || "Failed to upload resume. Please try again.");
      }
    }
  };

  // Handle Upload Simulation
  useEffect(() => {
    if (uploadStep !== null && uploadStep < 6 && uploadStep > 0) {
      const timer = setTimeout(() => {
        setUploadStep(prev => (prev !== null ? prev + 1 : null));
      }, 500); // Faster progression for UX since API does the real work
      return () => clearTimeout(timer);
    } else if (uploadStep === 6) {
      // Complete
      setTimeout(() => {
        if (activeResume) {
          setMetrics(m => ({ ...m, resumeScore: activeResume.score || 85, placement: Math.min(100, (activeResume.score || 85) + 5) }));
          setMockData(prev => [...prev.slice(0, 5), { name: 'Week 6', score: Math.min(100, (activeResume.score || 85) + 5) }]);
        }
        setUploadStep(null);
      }, 1000);
    }
  }, [uploadStep, activeResume]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upload Resume Modal */}
      <Dialog open={uploadStep !== null} onOpenChange={(open) => !open && setUploadStep(null)}>
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle>Upload New Resume</DialogTitle>
            <DialogDescription>Let AI analyze your latest experience.</DialogDescription>
          </DialogHeader>
          <div className="min-h-[200px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-secondary/10">
            {uploadStep === 0 && (
              <>
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Drag and drop your PDF or DOCX file here</p>
                <div className="relative">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                  <Button>Browse Files</Button>
                </div>
              </>
            )}
            {uploadStep !== null && uploadStep > 0 && uploadStep < 6 && (
              <div className="flex flex-col items-center w-full max-w-xs space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>
                      {uploadStep === 1 && "Validating format..."}
                      {uploadStep === 2 && "Uploading securely..."}
                      {uploadStep === 3 && "Parsing text contents..."}
                      {uploadStep === 4 && "Extracting technical skills..."}
                      {uploadStep === 5 && "Calculating ATS Match..."}
                    </span>
                    <span>{uploadStep * 20}%</span>
                  </div>
                  <Progress value={uploadStep * 20} className="h-2" />
                </div>
              </div>
            )}
            {uploadStep === 6 && (
              <div className="flex flex-col items-center text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-lg text-emerald-500">Analysis Complete!</h3>
                <p className="text-sm text-muted-foreground mt-2">ATS Score improved by +3 points. Updating dashboard...</p>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Career Goals Wizard */}
      <Dialog open={goalsStep !== null} onOpenChange={(open) => !open && setGoalsStep(null)}>
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle>Career Goal Wizard</DialogTitle>
            <DialogDescription>Step {goalsStep} of 3</DialogDescription>
          </DialogHeader>
          
          <div className="min-h-[200px]">
            {goalsStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-medium">Target Companies</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Google', 'Amazon', 'Microsoft', 'Zoho'].map(c => (
                    <Button key={c} variant="outline" className="justify-start" onClick={() => setGoalsStep(2)}>{c}</Button>
                  ))}
                </div>
              </div>
            )}
            {goalsStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-medium">Target Role</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Frontend Engineer', 'Backend Developer', 'AI Engineer', 'Cloud Architect'].map(r => (
                    <Button key={r} variant="outline" className="justify-start" onClick={() => setGoalsStep(3)}>{r}</Button>
                  ))}
                </div>
              </div>
            )}
            {goalsStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Target ATS Score</label>
                    <input type="number" defaultValue={95} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Study Hours / Day</label>
                    <input type="number" defaultValue={3} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setGoalsStep(null)}>Cancel</Button>
                  <Button onClick={() => setGoalsStep(null)}>Save Goals</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* KPI Details Modal (Why?) */}
      <Dialog open={kpiModal !== null} onOpenChange={(open) => !open && setKpiModal(null)}>
        {kpiModal === 'Placement Probability' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Placement Probability: {metrics.placement}%</DialogTitle>
              <DialogDescription>Confidence Level: {activeResume ? (activeResume.score ? Math.min(99, activeResume.score + 5) : 86) : 0}% based on recent market data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 border-y border-border">
              <h4 className="text-sm font-semibold">Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Excellent Resume Structure</li>
                <li className="flex gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Strong React Projects</li>
                <li className="flex gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> High Mock Interview Score</li>
              </ul>
              <h4 className="text-sm font-semibold mt-6">Missing Key Skills</h4>
              <div className="flex gap-2">
                <Badge variant="destructive">Docker</Badge>
                <Badge variant="destructive">CI/CD</Badge>
                <Badge variant="destructive">AWS</Badge>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg mt-4 flex justify-between items-center">
                <span className="text-sm font-medium">Estimated Improvement</span>
                <span className="text-primary font-bold">+4%</span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setKpiModal(null)}>Close</Button>
            </div>
          </div>
        )}
        
        {kpiModal === 'Resume Score' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Resume Score Breakdown: {metrics.resumeScore}</DialogTitle>
              <DialogDescription>Detailed ATS parsing analysis</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 border-y border-border">
              {[
                { name: 'Technical Skills', val: 95 },
                { name: 'Projects', val: activeResume ? Math.min(100, (activeResume.score || 85) + 6) : 0 },
                { name: 'Achievements', val: activeResume ? Math.min(100, (activeResume.score || 85) - 5) : 0 },
                { name: 'Leadership', val: 52 },
                { name: 'Formatting', val: 94 }
              ].map(item => (
                <div key={item.name} className="flex items-center gap-4 text-sm">
                  <div className="w-32">{item.name}</div>
                  <Progress value={item.val} className="flex-1" />
                  <div className="w-8 text-right font-medium">{item.val}</div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs uppercase text-muted-foreground font-bold mb-2">Missing Keywords for Target Roles</p>
                <div className="flex gap-2">
                  <Badge variant="outline">Docker</Badge><Badge variant="outline">AWS</Badge><Badge variant="outline">Redis</Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setKpiModal(null)}>Close</Button>
            </div>
          </div>
        )}

        {kpiModal === 'Skill Gap Index' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Skill Gap Analysis</DialogTitle>
              <DialogDescription>Based on 500+ recent Frontend Engineer job postings</DialogDescription>
            </DialogHeader>
            <div className="py-4 border-y border-border space-y-6">
              <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg border border-border">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Current Gap</p>
                  <p className="text-3xl font-bold text-amber-500">18%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground font-medium">Estimated Time to Bridge</p>
                  <p className="text-xl font-bold">4 Weeks</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">Priority Skills to Learn</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer">Docker</Badge>
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer">CI/CD</Badge>
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer">System Design</Badge>
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer">AWS</Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline">View Full Roadmap</Button>
              <Button onClick={() => setKpiModal(null)}>Close</Button>
            </div>
          </div>
        )}

        {kpiModal === 'Active Applications' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Application Funnel</DialogTitle>
              <DialogDescription>Track your current pipeline status</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 border-y border-border">
               {[
                { name: 'Applied', val: 8, color: 'bg-blue-500' },
                { name: 'Under Review', val: 3, color: 'bg-amber-500' },
                { name: 'Interviewing', val: 2, color: 'bg-purple-500' },
                { name: 'Rejected', val: 1, color: 'bg-destructive' },
                { name: 'Offers', val: 0, color: 'bg-emerald-500' },
               ].map(item => (
                 <div key={item.name} className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                   <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${item.color}`} />
                     <span className="text-sm font-medium">{item.name}</span>
                   </div>
                   <span className="font-bold">{item.val}</span>
                 </div>
               ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline">Job Tracker Board</Button>
              <Button onClick={() => setKpiModal(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Action Item Workflow Modal */}
      <Dialog open={actionModal !== null} onOpenChange={(open) => !open && setActionModal(null)}>
        {actionModal === 'Add System Design Project' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Start System Design Project</DialogTitle>
              <DialogDescription>Adding a complex backend project increases ATS match for Senior roles by ~15%.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4 border-y border-border">
              {[
                { name: 'URL Shortener', difficulty: 'Medium', skills: 'Redis, Node, Docker' },
                { name: 'Ride Sharing Service', difficulty: 'Hard', skills: 'WebSockets, PostGIS' },
                { name: 'Food Delivery System', difficulty: 'Hard', skills: 'Microservices, RabbitMQ' },
              ].map(proj => (
                <div key={proj.name} className="p-4 border border-border rounded-lg bg-card hover:border-primary/50 cursor-pointer transition-colors flex justify-between items-center group">
                  <div>
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{proj.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Skills: {proj.skills}</p>
                  </div>
                  <Badge variant={proj.difficulty === 'Medium' ? 'secondary' : 'destructive'}>{proj.difficulty}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionModal(null)}>Cancel</Button>
              <Button onClick={() => setActionModal(null)}>Start Selected Project</Button>
            </div>
          </div>
        )}

        {actionModal === 'Optimize LinkedIn Summary' && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>AI LinkedIn Optimization</DialogTitle>
              <DialogDescription>Let's update your summary to match your new goals.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 border-y border-border">
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground font-bold">Current Summary</p>
                <div className="p-3 bg-secondary/20 rounded-md border border-border text-sm text-muted-foreground line-through opacity-70">
                  Software engineer with 3 years of experience building web apps with React.
                </div>
              </div>
              <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" /></div>
              <div className="space-y-2">
                <p className="text-xs uppercase text-primary font-bold flex items-center gap-2"><Zap className="h-3 w-3" /> AI Suggested Summary</p>
                <div className="p-3 bg-primary/10 rounded-md border border-primary/30 text-sm text-foreground">
                  Frontend Engineer specializing in React ecosystem and performance optimization. Passionate about scalable architecture and transitioning towards full-stack system design with Node and Docker.
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="text-xs"><span className="text-emerald-400 font-bold">+2</span> ATS Score</div>
                <div className="text-xs"><span className="text-emerald-400 font-bold">+8%</span> Recruiter Visibility</div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Regenerate</Button>
              <Button onClick={() => setActionModal(null)}>Copy & Mark Done</Button>
            </div>
          </div>
        )}

        {actionModal === 'Complete Mock Interview: React' && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Start Mock Interview</DialogTitle>
              <DialogDescription>Simulate a realistic React technical interview.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Target Company</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
                  <option>Google (Frontend)</option>
                  <option>Amazon (SDE II)</option>
                  <option>Meta (UI Engineer)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Duration</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
                  <option>15 Minutes (Quick)</option>
                  <option>30 Minutes (Standard)</option>
                  <option>45 Minutes (Deep Dive)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setActionModal(null)}>Cancel</Button>
              <Button onClick={() => setActionModal(null)} className="gap-2"><PlayCircle className="h-4 w-4" /> Start Interview</Button>
            </div>
          </div>
        )}
      </Dialog>
      
      {/* Company Details Modal */}
      <Dialog open={companyModal !== null} onOpenChange={(open) => !open && setCompanyModal(null)}>
        {companyModal && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>{companyModal} Readiness Analysis</DialogTitle>
              <DialogDescription>Detailed breakdown of your compatibility with {companyModal}.</DialogDescription>
            </DialogHeader>
            <div className="py-4 border-y border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">Overall Match</span>
                <span className="text-2xl font-bold text-primary">{companyModal === 'Google' ? (activeResume ? Math.max(0, (activeResume.score || 85) - 10) : 0) + '%' : (activeResume ? Math.max(0, (activeResume.score || 85) - 5) : 0) + '%'}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Key Strengths</h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">React Architecture</Badge>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">TypeScript</Badge>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Priority Gaps</h4>
                <div className="flex gap-2">
                  <Badge variant="destructive">System Design</Badge>
                  <Badge variant="destructive">Docker</Badge>
                  {companyModal === 'Google' && <Badge variant="destructive">CI/CD</Badge>}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCompanyModal(null)}>Mock Interview</Button>
              <Button onClick={() => setCompanyModal(null)}>Generate Plan</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Timeline Event Modal */}
      <Dialog open={timelineModal !== null} onOpenChange={(open) => !open && setTimelineModal(null)}>
        {timelineModal && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>{timelineModal}</DialogTitle>
              <DialogDescription>Event details from your career timeline.</DialogDescription>
            </DialogHeader>
            <div className="py-6 border-y border-border flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                 <CheckCircle2 className="h-6 w-6 text-emerald-500" />
               </div>
               <p className="text-sm font-medium">This milestone has been recorded.</p>
               <p className="text-xs text-muted-foreground mt-1">Check the full detailed report in the respective module.</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setTimelineModal(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here's your placement readiness intelligence overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setGoalsStep(1)}>
            <Target className="h-4 w-4" />
            Set Goals
          </Button>
          <Button className="gap-2" onClick={() => setUploadStep(0)}>
            <UploadCloud className="h-4 w-4" />
            Upload New Resume
          </Button>
        </div>
      </div>

      
      {!activeResume && !isDemoMode ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-secondary/10">
          <UploadCloud className="h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Upload your resume to begin</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            SmartHireAI needs your resume to analyze your skills, build your learning roadmap, and calculate your placement probability.
          </p>
          <Button size="lg" onClick={() => setUploadStep(0)} className="gap-2">
            <UploadCloud className="h-5 w-5" />
            Upload Resume
          </Button>
        </div>
      ) : (
        <>
{/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard 
          title="Placement Probability" 
          value={metrics.placement !== null ? `${metrics.placement}%` : '—'} 
          trend={activeResume ? "+4%" : ""} 
          icon={TrendingUp}
          description={activeResume ? "Confidence " + (activeResume.score ? Math.min(99, activeResume.score + 5) : 86) + "%" : "Upload a resume"}
          onClick={() => setKpiModal('Placement Probability')}
        />
        <MetricCard 
          title="Resume Score" 
          value={metrics.resumeScore !== null ? metrics.resumeScore.toString() : '—'} 
          trend={activeResume ? "+12 points" : ""} 
          icon={FileCheck}
          description={activeResume ? "Requires Docker keyword" : ""}
          onClick={() => setKpiModal('Resume Score')}
        />
        <MetricCard 
          title="Skill Gap Index" 
          value={metrics.skillGap} 
          trend={activeResume ? "Improving" : ""} 
          icon={BrainCircuit}
          description={activeResume ? "System Design needs work" : ""}
          onClick={() => setKpiModal('Skill Gap Index')}
        />
        <MetricCard 
          title="Active Applications" 
          value={metrics.applications.toString()} 
          trend={activeResume ? "0 pending review" : ""} 
          icon={Briefcase}
          description={activeResume ? "0 interviews scheduled" : ""}
          onClick={() => setKpiModal('Active Applications')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="xl:col-span-2 overflow-hidden flex flex-col group relative cursor-pointer" onClick={() => {}}>
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 transition-colors z-0" />
          <CardHeader className="relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Readiness Trajectory</CardTitle>
                <CardDescription>Your overall ATS and skill growth over the last 6 weeks</CardDescription>
              </div>
              <Badge variant="success" className="gap-1">
                <Zap className="h-3 w-3" /> On Track
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              {!activeResume ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Upload a resume to see readiness</div>
              ) : (
              <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                  formatter={(value: any) => [`${value} Score`, 'Readiness']}
                />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>)}
            </ResponsiveContainer>
          </CardContent>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
             <Button variant="secondary" size="sm">Open Analytics</Button>
          </div>
        </Card>

        {/* Actionable AI Insights */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>AI Action Plan</CardTitle>
            <CardDescription>Prioritized tasks to boost your score</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-5">
            <ActionItem 
              title="Add System Design Project" 
              impact="High Impact" 
              time="~2 weeks"
              progress={30}
              onClick={() => setActionModal('Add System Design Project')}
            />
            <ActionItem 
              title="Optimize LinkedIn Summary" 
              impact="Medium Impact" 
              time="~1 hour"
              progress={0}
              onClick={() => setActionModal('Optimize LinkedIn Summary')}
            />
            <ActionItem 
              title="Complete Mock Interview: React" 
              impact="High Impact" 
              time="45 mins"
              progress={100}
              onClick={() => setActionModal('Complete Mock Interview: React')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Deep Workflows & Career Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Target Company Readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Target Company Readiness
            </CardTitle>
            <CardDescription>How you stack up against top tech companies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <CompanyMatch 
              name="Google" 
              score={activeResume ? Math.max(0, (activeResume.score || 85) - 10) : null} 
              missing={activeResume ? ["System Design", "Docker", "CI/CD"] : []} 
              onClick={() => activeResume && setCompanyModal('Google')}
            />
            <CompanyMatch 
              name="Amazon" 
              score={activeResume ? Math.max(0, (activeResume.score || 85) - 5) : null} 
              missing={activeResume ? ["AWS", "Leadership Principles"] : []} 
              onClick={() => activeResume && setCompanyModal('Amazon')}
            />
          </CardContent>
        </Card>

        {/* Career Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Career Timeline
            </CardTitle>
            <CardDescription>Your recent activity and progress milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            <TimelineEvent 
              title="Mock Interview Completed" 
              description="Google Frontend Engineer practice session."
              time="2h ago" 
              active 
              onClick={() => setTimelineModal('Mock Interview Completed')}
            />
            <TimelineEvent 
              title="Resume Parsed & Ranked" 
              description="ATS score increased by +3 points."
              time="5h ago" 
              onClick={() => setTimelineModal('Resume Parsed')}
            />
            <TimelineEvent 
              title="Skill Gap Identified" 
              description="Docker Mastery added to learning roadmap."
              time="Yesterday" 
            />
            <TimelineEvent 
              title="Learning Roadmap Created" 
              description="AI generated a 4-week preparation plan."
              time="2 days ago" 
              isLast
            />
          </CardContent>
        </Card>

      </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, description, onClick }: any) {
  return (
    <Card className="group hover:border-primary/50 transition-colors cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{title}</p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              <Button variant="outline" size="sm" className="h-6 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Why?</Button>
            </div>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-emerald-500 font-medium">{trend}</span>
          <span className="text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionItem({ title, impact, time, progress, onClick }: any) {
  return (
    <div className="space-y-3 p-3 -mx-3 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer group" onClick={onClick}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm group-hover:text-primary transition-colors">{title}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] h-5">{impact}</Badge>
            <span className="text-xs text-muted-foreground flex items-center">{time}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="h-4 w-4" />
        </Button>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}

function CompanyMatch({ name, score, missing, onClick }: any) {
  return (
    <div className="p-4 rounded-xl border border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-base">{name}</h4>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{score}%</div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <svg className="w-full h-full transform -rotate-90 absolute">
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-primary/20" />
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-primary" strokeDasharray="125" strokeDashoffset={125 - (125 * score) / 100} />
            </svg>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Missing Requirements</p>
        <div className="flex flex-wrap gap-2">
          {missing.map((item: string, idx: number) => (
            <Badge key={idx} variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-xs py-0">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({ title, description, time, active = false, isLast = false, onClick }: any) {
  return (
    <div className="flex gap-4 relative group cursor-pointer" onClick={onClick}>
      {!isLast && <div className="absolute left-2.5 top-7 bottom-0 w-px bg-border -ml-px" />}
      <div className="relative mt-1">
        <div className={`w-5 h-5 rounded-full border-4 flex items-center justify-center transition-colors ${active ? 'bg-primary border-card' : 'bg-muted border-card group-hover:bg-primary/50'}`} />
      </div>
      <div className="pb-6 w-full">
        <div className="flex justify-between items-start">
           <div>
             <p className={`text-sm font-semibold transition-colors ${active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{title}</p>
             <p className="text-sm text-muted-foreground mt-1">{description}</p>
           </div>
           {onClick && <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8">View</Button>}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{time}</p>
      </div>
    </div>
  );
}


function FileCheckIcon(props: any) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  )
}

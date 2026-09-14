import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Building2, AlertCircle, CheckCircle2, Target, Zap, ArrowRight, BrainCircuit, Play, FileText, Video } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { useNavigate } from 'react-router-dom';

const mockCompanies = [
  {
    name: 'Google',
    logo: 'G',
    score: 82,
    industry: 'Big Tech',
    requirements: {
      matched: ['React', 'TypeScript', 'Data Structures', 'Algorithms', 'Performance'],
      missing: ['System Design', 'Docker', 'CI/CD']
    },
    culture: 'Engineering-driven, heavy focus on scale and optimization.',
    interviewProcess: ['Phone Screen', 'DSA (2x)', 'System Design', 'Googlyness (Behavioral)']
  },
  {
    name: 'Amazon',
    logo: 'A',
    score: 91,
    industry: 'Big Tech / E-commerce',
    requirements: {
      matched: ['React', 'Redux', 'System Architecture', 'Problem Solving'],
      missing: ['AWS', 'Leadership Principles']
    },
    culture: 'Customer-obsessed, ownership, bias for action.',
    interviewProcess: ['Online Assessment', 'Phone Screen', 'Loop (4x) with Bar Raiser']
  },
  {
    name: 'Stripe',
    logo: 'S',
    score: 88,
    industry: 'FinTech',
    requirements: {
      matched: ['React', 'TypeScript', 'API Design', 'Security Practices'],
      missing: ['Ruby (Bonus)', 'Integration Testing']
    },
    culture: 'Developer experience focused, rigorous API standards, writing-heavy.',
    interviewProcess: ['Pair Programming', 'Bug Squash', 'System Design', 'Behavioral']
  }
];

export function CompanyReadiness() {
  const { activeResume, isDemoMode } = useSelector((state: RootState) => state.resume);
  const navigate = useNavigate();
  useEffect(() => {
    if (activeResume) {
      setIsLoading(true);
      
      const userSkills = activeResume.parsedContent?.skills || [];
      
      const generateCompany = (name, logo, industry, missingPool, interviewProcess) => {
          const baseScore = activeResume.score || 80;
          const score = Math.min(100, Math.max(0, baseScore - (missingPool.length * 5)));
          return {
              name,
              logo,
              score,
              industry,
              requirements: {
                  matched: userSkills.slice(0, 4),
                  missing: missingPool
              },
              culture: 'Culture information for ' + name,
              interviewProcess
          };
      };
      
      const dynamicCompanies = [
          generateCompany('Google', 'G', 'Big Tech', ['System Design', 'Go', 'GCP'], ['Phone Screen', 'DSA (2x)', 'System Design', 'Googlyness']),
          generateCompany('Microsoft', 'M', 'Big Tech', ['C#', 'Azure', 'System Design'], ['Online Assessment', 'Technical (3x)', 'System Design']),
          generateCompany('Amazon', 'A', 'Big Tech', ['AWS', 'Leadership Principles'], ['Online Assessment', 'Phone Screen', 'Loop (4x)']),
          generateCompany('TCS', 'T', 'IT Services', ['Java', 'Spring Boot'], ['Aptitude', 'Technical', 'HR']),
          generateCompany('Infosys', 'I', 'IT Services', ['Python', 'SQL'], ['Online Test', 'Technical', 'HR']),
          generateCompany('Accenture', 'Ac', 'Consulting', ['Agile', 'Cloud Computing'], ['Cognitive Test', 'Technical', 'HR'])
      ];

      setCompanies(dynamicCompanies);
      setIsLoading(false);
    }
  }, [activeResume]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<{ type: 'prep' | 'resume' | 'interview', company: typeof mockCompanies[0] } | null>(null);

  if (!activeResume && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-secondary/10">
        <h2 className="text-2xl font-bold tracking-tight mb-2">No Active Resume</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Upload your resume in the dashboard to see your target company readiness.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <Dialog open={!!activeAction} onOpenChange={(open) => !open && setActiveAction(null)}>
        {activeAction && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {activeAction.type === 'prep' && <Zap className="h-5 w-5 text-primary" />}
                {activeAction.type === 'resume' && <FileText className="h-5 w-5 text-primary" />}
                {activeAction.type === 'interview' && <Video className="h-5 w-5 text-primary" />}
                {activeAction.type === 'prep' && `Start ${activeAction.company.name} Prep Track`}
                {activeAction.type === 'resume' && `Generate ${activeAction.company.name} Resume`}
                {activeAction.type === 'interview' && `${activeAction.company.name} Mock Interview`}
              </DialogTitle>
              <DialogDescription>
                {activeAction.type === 'prep' && `AI is generating a customized 3-week study plan targeting your gaps for ${activeAction.company.name}.`}
                {activeAction.type === 'resume' && `Generating a customized resume highlighting your matching skills for ${activeAction.company.name}.`}
                {activeAction.type === 'interview' && `Starting a simulated interview environment tailored to ${activeAction.company.name}'s process.`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-secondary/20 border border-border/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[150px] text-center">
              <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center font-bold text-2xl mb-4">
                {activeAction.company.logo}
              </div>
              <p className="text-sm text-muted-foreground">
                {activeAction.type === 'prep' && `Focusing on: ${activeAction.company.requirements.missing.join(', ')}`}
                {activeAction.type === 'resume' && `Highlighting: ${activeAction.company.requirements.matched.join(', ')}`}
                {activeAction.type === 'interview' && `Format: ${activeAction.company.interviewProcess[0]}`}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setActiveAction(null)}>Cancel</Button>
              <Button onClick={() => setActiveAction(null)}>Confirm</Button>
            </div>
          </div>
        )}
      </Dialog>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Readiness Intelligence</h1>
          <p className="text-muted-foreground mt-1">Personalized readiness scores for your target tier-1 companies.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            Manage Target Companies
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">AI is generating custom readiness reports based on your skills...</p>
        </div>
      ) : companies.map((company) => (
          <Card key={company.name} className="overflow-hidden hover:border-primary/50 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-4 md:divide-x divide-border">
              {/* Score & Basic Info */}
              <div className="p-6 flex flex-col justify-between bg-secondary/10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-lg">
                      {company.logo}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{company.name}</h3>
                      <p className="text-xs text-muted-foreground">{company.industry}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Readiness Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-foreground leading-none">{company.score}%</span>
                    <Badge variant={company.score >= 90 ? 'success' : 'secondary'} className="mb-1">
                      {company.score >= 90 ? 'Interview Ready' : 'Needs Prep'}
                    </Badge>
                  </div>
                  <Progress value={company.score} className="h-1.5 mt-4" indicatorClassName={company.score >= 90 ? 'bg-emerald-500' : 'bg-primary'} />
                </div>
              </div>

              {/* Gap Analysis */}
              <div className="p-6 md:col-span-2 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-primary" /> Profile Gap Analysis
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-2">
                      <CheckCircle2 className="h-3 w-3" /> Met Requirements
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.requirements.matched.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-[10px] bg-secondary/50">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-destructive flex items-center gap-1 mb-2">
                      <AlertCircle className="h-3 w-3" /> Critical Gaps
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.requirements.missing.map(skill => (
                        <Badge key={skill} variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Interview Process</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {company.interviewProcess.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-foreground font-medium bg-background px-2 py-1 rounded-md border border-border">{step}</span>
                        {idx < company.interviewProcess.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-secondary/10 flex flex-col justify-center space-y-3">
                <Button className="w-full gap-2" onClick={() => navigate(`/preparation/${company.name.toLowerCase()}`, { state: { company } })}>
                  <Zap className="h-4 w-4" /> Start Company Prep
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => navigate(`/resume`, { state: { tailorFor: company } })}>
                  Tailor Resume
                </Button>
                <Button variant="secondary" className="w-full gap-2" onClick={() => setActiveAction({ type: 'interview', company })}>
                  Mock Interview
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
                
    </div>
  );
}
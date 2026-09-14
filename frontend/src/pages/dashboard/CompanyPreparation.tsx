import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { ChevronLeft, Zap, Target, BookOpen, Code2, BrainCircuit, Activity, Settings2, Users, FileText, Video } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export function CompanyPreparation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeResume } = useSelector((state: RootState) => state.resume);
  const company = location.state?.company;

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Company not found</h2>
        <Button onClick={() => navigate('/readiness')}>Back to Readiness</Button>
      </div>
    );
  }

  const sections = [
    { id: 'technical', title: 'Technical Preparation', icon: Code2, desc: 'Core language and framework specifics.', progress: 68 },
    { id: 'coding', title: 'Coding Preparation', icon: Activity, desc: 'Data structures and algorithms.', progress: 40 },
    { id: 'aptitude', title: 'Aptitude Preparation', icon: BrainCircuit, desc: 'Probability, Math, and Logic.', progress: 15 },
    { id: 'system-design', title: 'System Design', icon: Settings2, desc: 'Architecture and scalability.', progress: 10 },
    { id: 'behavioral', title: 'Behavioral Preparation', icon: Users, desc: 'STAR method and culture fit.', progress: 85 },
    { id: 'company', title: company.name + ' Specific', icon: Target, desc: 'Values and interview process.', progress: 0 },
    { id: 'resume', title: 'Resume Preparation', icon: FileText, desc: 'Tailoring your resume.', progress: 100 },
    { id: 'mock', title: 'Mock Interview', icon: Video, desc: 'Simulate the real experience.', progress: 0 }
  ];

  const handleStartLearning = (gap: string) => {
    navigate('/learning', { state: { targetGap: gap, company: company.name } });
  };

  const startMockInterview = () => {
    navigate('/interviews', { state: { company: company.name } });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/readiness')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{company.name} Preparation</h1>
          <p className="text-muted-foreground mt-1">Target Role: {activeResume?.parsedContent?.skills?.[0] || 'Software'} Engineer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-foreground leading-none">68%</span>
              <span className="text-muted-foreground mb-1">completed</span>
            </div>
            <Progress value={68} className="h-2" />
            
            <div className="pt-6 mt-6 border-t border-border">
               <h3 className="text-lg font-bold mb-4">Preparation Tracks</h3>
               <div className="space-y-4">
                  {sections.map(section => (
                    <div key={section.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
                          <section.icon className="h-5 w-5" />
                        </div>
                        <div>
                           <h4 className="font-semibold text-sm">{section.title}</h4>
                           <p className="text-xs text-muted-foreground">{section.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <span className="text-sm font-bold">{section.progress}%</span>
                          <Progress value={section.progress} className="h-1 w-16" />
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => section.id === 'mock' ? startMockInterview() : navigate('/learning', { state: { track: section.id, company: company.name } })}
                        >
                          {section.progress === 100 ? 'Review' : section.progress > 0 ? 'Continue' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold">{company.score}%</span>
              </div>
              <Progress value={company.score} className="h-1.5" />
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                 Critical Gaps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {company.requirements.missing.map((gap: string) => (
                 <div key={gap} className="flex flex-col gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-destructive">{gap}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => handleStartLearning(gap)}>
                      Start Learning
                    </Button>
                 </div>
               ))}
               <div className="flex flex-col gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-orange-500">Advanced DSA</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => handleStartLearning('Advanced DSA')}>
                      Start Learning
                    </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

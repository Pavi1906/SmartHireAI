import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Briefcase, Building2, Calendar, CheckCircle2, FileCheck, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applicationService, StudentApplicationResponse } from '../../services/applicationService';
import { toast } from 'sonner';

export function StudentApplications() {
  const [applications, setApplications] = useState<StudentApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadApplications = async () => {
      try {
        const data = await applicationService.fetchMyApplications();
        if (isMounted) {
          setApplications(data);
        }
      } catch (err: any) {
        if (isMounted) {
          toast.error(err?.response?.data?.detail || 'Failed to load your applications.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'applied' || s === 'sourced') {
      return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{status}</Badge>;
    }
    if (s === 'shortlisted' || s === 'interview' || s === 'selected' || s === 'offer') {
      return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{status}</Badge>;
    }
    if (s === 'rejected' || s === 'withdrawn') {
      return <Badge variant="outline" className="text-destructive border-destructive/20">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track all job requisitions you have applied to through SmartHireAI.
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" /> Browse More Jobs
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-xl bg-secondary/10">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mb-4">
            <FileCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You have not submitted any job applications yet. Head over to Job Matching to apply with your resume.
          </p>
          <Link to="/jobs">
            <Button className="gap-2">
              Explore Job Matches <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <Card key={app.applicationId} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 border border-border flex items-center justify-center mb-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {getStatusBadge(app.status)}
                </div>
                <CardTitle className="text-lg font-bold line-clamp-1">
                  {app.jobTitle || 'Job Position'}
                </CardTitle>
                <CardDescription className="text-sm">
                  {app.companyName || 'SmartHire Partner'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Applied Date:
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(app.appliedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {app.matchScore !== null && app.matchScore !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Match Score:
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {Math.round(app.matchScore)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

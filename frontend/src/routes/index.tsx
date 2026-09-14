import { Navigate, Route, Routes, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setInitialized } from '../store/slices/authSlice';
import { restoreResumeState, clearResumeState } from '../store/slices/resumeSlice';
import { restoreRecruiterState, clearRecruiterState } from '../store/slices/recruiterSlice';
import { apiClient } from '../services/api';
import { useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { StudentDashboard } from '../pages/dashboard/StudentDashboard';
import { RecruiterDashboard } from '../pages/dashboard/RecruiterDashboard';
import { ResumeIntelligence } from '../pages/resume/ResumeIntelligence';
import { JobMatching } from '../pages/dashboard/JobMatching';
import { StudentApplications } from '../pages/dashboard/StudentApplications';
import { MockInterviews } from '../pages/dashboard/MockInterviews';
import { SkillGraph } from '../pages/dashboard/SkillGraph';
import { LearningRoadmap } from '../pages/dashboard/LearningRoadmap';
import { LearningModule } from '../pages/dashboard/LearningModule';
import { CompanyReadiness } from '../pages/dashboard/CompanyReadiness';
import { Analytics } from '../pages/dashboard/Analytics';
import { JobPosts } from '../pages/recruiter/JobPosts';
import { JobApplicants } from '../pages/recruiter/JobApplicants';
import { TalentPipeline } from '../pages/recruiter/TalentPipeline';
import { SourcingCampaigns } from '../pages/recruiter/SourcingCampaigns';
import { RecruiterReports } from '../pages/recruiter/RecruiterReports';
import { RecruiterInterviews } from '../pages/recruiter/RecruiterInterviews';
import { AdminDashboard } from '../pages/dashboard/AdminDashboard';
import { CompanyPreparation } from '../pages/dashboard/CompanyPreparation';
import { MockInterviewPrepare } from '../pages/dashboard/MockInterviewPrepare';
import { MockInterviewSession } from '../pages/dashboard/MockInterviewSession';
import { MockInterviewReport } from '../pages/dashboard/MockInterviewReport';
import { Settings } from '../pages/settings/Settings';
import { RootState } from '../store';

// Auth Pages
import { LandingPage } from '../pages/LandingPage';
import { AuthLayout } from '../pages/auth/AuthLayout';
import { Login } from '../pages/auth/Login';
import { RegisterStudent } from '../pages/auth/RegisterStudent';
import { RegisterRecruiter } from '../pages/auth/RegisterRecruiter';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { Terms, Privacy } from '../pages/legal/Terms';
import { Button } from '../components/ui/button';

function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { isAuthenticated, user, isInitializing } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (isInitializing) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading session...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          You do not have permission to view this page. You are logged in as a {user.role}.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => window.history.back()} variant="outline">Go Back</Button>
          <Button onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Simulate session restoration
    const timer = setTimeout(() => {
      dispatch(setInitialized());
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && user.id) {
      if (user.role === 'STUDENT') {
        const savedResume = localStorage.getItem(`smarthireai_user_${user.id}_resume`);

        if (savedResume) {
          const parsed = JSON.parse(savedResume);
          dispatch(restoreResumeState(parsed));
        } else {
          dispatch(clearResumeState());
        }

        // Always fetch latest from backend
        apiClient.get('/resumes/active').then(res => {
          const data = res.data;
          const parsed = data.parsed_json || {};
          if (data && data.resume_id) {
            dispatch(restoreResumeState({
              activeResume: {
                id: data.resume_id,
                resume_id: data.resume_id,
                name: data.s3_key ? data.s3_key.split('/').pop() : '',
                size: 0,
                version: 1,
                score: 0,
                status: data.status || 'PARSED',
                parsedContent: {
                  text: parsed.text || '',
                  skills: parsed.skills || [],
                  experience: parsed.experience || [],
                  education: parsed.education || [],
                  projects: parsed.projects || [],
                  certifications: parsed.certifications || [],
                  achievements: parsed.achievements || []
                }
              },
              resumeId: data.resume_id,
              resumeVersion: 1,
              parsedText: parsed.text || '',
              skills: parsed.skills || [],
              experience: parsed.experience || [],
              education: parsed.education || [],
              status: 'success',
              isDemoMode: false
            }));
          }
        }).catch(() => { });
      } else if (user.role === 'RECRUITER') {
        const savedRecruiter = localStorage.getItem(`smarthireai_user_${user.id}_recruiter`);
        if (savedRecruiter) {
          dispatch(restoreRecruiterState(JSON.parse(savedRecruiter)));
        } else {
          dispatch(clearRecruiterState());
        }
      }
    } else {
      dispatch(clearResumeState());
      dispatch(clearRecruiterState());
    }
  }, [user, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/student" element={<AuthLayout />}>
        <Route path="login" element={<Login role="STUDENT" />} />
        <Route path="register" element={<RegisterStudent />} />
      </Route>
      <Route path="/recruiter" element={<AuthLayout />}>
        <Route path="login" element={<Login role="RECRUITER" />} />
        <Route path="register" element={<RegisterRecruiter />} />
      </Route>
      <Route path="/admin" element={<AuthLayout />}>
        <Route path="login" element={<Login role="ADMIN" />} />
      </Route>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'ADMIN']} />}>
        <Route path="/" element={<MainLayout />}>
          <Route
            path="dashboard"
            element={
              user?.role === 'ADMIN' ? (
                <AdminDashboard />
              ) : user?.role === 'RECRUITER' ? (
                <RecruiterDashboard />
              ) : (
                <StudentDashboard />
              )
            }
          />

          {/* STUDENT ONLY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="resume" element={<ResumeIntelligence />} />
            <Route path="jobs" element={<JobMatching />} />
            <Route path="applications" element={<StudentApplications />} />
            <Route path="readiness" element={<CompanyReadiness />} />
            <Route path="preparation/:companyId" element={<CompanyPreparation />} />
            <Route path="skills" element={<SkillGraph />} />
            <Route path="interviews" element={<MockInterviews />} />
            <Route path="interviews/:interviewId/prepare" element={<MockInterviewPrepare />} />
            <Route path="interviews/:interviewId/session" element={<MockInterviewSession />} />
            <Route path="interviews/:interviewId/report" element={<MockInterviewReport />} />
            <Route path="learning" element={<LearningRoadmap />} />
            <Route path="learning/:moduleId" element={<LearningModule />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* RECRUITER ONLY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
            <Route path="recruiter/jobs" element={<JobPosts />} />
            <Route path="recruiter/jobs/:jobId/applicants" element={<JobApplicants />} />
            <Route path="recruiter/interviews" element={<RecruiterInterviews />} />
            <Route path="candidates" element={<TalentPipeline />} />
            <Route path="campaigns" element={<SourcingCampaigns />} />
            <Route path="reports" element={<RecruiterReports />} />
          </Route>

          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

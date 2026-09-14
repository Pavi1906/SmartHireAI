import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  TrendingUp, 
  MessageSquare, 
  Settings,
  Target,
  Users,
  Search,
  BrainCircuit,
  FileCheck
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { RootState } from '../../store';

const STUDENT_NAV_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Resume Intelligence', path: '/resume', icon: FileText },
  { name: 'Job Matching', path: '/jobs', icon: Briefcase },
  { name: 'My Applications', path: '/applications', icon: FileCheck },
  { name: 'Company Readiness', path: '/readiness', icon: Target },
  { name: 'Skill Intelligence', path: '/skills', icon: BrainCircuit },
  { name: 'Mock Interviews', path: '/interviews', icon: MessageSquare },
  { name: 'Learning Roadmap', path: '/learning', icon: GraduationCap },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp },
];

const RECRUITER_NAV_ITEMS = [
  { name: 'Workspace', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Talent Pipeline', path: '/candidates', icon: Users },
  { name: 'Interviews', path: '/recruiter/interviews', icon: MessageSquare },
  { name: 'Sourcing Campaigns', path: '/campaigns', icon: Search },
  { name: 'Job Posts', path: '/recruiter/jobs', icon: Briefcase },
  { name: 'Reports', path: '/reports', icon: TrendingUp },
];

const ADMIN_NAV_ITEMS = [
  { name: 'Platform Overview', path: '/dashboard#overview', icon: LayoutDashboard },
  { name: 'User Management', path: '/dashboard#users', icon: Users },
  { name: 'Students', path: '/dashboard#students', icon: GraduationCap },
  { name: 'Recruiters', path: '/dashboard#recruiters', icon: Briefcase },
  { name: 'Settings', path: '/dashboard#settings', icon: Settings },
];

export function Sidebar() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const isRecruiter = user?.role === 'RECRUITER';
  const isAdmin = user?.role === 'ADMIN';
  
  const navItems = isAdmin 
    ? ADMIN_NAV_ITEMS 
    : isRecruiter 
      ? RECRUITER_NAV_ITEMS 
      : STUDENT_NAV_ITEMS;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
            S
          </div>
          <span className="font-semibold tracking-tight text-lg">SmartHireAI</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {isAdmin ? 'Administration' : isRecruiter ? 'Recruitment' : 'Intelligence'}
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive 
                    ? "bg-secondary/50 text-foreground border border-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive 
                ? "bg-secondary/50 text-foreground border border-border/50" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}

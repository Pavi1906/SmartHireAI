import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Activity, ShieldAlert, Server, Search, CheckCircle, XCircle, UserCheck, UserX, Briefcase, GraduationCap, Settings, LogOut, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { getStoredUsers, saveUsers, AuthUser } from '../../services/authDemo';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'recruiters' | 'students' | 'settings'>('overview');
  const [usersList, setUsersList] = useState<(AuthUser & { status?: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Admin profile form state
  const [adminForm, setAdminForm] = useState({
    name: user?.name || 'System Admin',
    email: user?.email || 'admin@smarthire.ai'
  });

  useEffect(() => {
    loadUsers();
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'users', 'recruiters', 'students', 'settings'].includes(hash)) {
        setActiveTab(hash as any);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadUsers = () => {
    let stored = getStoredUsers();
    if (stored.length === 0) {
      // Seed initial demo users if empty so admin has real frontend data
      const initialSeed: AuthUser[] = [
        { id: 'stud_1', name: 'Alex Rivera', email: 'alex.rivera@example.com', role: 'STUDENT', phone: '+15552345678', college: 'Stanford University', degree: 'B.S. Computer Science', graduationYear: '2025', location: 'San Francisco, CA', avatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=random' },
        { id: 'stud_2', name: 'Jordan Lee', email: 'jordan.lee@example.com', role: 'STUDENT', phone: '+15559876543', college: 'UC Berkeley', degree: 'B.S. Electrical Engineering', graduationYear: '2026', location: 'Berkeley, CA', avatar: 'https://ui-avatars.com/api/?name=Jordan+Lee&background=random' },
        { id: 'rec_1', name: 'Sarah Connor', email: 'sarah@acmetech.com', role: 'RECRUITER', companyName: 'Acme Tech', designation: 'Head of Talent', phone: '+15551112223', location: 'San Francisco, CA', avatar: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=random' },
        { id: 'rec_2', name: 'Michael Vance', email: 'michael@innovate.io', role: 'RECRUITER', companyName: 'Innovate.io', designation: 'Senior Tech Recruiter', phone: '+15554445566', location: 'New York, NY', avatar: 'https://ui-avatars.com/api/?name=Michael+Vance&background=random' },
      ];
      saveUsers(initialSeed);
      stored = initialSeed;
    }
    
    // Ensure status property exists
    const withStatus = stored.map(u => ({
      ...u,
      status: (u as any).status || 'Active'
    }));
    setUsersList(withStatus);
  };

  const handleToggleStatus = (id: string) => {
    const updated = usersList.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'Suspended' ? 'Active' : 'Suspended';
        toast.success(`User ${u.name} status changed to ${newStatus}`);
        return { ...u, status: newStatus };
      }
      return u;
    });
    setUsersList(updated);
    saveUsers(updated);
  };

  const handleDeleteUser = (id: string) => {
    const updated = usersList.filter(u => u.id !== id);
    setUsersList(updated);
    saveUsers(updated);
    toast.success('User removed from platform registry');
  };

  // Filtered users
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const studentsCount = usersList.filter(u => u.role === 'STUDENT').length;
  const recruitersCount = usersList.filter(u => u.role === 'RECRUITER').length;
  const activeCount = usersList.filter(u => u.status === 'Active').length;
  const suspendedCount = usersList.filter(u => u.status === 'Suspended').length;

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUser(adminForm));
    toast.success('Admin profile updated successfully');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="text-muted-foreground mt-1">Manage platform users, monitor aggregate metrics, and system controls.</p>
        </div>
        <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg border border-border overflow-x-auto max-w-full">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={activeTab === 'users' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('users')}
          >
            Users ({usersList.length})
          </Button>
          <Button 
            variant={activeTab === 'recruiters' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('recruiters')}
          >
            Recruiters ({recruitersCount})
          </Button>
          <Button 
            variant={activeTab === 'students' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('students')}
          >
            Students ({studentsCount})
          </Button>
          <Button 
            variant={activeTab === 'settings' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Registered Users" value={usersList.length.toString()} trend="Live Registry" icon={Users} positive />
            <MetricCard title="Active Students" value={studentsCount.toString()} trend="Verified profiles" icon={GraduationCap} positive />
            <MetricCard title="Active Recruiters" value={recruitersCount.toString()} trend="Active organizations" icon={Briefcase} positive />
            <MetricCard title="System Health" value="100%" trend="Operational" icon={Server} positive />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Platform Registrations</CardTitle>
                  <CardDescription>Latest student and recruiter signups stored in frontend registry</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('users')}>View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersList.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/40 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt={u.name} className="h-10 w-10 rounded-full border border-border object-cover" />
                        <div>
                          <p className="text-sm font-semibold">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={u.role === 'RECRUITER' ? 'default' : 'secondary'} className="text-xs">
                          {u.role}
                        </Badge>
                        <Badge variant={u.status === 'Active' ? 'success' : 'destructive'} className="text-xs w-20 justify-center">
                          {u.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>User role breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Students</span>
                      <span className="font-semibold">{studentsCount} ({Math.round((studentsCount / (usersList.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(studentsCount / (usersList.length || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recruiters</span>
                      <span className="font-semibold">{recruitersCount} ({Math.round((recruitersCount / (usersList.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(recruitersCount / (usersList.length || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick System Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => setActiveTab('users')}>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Manage All Users ({usersList.length})
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => loadUsers()}>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    Refresh Registry State
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Search, filter, and manage platform users</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="RECRUITER">Recruiters</option>
                  <option value="ADMIN">Admins</option>
                </select>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No users found matching the filter criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border rounded-lg bg-card/40 gap-4">
                    <div className="flex items-center gap-4">
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt={u.name} className="h-10 w-10 rounded-full border border-border object-cover" />
                      <div>
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                        {u.role === 'RECRUITER' && (u as any).companyName && (
                          <p className="text-xs text-primary font-medium mt-0.5">Company: {(u as any).companyName}</p>
                        )}
                        {u.role === 'STUDENT' && (u as any).college && (
                          <p className="text-xs text-primary font-medium mt-0.5">College: {(u as any).college}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      <Badge variant={u.role === 'RECRUITER' ? 'default' : 'secondary'} className="text-xs">
                        {u.role}
                      </Badge>
                      <Badge variant={u.status === 'Active' ? 'success' : 'destructive'} className="text-xs w-20 justify-center">
                        {u.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleToggleStatus(u.id)}
                          title={u.status === 'Active' ? 'Suspend user' : 'Activate user'}
                        >
                          {u.status === 'Active' ? <UserX className="h-3.5 w-3.5 text-destructive" /> : <UserCheck className="h-3.5 w-3.5 text-emerald-500" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10" 
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete user"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'recruiters' && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Recruiters Overview</CardTitle>
            <CardDescription>Recruiter accounts and enterprise organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usersList.filter(u => u.role === 'RECRUITER').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recruiters registered yet.</p>
              ) : (
                usersList.filter(u => u.role === 'RECRUITER').map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/40">
                    <div className="flex items-center gap-4">
                      <img src={r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}`} alt={r.name} className="h-10 w-10 rounded-full border border-border object-cover" />
                      <div>
                        <p className="font-semibold text-sm">{r.name} <span className="text-xs text-muted-foreground font-normal">({r.designation || 'Recruiter'})</span></p>
                        <p className="text-xs text-muted-foreground">{r.email} • {r.phone || 'No phone'}</p>
                        <p className="text-xs font-medium text-primary mt-1">Company: {r.companyName || 'Independent'}</p>
                      </div>
                    </div>
                    <Badge variant={r.status === 'Active' ? 'success' : 'destructive'}>{r.status || 'Active'}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Students Overview</CardTitle>
            <CardDescription>Student talent profiles and academic details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usersList.filter(u => u.role === 'STUDENT').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No students registered yet.</p>
              ) : (
                usersList.filter(u => u.role === 'STUDENT').map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/40">
                    <div className="flex items-center gap-4">
                      <img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}`} alt={s.name} className="h-10 w-10 rounded-full border border-border object-cover" />
                      <div>
                        <p className="font-semibold text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email} • {s.location || 'Location unlisted'}</p>
                        <p className="text-xs font-medium text-primary mt-1">{s.college || 'College unlisted'} ({s.degree || 'Degree unlisted'}) - Class of {s.graduationYear || 'N/A'}</p>
                      </div>
                    </div>
                    <Badge variant={s.status === 'Active' ? 'success' : 'destructive'}>{s.status || 'Active'}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Admin Profile & Security</CardTitle>
            <CardDescription>Manage your administrator credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveAdminProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Administrator Name</label>
                <input 
                  type="text" 
                  value={adminForm.name} 
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Administrator Email</label>
                <input 
                  type="email" 
                  value={adminForm.email} 
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, positive }: { title: string, value: string, trend: string, icon: any, positive: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="font-medium text-emerald-500">{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Bell, Search, LogOut, Shuffle, FileText, Briefcase, Zap, BrainCircuit, PlayCircle, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../services/api';



const mockSearchResults = [
  { group: 'Pages', items: [{ icon: <Search className="h-4 w-4" />, label: 'Dashboard' }, { icon: <Briefcase className="h-4 w-4" />, label: 'Jobs' }, { icon: <BrainCircuit className="h-4 w-4" />, label: 'Mock Interviews' }] },
  { group: 'Company Readiness', items: [{ icon: <Zap className="h-4 w-4" />, label: 'Google' }, { icon: <Zap className="h-4 w-4" />, label: 'Amazon' }] },
  { group: 'Skills', items: [{ icon: <BookOpen className="h-4 w-4" />, label: 'Docker' }, { icon: <BookOpen className="h-4 w-4" />, label: 'React' }] }
];

export function Topbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeResume } = useSelector((state: RootState) => state.resume);

  const mockNotifications = activeResume ? [
    { id: 1, type: 'success', title: 'Resume analyzed successfully', time: 'Just now', action: 'View Report' },
    { id: 2, type: 'update', title: 'Skills Extracted', desc: `Found ${activeResume.parsedContent?.skills?.length || 0} skills in your resume`, time: 'Just now', action: 'View Skills' },
  ] : [
    { id: 1, type: 'alert', title: 'No Resume Uploaded', desc: 'Please upload your resume to unlock AI features', time: 'Just now', action: 'Upload Resume' },
  ];
  const dispatch = useDispatch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    setIsLoggingOut(true);
    setShowUserMenu(false);
    toast("Logging out", { description: "Revoking session and clearing tokens..." });

    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      // Ignore backend logout failures and still clear the local session.
    }

    dispatch(logout());
    setIsLoggingOut(false);
    toast.success("Logged out successfully");
  };



  return (
    <>
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-medium">Logging out...</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 glass-nav fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-8">
        <div className="flex-1 flex items-center">
          <div
            className="relative w-96 cursor-text"
            onClick={() => setShowSearch(true)}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <div className="w-full h-10 bg-input border border-border rounded-full pl-10 pr-4 text-xs flex items-center text-muted-foreground hover:ring-1 hover:ring-ring transition-all">
              Search roles, skills, or analytics...
              <span className="ml-auto text-[10px] border border-border px-1.5 py-0.5 rounded-md">⌘ K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">


          <button
            className="relative text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
          </button>

          <div className="relative pl-6 border-l border-border flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium leading-none">{user?.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{user?.role}</span>
            </div>

            <button onClick={() => setShowUserMenu(!showUserMenu)} className="focus:outline-none rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="cursor-pointer border border-border hover:opacity-80 transition-opacity">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 mt-2 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center px-4 py-2 text-sm hover:bg-secondary/50 cursor-pointer">
                      <SettingsIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      Account Settings
                    </Link>
                  </div>
                  <div className="py-1 border-t border-border">
                    <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <div className="p-0 overflow-hidden">
          <div className="flex items-center border-b border-border px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <input
              autoFocus
              type="text"
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-foreground text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">ESC</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {mockSearchResults.map((group, i) => (
              <div key={i} className="mb-4">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.group}</p>
                {group.items.map((item, j) => (
                  <div key={j} className="flex items-center px-2 py-2 hover:bg-secondary/30 rounded-md cursor-pointer transition-colors group">
                    <span className="text-muted-foreground group-hover:text-primary transition-colors mr-3">{item.icon}</span>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Notification Drawer - implemented with Dialog for now */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>You have 3 unread messages.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[400px] overflow-y-auto pr-2">
            {mockNotifications.map((n) => (
              <div key={n.id} className="p-4 border border-border rounded-lg bg-card hover:bg-secondary/20 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-4">{n.time}</span>
                </div>
                {n.desc && <p className="text-xs text-muted-foreground mb-3">{n.desc}</p>}
                <Button variant="secondary" size="sm" className="w-full text-xs h-7">{n.action}</Button>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <Button variant="ghost" size="sm">Mark all read</Button>
            <Button variant="outline" size="sm" onClick={() => setShowNotifications(false)}>Close</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

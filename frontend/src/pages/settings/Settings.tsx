import React from "react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Target, FileText, BrainCircuit, Bell, LayoutDashboard, Palette, Link as LinkIcon, Download, Shield, HelpCircle, Search, Save, RotateCcw, Briefcase } from 'lucide-react';
import { ProfileTab } from './ProfileTab';
import { CareerTab } from './CareerTab';
import { ResumeTab } from './ResumeTab';
import { AITab } from './AITab';
import { NotificationsTab } from './NotificationsTab';
import { DashboardTab } from './DashboardTab';
import { AppearanceTab } from './AppearanceTab';
import { AccountsTab } from './AccountsTab';
import { DataExportTab } from './DataExportTab';
import { PrivacyTab } from './PrivacyTab';
import { HelpTab } from './HelpTab';
import { RecruiterProfileTab } from './RecruiterProfileTab';
import { CompanyInfoTab } from './CompanyInfoTab';
import { HiringPreferencesTab } from './HiringPreferencesTab';
import { RecruiterNotificationsTab } from './RecruiterNotificationsTab';
import { RecruiterSecurityTab } from './RecruiterSecurityTab';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { Input } from './components/Input';
import { cn } from '../../lib/utils';

const studentTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'career', label: 'Career Preferences', icon: Target },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'ai', label: 'AI Preferences', icon: BrainCircuit },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'accounts', label: 'Connected Accounts', icon: LinkIcon },
  { id: 'data', label: 'Data & Export', icon: Download },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

const recruiterTabs = [
  { id: 'profile', label: 'Recruiter Profile', icon: User },
  { id: 'company', label: 'Company Information', icon: Briefcase },
  { id: 'hiring', label: 'Hiring Preferences', icon: Target },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security & Logout', icon: Shield },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isProfileValid, setIsProfileValid] = useState(true);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [profileData, setProfileData] = useState<any>({});
  
  const tabs = user?.role === 'RECRUITER' ? recruiterTabs : studentTabs;
  const filteredTabs = tabs.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    setActiveTab('profile');
  }, [user?.role]);

  const handleSave = () => {
    if (activeTab === 'profile' && !isProfileValid) {
      toast.error('Please fix validation errors before saving profile');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      toast.success('Settings saved successfully');
      if (Object.keys(profileData).length > 0) {
        dispatch(updateUser(profileData));
      }
    }, 800);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-8 mt-0 bg-background/50 overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-border bg-card/30 flex flex-col backdrop-blur-xl">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg mb-4">{user?.role === 'RECRUITER' ? 'Recruiter Settings' : 'Settings'}</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search settings..." 
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto relative bg-background/40">
        <div className="max-w-4xl mx-auto p-8 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {user?.role === 'RECRUITER' ? (
                <>
                  {activeTab === 'profile' && <RecruiterProfileTab onChange={(data, valid) => { setHasUnsavedChanges(true); setProfileData(data); setIsProfileValid(valid); }} />}
                  {activeTab === 'company' && <CompanyInfoTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'hiring' && <HiringPreferencesTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'notifications' && <RecruiterNotificationsTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'appearance' && <AppearanceTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'security' && <RecruiterSecurityTab onChange={() => setHasUnsavedChanges(true)} />}
                </>
              ) : (
                <>
                  {activeTab === 'profile' && <ProfileTab onChange={(data) => { setHasUnsavedChanges(true); setProfileData(data); }} />}
                  {activeTab === 'career' && <CareerTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'resume' && <ResumeTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'ai' && <AITab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'notifications' && <NotificationsTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'dashboard' && <DashboardTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'appearance' && <AppearanceTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'accounts' && <AccountsTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'data' && <DataExportTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'privacy' && <PrivacyTab onChange={() => setHasUnsavedChanges(true)} />}
                  {activeTab === 'help' && <HelpTab />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Action Bar for Unsaved Changes */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 left-[calc(16rem+2rem)] lg:left-[calc(20rem+2rem)] max-w-4xl mx-auto pointer-events-none"
            >
              <div className="bg-card border border-border shadow-lg rounded-full px-6 py-3 flex items-center justify-between pointer-events-auto backdrop-blur-xl">
                <span className="text-sm font-medium">You have unsaved changes</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setHasUnsavedChanges(false)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AIAssistant } from './AIAssistant';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <Sidebar />
      <Topbar />
      
      <main className="pl-64 pt-16 min-h-screen relative z-10">
        <div className="p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}

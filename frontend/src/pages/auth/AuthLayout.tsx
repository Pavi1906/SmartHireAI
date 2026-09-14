import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-8 bg-background relative overflow-hidden">
        
        {/* Background gradient blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BrainCircuit className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartHireAI</span>
          </div>
          
          <Outlet />
          
        </div>
      </div>
      
      <div className="hidden md:flex flex-col justify-between p-12 bg-secondary/30 border-l border-border relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
         
         <div className="relative z-10 flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
               <BrainCircuit className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">The Future of Hiring is Intelligent</h2>
            <p className="text-muted-foreground text-lg mb-12">
              Match with your dream role using deterministic AI evaluation, mock technical rounds, and automated skill gap bridging.
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-xl bg-background/50 border border-border backdrop-blur-sm text-left">
                <h4 className="font-semibold mb-1">For Candidates</h4>
                <p className="text-sm text-muted-foreground">AI mock interviews & ATS optimization.</p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-border backdrop-blur-sm text-left">
                <h4 className="font-semibold mb-1">For Recruiters</h4>
                <p className="text-sm text-muted-foreground">Automated sourcing & semantic matching.</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
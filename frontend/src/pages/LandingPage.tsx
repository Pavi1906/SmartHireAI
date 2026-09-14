import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, ArrowRight, Zap, Target, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">SmartHireAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/student/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild size="sm"><Link to="/student/register">Get Started</Link></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4" />
                <span>The new standard for intelligent hiring</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Deterministic AI for <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                  Modern Recruitment
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Eliminate bias, validate technical skills with precision, and match top talent to ideal roles using advanced semantic intelligence.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-12 px-8 text-base"><Link to="/student/register">I'm a Candidate<ArrowRight className="ml-2 w-5 h-5" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base"><Link to="/recruiter/register">I'm Hiring</Link></Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Intelligence at Every Step</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform bridges the gap between candidate capabilities and recruiter requirements.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Target className="w-6 h-6 text-primary" />}
                title="Semantic Matching"
                description="Go beyond keyword search. Our AI understands the context of skills, experience, and role requirements."
              />
              <FeatureCard 
                icon={<Zap className="w-6 h-6 text-primary" />}
                title="Mock Technical Rounds"
                description="Candidates can practice and prove their skills in simulated technical interviews evaluated by AI."
              />
              <FeatureCard 
                icon={<Shield className="w-6 h-6 text-primary" />}
                title="Bias Elimination"
                description="Focus purely on merit. Our deterministic evaluation ensures fair and equitable hiring practices."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">SmartHireAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SmartHireAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-background border border-border flex flex-col">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function SparklesIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
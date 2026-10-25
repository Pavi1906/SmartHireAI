import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  ArrowRight,
  Zap,
  Target,
  Shield,
} from 'lucide-react';
import { Button } from '../components/ui/button';

export function LandingPage() {
  const [showLoginOptions, setShowLoginOptions] = React.useState(false);

  const closeLoginOptions = () => {
    setShowLoginOptions(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">SmartHireAI</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Sign In opens the role-selection dialog */}
            <button
              type="button"
              onClick={() => setShowLoginOptions(true)}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Sign In
            </button>

            <Button asChild size="sm">
              <Link to="/student/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Student / Recruiter Login Selection Dialog */}
      {showLoginOptions && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={closeLoginOptions}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-options-title"
            className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <BrainCircuit className="h-7 w-7 text-primary" />
              </div>

              <h2
                id="login-options-title"
                className="text-2xl font-bold tracking-tight"
              >
                Welcome to SmartHireAI
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Choose your account type to sign in.
              </p>
            </div>

            <div className="grid gap-4">
              {/* Student Login */}
              <Button asChild className="h-12 w-full">
                <Link to="/student/login" onClick={closeLoginOptions}>
                  <span>Student Login</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              {/* Recruiter Login */}
              <Button
                asChild
                variant="outline"
                className="h-12 w-full"
              >
                <Link to="/recruiter/login" onClick={closeLoginOptions}>
                  <span>Recruiter Login</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <button
              type="button"
              onClick={closeLoginOptions}
              className="mt-5 w-full rounded-md py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <SparklesIcon className="h-4 w-4" />
                <span>The new standard for intelligent hiring</span>
              </div>

              <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
                Deterministic AI for
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Modern Recruitment
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
                Eliminate bias, validate technical skills with precision,
                and match top talent to ideal roles using advanced semantic
                intelligence.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-8 text-base"
                >
                  <Link to="/student/register">
                    I'm a Candidate
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                >
                  <Link to="/recruiter/register">I'm Hiring</Link>
                </Button>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Already have an account? Click Sign In above to choose
                Student or Recruiter Login.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary/30 py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                Intelligence at Every Step
              </h2>

              <p className="mx-auto max-w-2xl text-muted-foreground">
                Our platform bridges the gap between candidate capabilities
                and recruiter requirements.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<Target className="h-6 w-6 text-primary" />}
                title="Semantic Matching"
                description="Go beyond keyword search. Our AI understands the context of skills, experience, and role requirements."
              />

              <FeatureCard
                icon={<Zap className="h-6 w-6 text-primary" />}
                title="Mock Technical Rounds"
                description="Candidates can practice and prove their skills in simulated technical interviews evaluated by AI."
              />

              <FeatureCard
                icon={<Shield className="h-6 w-6 text-primary" />}
                title="Bias Elimination"
                description="Focus purely on merit. Our deterministic evaluation ensures fair and equitable hiring practices."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">SmartHireAI</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SmartHireAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>

      <h3 className="mb-2 text-xl font-semibold">{title}</h3>

      <p className="leading-relaxed text-muted-foreground">
        {description}
      </p>
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

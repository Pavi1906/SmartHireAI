import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStep('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  if (step === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
        <div className="pt-4">
          <Link to="/auth/login">
            <Button variant="outline" className="w-full">Return to login</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <Link to="/auth/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
        <p className="text-muted-foreground">Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={step === 'loading'}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={step === 'loading'}>
          {step === 'loading' ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...</>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
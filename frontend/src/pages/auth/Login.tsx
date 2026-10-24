import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { loginSuccess, loginStart, loginFailure, buildSessionUserFromToken } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { apiClient } from '../../services/api';

interface LoginProps {
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
}

export function Login({ role }: LoginProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState<number>(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(1);
    dispatch(loginStart());

    try {
      const endpoint =
        role === 'ADMIN'
          ? '/auth/admin/login'
          : role === 'STUDENT'
            ? '/auth/student/login'
            : '/auth/recruiter/login';

      const response = await apiClient.post(endpoint, {
        email,
        password,
      });

      const data = response.data;
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error('Authentication response missing token data.');
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      const sessionUser = buildSessionUserFromToken(accessToken, email, role);
      if (!sessionUser) {
        throw new Error('Authentication token was invalid or missing user data.');
      }

      dispatch(loginSuccess(sessionUser));
      navigate('/dashboard');
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.detail ||
        'Invalid email or password';

      dispatch(loginFailure(message));
      setStep(0);
    }
  };

  const getTitle = () => {
    switch (role) {
      case 'ADMIN':
        return 'Admin Login';
      case 'RECRUITER':
        return 'Recruiter Login';
      default:
        return 'Student Login';
    }
  };

  if (step > 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 h-64">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />

        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg font-medium text-muted-foreground"
          >
            Authenticating...
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
        <p className="text-muted-foreground">
          Welcome back to SmartHireAI
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>

            <Link
              to="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>

      {role !== 'ADMIN' && (
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to={`/${role.toLowerCase()}/register`}
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      )}
    </motion.div>
  );
}

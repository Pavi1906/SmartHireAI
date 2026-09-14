import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, Mail, Lock, Building2, MapPin, Phone, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { loginSuccess, loginStart, loginFailure } from '../../store/slices/authSlice';
import { getStoredUsers, saveUsers, Recruiter } from '../../services/authDemo';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  name: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "Valid phone number required"),
  companyName: z.string().min(2, "Company Name is required"),
  designation: z.string().min(2, "Designation is required"),
  location: z.string().min(2, "Location is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterRecruiter() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState<number>(0);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = (data: RegisterFormValues) => {
    setStep(1);
    dispatch(loginStart());

    setTimeout(() => {
      const users = getStoredUsers();
      if (users.find(u => u.email === data.email)) {
        dispatch(loginFailure("Email already registered"));
        setStep(0);
        return;
      }

      const newRecruiter: Recruiter = {
        id: 'rec_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        email: data.email,
        role: 'RECRUITER',
        phone: data.phone,
        companyName: data.companyName,
        designation: data.designation,
        location: data.location,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
      };

      users.push(newRecruiter);
      (newRecruiter as any).password = data.password;
      saveUsers(users);
      delete (newRecruiter as any).password;

      setStep(2);
      
      setTimeout(() => {
        dispatch(loginSuccess(newRecruiter));
        navigate('/dashboard');
      }, 800);
    }, 800);
  };

  const loadingSteps = [
    "Verifying company details...",
    "Setting up recruiter workspace...",
  ];

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
            {loadingSteps[step - 1]}
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
        <h1 className="text-3xl font-bold tracking-tight">Recruiter Access</h1>
        <p className="text-muted-foreground">Find top early-career talent with SmartHireAI.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("name")} type="text" placeholder="Jane Smith" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("email")} type="email" placeholder="jane@company.com" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("password")} type="password" placeholder="••••••••" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("confirmPassword")} type="password" placeholder="••••••••" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("companyName")} type="text" placeholder="Acme Corp" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Designation</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("designation")} type="text" placeholder="Technical Recruiter" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.designation && <p className="text-xs text-red-500">{errors.designation.message}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("phone")} type="tel" placeholder="+1 (555) 000-0000" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("location")} type="text" placeholder="New York, NY" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" required id="terms" className="rounded border-input text-primary focus:ring-primary" />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I accept the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </label>
        </div>

        <Button type="submit" className="w-full">
          Create Recruiter Account
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/recruiter/login" className="font-semibold text-primary hover:underline">
          Sign in instead
        </Link>
      </div>
    </motion.div>
  );
}

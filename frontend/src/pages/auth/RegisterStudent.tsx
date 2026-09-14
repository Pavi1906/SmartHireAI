import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, Mail, Lock, GraduationCap, Github, Linkedin, MapPin, Phone } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { loginSuccess, loginStart, loginFailure } from '../../store/slices/authSlice';
import { getStoredUsers, saveUsers, Student } from '../../services/authDemo';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  name: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "Valid phone number required"),
  college: z.string().min(2, "College is required"),
  degree: z.string().min(2, "Degree is required"),
  graduationYear: z.string().min(4, "Graduation year required"),
  location: z.string().min(2, "Location is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterStudent() {
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

      const newStudent: Student = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        email: data.email,
        role: 'STUDENT',
        phone: data.phone,
        college: data.college,
        degree: data.degree,
        graduationYear: data.graduationYear,
        location: data.location,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
      };

      // Store in users
      users.push(newStudent);
      saveUsers(users);

      // We should really save the password securely, but since this is a frontend demo we can store it in the users array or a separate auth store.
      // Let's store password in a separate hidden property for demo purposes
      (newStudent as any).password = data.password;
      saveUsers(users);
      delete (newStudent as any).password; // don't put it in redux

      setStep(2);
      
      setTimeout(() => {
        dispatch(loginSuccess(newStudent));
        navigate('/dashboard');
      }, 800);
    }, 800);
  };

  const loadingSteps = [
    "Creating account...",
    "Setting up student profile...",
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
        <h1 className="text-3xl font-bold tracking-tight">Create Student Account</h1>
        <p className="text-muted-foreground">Start your career journey with SmartHireAI.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("name")} type="text" placeholder="John Doe" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("email")} type="email" placeholder="name@example.com" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
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
              <input {...register("location")} type="text" placeholder="San Francisco, CA" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium">Degree</label>
            <div className="relative">
              <input {...register("degree")} type="text" placeholder="B.S. Computer Science" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.degree && <p className="text-xs text-red-500">{errors.degree.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium">College</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...register("college")} type="text" placeholder="University Name" className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {errors.college && <p className="text-xs text-red-500">{errors.college.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-medium">Graduation Year</label>
            <select {...register("graduationYear")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            {errors.graduationYear && <p className="text-xs text-red-500">{errors.graduationYear.message}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" required id="terms" className="rounded border-input text-primary focus:ring-primary" />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I accept the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </label>
        </div>

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/student/login" className="font-semibold text-primary hover:underline">
          Sign in instead
        </Link>
      </div>
    </motion.div>
  );
}

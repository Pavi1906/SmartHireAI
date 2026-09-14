import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from './components/Input';
import { Label } from './components/Label';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getRecruiterProfile, updateRecruiterProfile, RecruiterProfileResponse, RecruiterProfileUpdate } from '../../services/recruiterService';

export function RecruiterProfileTab({ onChange }: { onChange: (data: any, isValid: boolean) => void }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    designation: (user as any)?.designation || 'Senior Technical Recruiter',
    department: (user as any)?.department || 'Talent Acquisition',
    company: (user as any)?.company || 'SmartHire Technologies'
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = (updatedForm: typeof form) => {
    const newErrors: { name?: string; email?: string } = {};
    let valid = true;

    if (!updatedForm.name.trim()) {
      newErrors.name = 'Full name is required';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!updatedForm.email.trim() || !emailRegex.test(updatedForm.email)) {
      newErrors.email = 'Valid email address is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile: RecruiterProfileResponse = await getRecruiterProfile();
        const initialData = {
          name: profile.full_name || '',
          email: profile.work_email || '',
          phone: (user as any)?.phone || '',
          designation: profile.designation || '',
          department: (user as any)?.department || 'Talent Acquisition',
          company: profile.company_name || 'SmartHire Technologies'
        };
        setForm(initialData);
        const isValid = validate(initialData);
        onChange(initialData, isValid);
        // Sync Redux auth state
        dispatch(updateUser({ ...user, name: profile.full_name, email: profile.work_email, designation: profile.designation, company: profile.company_name }));
      } catch (err) {
        toast.error('Failed to load recruiter profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    const isValid = validate(updated);
    onChange(updated, isValid);
  };

  const handleSave = async () => {
    if (!validate(form)) return;
    setLoading(true);
    const payload: RecruiterProfileUpdate = {
      full_name: form.name,
      designation: form.designation
    };
    try {
      const updated = await updateRecruiterProfile(payload);
      toast.success('Profile updated');
      dispatch(updateUser({ ...user, name: updated.full_name, email: updated.work_email, designation: updated.designation, company: updated.company_name }));
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Recruiter Profile</CardTitle>
          <CardDescription>Manage your professional recruiter identity and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border border-border">
              <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
              <AvatarFallback>{form.name.charAt(0) || 'R'}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="gap-2" onClick={() => toast.success('Avatar updated simulation')}>
                <Upload className="h-4 w-4" />
                Upload new picture
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Job Title / Designation</Label>
              <Input id="designation" name="designation" value={form.designation} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" value={form.department} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" name="company" value={form.company} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

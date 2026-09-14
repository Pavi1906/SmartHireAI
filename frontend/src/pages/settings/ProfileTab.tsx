import React, { useEffect } from "react";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from './components/Input';
import { Label } from './components/Label';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Upload } from 'lucide-react';

export function ProfileTab({ onChange }: { onChange: (data: any) => void }) {
  const { user } = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    college: (user as any)?.college || '',
    degree: (user as any)?.degree || '',
    gradYear: (user as any)?.graduationYear || '',
    role: user?.role === 'STUDENT' ? 'Student' : ((user as any)?.designation || 'Recruiter'),
    github: (user as any)?.github || '',
    linkedin: (user as any)?.linkedin || '',
    portfolio: (user as any)?.portfolio || ''
  });

  useEffect(() => {
    if (user) {
      setProfile(p => ({
        ...p,
        name: user.name,
        email: user.email,
        phone: (user as any)?.phone || '',
        college: (user as any)?.college || '',
        degree: (user as any)?.degree || '',
        gradYear: (user as any)?.graduationYear || '',
        role: user.role === 'STUDENT' ? 'Student' : ((user as any).designation || 'Recruiter'),
        github: (user as any)?.github || '',
        linkedin: (user as any)?.linkedin || '',
        portfolio: (user as any)?.portfolio || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
    onChange({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Manage your public profile and personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar || (user as any)?.avatarUrl || "https://github.com/shadcn.png"} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload new picture
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={profile.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={profile.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Current Role</Label>
              <Input id="role" name="role" value={profile.role} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Education</CardTitle>
          <CardDescription>Your educational background and achievements.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="college">College / University</Label>
              <Input id="college" name="college" value={profile.college} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Input id="degree" name="degree" value={profile.degree} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradYear">Graduation Year</Label>
              <Input id="gradYear" name="gradYear" value={profile.gradYear} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Links</CardTitle>
          <CardDescription>Connect your external profiles and portfolios.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input id="github" name="github" value={profile.github} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" name="linkedin" value={profile.linkedin} onChange={handleChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input id="portfolio" name="portfolio" value={profile.portfolio} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

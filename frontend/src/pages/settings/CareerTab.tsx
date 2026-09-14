import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from './components/Input';
import { Label } from './components/Label';

export function CareerTab({ onChange }: { onChange: () => void }) {
  const [career, setCareer] = useState({
    role: 'Frontend Engineer',
    companies: 'Google, Amazon, Microsoft',
    locations: 'San Francisco, Remote',
    salary: '$120,000',
    type: 'Full-time',
    techStack: 'React, TypeScript, Node.js',
    experience: 'Intermediate (2-4 years)'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCareer(c => ({ ...c, [e.target.name]: e.target.value }));
    onChange();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Career Preferences</CardTitle>
          <CardDescription>Set your targets to improve AI matching accuracy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Preferred Role</Label>
              <Input id="role" name="role" value={career.role} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companies">Target Companies</Label>
              <Input id="companies" name="companies" value={career.companies} onChange={handleChange} placeholder="e.g. Google, Apple" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack">Preferred Tech Stack</Label>
              <Input id="techStack" name="techStack" value={career.techStack} onChange={handleChange} placeholder="e.g. React, Python" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locations">Preferred Locations</Label>
                <Input id="locations" name="locations" value={career.locations} onChange={handleChange} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary">Expected Salary</Label>
                <Input id="salary" name="salary" value={career.salary} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Employment Type</Label>
                <select 
                  id="type" 
                  name="type" 
                  value={career.type} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <select 
                  id="experience" 
                  name="experience" 
                  value={career.experience} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Entry (0-2 years)">Entry (0-2 years)</option>
                  <option value="Intermediate (2-4 years)">Intermediate (2-4 years)</option>
                  <option value="Senior (5+ years)">Senior (5+ years)</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

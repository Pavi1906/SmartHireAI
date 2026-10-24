import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from './components/Label';
import { Input } from './components/Input';
import { Switch } from './components/Switch';

export function HiringPreferencesTab({ onChange }: { onChange: (data: any) => void }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const storageKey = `smarthireai_user_${user?.id}_hiring_prefs`;

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      remoteOnly: false,
      autoScreening: true,
      aiScoring: true,
      preferredExperience: '2-5 years',
      defaultTargetSkills: 'React, TypeScript, Python, Node.js',
      workMode: 'Hybrid'
    };
  });

  const toggle = (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    onChange(updated);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...prefs, [e.target.name]: e.target.value };
    setPrefs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Recruitment & Sourcing Preferences</CardTitle>
          <CardDescription>Configure automated defaults and candidate screening rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automated AI Candidate Scoring</Label>
                <p className="text-sm text-muted-foreground">Automatically evaluate match scores upon candidate resume parsing.</p>
              </div>
              <Switch checked={prefs.aiScoring} onCheckedChange={() => toggle('aiScoring')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Smart Pre-Screening</Label>
                <p className="text-sm text-muted-foreground">Flag unqualified applicants based on required job skills.</p>
              </div>
              <Switch checked={prefs.autoScreening} onCheckedChange={() => toggle('autoScreening')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="preferredExperience">Default Experience Benchmark</Label>
              <Input id="preferredExperience" name="preferredExperience" value={prefs.preferredExperience} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workMode">Preferred Work Mode</Label>
              <Input id="workMode" name="workMode" value={prefs.workMode} onChange={handleChange} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="defaultTargetSkills">Default Target Skills (Comma separated)</Label>
              <Input id="defaultTargetSkills" name="defaultTargetSkills" value={prefs.defaultTargetSkills} onChange={handleChange} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

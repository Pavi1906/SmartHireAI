import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from './components/Switch';
import { Label } from './components/Label';

export function AITab({ onChange }: { onChange: () => void }) {
  const [aiSettings, setAiSettings] = useState({
    model: 'Gemini 3.1 Pro',
    depth: 'Deep',
    atsStrictness: 'High',
    personality: 'Professional & Direct',
    recommendations: true,
    learning: true,
    mockInterviews: true,
    companyReadiness: true
  });

  const toggleSetting = (key: keyof typeof aiSettings) => {
    setAiSettings(s => ({ ...s, [key]: !(s as any)[key] }));
    onChange();
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAiSettings(s => ({ ...s, [e.target.name]: e.target.value }));
    onChange();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>AI Model Settings</CardTitle>
          <CardDescription>Configure the core intelligence engine.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="model">Preferred AI Model</Label>
              <select name="model" value={aiSettings.model} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Gemini 3.1 Pro">Gemini 3.1 Pro (Recommended)</option>
                <option value="Gemini 3.1 Flash">Gemini 3.1 Flash (Faster)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="personality">AI Mentor Personality</Label>
              <select name="personality" value={aiSettings.personality} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Professional & Direct">Professional & Direct</option>
                <option value="Encouraging & Friendly">Encouraging & Friendly</option>
                <option value="Strict Interviewer">Strict Interviewer</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depth">Analysis Depth</Label>
              <select name="depth" value={aiSettings.depth} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Quick">Quick Overview</option>
                <option value="Standard">Standard</option>
                <option value="Deep">Deep Dive (Comprehensive)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="atsStrictness">ATS Strictness</Label>
              <select name="atsStrictness" value={aiSettings.atsStrictness} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Lenient">Lenient</option>
                <option value="Standard">Standard</option>
                <option value="High">High (FAANG level)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
          <CardDescription>Enable or disable specific AI capabilities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Recommendations</Label>
              <p className="text-sm text-muted-foreground">Receive personalized job and role suggestions.</p>
            </div>
            <Switch checked={aiSettings.recommendations} onCheckedChange={() => toggleSetting('recommendations')} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Learning Suggestions</Label>
              <p className="text-sm text-muted-foreground">AI will build custom courses based on your skill gaps.</p>
            </div>
            <Switch checked={aiSettings.learning} onCheckedChange={() => toggleSetting('learning')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mock Interview Suggestions</Label>
              <p className="text-sm text-muted-foreground">AI will prompt you to practice when you are ready.</p>
            </div>
            <Switch checked={aiSettings.mockInterviews} onCheckedChange={() => toggleSetting('mockInterviews')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Company Readiness Tracking</Label>
              <p className="text-sm text-muted-foreground">Continuously calculate your match score for target companies.</p>
            </div>
            <Switch checked={aiSettings.companyReadiness} onCheckedChange={() => toggleSetting('companyReadiness')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

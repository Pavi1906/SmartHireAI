import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from './components/Switch';
import { Label } from './components/Label';

export function DashboardTab({ onChange }: { onChange: () => void }) {
  const [widgets, setWidgets] = useState({
    placement: true,
    resume: true,
    skillGap: true,
    applications: true,
    charts: true,
    timeline: true,
    readiness: true,
    mentor: true,
    actionPlan: true
  });
  
  const [defaultPage, setDefaultPage] = useState('Overview');

  const toggle = (key: keyof typeof widgets) => {
    setWidgets(w => ({ ...w, [key]: !w[key] }));
    onChange();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Dashboard Layout</CardTitle>
          <CardDescription>Toggle visibility of widgets on your main dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 pb-4 border-b border-border">
            <Label>Default Landing Page</Label>
            <select 
              value={defaultPage}
              onChange={(e) => { setDefaultPage(e.target.value); onChange(); }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Overview">Overview (Dashboard)</option>
              <option value="Resume Intelligence">Resume Intelligence</option>
              <option value="Analytics">Analytics</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex items-center justify-between">
              <Label>Placement Probability</Label>
              <Switch checked={widgets.placement} onCheckedChange={() => toggle('placement')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Resume Score</Label>
              <Switch checked={widgets.resume} onCheckedChange={() => toggle('resume')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Skill Gap Index</Label>
              <Switch checked={widgets.skillGap} onCheckedChange={() => toggle('skillGap')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active Applications</Label>
              <Switch checked={widgets.applications} onCheckedChange={() => toggle('applications')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Readiness Trajectory Chart</Label>
              <Switch checked={widgets.charts} onCheckedChange={() => toggle('charts')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Career Timeline</Label>
              <Switch checked={widgets.timeline} onCheckedChange={() => toggle('timeline')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Company Readiness</Label>
              <Switch checked={widgets.readiness} onCheckedChange={() => toggle('readiness')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Floating AI Mentor</Label>
              <Switch checked={widgets.mentor} onCheckedChange={() => toggle('mentor')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>AI Action Plan</Label>
              <Switch checked={widgets.actionPlan} onCheckedChange={() => toggle('actionPlan')} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

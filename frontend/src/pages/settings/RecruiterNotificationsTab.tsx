import React, { useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from './components/Switch';
import { Label } from './components/Label';

export function RecruiterNotificationsTab({ onChange }: { onChange: (data: any) => void }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const storageKey = `smarthireai_user_${user?.id}_recruiter_notifs`;

  const [notifs, setNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      newCandidate: true,
      candidateShortlisted: true,
      interviewUpdates: true,
      jobApplicationActivity: true,
      pipelineUpdates: true,
      emailDigest: true
    };
  });

  const toggle = (key: string) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Recruiter Notification Preferences</CardTitle>
          <CardDescription>Configure alerts for applicant activities and pipeline stage transitions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Candidate Applications</Label>
              <p className="text-sm text-muted-foreground">Receive instant alerts when a candidate applies to your job postings.</p>
            </div>
            <Switch checked={notifs.newCandidate} onCheckedChange={() => toggle('newCandidate')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Candidate Shortlisted</Label>
              <p className="text-sm text-muted-foreground">Notify when candidates are moved to shortlisted status.</p>
            </div>
            <Switch checked={notifs.candidateShortlisted} onCheckedChange={() => toggle('candidateShortlisted')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Interview Updates</Label>
              <p className="text-sm text-muted-foreground">Alerts regarding candidate interview schedules and feedback ratings.</p>
            </div>
            <Switch checked={notifs.interviewUpdates} onCheckedChange={() => toggle('interviewUpdates')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Job Application Activity</Label>
              <p className="text-sm text-muted-foreground">Summary reports of active job requisition metrics.</p>
            </div>
            <Switch checked={notifs.jobApplicationActivity} onCheckedChange={() => toggle('jobApplicationActivity')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pipeline Stage Updates</Label>
              <p className="text-sm text-muted-foreground">Alerts when candidates transition between pipeline stages.</p>
            </div>
            <Switch checked={notifs.pipelineUpdates} onCheckedChange={() => toggle('pipelineUpdates')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

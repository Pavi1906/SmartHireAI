import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from './components/Switch';
import { Label } from './components/Label';

export function NotificationsTab({ onChange }: { onChange: () => void }) {
  const [notifs, setNotifs] = useState({
    email: true,
    push: true,
    interview: true,
    learning: true,
    applications: true,
    company: true,
    weekly: false,
    jobs: true
  });

  const toggle = (key: keyof typeof notifs) => {
    setNotifs(n => ({ ...n, [key]: !n[key] }));
    onChange();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
          <CardDescription>Where do you want to receive notifications?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email.</p>
            </div>
            <Switch checked={notifs.email} onCheckedChange={() => toggle('email')} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive in-app push notifications.</p>
            </div>
            <Switch checked={notifs.push} onCheckedChange={() => toggle('push')} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
          <CardDescription>What events should trigger a notification?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Interview Reminders</Label>
              <p className="text-sm text-muted-foreground">Alerts before upcoming mock interviews.</p>
            </div>
            <Switch checked={notifs.interview} onCheckedChange={() => toggle('interview')} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Learning Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders to complete your AI learning path.</p>
            </div>
            <Switch checked={notifs.learning} onCheckedChange={() => toggle('learning')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Application Updates</Label>
              <p className="text-sm text-muted-foreground">Status changes on your job applications.</p>
            </div>
            <Switch checked={notifs.applications} onCheckedChange={() => toggle('applications')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Company Readiness Alerts</Label>
              <p className="text-sm text-muted-foreground">When you hit a readiness milestone for a target company.</p>
            </div>
            <Switch checked={notifs.company} onCheckedChange={() => toggle('company')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Job Recommendations</Label>
              <p className="text-sm text-muted-foreground">New jobs matching your profile.</p>
            </div>
            <Switch checked={notifs.jobs} onCheckedChange={() => toggle('jobs')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Weekly summary of your progress and ATS score.</p>
            </div>
            <Switch checked={notifs.weekly} onCheckedChange={() => toggle('weekly')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

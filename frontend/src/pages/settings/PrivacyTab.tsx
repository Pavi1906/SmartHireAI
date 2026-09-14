import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from './components/Switch';
import { Label } from './components/Label';
import { Input } from './components/Input';
import { Laptop, Smartphone, AlertTriangle } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

export function PrivacyTab({ onChange }: { onChange: () => void }) {
  const [twoFA, setTwoFA] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="space-y-6">
      
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your resumes, mock interviews, and analytics will be wiped.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
             <div className="space-y-2">
               <Label>To confirm, type "DELETE"</Label>
               <Input placeholder="DELETE" />
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t border-border">
               <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
               <Button variant="destructive" onClick={() => setShowDelete(false)}>Permanently Delete</Button>
             </div>
          </div>
        </div>
      </Dialog>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 border-b border-border pb-6">
            <h4 className="font-medium text-sm">Change Password</h4>
            <div className="grid gap-4 max-w-sm">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <Button className="w-fit">Update Password</Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <Switch checked={twoFA} onCheckedChange={(c) => { setTwoFA(c); onChange(); }} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage devices currently logged in to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/10">
            <div className="flex items-center gap-4">
              <Laptop className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-sm">MacBook Pro - San Francisco, CA</h4>
                <p className="text-xs text-emerald-500 font-medium">Active Now (Current Session)</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/10">
            <div className="flex items-center gap-4">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-sm">iPhone 13 - Remote</h4>
                <p className="text-xs text-muted-foreground">Last active 2 hours ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Log Out</Button>
          </div>
          
          <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
            Log out of all other devices
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}

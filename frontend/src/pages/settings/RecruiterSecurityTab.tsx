import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from './components/Switch';
import { Label } from './components/Label';
import { Laptop, Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function RecruiterSecurityTab({ onChange }: { onChange: () => void }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [twoFA, setTwoFA] = useState(false);

  const handleLogout = () => {
    toast("Logging out", { description: "Clearing session..." });
    setTimeout(() => {
      dispatch(logout());
      toast.success("Logged out successfully");
    }, 800);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Security & Authentication</CardTitle>
          <CardDescription>Manage your account security and active authentication sessions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-muted-foreground">Secure your recruiter account with multi-factor authentication.</p>
            </div>
            <Switch checked={twoFA} onCheckedChange={(c) => { setTwoFA(c); onChange(); toast.success('2FA setting updated'); }} />
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            <h4 className="font-medium text-sm">Active Recruiter Session</h4>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/10">
              <div className="flex items-center gap-4">
                <Laptop className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium text-sm">{user?.name} ({user?.email})</h4>
                  <p className="text-xs text-emerald-500 font-medium">Active Session • Role: RECRUITER</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out of Recruiter Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

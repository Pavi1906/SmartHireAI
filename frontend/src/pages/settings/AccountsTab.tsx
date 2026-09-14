import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle2, Loader2, Link as LinkIcon, Unlink } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

export function AccountsTab({ onChange }: { onChange: () => void }) {
  const [accounts, setAccounts] = useState<Record<string, boolean>>({
    github: true,
    linkedin: false,
    google: true,
    leetcode: false,
    hackerrank: false,
    geeksforgeeks: false
  });
  
  const [connecting, setConnecting] = useState<string | null>(null);

  const toggleAccount = (provider: string) => {
    if (accounts[provider]) {
      // Disconnect
      setAccounts(a => ({ ...a, [provider]: false }));
      onChange();
    } else {
      // Connect
      setConnecting(provider);
      setTimeout(() => {
        setConnecting(null);
        setAccounts(a => ({ ...a, [provider]: true }));
        onChange();
      }, 2000);
    }
  };

  const providers = [
    { id: 'github', name: 'GitHub', desc: 'Sync your repositories and contribution graph.' },
    { id: 'linkedin', name: 'LinkedIn', desc: 'Import work experience and endorsements.' },
    { id: 'google', name: 'Google', desc: 'Sign in and sync Google Calendar.' },
    { id: 'leetcode', name: 'LeetCode', desc: 'Verify your DSA problem-solving skills.' },
    { id: 'hackerrank', name: 'HackerRank', desc: 'Import certification test results.' },
    { id: 'geeksforgeeks', name: 'GeeksForGeeks', desc: 'Sync your coding practice scores.' }
  ];

  return (
    <div className="space-y-6">
      <Dialog open={connecting !== null} onOpenChange={() => {}}>
        <div className="space-y-6 flex flex-col items-center justify-center p-6 min-h-[200px] text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
          <DialogTitle>Connecting to {providers.find(p => p.id === connecting)?.name}</DialogTitle>
          <DialogDescription>Waiting for OAuth authorization...</DialogDescription>
        </div>
      </Dialog>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Link third-party platforms to enrich your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map(provider => {
            const isConnected = accounts[provider.id];
            return (
              <div key={provider.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{provider.name}</h4>
                    {isConnected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{provider.desc}</p>
                  {isConnected && <p className="text-xs text-primary mt-1 flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Connected as alex_dev</p>}
                </div>
                <Button 
                  variant={isConnected ? "outline" : "default"} 
                  className={isConnected ? "text-destructive hover:bg-destructive/10 hover:text-destructive border-border" : ""}
                  onClick={() => toggleAccount(provider.id)}
                >
                  {isConnected ? <><Unlink className="h-4 w-4 mr-2" /> Disconnect</> : 'Connect'}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

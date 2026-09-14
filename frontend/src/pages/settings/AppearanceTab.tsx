import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from './components/Switch';
import { Label } from './components/Label';

export function AppearanceTab({ onChange }: { onChange: () => void }) {
  const [appearance, setAppearance] = useState({
    theme: 'Dark',
    accent: 'Blue',
    compact: false,
    animations: true
  });

  const toggle = (key: keyof typeof appearance) => {
    setAppearance(a => ({ ...a, [key]: !(a as any)[key] }));
    onChange();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAppearance(a => ({ ...a, [e.target.name]: e.target.value }));
    onChange();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Customize the visual appearance of SmartHireAI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Color Theme</Label>
              <select name="theme" value={appearance.theme} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Dark">Dark Mode</option>
                <option value="Light">Light Mode</option>
                <option value="System">System Preference</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <Label>Accent Color</Label>
              <select name="accent" value={appearance.accent} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Blue">Brand Blue</option>
                <option value="Purple">Deep Purple</option>
                <option value="Green">Emerald Green</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce padding and spacing to fit more content on screen.</p>
              </div>
              <Switch checked={appearance.compact} onCheckedChange={() => toggle('compact')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>UI Animations</Label>
                <p className="text-sm text-muted-foreground">Enable smooth transitions and AI processing effects.</p>
              </div>
              <Switch checked={appearance.animations} onCheckedChange={() => toggle('animations')} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>Preview your appearance settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-xl border border-border bg-background space-y-4">
             <div className="flex gap-4 items-center">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                 <div className="w-5 h-5 rounded-full bg-primary" />
               </div>
               <div className="space-y-2 flex-1">
                 <div className="h-4 w-1/3 bg-muted rounded" />
                 <div className="h-3 w-1/2 bg-muted/50 rounded" />
               </div>
             </div>
             <div className="h-24 w-full bg-secondary/50 rounded-lg border border-border flex items-center justify-center text-sm text-muted-foreground">
               Component Preview
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

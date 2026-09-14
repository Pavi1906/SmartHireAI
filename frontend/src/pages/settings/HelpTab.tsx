import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ExternalLink, BookOpen, MessageSquare, AlertCircle, Shield } from 'lucide-react';

export function HelpTab() {
  const links = [
    { name: 'Documentation', desc: 'Detailed guides on how to use SmartHireAI', icon: BookOpen },
    { name: 'Report a Bug', desc: 'Found an issue? Let us know', icon: AlertCircle },
    { name: 'Feature Request', desc: 'Suggest a new feature or integration', icon: MessageSquare },
    { name: 'Privacy Policy', desc: 'Read how we handle your data', icon: Shield },
    { name: 'Terms of Service', desc: 'Our rules and guidelines', icon: FileTextIcon },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle>About SmartHireAI</CardTitle>
          <CardDescription>Version 2.4.0 (Build 4920)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            SmartHireAI is an enterprise-grade career intelligence platform powered by Gemini models. 
            Our mission is to help candidates perfectly match with their dream roles using 
            deterministic AI evaluation, mock technical rounds, and skill gap bridging.
          </p>
          <div className="mt-6 flex gap-3">
             <Button>Check for Updates</Button>
             <Button variant="outline">View Changelog</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Support & Resources</CardTitle>
          <CardDescription>Find help and learn how to maximize your ATS score.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link, i) => {
              const Icon = link.icon;
              return (
                <div key={i} className="flex items-start p-4 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/30 transition-colors cursor-pointer group">
                  <Icon className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors mr-3" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                      {link.name} <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">How is my ATS score calculated?</h4>
            <p className="text-sm text-muted-foreground">We use standard enterprise parsing techniques combined with AI to match keywords, semantic intent, and impact metrics against target job descriptions.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Are mock interviews recorded?</h4>
            <p className="text-sm text-muted-foreground">Audio and video are processed locally in your browser and sent securely to our AI models. They are not stored permanently unless you choose to export them.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

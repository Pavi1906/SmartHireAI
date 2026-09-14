import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

export function DataExportTab({ onChange }: { onChange: () => void }) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = (type: string, format: string) => {
    setExporting(`${type} (${format})`);
    setTimeout(() => {
      setExporting('done');
      setTimeout(() => setExporting(null), 2000);
    }, 2500);
  };

  const reports = [
    { id: 'resume', name: 'Resume Report', desc: 'Detailed ATS analysis and keyword gap report.' },
    { id: 'analytics', name: 'Analytics Data', desc: 'Raw metrics from your dashboard.' },
    { id: 'learning', name: 'Learning Progress', desc: 'Your completed modules and study hours.' },
    { id: 'interview', name: 'Interview Report', desc: 'Transcripts and feedback from Mock Interviews.' },
    { id: 'career', name: 'Career Trajectory', desc: 'Goals and probability projections.' }
  ];

  return (
    <div className="space-y-6">
      <Dialog open={exporting !== null} onOpenChange={() => {}}>
        <div className="space-y-6 flex flex-col items-center justify-center p-6 min-h-[200px] text-center">
          {exporting !== 'done' ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
              <DialogTitle>Generating {exporting}</DialogTitle>
              <DialogDescription>Compiling your data, please wait...</DialogDescription>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
              <DialogTitle>Export Complete</DialogTitle>
              <DialogDescription>Your file download has started.</DialogDescription>
            </>
          )}
        </div>
      </Dialog>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Data & Export</CardTitle>
          <CardDescription>Download your SmartHireAI data in standard formats.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg bg-secondary/10">
              <div className="mb-4 sm:mb-0 flex items-start gap-4">
                <div className="mt-1">
                   <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">{report.name}</h4>
                  <p className="text-sm text-muted-foreground">{report.desc}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport(report.name, 'PDF')}>
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport(report.name, 'CSV')}>
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from './components/Switch';
import { Label } from './components/Label';
import { Upload, Download, Trash2, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export function ResumeTab({ onChange }: { onChange: () => void }) {
  const { activeResume } = useSelector((state: RootState) => state.resume);
  const [resumeSettings, setResumeSettings] = useState({
    autoAnalysis: true,
    autoVersioning: true,
    privacy: 'Private'
  });
  
  const [uploadStep, setUploadStep] = useState<number | null>(null);

  useEffect(() => {
    if (uploadStep !== null && uploadStep < 6 && uploadStep > 0) {
      const timer = setTimeout(() => {
        setUploadStep(prev => (prev !== null ? prev + 1 : null));
      }, 1500);
      return () => clearTimeout(timer);
    } else if (uploadStep === 6) {
      setTimeout(() => {
        setUploadStep(null);
      }, 2000);
    }
  }, [uploadStep]);

  const toggleSetting = (key: keyof typeof resumeSettings) => {
    setResumeSettings(s => ({ ...s, [key]: !s[key] }));
    onChange();
  };

  return (
    <div className="space-y-6">
      <Dialog open={uploadStep !== null} onOpenChange={(open) => !open && setUploadStep(null)}>
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle>Upload New Resume</DialogTitle>
            <DialogDescription>Let AI analyze your latest experience.</DialogDescription>
          </DialogHeader>
          <div className="min-h-[200px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-secondary/10">
            {uploadStep === 0 && (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Drag and drop your PDF or DOCX file here</p>
                <Button onClick={() => setUploadStep(1)}>Browse Files</Button>
              </>
            )}
            {uploadStep !== null && uploadStep > 0 && uploadStep < 6 && (
              <div className="flex flex-col items-center w-full max-w-xs space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>
                      {uploadStep === 1 && "Validating format..."}
                      {uploadStep === 2 && "Uploading securely..."}
                      {uploadStep === 3 && "Parsing text contents..."}
                      {uploadStep === 4 && "Extracting technical skills..."}
                      {uploadStep === 5 && "Calculating ATS Match..."}
                    </span>
                    <span>{uploadStep * 20}%</span>
                  </div>
                  <Progress value={uploadStep * 20} className="h-2" />
                </div>
              </div>
            )}
            {uploadStep === 6 && (
              <div className="flex flex-col items-center text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-lg text-emerald-500">Analysis Complete!</h3>
                <p className="text-sm text-muted-foreground mt-2">Resume is now set as the active version.</p>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Current Resume</CardTitle>
          <CardDescription>Manage your active resume document.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">{activeResume ? activeResume.name : 'No Resume Uploaded'}</h4>
                <p className="text-xs text-muted-foreground">Uploaded {activeResume ? 'Recently' : 'Never'} • {activeResume ? (activeResume.size / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => setUploadStep(0)} className="gap-2">
              <Upload className="h-4 w-4" /> Upload New Resume
            </Button>
            <Button variant="outline">Switch Active Version</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Resume Preferences</CardTitle>
          <CardDescription>Configure how SmartHireAI handles your resumes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Resume Analysis</Label>
              <p className="text-sm text-muted-foreground">Automatically scan new uploads for ATS optimization.</p>
            </div>
            <Switch checked={resumeSettings.autoAnalysis} onCheckedChange={() => toggleSetting('autoAnalysis')} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Versioning</Label>
              <p className="text-sm text-muted-foreground">Keep older versions when you upload a new resume.</p>
            </div>
            <Switch checked={resumeSettings.autoVersioning} onCheckedChange={() => toggleSetting('autoVersioning')} />
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Resume Privacy</Label>
            <select 
              value={resumeSettings.privacy}
              onChange={(e) => {
                setResumeSettings(s => ({ ...s, privacy: e.target.value }));
                onChange();
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Private">Private (Only you can see it)</option>
              <option value="Recruiters">Recruiters Only (Visible to active hiring managers)</option>
              <option value="Public">Public (Anyone with link)</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

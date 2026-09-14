import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  FileText,
  FileType,
  History,
  Loader2,
  RefreshCw,
  Search,
  UploadCloud,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';

import { RootState } from '../../store';
import {
  uploadResumeSuccess,
  setResumeData,
  toggleDemoMode,
} from '../../store/slices/resumeSlice';

import { Switch } from '../../pages/settings/components/Switch';
import { Label } from '../../pages/settings/components/Label';
import { resumeService, ATSScoreResponse } from '../../services/resumeService';

interface ResumeHistoryItem {
  v: number;
  s: number;
  d: string;
}

interface ParsedResumeData {
  text?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  certifications?: any[];
  achievements?: any[];
  error?: string;
  [key: string]: any;
}

interface BackendResume {
  resume_id?: string;
  id?: string;
  student_id?: string;
  s3_key?: string;
  status?: string;
  parsed_json?: ParsedResumeData | null;
  created_at?: string;
  version?: number;
  score?: number;
  ats_data?: ATSScoreResponse;
}

interface FrontendResume {
  id: string;
  resume_id: string;
  name: string;
  size: number;
  version: number;
  score: number;
  status: string;
  parsedContent: ParsedResumeData;
  ats_data?: ATSScoreResponse;
}

export function ResumeIntelligence() {
  const location = useLocation();
  const dispatch = useDispatch();

  const tailorFor = location.state?.tailorFor;

  const { user } = useSelector((state: RootState) => state.auth);

  const { activeResume, isDemoMode } = useSelector(
    (state: RootState) => state.resume
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);

  const [score, setScore] = useState(0);
  const [atsDetails, setAtsDetails] = useState<ATSScoreResponse | null>(null);
  const [version, setVersion] = useState(0);

  const [history, setHistory] = useState<ResumeHistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const hasResume = isDemoMode || !!activeResume;

  /*
   * Restore resume information from Redux.
   */
  useEffect(() => {
    if (activeResume) {
      const currentVersion = Number(activeResume.version || 1);
      const currentScore = Number(activeResume.score || activeResume.ats_data?.ats_score || 0);

      setScore(currentScore);
      setVersion(currentVersion);
      if (activeResume.ats_data) {
        setAtsDetails(activeResume.ats_data);
      }

      setHistory([
        {
          v: currentVersion,
          s: currentScore,
          d: 'Just now',
        },
      ]);
    } else {
      setScore(0);
      setAtsDetails(null);
      setVersion(0);
      setHistory([]);
    }
  }, [activeResume]);

  /*
   * PDF validation.
   */
  const validateFile = (file: File): boolean => {
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      toast.error('Invalid file type. Please upload a PDF resume.');
      return false;
    }

    if (file.size === 0) {
      toast.error('The selected file is empty.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds the 5MB limit.');
      return false;
    }

    return true;
  };

  /*
   * File picker.
   */
  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  /*
   * Drag and drop.
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = event.dataTransfer.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  /*
   * Convert backend response into Redux/frontend format.
   */
  const createFrontendResume = (
    backendResume: BackendResume,
    file: File,
    atsResult?: ATSScoreResponse
  ): FrontendResume => {
    const parsed =
      backendResume.parsed_json || {};

    const resumeId =
      backendResume.resume_id ||
      backendResume.id ||
      '';

    const parsedSkills = Array.isArray(parsed.skills)
      ? parsed.skills
      : [];

    const parsedExperience = Array.isArray(
      parsed.experience
    )
      ? parsed.experience
      : [];

    const parsedEducation = Array.isArray(
      parsed.education
    )
      ? parsed.education
      : [];

    const parsedProjects = Array.isArray(
      parsed.projects
    )
      ? parsed.projects
      : [];

    const parsedCertifications = Array.isArray(
      parsed.certifications
    )
      ? parsed.certifications
      : [];

    const parsedAchievements = Array.isArray(
      parsed.achievements
    )
      ? parsed.achievements
      : [];

    const finalScore = atsResult ? atsResult.ats_score : Number(backendResume.score || 0);

    return {
      id: resumeId,
      resume_id: resumeId,
      name: file.name,
      size: file.size,
      version: Number(
        backendResume.version || version + 1 || 1
      ),
      score: finalScore,
      status:
        backendResume.status || 'PARSED',
      ats_data: atsResult,

      parsedContent: {
        text: parsed.text || '',
        skills: parsedSkills,
        experience: parsedExperience,
        education: parsedEducation,
        projects: parsedProjects,
        certifications: parsedCertifications,
        achievements: parsedAchievements,
      },
    };
  };

  /*
   * REAL BACKEND UPLOAD FLOW
   *
   * Browser
   *   ↓
   * FastAPI POST /api/v1/resumes (multipart/form-data)
   *   ↓
   * Resume record created with status UPLOADED
   *   ↓
   * Asynchronous background parsing (Celery/pypdf)
   *   ↓
   * Polling GET /api/v1/resumes/{id} until status === 'PARSED'
   *   ↓
   * Backend ATS Scoring: POST /api/v1/ats/score
   *   ↓
   * Redux Store & UI Update
   */
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF resume first.');
      return;
    }

    setIsUploading(true);
    setUploadStep(1);

    try {
      /*
       * STEP 1 — Upload PDF via multipart/form-data.
       */
      const uploadResult = await resumeService.uploadResume(selectedFile);
      const resumeId = uploadResult.resume_id;

      if (!resumeId) {
        throw new Error('Backend did not return a valid resume ID.');
      }

      /*
       * STEP 2 — Wait for backend parsing to complete.
       */
      setUploadStep(2);
      const backendResume = await resumeService.waitForResumeParsing(resumeId);

      /*
       * STEP 3 — Skills extracted.
       */
      setUploadStep(3);
      const extractedSkills = backendResume.parsed_json?.skills || [];

      /*
       * STEP 4 — Real Backend ATS Scoring Engine.
       * POST /api/v1/ats/score
       */
      setUploadStep(4);
      let atsResult: ATSScoreResponse | undefined;

      try {
        const targetJdSkills = ['Python', 'FastAPI', 'SQL', 'PostgreSQL', 'Docker', 'REST API', 'Git'];
        atsResult = await resumeService.calculateATSScore({
          resume_id: resumeId,
          job_description_id: 'default-student-target',
          resume_skills: extractedSkills,
          jd_skills: targetJdSkills,
        });
        setAtsDetails(atsResult);
      } catch (atsError) {
        console.warn('ATS score calculation warning:', atsError);
      }

      /*
       * STEP 5 — Finalizing analysis.
       */
      setUploadStep(5);
      await new Promise<void>((resolve) => setTimeout(resolve, 300));

      /*
       * Create frontend resume state object.
       */
      const frontendResume = createFrontendResume(
        backendResume,
        selectedFile,
        atsResult
      );

      setScore(frontendResume.score);
      setVersion(frontendResume.version);

      setHistory((previous) => [
        {
          v: frontendResume.version,
          s: frontendResume.score,
          d: 'Just now',
        },
        ...previous,
      ]);

      /*
       * Save into Redux store.
       */
      dispatch(
        uploadResumeSuccess(
          frontendResume as any
        )
      );

      dispatch(
        setResumeData({
          resumeMetadata:
            frontendResume as any,

          parsedText:
            frontendResume.parsedContent.text ||
            '',

          skills:
            frontendResume.parsedContent.skills ||
            [],

          experience:
            frontendResume.parsedContent
              .experience || [],

          education:
            frontendResume.parsedContent
              .education || [],

          ats: atsResult || null,
        })
      );

      /*
       * STEP 6 — Complete.
       */
      setUploadStep(6);

      toast.success(
        'Resume uploaded, parsed, and analyzed for ATS score successfully.'
      );
    } catch (error: any) {
      console.error(
        'Resume upload/analysis failed:',
        error
      );

      setIsUploading(false);
      setUploadStep(0);

      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error;

      const message =
        backendMessage ||
        error?.message ||
        'Failed to upload and process resume.';

      toast.error(message);
    }
  };

  /*
   * Close frontend processing state.
   *
   * This does not cancel an already queued Celery task.
   */
  const handleCancelUpload = () => {
    setIsUploading(false);
    setUploadStep(0);

    toast.error('Upload cancelled.');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /*
   * Remove selected file.
   */
  const resetSelection = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /*
   * Open upload dialog.
   */
  const openUploadDialog = () => {
    resetSelection();
    setIsDialogOpen(true);
  };

  const progressPercentage =
    uploadStep > 0
      ? Math.min(
          100,
          Math.round(
            (uploadStep / 6) * 100
          )
        )
      : 0;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">

      {/* =====================================================
          UPLOAD DIALOG
          ===================================================== */}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isUploading) {
            setIsDialogOpen(open);
          }
        }}
      >
        <div>

          <DialogHeader>
            <DialogTitle>
              {isUploading
                ? 'Processing Resume'
                : 'Upload Resume'}
            </DialogTitle>

            <DialogDescription>
              {isUploading
                ? 'Your resume is being uploaded and processed by SmartHireAI.'
                : 'Upload your latest PDF resume for analysis.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">

            {/* FILE SELECTION */}

            {!isUploading ? (
              <>
                {!selectedFile ? (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-all"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    onDragOver={(event) =>
                      event.preventDefault()
                    }
                    onDrop={handleDrop}
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <UploadCloud className="h-6 w-6" />
                    </div>

                    <h3 className="font-semibold text-lg mb-1">
                      Drag & Drop
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4">
                      or Browse Files
                    </p>

                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                    >
                      Select PDF
                    </Button>

                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                    />

                    <p className="text-xs text-muted-foreground mt-3">
                      PDF only • Maximum 5MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">

                    <div className="flex items-start gap-4 p-4 border border-border rounded-xl bg-secondary/10">

                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">

                        <h4 className="font-semibold text-sm truncate">
                          {selectedFile.name}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">

                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {(
                              selectedFile.size /
                              (1024 * 1024)
                            ).toFixed(2)}{' '}
                            MB
                          </span>

                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            PDF
                          </span>

                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Ready to Upload
                          </span>

                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />

                      <span>
                        This will become{' '}
                        <strong>
                          Version {version + 1}
                        </strong>{' '}
                        of your resume.
                      </span>
                    </div>

                  </div>
                )}
              </>
            ) : uploadStep < 6 ? (

              /* PROCESSING */

              <div className="space-y-6 px-2">

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">
                    Analysis Progress
                  </span>

                  <span className="text-muted-foreground">
                    {progressPercentage}%
                  </span>
                </div>

                <Progress
                  value={progressPercentage}
                  className="h-2"
                />

                <div className="space-y-4 mt-6">

                  <ProcessingStep
                    active={uploadStep === 1}
                    completed={uploadStep > 1}
                    text="Uploading resume..."
                  />

                  <ProcessingStep
                    active={uploadStep === 2}
                    completed={uploadStep > 2}
                    text="Parsing Resume..."
                  />

                  <ProcessingStep
                    active={uploadStep === 3}
                    completed={uploadStep > 3}
                    text="Extracting Skills..."
                  />

                  <ProcessingStep
                    active={uploadStep === 4}
                    completed={uploadStep > 4}
                    text="Preparing ATS analysis..."
                  />

                  <ProcessingStep
                    active={uploadStep === 5}
                    completed={uploadStep > 5}
                    text="Preparing AI feedback..."
                  />

                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">

                  <div className="flex items-start gap-2">

                    <BrainCircuit className="h-4 w-4 text-primary shrink-0 mt-0.5" />

                    <span>
                      Your resume is being processed by the
                      SmartHireAI backend. PDF text extraction
                      is handled asynchronously by the Celery
                      worker.
                    </span>

                  </div>

                </div>

              </div>

            ) : (

              /* SUCCESS */

              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">

                <div className="h-16 w-16 bg-success/20 text-emerald-500 rounded-full flex items-center justify-center mb-2 border border-success/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Resume Processing Complete
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Your resume has been successfully uploaded
                    and parsed.
                  </p>
                </div>

                <div className="w-full bg-secondary/30 border border-border rounded-lg p-4 mt-2">

                  <div className="flex justify-between items-center border-b border-border pb-2 mb-2">

                    <span className="text-sm text-muted-foreground">
                      Resume Status
                    </span>

                    <span className="font-bold text-emerald-400">
                      PARSED
                    </span>

                  </div>

                  <div className="flex justify-between items-center border-b border-border pb-2 mb-2">

                    <span className="text-sm text-muted-foreground">
                      New Version
                    </span>

                    <span className="font-bold text-foreground">
                      Version {version}
                    </span>

                  </div>

                  <div className="flex justify-between items-center">

                    <span className="text-sm text-muted-foreground">
                      Skills Extracted
                    </span>

                    <span className="font-bold text-foreground">
                      {activeResume?.parsedContent?.skills?.length || 0}
                    </span>

                  </div>

                </div>

                <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs text-muted-foreground text-left">

                  <strong className="text-amber-400">
                    ATS scoring:
                  </strong>{' '}
                  Resume parsing is connected successfully.
                  ATS scoring and AI feedback will use the
                  parsed resume data when those modules are
                  connected.

                </div>

              </div>
            )}

          </div>

          {/* FOOTER */}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">

            {!isUploading ? (

              selectedFile ? (

                <div className="flex flex-col sm:flex-row gap-2 w-full justify-between">

                  <div className="flex gap-2">

                    <Button
                      variant="outline"
                      onClick={resetSelection}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Replace
                    </Button>

                  </div>

                  <div className="flex gap-2">

                    <Button
                      variant="ghost"
                      onClick={() =>
                        setIsDialogOpen(false)
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleUploadAndAnalyze}
                    >
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Upload & Analyze
                    </Button>

                  </div>

                </div>

              ) : (

                <Button
                  variant="ghost"
                  onClick={() =>
                    setIsDialogOpen(false)
                  }
                >
                  Cancel
                </Button>

              )

            ) : uploadStep < 6 ? (

              <Button
                variant="outline"
                onClick={handleCancelUpload}
                className="w-full sm:w-auto"
              >
                Cancel Upload
              </Button>

            ) : (

              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsUploading(false);
                  setUploadStep(0);
                }}
                className="w-full sm:w-auto"
              >
                View Results
              </Button>

            )}

          </DialogFooter>

        </div>
      </Dialog>

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <div>

          <div className="flex items-center justify-between gap-6">

            <h1 className="text-3xl font-bold tracking-tight">
              Resume Intelligence
            </h1>

            <div className="flex items-center space-x-2">

              <Switch
                id="demo-mode"
                checked={isDemoMode}
                onCheckedChange={(checked) =>
                  dispatch(
                    toggleDemoMode(checked)
                  )
                }
              />

              <Label htmlFor="demo-mode">
                Demo Mode
              </Label>

            </div>

          </div>

          <p className="text-muted-foreground mt-1">
            Deep analysis of your profile against industry
            standards.
          </p>

        </div>

        <Button
          className="gap-2"
          onClick={openUploadDialog}
        >
          <UploadCloud className="h-4 w-4" />
          Upload New Version
        </Button>

      </div>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {!hasResume ? (

          <Card className="col-span-1 xl:col-span-3 py-12 flex flex-col items-center justify-center text-center">

            <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>

            <h3 className="text-xl font-bold mb-2">
              No resume uploaded yet
            </h3>

            <p className="text-muted-foreground max-w-md mb-6">
              Upload your resume to get resume parsing,
              ATS scoring, AI feedback, and personalized
              job matching.
            </p>

            <Button onClick={openUploadDialog}>
              Upload Resume
            </Button>

          </Card>

        ) : (

          <>
            {/* =================================================
                LEFT COLUMN
                ================================================= */}

            <div className="space-y-6">

              {/* RESUME SCORE */}

              <Card className="bg-gradient-to-br from-card to-primary/10 border-primary/20">

                <CardHeader>

                  <CardTitle className="flex justify-between items-center">

                    <span>
                      Resume Score
                    </span>

                    <Badge
                      variant="success"
                      className="text-lg py-1 px-3"
                    >
                      {score > 0 ? `${score}%` : '—'}
                    </Badge>

                  </CardTitle>

                  <CardDescription>
                    {score > 0
                      ? 'Real-time ATS score evaluated by SmartHireAI Engine'
                      : 'Upload a resume to evaluate ATS score'}
                  </CardDescription>

                </CardHeader>

                <CardContent>

                  <div className="space-y-4">

                    <div className="grid grid-cols-2 gap-4 text-sm">

                      <ScoreRow
                        label="Keyword Match"
                        value={
                          atsDetails?.breakdown?.keywords !== undefined
                            ? `${atsDetails.breakdown.keywords}%`
                            : score > 0
                            ? `${score}%`
                            : 'Pending'
                        }
                      />

                      <ScoreRow
                        label="Semantic Fit"
                        value={
                          atsDetails?.breakdown?.semantic !== undefined
                            ? `${atsDetails.breakdown.semantic}%`
                            : score > 0
                            ? `${score}%`
                            : 'Pending'
                        }
                      />

                      <ScoreRow
                        label="Experience Match"
                        value={
                          atsDetails?.breakdown?.experience !== undefined
                            ? `${atsDetails.breakdown.experience}%`
                            : score > 0
                            ? `${score}%`
                            : 'Pending'
                        }
                      />

                      <ScoreRow
                        label="Formatting Fit"
                        value={
                          atsDetails?.breakdown?.formatting !== undefined
                            ? `${atsDetails.breakdown.formatting}%`
                            : score > 0
                            ? `${score}%`
                            : 'Pending'
                        }
                      />

                    </div>

                    {atsDetails?.missing_skills && atsDetails.missing_skills.length > 0 && (
                      <div className="pt-2 border-t border-border/50 text-xs">
                        <span className="text-amber-400 font-semibold block mb-1">
                          Recommended Skills to Add:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {atsDetails.missing_skills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] text-amber-300 border-amber-500/30">
                              +{skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 p-2 rounded border border-border">

                      <BrainCircuit className="h-4 w-4 text-primary" />

                      <span>
                        ATS Engine Status:{' '}
                        <strong className="text-foreground">
                          {score > 0 ? 'Active (v1.0)' : 'Pending'}
                        </strong>
                      </span>

                    </div>

                  </div>

                </CardContent>

              </Card>

              {/* CURRENT VERSION */}

              <Card>

                <CardHeader>
                  <CardTitle>
                    Current Version
                  </CardTitle>
                </CardHeader>

                <CardContent>

                  <div className="flex items-center gap-4 p-4 border border-white/5 rounded-lg bg-black/20">

                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <FileType className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="font-medium text-sm truncate">

                        {activeResume?.name
                          ? `${activeResume.name.replace(
                              /\.[^/.]+$/,
                              ''
                            )}_v${
                              activeResume.version || 1
                            }.pdf`
                          : 'student_resume.pdf'}

                      </p>

                      <p className="text-xs text-muted-foreground">
                        Parsed just now
                      </p>

                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                    >
                      <Search className="h-4 w-4" />
                    </Button>

                  </div>

                </CardContent>

              </Card>

              {/* VERSION HISTORY */}

              <Card>

                <CardHeader>

                  <CardTitle className="flex items-center gap-2">

                    <History className="h-4 w-4 text-primary" />

                    Version History

                  </CardTitle>

                </CardHeader>

                <CardContent className="space-y-4">

                  {history.length > 0 ? (

                    history.map((item, index) => (

                      <VersionItem
                        key={`${item.v}-${index}`}
                        version={`v${item.v}`}
                        score={item.s}
                        date={item.d}
                        active={index === 0}
                      />

                    ))

                  ) : (

                    <p className="text-sm text-muted-foreground">
                      No version history available.
                    </p>

                  )}

                </CardContent>

              </Card>

            </div>

            {/* =================================================
                RIGHT COLUMN
                ================================================= */}

            <Card className="xl:col-span-2">

              <CardHeader>

                <CardTitle>
                  Explainable Analysis
                </CardTitle>

                <CardDescription>
                  Resume parsing results from the SmartHireAI
                  backend.
                </CardDescription>

              </CardHeader>

              <CardContent className="space-y-6">

                {/* SKILLS */}

                <div>

                  <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">

                    <CheckCircle2 className="h-4 w-4" />

                    Skills Detected

                  </h4>

                  <div className="flex flex-wrap gap-2">

                    {activeResume?.parsedContent?.skills?.length ? (

                      activeResume.parsedContent.skills.map(
                        (skill: string, index: number) => (

                          <Badge
                            key={`${skill}-${index}`}
                            variant="secondary"
                          >
                            {skill}
                          </Badge>

                        )
                      )

                    ) : (

                      <p className="text-sm text-muted-foreground">
                        No skills were extracted from the
                        resume.
                      </p>

                    )}

                  </div>

                </div>

                {/* EXPERIENCE */}

                <div className="pt-4 border-t border-white/5">

                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">

                    <BrainCircuit className="h-4 w-4" />

                    Parsed Information

                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <InfoCard
                      title="Experience"
                      value={
                        activeResume?.parsedContent
                          ?.experience?.length || 0
                      }
                    />

                    <InfoCard
                      title="Education"
                      value={
                        activeResume?.parsedContent
                          ?.education?.length || 0
                      }
                    />

                    <InfoCard
                      title="Projects"
                      value={
                        activeResume?.parsedContent
                          ?.projects?.length || 0
                      }
                    />

                    <InfoCard
                      title="Certifications"
                      value={
                        activeResume?.parsedContent
                          ?.certifications?.length || 0
                      }
                    />

                  </div>

                </div>

                {/* RESUME TEXT */}

                <div className="pt-4 border-t border-white/5">

                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">

                    <FileText className="h-4 w-4" />

                    Resume Text

                  </h4>

                  <div className="max-h-72 overflow-y-auto rounded-lg border border-border bg-secondary/20 p-4">

                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">

                      {activeResume?.parsedContent?.text ||
                        'No parsed resume text available.'}

                    </p>

                  </div>

                </div>

                {/* EXPERIENCE DETAILS */}

                {activeResume?.parsedContent?.experience?.length ? (

                  <div className="pt-4 border-t border-white/5">

                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">

                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                      Experience Details

                    </h4>

                    <div className="space-y-3">

                      {activeResume.parsedContent.experience.map(
                        (experience: any, index: number) => (

                          <div
                            key={index}
                            className="p-4 rounded-lg border border-border bg-secondary/20"
                          >

                            <p className="font-semibold text-sm">
                              {experience.title ||
                                experience.position ||
                                experience.role ||
                                'Experience'}
                            </p>

                            {experience.company && (
                              <p className="text-xs text-primary mt-1">
                                {experience.company}
                              </p>
                            )}

                            {experience.period && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {experience.period}
                              </p>
                            )}

                            {experience.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {experience.description}
                              </p>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                ) : null}

                {/* EDUCATION */}

                {activeResume?.parsedContent?.education?.length ? (

                  <div className="pt-4 border-t border-white/5">

                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">

                      <CheckCircle2 className="h-4 w-4 text-primary" />

                      Education

                    </h4>

                    <div className="space-y-3">

                      {activeResume.parsedContent.education.map(
                        (education: any, index: number) => (

                          <div
                            key={index}
                            className="p-4 rounded-lg border border-border bg-secondary/20"
                          >

                            <p className="font-semibold text-sm">
                              {education.degree ||
                                education.course ||
                                'Education'}
                            </p>

                            {education.institution && (
                              <p className="text-xs text-primary mt-1">
                                {education.institution}
                              </p>
                            )}

                            {education.year && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {education.year}
                              </p>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                ) : null}

              </CardContent>

            </Card>

            {/* =================================================
                AI RECRUITER SIMULATOR
                ================================================= */}

            <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/20 xl:col-span-2">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <BrainCircuit className="h-5 w-5 text-primary" />

                  AI Recruiter Simulator

                </CardTitle>

                <CardDescription>
                  Evaluate the parsed resume against recruiter
                  and job requirements.
                </CardDescription>

              </CardHeader>

              <CardContent className="space-y-6">

                <div className="flex items-center gap-3">

                  <span className="text-sm font-semibold">
                    Status:
                  </span>

                  <Badge
                    variant="success"
                    className="text-sm py-1"
                  >
                    {score > 0 ? 'Analyzed by ATS Engine' : 'Resume Parsed'}
                  </Badge>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-black/20 rounded-xl border border-white/5">

                  <div>

                    <h4 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">
                      Live Analysis Data
                    </h4>

                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">

                      <li>
                        Resume text extracted from PDF.
                      </li>

                      <li>
                        Technical skills: {activeResume?.parsedContent?.skills?.length || 0} detected.
                      </li>

                      <li>
                        Matched skills in ATS: {atsDetails?.matched_skills?.length || 0}.
                      </li>

                      <li>
                        Missing skills identified: {atsDetails?.missing_skills?.length || 0}.
                      </li>

                    </ul>

                  </div>

                  <div>

                    <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">
                      Scoring Metrics
                    </h4>

                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">

                      <li>
                        ATS Score: {score > 0 ? `${score}%` : 'Pending'}.
                      </li>

                      <li>
                        Keyword Match: {atsDetails?.breakdown?.keywords !== undefined ? `${atsDetails.breakdown.keywords}%` : 'Pending'}.
                      </li>

                      <li>
                        Semantic Alignment: {atsDetails?.breakdown?.semantic !== undefined ? `${atsDetails.breakdown.semantic}%` : 'Pending'}.
                      </li>

                      <li>
                        Deterministic Scoring v1.0.
                      </li>

                    </ul>

                  </div>

                </div>

                <div className="pt-4 border-t border-white/5">

                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">
                    Current Recommendation
                  </p>

                  <p className="text-sm text-foreground font-medium bg-secondary/30 p-4 rounded-lg border border-border">

                    {score >= 75
                      ? `Strong technical alignment detected with ${score}% ATS score. Profile contains core capabilities in ${activeResume?.parsedContent?.skills?.slice(0, 4).join(', ') || 'required areas'}.`
                      : score > 0
                      ? `Resume evaluated with ${score}% ATS match. Recommended to incorporate missing keywords (${atsDetails?.missing_skills?.slice(0, 3).join(', ') || 'domain skills'}) to improve search discovery.`
                      : 'Resume parsing completed successfully. The extracted resume data is ready for ATS scoring.'}

                  </p>

                </div>

              </CardContent>

            </Card>

          </>

        )}

      </div>

    </div>
  );
}

/* ============================================================
   PROCESSING STEP
   ============================================================ */

function ProcessingStep({
  active,
  completed,
  text,
}: {
  active: boolean;
  completed: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">

      <div
        className={`p-2 rounded-full ${
          completed || active
            ? 'bg-primary/20 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >

        {completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : active ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <div className="h-4 w-4 rounded-full border border-current" />
        )}

      </div>

      <div
        className={
          completed || active
            ? 'text-foreground text-sm font-medium'
            : 'text-muted-foreground text-sm'
        }
      >
        {text}
      </div>

    </div>
  );
}

/* ============================================================
   SCORE ROW
   ============================================================ */

function ScoreRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between border-b border-border pb-1">

      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="font-bold text-emerald-400">
        {value}
      </span>

    </div>
  );
}

/* ============================================================
   INFO CARD
   ============================================================ */

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="p-4 rounded-lg border border-border bg-secondary/20">

      <p className="text-xs text-muted-foreground">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   VERSION ITEM
   ============================================================ */

function VersionItem({
  version,
  score,
  date,
  active = false,
}: {
  key?: React.Key;
  version: string;
  score: number;
  date: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        active
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card hover:bg-secondary/50'
      } transition-colors`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`h-8 w-8 rounded-md flex items-center justify-center font-bold text-xs ${
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          {version}
        </div>

        <div>

          <p className="font-medium text-sm">
            {date}
          </p>

          <p className="text-xs text-muted-foreground">
            {active
              ? 'Current active resume'
              : 'Archived version'}
          </p>

        </div>

      </div>

      <div className="text-right">

        <p
          className={`font-bold ${
            active
              ? 'text-emerald-400'
              : 'text-muted-foreground'
          }`}
        >
          {score > 0
            ? `${score}%`
            : '—'}
        </p>

        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          ATS Score
        </p>

      </div>

    </div>
  );
}

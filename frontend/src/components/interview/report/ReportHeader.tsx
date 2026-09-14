import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { InterviewReportEvaluation, InterviewType } from '../../../types/interview';
import { INTERVIEW_TYPE_METADATA } from '../../../services/interviewService';
import { 
  ChevronLeft, 
  RotateCcw, 
  Printer, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface ReportHeaderProps {
  evaluation: InterviewReportEvaluation;
  onRetake: () => void;
}

export function ReportHeader({ evaluation, onRetake }: ReportHeaderProps) {
  const navigate = useNavigate();
  const meta = INTERVIEW_TYPE_METADATA[evaluation.interviewType as InterviewType] || INTERVIEW_TYPE_METADATA.Technical;

  const formattedDate = new Date(evaluation.completedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const durationMin = Math.round(evaluation.totalTimeSpentSeconds / 60);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Back button & top actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/interviews')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Interviews
        </Button>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="gap-2 print:hidden"
          >
            <Printer className="h-4 w-4" />
            Export / Print
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            onClick={onRetake}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground print:hidden"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Round
          </Button>
        </div>
      </div>

      {/* Title & Metadata Banner */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={meta.badgeColor}>
                {evaluation.interviewType} Round
              </Badge>
              {evaluation.company && (
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {evaluation.company} Track
                </Badge>
              )}
              <Badge variant="outline" className="text-muted-foreground">
                Role: {evaluation.role}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {evaluation.sessionTitle} Report
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground/70" />
                <span>Completed {formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground/70" />
                <span>Time Spent: {durationMin} mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{evaluation.questionsAttempted} of {evaluation.questionsTotal} Questions Attempted</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 md:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/learning')}
              className="gap-2 text-xs sm:text-sm"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              Learning Roadmap
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

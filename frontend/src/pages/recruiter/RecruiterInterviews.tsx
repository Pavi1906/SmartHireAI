import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { recruiterInterviewService } from '../../services/recruiterInterviewService';
import { candidateService } from '../../services/candidateService';
import { 
  RecruiterInterviewResponse, 
  InterviewCreate, 
  InterviewUpdate, 
  InterviewFeedbackCreate 
} from '../../types/recruiterInterview';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  MessageSquare, Calendar, Clock, MapPin, 
  CheckCircle2, Plus, Edit2, X, AlertCircle, RefreshCw
} from 'lucide-react';

export function RecruiterInterviews() {
  const { jobs } = useSelector((state: RootState) => state.recruiter);
  
  const [interviews, setInterviews] = useState<RecruiterInterviewResponse[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<RecruiterInterviewResponse | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<RecruiterInterviewResponse | null>(null);

  // Forms state
  const [scheduleForm, setScheduleForm] = useState<InterviewCreate>({
    applicationId: '',
    candidateId: '',
    jobId: '',
    interviewType: 'Technical',
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    durationMinutes: 45,
    locationUrl: '',
    notes: ''
  });

  const [editForm, setEditForm] = useState<InterviewUpdate>({
    scheduledAt: '',
    durationMinutes: 45,
    locationUrl: '',
    status: '',
    notes: ''
  });

  const [feedbackForm, setFeedbackForm] = useState<InterviewFeedbackCreate>({
    rating: 3,
    recommendation: 'Neutral',
    strengths: [],
    weaknesses: [],
    notes: ''
  });

  const fetchInterviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recruiterInterviewService.getInterviews();
      setInterviews(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await candidateService.listCandidates();
      setCandidates(data);
    } catch (err) {
      console.error("Failed to load candidates", err);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchCandidates();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.candidateId || !scheduleForm.jobId || !scheduleForm.scheduledAt) {
      alert("Please fill required fields (Candidate, Job, Date/Time)");
      return;
    }
    
    // Find application ID for candidate
    const candidate = candidates.find(c => c.id === scheduleForm.candidateId);
    if (!candidate || !candidate.applicationId) {
      alert("Selected candidate does not have an active application ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...scheduleForm,
        applicationId: candidate.applicationId,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString()
      };
      await recruiterInterviewService.scheduleInterview(payload);
      setShowScheduleModal(false);
      setScheduleForm({
        applicationId: '',
        candidateId: '',
        jobId: '',
        interviewType: 'Technical',
        scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        durationMinutes: 45,
        locationUrl: '',
        notes: ''
      });
      await fetchInterviews();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...editForm,
        scheduledAt: editForm.scheduledAt ? new Date(editForm.scheduledAt).toISOString() : undefined
      };
      await recruiterInterviewService.updateInterview(showEditModal.id, payload);
      setShowEditModal(null);
      await fetchInterviews();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to update interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeedbackModal) return;

    setIsSubmitting(true);
    try {
      await recruiterInterviewService.submitFeedback(showFeedbackModal.id, feedbackForm);
      setShowFeedbackModal(null);
      await fetchInterviews();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCandidateName = (id: string) => {
    return candidates.find(c => c.id === id)?.name || id;
  };

  const getJobTitle = (id: string) => {
    return jobs.find(j => j.id === id)?.title || id;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-full pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Interviews
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your scheduled interviews and submit candidate feedback.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchInterviews}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowScheduleModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Interviews List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading && interviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Loading interviews...</div>
        ) : interviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No interviews found. Schedule one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Candidate & Job</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {interviews.map(interview => (
                  <tr key={interview.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{getCandidateName(interview.candidateId)}</div>
                      <div className="text-xs text-muted-foreground">{getJobTitle(interview.jobId)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs bg-secondary/30">
                        {interview.interviewType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(interview.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(interview.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                        ({interview.durationMinutes}m)
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant="secondary"
                        className={
                          interview.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400' :
                          interview.status === 'CANCELLED' ? 'bg-destructive/15 text-destructive' :
                          'bg-primary/15 text-primary'
                        }
                      >
                        {interview.status}
                      </Badge>
                      {interview.feedback && (
                        <div className="text-[10px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Feedback Submitted
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {interview.status !== 'COMPLETED' && interview.status !== 'CANCELLED' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditForm({
                                scheduledAt: new Date(interview.scheduledAt).toISOString().slice(0, 16),
                                durationMinutes: interview.durationMinutes,
                                locationUrl: interview.locationUrl || '',
                                status: interview.status,
                                notes: interview.notes || ''
                              });
                              setShowEditModal(interview);
                            }}
                            className="h-8 text-xs px-2"
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                        )}
                        {interview.status !== 'COMPLETED' && !interview.feedback && interview.status !== 'CANCELLED' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => {
                              setFeedbackForm({
                                rating: 3,
                                recommendation: 'Neutral',
                                strengths: [],
                                weaknesses: [],
                                notes: ''
                              });
                              setShowFeedbackModal(interview);
                            }}
                            className="h-8 text-xs px-2"
                          >
                            Submit Feedback
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
              <h2 className="font-bold">Schedule Interview</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Candidate</label>
                <Select value={scheduleForm.candidateId} onValueChange={(val) => setScheduleForm({...scheduleForm, candidateId: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Candidate" /></SelectTrigger>
                  <SelectContent>
                    {candidates.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Job Requisition</label>
                <Select value={scheduleForm.jobId} onValueChange={(val) => setScheduleForm({...scheduleForm, jobId: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Job" /></SelectTrigger>
                  <SelectContent>
                    {jobs.map(j => (
                      <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Interview Type</label>
                <Select value={scheduleForm.interviewType} onValueChange={(val) => setScheduleForm({...scheduleForm, interviewType: val})}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Behavioral">Behavioral</SelectItem>
                    <SelectItem value="System Design">System Design</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Date & Time</label>
                  <Input 
                    type="datetime-local" 
                    value={scheduleForm.scheduledAt}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledAt: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Duration (mins)</label>
                  <Input 
                    type="number" 
                    min="15" step="15"
                    value={scheduleForm.durationMinutes}
                    onChange={(e) => setScheduleForm({...scheduleForm, durationMinutes: parseInt(e.target.value) || 45})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Meeting URL</label>
                <Input 
                  placeholder="https://zoom.us/..." 
                  value={scheduleForm.locationUrl}
                  onChange={(e) => setScheduleForm({...scheduleForm, locationUrl: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Scheduling...' : 'Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
              <h2 className="font-bold">Edit Interview</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(null)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Status</label>
                <Select value={editForm.status} onValueChange={(val) => setEditForm({...editForm, status: val})}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Date & Time</label>
                  <Input 
                    type="datetime-local" 
                    value={editForm.scheduledAt}
                    onChange={(e) => setEditForm({...editForm, scheduledAt: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Duration (mins)</label>
                  <Input 
                    type="number" 
                    value={editForm.durationMinutes}
                    onChange={(e) => setEditForm({...editForm, durationMinutes: parseInt(e.target.value) || 45})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Meeting URL</label>
                <Input 
                  value={editForm.locationUrl}
                  onChange={(e) => setEditForm({...editForm, locationUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Notes</label>
                <Input 
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setShowEditModal(null)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/20">
              <h2 className="font-bold">Submit Feedback</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFeedbackModal(null)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Recommendation</label>
                <Select value={feedbackForm.recommendation} onValueChange={(val) => setFeedbackForm({...feedbackForm, recommendation: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Recommendation" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strong Hire">Strong Hire</SelectItem>
                    <SelectItem value="Hire">Hire</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="No Hire">No Hire</SelectItem>
                    <SelectItem value="Strong No Hire">Strong No Hire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Rating (1-5)</label>
                <Input 
                  type="number" 
                  min="1" max="5" step="0.5"
                  value={feedbackForm.rating}
                  onChange={(e) => setFeedbackForm({...feedbackForm, rating: parseFloat(e.target.value) || 3})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Notes</label>
                <textarea 
                  className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Detailed feedback..."
                  value={feedbackForm.notes}
                  onChange={(e) => setFeedbackForm({...feedbackForm, notes: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setShowFeedbackModal(null)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

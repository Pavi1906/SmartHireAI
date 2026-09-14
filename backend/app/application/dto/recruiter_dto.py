from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- Enums / Literal Types ---
class JobStatusEnum:
    DRAFT = "draft"
    PUBLISHED = "published"
    PAUSED = "paused"
    CLOSED = "closed"
    ARCHIVED = "archived"

class CandidatePipelineStageEnum:
    SOURCED = "Sourced"
    SCREENING = "Screening"
    SHORTLISTED = "Shortlisted"
    INTERVIEW = "Interview"
    SELECTED = "Selected"
    OFFER = "Offer"
    HIRED = "Hired"
    REJECTED = "Rejected"

# --- Company DTOs ---
class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None

# --- Recruiter Profile DTOs ---
class RecruiterProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    full_name: str
    work_email: str
    designation: str
    company_name: Optional[str] = None

class RecruiterProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None

# --- Job Requisition DTOs ---
class JobCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    department: str
    description: str
    responsibilities: Optional[List[str]] = Field(default_factory=list)
    requiredSkills: List[str] = Field(default_factory=list)
    preferredSkills: Optional[List[str]] = Field(default_factory=list)
    experience: str
    education: str
    location: str
    workplaceType: str = "Remote"
    type: str = "Full-time"
    salary: str
    status: str = "published"

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    requiredSkills: Optional[List[str]] = None
    preferredSkills: Optional[List[str]] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    location: Optional[str] = None
    workplaceType: Optional[str] = None
    type: Optional[str] = None
    salary: Optional[str] = None
    status: Optional[str] = None

class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    department: str
    description: str
    responsibilities: List[str] = Field(default_factory=list)
    requiredSkills: List[str]
    preferredSkills: List[str] = Field(default_factory=list)
    experience: str
    education: str
    location: str
    workplaceType: str
    type: str
    salary: str
    status: str
    createdAt: str
    updatedAt: str
    applicantCount: int = 0
    viewsCount: int = 0

# --- Candidate DTOs ---
class CandidateExperienceDTO(BaseModel):
    company: str
    role: str
    duration: str
    achievements: Optional[List[str]] = Field(default_factory=list)

class CandidateEducationDTO(BaseModel):
    degree: str
    school: str
    year: str
    gpa: Optional[str] = None

class CandidateProjectDTO(BaseModel):
    name: str
    description: str
    technologies: List[str] = Field(default_factory=list)

class CandidateResumeDataDTO(BaseModel):
    personalInfo: Optional[Dict[str, Any]] = None
    skills: Optional[List[str]] = Field(default_factory=list)
    experience: Optional[List[CandidateExperienceDTO]] = Field(default_factory=list)
    education: Optional[List[CandidateEducationDTO]] = Field(default_factory=list)
    projects: Optional[List[CandidateProjectDTO]] = Field(default_factory=list)

class CandidateCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    role: str
    location: Optional[str] = None
    avatar: Optional[str] = None
    resumeData: CandidateResumeDataDTO
    pipelineStage: str = "Sourced"
    jobId: Optional[str] = None
    source: str = "Direct"

class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    resumeData: Optional[CandidateResumeDataDTO] = None
    pipelineStage: Optional[str] = None
    jobId: Optional[str] = None

class CandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: Optional[str] = None
    role: str
    location: Optional[str] = None
    avatar: Optional[str] = None
    resumeData: Dict[str, Any] = Field(default_factory=dict)
    matchScore: Optional[float] = None
    confidence: Optional[float] = None
    matchedSkills: Optional[List[str]] = Field(default_factory=list)
    missingSkills: Optional[List[str]] = Field(default_factory=list)
    recommendation: Optional[str] = None
    pipelineStage: str
    jobId: Optional[str] = None
    applicationId: Optional[str] = None
    appliedAt: Optional[str] = None
    time: str

# --- Application DTOs ---
class ApplicationCreate(BaseModel):
    candidateId: str
    jobId: str

class ApplicationStageUpdate(BaseModel):
    stage: str
    reason: Optional[str] = None

class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    jobId: str
    candidateId: str
    pipelineStage: str
    status: str
    appliedAt: str
    updatedAt: str

class StageHistoryResponse(BaseModel):
    id: str
    applicationId: str
    previousStage: Optional[str] = None
    newStage: str
    changedByUserId: Optional[str] = None
    reason: Optional[str] = None
    changedAt: str

# --- Matching DTOs ---
class MatchEvaluationRequest(BaseModel):
    candidateId: str
    jobId: str

class MatchResultResponse(BaseModel):
    id: str
    applicationId: Optional[str] = None
    candidateId: str
    jobId: str
    matchScore: float
    confidence: float
    matchedSkills: List[str]
    missingSkills: List[str]
    recommendation: str
    scoringBreakdown: Dict[str, Any]
    algorithmVersion: str
    calculatedAt: str

# --- Sourcing Campaign DTOs ---
class CampaignCreate(BaseModel):
    name: str
    jobId: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None
    status: str = "active"
    results: Optional[List[str]] = Field(default_factory=list)

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    jobId: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    results: Optional[List[str]] = None

class CampaignResponse(BaseModel):
    id: str
    name: str
    jobId: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None
    status: str
    results: List[str] = Field(default_factory=list)
    createdAt: str
    updatedAt: str

# --- Interview DTOs ---
class InterviewCreate(BaseModel):
    applicationId: str
    candidateId: str
    jobId: str
    interviewType: str = "Technical"
    scheduledAt: str
    durationMinutes: int = 45
    locationUrl: Optional[str] = None
    notes: Optional[str] = None

class InterviewUpdate(BaseModel):
    scheduledAt: Optional[str] = None
    durationMinutes: Optional[int] = None
    locationUrl: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class InterviewFeedbackCreate(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0)
    recommendation: str  # Strong Hire, Hire, Neutral, No Hire, Strong No Hire
    strengths: Optional[List[str]] = Field(default_factory=list)
    weaknesses: Optional[List[str]] = Field(default_factory=list)
    notes: Optional[str] = None

class InterviewFeedbackResponse(BaseModel):
    id: str
    interviewId: str
    reviewerId: Optional[str] = None
    rating: float
    recommendation: str
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    submittedAt: str

class RecruiterInterviewResponse(BaseModel):
    id: str
    applicationId: str
    candidateId: str
    jobId: str
    interviewType: str
    scheduledAt: str
    durationMinutes: int
    locationUrl: Optional[str] = None
    status: str
    notes: Optional[str] = None
    createdAt: str
    feedback: Optional[InterviewFeedbackResponse] = None

# --- Offer DTOs ---
class OfferCreate(BaseModel):
    applicationId: str
    candidateId: str
    compensation: str
    currency: str = "USD"
    startDate: Optional[str] = None
    expirationDate: Optional[str] = None
    notes: Optional[str] = None

class OfferStatusUpdate(BaseModel):
    status: str  # SENT, ACCEPTED, DECLINED, EXPIRED, WITHDRAWN
    notes: Optional[str] = None

class OfferResponse(BaseModel):
    id: str
    applicationId: str
    candidateId: str
    compensation: str
    currency: str
    startDate: Optional[str] = None
    expirationDate: Optional[str] = None
    status: str
    notes: Optional[str] = None
    issuedAt: str
    updatedAt: str

# --- Settings & Notification DTOs ---
class RecruiterSettingsResponse(BaseModel):
    notificationPrefs: Dict[str, Any] = Field(default_factory=dict)
    sourcingPrefs: Dict[str, Any] = Field(default_factory=dict)
    dashboardPrefs: Dict[str, Any] = Field(default_factory=dict)
    aiPrefs: Dict[str, Any] = Field(default_factory=dict)
    securityPrefs: Dict[str, Any] = Field(default_factory=dict)

class RecruiterSettingsUpdate(BaseModel):
    notificationPrefs: Optional[Dict[str, Any]] = None
    sourcingPrefs: Optional[Dict[str, Any]] = None
    dashboardPrefs: Optional[Dict[str, Any]] = None
    aiPrefs: Optional[Dict[str, Any]] = None
    securityPrefs: Optional[Dict[str, Any]] = None

class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    resourceType: Optional[str] = None
    resourceId: Optional[str] = None
    isRead: bool
    createdAt: str

# --- Analytics KPI DTOs ---
class RecruiterKPIsResponse(BaseModel):
    totalJobs: int
    activeJobs: int
    draftJobs: int
    closedJobs: int
    archivedJobs: int
    totalCandidates: int
    shortlistedCandidates: int
    interviewingCandidates: int
    averageMatchScore: float

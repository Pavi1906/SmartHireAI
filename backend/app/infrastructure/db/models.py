import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Integer, Float, Text, Enum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, PyEnum):
    STUDENT = "STUDENT"
    RECRUITER = "RECRUITER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role_enum"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter_profile = relationship("Recruiter", back_populates="user", uselist=False, cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False, unique=True)
    industry = Column(String(100))
    website = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(String(150), nullable=False)
    college = Column(String(150), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    branch = Column(String(100), nullable=False)
    phone_number = Column(String(20))

    user = relationship("User", back_populates="student_profile")
    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan")

class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    full_name = Column(String(150), nullable=False)
    designation = Column(String(100), nullable=False)
    work_email = Column(String(255), nullable=False)

    user = relationship("User", back_populates="recruiter_profile")
    company = relationship("Company")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="refresh_tokens")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), index=True)
    s3_key = Column(String(500), nullable=False)
    raw_text = Column(Text)
    parsed_json = Column(JSONB)
    status = Column(String(20), default="uploaded")
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="resumes")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    name = Column(String(150), unique=True, nullable=False)
    category = Column(String(80))

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    title = Column(String(200))
    raw_text = Column(Text, nullable=False)
    parsed_json = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ATSReport(Base):
    __tablename__ = "ats_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id"), index=True)
    job_description_id = Column(UUID(as_uuid=True), ForeignKey("job_descriptions.id"))
    ats_score = Column(Float, nullable=False)
    matched_skills = Column(JSONB)
    missing_skills = Column(JSONB)
    explanation = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class PlacementScore(Base):
    __tablename__ = "placement_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), index=True)
    probability = Column(Float, nullable=False)
    contributing_factors = Column(JSONB)
    model_version = Column(String(30), default="v1.0")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"))
    job_description_id = Column(UUID(as_uuid=True), ForeignKey("job_descriptions.id"))
    status = Column(String(20), default="in_progress")
    overall_feedback = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True))

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    session_id = Column(UUID(as_uuid=True), ForeignKey("interview_sessions.id", ondelete="CASCADE"))
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text)
    score = Column(Float)
    feedback = Column(Text)
    sequence = Column(Integer)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    company_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    metadata_json = Column(JSONB)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


class JobRequisition(Base):
    __tablename__ = "job_requisitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    department = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    responsibilities = Column(JSONB)  # List[str]
    required_skills = Column(JSONB, nullable=False)  # List[str]
    preferred_skills = Column(JSONB)  # List[str]
    experience = Column(String(100), nullable=False)
    education = Column(String(200), nullable=False)
    location = Column(String(150), nullable=False)
    workplace_type = Column(String(50), nullable=False, default="Remote")  # Remote, Hybrid, On-site
    employment_type = Column(String(50), nullable=False, default="Full-time")  # Full-time, Contract, Part-time, Internship
    salary = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="published", index=True)  # draft, published, paused, closed, archived
    applicant_count = Column(Integer, nullable=False, default=0)
    views_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    company = relationship("Company")
    recruiter = relationship("User")
    applications = relationship("Application", back_populates="job_requisition", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True, index=True)
    role = Column(String(150), nullable=False)
    location = Column(String(150), nullable=True)
    avatar = Column(String(500), nullable=True)
    resume_data = Column(JSONB, nullable=True)  # Structured candidate resume
    source = Column(String(50), default="Direct", nullable=False)
    availability = Column(String(50), nullable=True)
    status = Column(String(50), default="Active", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    company = relationship("Company")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_requisitions.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=True, index=True)  # New FK for student ownership
    pipeline_stage = Column(String(50), nullable=False, default="Sourced", index=True)  # Sourced, Screening, Shortlisted, Interview, Selected, Offer, Hired, Rejected
    status = Column(String(50), nullable=False, default="Active")  # Active, Withdrawn, Rejected, Hired
    applied_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    company = relationship("Company")
    job_requisition = relationship("JobRequisition", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
    stage_history = relationship("ApplicationStageHistory", back_populates="application", cascade="all, delete-orphan")
    match_result = relationship("MatchResult", back_populates="application", uselist=False, cascade="all, delete-orphan")
    interviews = relationship("RecruiterInterview", back_populates="application", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="application", cascade="all, delete-orphan")


class ApplicationStageHistory(Base):
    __tablename__ = "application_stage_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_stage = Column(String(50), nullable=True)
    new_stage = Column(String(50), nullable=False)
    changed_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=True)
    changed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    application = relationship("Application", back_populates="stage_history")


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=True, unique=True, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_requisitions.id", ondelete="CASCADE"), nullable=False, index=True)
    match_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    matched_skills = Column(JSONB, nullable=False)  # List[str]
    missing_skills = Column(JSONB, nullable=False)  # List[str]
    recommendation = Column(Text, nullable=False)
    scoring_breakdown = Column(JSONB, nullable=False)  # dict details
    algorithm_version = Column(String(30), default="v1.0-deterministic", nullable=False)
    calculated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="match_result")
    candidate = relationship("Candidate")
    job_requisition = relationship("JobRequisition")


class SourcingCampaign(Base):
    __tablename__ = "sourcing_campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_requisitions.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    criteria = Column(JSONB, nullable=True)
    status = Column(String(20), nullable=False, default="active")  # active, completed, paused, draft
    results = Column(JSONB, nullable=True)  # List of Candidate IDs
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    company = relationship("Company")
    job_requisition = relationship("JobRequisition")


class RecruiterInterview(Base):
    __tablename__ = "recruiter_interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("job_requisitions.id", ondelete="CASCADE"), nullable=False, index=True)
    interviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    interview_type = Column(String(50), nullable=False, default="Technical")  # Screening, Technical, System Design, Behavioral, Final
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=45, nullable=False)
    location_url = Column(String(500), nullable=True)
    status = Column(String(30), nullable=False, default="SCHEDULED")  # SCHEDULED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    company = relationship("Company")
    application = relationship("Application", back_populates="interviews")
    candidate = relationship("Candidate")
    job_requisition = relationship("JobRequisition")
    feedback = relationship("InterviewFeedback", back_populates="interview", cascade="all, delete-orphan")


class InterviewFeedback(Base):
    __tablename__ = "interview_feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("recruiter_interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Float, nullable=False)
    recommendation = Column(String(50), nullable=False)  # Strong Hire, Hire, Neutral, No Hire, Strong No Hire
    strengths = Column(JSONB, nullable=True)
    weaknesses = Column(JSONB, nullable=True)
    notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    interview = relationship("RecruiterInterview", back_populates="feedback")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    compensation = Column(String(100), nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    expiration_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(30), nullable=False, default="DRAFT")  # DRAFT, SENT, ACCEPTED, DECLINED, EXPIRED, WITHDRAWN
    notes = Column(Text, nullable=True)
    issued_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    company = relationship("Company")
    application = relationship("Application", back_populates="offers")
    candidate = relationship("Candidate")


class RecruiterSettings(Base):
    __tablename__ = "recruiter_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_prefs = Column(JSONB, nullable=True)
    sourcing_prefs = Column(JSONB, nullable=True)
    dashboard_prefs = Column(JSONB, nullable=True)
    ai_prefs = Column(JSONB, nullable=True)
    security_prefs = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User")
    company = relationship("Company")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    user = relationship("User")
    company = relationship("Company")


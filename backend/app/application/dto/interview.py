from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class InterviewStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class StartInterviewRequestDTO(BaseModel):
    job_description_id: str = Field(..., description="UUID of the job description to interview for")
    num_questions: int = Field(default=5, ge=3, le=10, description="Number of questions (3–10)")


class SubmitAnswerRequestDTO(BaseModel):
    session_id: str = Field(..., description="UUID of active interview session")
    question_id: str = Field(..., description="UUID of the question being answered")
    answer_text: str = Field(..., min_length=1, max_length=5000, description="Candidate's answer text")


class InterviewQuestionDTO(BaseModel):
    question_id: str
    sequence: int
    question_text: str
    answer_text: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None


class InterviewSessionDTO(BaseModel):
    session_id: str
    student_id: str
    job_description_id: str
    status: InterviewStatus
    questions: List[InterviewQuestionDTO]
    overall_feedback: Optional[dict] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class InterviewFeedbackDTO(BaseModel):
    session_id: str
    overall_score: float = Field(..., ge=0.0, le=100.0)
    strength_areas: List[str]
    improvement_areas: List[str]
    recommendation: str
    detailed_feedback: List[InterviewQuestionDTO]

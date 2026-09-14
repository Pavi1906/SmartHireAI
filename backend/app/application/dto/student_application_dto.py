from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional

class StudentApplicationCreate(BaseModel):
    """Data required for a student to apply to a job.

    * ``job_id`` – UUID of the job requisition to apply for.
    * ``resume_id`` – UUID of a Resume belonging to the student (required).
    """
    model_config = ConfigDict(populate_by_name=True)

    job_id: UUID = Field(..., alias="jobId", description="Job requisition identifier")
    resume_id: UUID = Field(..., alias="resumeId", description="Student resume identifier (required)")

class StudentApplicationResponse(BaseModel):
    """Response model for a student‑owned application.
    Fields follow the approved student‑facing response format.
    """
    applicationId: UUID = Field(..., description="Application identifier")
    jobId: UUID = Field(..., description="Job requisition identifier")
    jobTitle: Optional[str] = Field(None, description="Title of the job")
    companyName: Optional[str] = Field(None, description="Name of the company offering the job")
    status: str = Field(..., description="Application status")
    appliedAt: str = Field(..., description="ISO‑8601 timestamp when the application was created")
    matchScore: Optional[float] = Field(None, description="Real match score, if available")

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List

class ResumeUploadResponseDTO(BaseModel):
    resume_id: str
    s3_key: str
    status: str = Field(..., json_schema_extra={"example": "PARSING"})
    task_id: str
    message: str = "Resume uploaded successfully and parsing job queued."

class ResumeDetailDTO(BaseModel):
    resume_id: str
    student_id: str
    s3_key: str
    status: str = Field(..., json_schema_extra={"example": "PARSED"})
    parsed_json: Optional[Dict[str, Any]] = None
    created_at: datetime

class ResumeStatusUpdateDTO(BaseModel):
    status: str
    raw_text: Optional[str] = None
    parsed_json: Optional[Dict[str, Any]] = None

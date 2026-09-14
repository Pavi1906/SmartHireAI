from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ATSScoreRequestDTO(BaseModel):
    resume_id: str = Field(..., description="UUID of the parsed resume record")
    job_description_id: str = Field(..., description="UUID of the target job description")
    resume_skills: List[str] = Field(..., description="Skills extracted from candidate resume")
    jd_skills: List[str] = Field(..., description="Skills required in the job description")


class ATSSkillBreakdownDTO(BaseModel):
    matched: List[str]
    missing: List[str]
    extra: List[str]
    skill_match_score: float
    keyword_density_score: float
    semantic_similarity_score: float


class ATSScoreResponseDTO(BaseModel):
    report_id: str
    resume_id: str
    job_description_id: str
    ats_score: float = Field(..., ge=0.0, le=100.0, description="ATS score 0–100")
    matched_skills: List[str]
    missing_skills: List[str]
    breakdown: Dict[str, float]
    explanation: Optional[Dict[str, Any]] = None
    recommendation: str

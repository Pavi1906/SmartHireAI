# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import Dict, Any, List

from app.api.deps import get_current_user, TokenData
from app.infrastructure.ai.ats_engine import ats_engine

router = APIRouter(prefix="/ats", tags=["ATS Scoring Engine"])

class ATSScoreRequest(BaseModel):
    resume_id: str
    job_description_id: str
    resume_skills: List[str]
    jd_skills: List[str]

class ATSScoreResponse(BaseModel):
    ats_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    breakdown: Dict[str, float]

@router.post("/score", response_model=ATSScoreResponse)
async def score_ats(
    payload: ATSScoreRequest,
    current_user: TokenData = Depends(get_current_user)
):
    result = ats_engine.score(
        resume_json={"skills": payload.resume_skills},
        jd_json={"skills": payload.jd_skills}
    )
    return ATSScoreResponse(**result)

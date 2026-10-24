from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.matching_service import MatchingService
from app.application.dto.recruiter_dto import MatchEvaluationRequest, MatchResultResponse

router = APIRouter(prefix="/matching", tags=["Deterministic Matching Engine"])

@router.post("/evaluate", response_model=MatchResultResponse)
async def evaluate_match(
    dto: MatchEvaluationRequest,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Authoritative backend deterministic match evaluation between a candidate and job requisition."""
    try:
        res = await MatchingService.evaluate_and_save_match(
            db=db,
            candidate_id=dto.candidateId,
            job_id=dto.jobId,
            company_id=ctx.company_id
        )
        return MatchResultResponse(
            id=str(res.id),
            applicationId=str(res.application_id) if res.application_id else None,
            candidateId=str(res.candidate_id),
            jobId=str(res.job_id),
            matchScore=res.match_score,
            confidence=res.confidence,
            matchedSkills=res.matched_skills or [],
            missingSkills=res.missing_skills or [],
            recommendation=res.recommendation,
            scoringBreakdown=res.scoring_breakdown or {},
            algorithmVersion=res.algorithm_version,
            calculatedAt=res.calculated_at.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.recruiter_interview_service import RecruiterInterviewService
from app.application.dto.recruiter_dto import (
    InterviewCreate, InterviewUpdate, RecruiterInterviewResponse,
    InterviewFeedbackCreate, InterviewFeedbackResponse
)

router = APIRouter(prefix="/recruiter/interviews", tags=["Recruiter Interviews & Feedback"])

@router.get("", response_model=List[RecruiterInterviewResponse])
async def list_interviews(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """List all scheduled and completed recruiter interviews."""
    return await RecruiterInterviewService.list_interviews(db, ctx.company_id)

@router.post("", response_model=RecruiterInterviewResponse, status_code=status.HTTP_201_CREATED)
async def schedule_interview(
    dto: InterviewCreate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Schedule a candidate interview."""
    try:
        return await RecruiterInterviewService.schedule_interview(
            db=db,
            company_id=ctx.company_id,
            interviewer_id=ctx.user_id,
            dto=dto
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{interview_id}", response_model=RecruiterInterviewResponse)
async def get_interview(
    interview_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details for a specific interview."""
    i = await RecruiterInterviewService.get_interview_by_id(db, ctx.company_id, interview_id)
    if not i:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Interview {interview_id} not found.")
    return i

@router.put("/{interview_id}", response_model=RecruiterInterviewResponse)
async def update_interview(
    interview_id: str,
    dto: InterviewUpdate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Update interview schedule or status."""
    try:
        return await RecruiterInterviewService.update_interview(db, ctx.company_id, interview_id, dto)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{interview_id}/feedback", response_model=InterviewFeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_interview_feedback(
    interview_id: str,
    dto: InterviewFeedbackCreate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Submit structured evaluation feedback for a recruiter interview."""
    try:
        return await RecruiterInterviewService.submit_feedback(
            db=db,
            company_id=ctx.company_id,
            interview_id=interview_id,
            reviewer_id=ctx.user_id,
            dto=dto
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

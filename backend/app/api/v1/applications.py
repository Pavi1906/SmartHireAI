from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext, get_current_student, Student
from app.application.services.application_service import ApplicationService
from app.application.services.student_application_service import StudentApplicationService
from app.application.dto.recruiter_dto import (
    ApplicationCreate, ApplicationStageUpdate, ApplicationResponse, StageHistoryResponse
)
from app.application.dto.student_application_dto import StudentApplicationCreate, StudentApplicationResponse

router = APIRouter(prefix="/applications", tags=["Applications & Pipeline Stage Transitions"])

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    dto: ApplicationCreate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Create a new job application linking candidate to job requisition."""
    try:
        return await ApplicationService.create_application(db=db, company_id=ctx.company_id, dto=dto)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/{application_id}/stage", response_model=ApplicationResponse)
async def update_pipeline_stage(
    application_id: str,
    dto: ApplicationStageUpdate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Transition candidate pipeline stage and record immutable stage history."""
    try:
        return await ApplicationService.update_pipeline_stage(
            db=db,
            company_id=ctx.company_id,
            application_id=application_id,
            user_id=ctx.user_id,
            dto=dto
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{application_id}/history", response_model=List[StageHistoryResponse])
async def get_application_stage_history(
    application_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve immutable stage transition history log for an application."""
    try:
        return await ApplicationService.get_stage_history(db=db, company_id=ctx.company_id, application_id=application_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{application_id}/withdraw", response_model=ApplicationResponse)
async def withdraw_application(
    application_id: str,
    reason: Optional[str] = None,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Withdraw an application."""
    try:
        return await ApplicationService.update_pipeline_stage(
            db=db,
            company_id=ctx.company_id,
            application_id=application_id,
            user_id=ctx.user_id,
            dto=ApplicationStageUpdate(stage="WITHDRAWN", reason=reason or "Withdrawn by user")
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{application_id}/reject", response_model=ApplicationResponse)
async def reject_application(
    application_id: str,
    reason: Optional[str] = None,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Reject an application."""
    try:
        return await ApplicationService.update_pipeline_stage(
            db=db,
            company_id=ctx.company_id,
            application_id=application_id,
            user_id=ctx.user_id,
            dto=ApplicationStageUpdate(stage="REJECTED", reason=reason or "Rejected by recruiter")
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/apply", response_model=StudentApplicationResponse, status_code=status.HTTP_201_CREATED)
async def student_apply(
    dto: StudentApplicationCreate,
    student: Student = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    """Student applies to a job using a resume.

    Validates job is published, resume belongs to student, and prevents duplicate applications.
    """
    try:
        return await StudentApplicationService.apply_to_job(db=db, student=student, dto=dto)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/me", response_model=List[StudentApplicationResponse])
async def get_my_applications(
    student: Student = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    """Return list of applications belonging to the authenticated student."""
    try:
        return await StudentApplicationService.list_student_applications(db=db, student=student)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


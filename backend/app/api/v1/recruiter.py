from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.company_service import CompanyService
from app.application.dto.recruiter_dto import RecruiterProfileResponse, RecruiterProfileUpdate

router = APIRouter(prefix="/recruiter", tags=["Recruiter Profile"])

@router.get("/profile", response_model=RecruiterProfileResponse)
async def get_current_recruiter_profile(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve current recruiter's profile information."""
    try:
        return await CompanyService.get_recruiter_profile(db, ctx.recruiter_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.patch("/profile", response_model=RecruiterProfileResponse)
async def update_current_recruiter_profile(
    dto: RecruiterProfileUpdate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Update current recruiter's profile details."""
    try:
        return await CompanyService.update_recruiter_profile(db, ctx.recruiter_id, dto)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

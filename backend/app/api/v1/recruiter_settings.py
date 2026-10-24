from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.settings_service import SettingsService
from app.application.dto.recruiter_dto import RecruiterSettingsResponse, RecruiterSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Recruiter Settings & Preferences"])

@router.get("", response_model=RecruiterSettingsResponse)
async def get_settings(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve persisted preferences for current recruiter."""
    return await SettingsService.get_settings(db, ctx.user_id, ctx.company_id)

@router.put("", response_model=RecruiterSettingsResponse)
async def update_settings(
    dto: RecruiterSettingsUpdate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Update recruiter preferences."""
    return await SettingsService.update_settings(db, ctx.user_id, ctx.company_id, dto)

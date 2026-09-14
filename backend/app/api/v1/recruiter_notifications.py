from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.notification_service import NotificationService
from app.application.dto.recruiter_dto import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Recruiter Notifications"])

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve persistent notifications for current recruiter."""
    return await NotificationService.list_notifications(db, ctx.user_id, ctx.company_id)

@router.post("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_notification_read(
    notification_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Mark a specific notification as read."""
    success = await NotificationService.mark_as_read(db, ctx.user_id, notification_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return {"status": "success"}

@router.post("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read."""
    count = await NotificationService.mark_all_as_read(db, ctx.user_id, ctx.company_id)
    return {"updatedCount": count}

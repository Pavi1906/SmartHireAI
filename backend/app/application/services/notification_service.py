from datetime import datetime, timezone
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.db.models import Notification
from app.application.dto.recruiter_dto import NotificationResponse

class NotificationService:

    @staticmethod
    def _format(n: Notification) -> NotificationResponse:
        return NotificationResponse(
            id=str(n.id),
            type=n.type,
            title=n.title,
            message=n.message,
            resourceType=n.resource_type,
            resourceId=n.resource_id,
            isRead=n.is_read,
            createdAt=n.created_at.isoformat() if n.created_at else datetime.now(timezone.utc).isoformat()
        )

    @classmethod
    async def create_notification(
        cls,
        db: AsyncSession,
        user_id: str,
        company_id: str,
        type: str,
        title: str,
        message: str,
        resource_type: str = None,
        resource_id: str = None
    ) -> NotificationResponse:
        n = Notification(
            user_id=user_id,
            company_id=company_id,
            type=type,
            title=title,
            message=message,
            resource_type=resource_type,
            resource_id=resource_id,
            is_read=False,
            created_at=datetime.now(timezone.utc)
        )
        db.add(n)
        await db.commit()
        await db.refresh(n)
        return cls._format(n)

    @classmethod
    async def list_notifications(cls, db: AsyncSession, user_id: str, company_id: str) -> List[NotificationResponse]:
        query = select(Notification)\
            .where(Notification.user_id == user_id, Notification.company_id == company_id)\
            .order_by(Notification.created_at.desc())
        result = await db.execute(query)
        records = result.scalars().all()
        return [cls._format(n) for n in records]

    @classmethod
    async def mark_as_read(cls, db: AsyncSession, user_id: str, notification_id: str) -> bool:
        result = await db.execute(
            select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
        )
        n = result.scalars().first()
        if not n:
            return False
        n.is_read = True
        await db.commit()
        return True

    @classmethod
    async def mark_all_as_read(cls, db: AsyncSession, user_id: str, company_id: str) -> int:
        result = await db.execute(
            select(Notification).where(Notification.user_id == user_id, Notification.company_id == company_id, Notification.is_read == False)
        )
        records = result.scalars().all()
        for n in records:
            n.is_read = True
        await db.commit()
        return len(records)

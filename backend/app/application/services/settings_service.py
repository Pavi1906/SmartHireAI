from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.db.models import RecruiterSettings
from app.application.dto.recruiter_dto import RecruiterSettingsResponse, RecruiterSettingsUpdate

class SettingsService:

    @classmethod
    async def get_settings(cls, db: AsyncSession, user_id: str, company_id: str) -> RecruiterSettingsResponse:
        result = await db.execute(select(RecruiterSettings).where(RecruiterSettings.user_id == user_id))
        s = result.scalars().first()
        if not s:
            now = datetime.now(timezone.utc)
            s = RecruiterSettings(
                user_id=user_id,
                company_id=company_id,
                notification_prefs={"emailAlerts": True, "stageUpdates": True, "dailyDigest": True},
                sourcing_prefs={"autoMatchThreshold": 75, "preferredLocations": ["Remote"]},
                dashboard_prefs={"defaultView": "jobs", "theme": "system"},
                ai_prefs={"explainabilityLevel": "detailed"},
                security_prefs={"mfaEnabled": False},
                created_at=now,
                updated_at=now
            )
            db.add(s)
            await db.commit()
            await db.refresh(s)

        return RecruiterSettingsResponse(
            notificationPrefs=s.notification_prefs or {},
            sourcingPrefs=s.sourcing_prefs or {},
            dashboardPrefs=s.dashboard_prefs or {},
            aiPrefs=s.ai_prefs or {},
            securityPrefs=s.security_prefs or {}
        )

    @classmethod
    async def update_settings(cls, db: AsyncSession, user_id: str, company_id: str, dto: RecruiterSettingsUpdate) -> RecruiterSettingsResponse:
        result = await db.execute(select(RecruiterSettings).where(RecruiterSettings.user_id == user_id))
        s = result.scalars().first()
        if not s:
            await cls.get_settings(db, user_id, company_id)
            result = await db.execute(select(RecruiterSettings).where(RecruiterSettings.user_id == user_id))
            s = result.scalars().first()

        if dto.notificationPrefs is not None:
            s.notification_prefs = dto.notificationPrefs
        if dto.sourcingPrefs is not None:
            s.sourcing_prefs = dto.sourcingPrefs
        if dto.dashboardPrefs is not None:
            s.dashboard_prefs = dto.dashboardPrefs
        if dto.aiPrefs is not None:
            s.ai_prefs = dto.aiPrefs
        if dto.securityPrefs is not None:
            s.security_prefs = dto.securityPrefs

        s.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(s)

        return RecruiterSettingsResponse(
            notificationPrefs=s.notification_prefs or {},
            sourcingPrefs=s.sourcing_prefs or {},
            dashboardPrefs=s.dashboard_prefs or {},
            aiPrefs=s.ai_prefs or {},
            securityPrefs=s.security_prefs or {}
        )

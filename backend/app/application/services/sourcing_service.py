from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.infrastructure.db.models import SourcingCampaign, Candidate
from app.application.dto.recruiter_dto import CampaignCreate, CampaignUpdate, CampaignResponse

class SourcingService:

    @staticmethod
    def _format_campaign(c: SourcingCampaign) -> CampaignResponse:
        return CampaignResponse(
            id=str(c.id),
            name=c.name,
            jobId=str(c.job_id) if c.job_id else None,
            criteria=c.criteria or {},
            status=c.status,
            results=c.results or [],
            createdAt=c.created_at.isoformat() if c.created_at else datetime.now(timezone.utc).isoformat(),
            updatedAt=c.updated_at.isoformat() if c.updated_at else datetime.now(timezone.utc).isoformat()
        )

    @classmethod
    async def create_campaign(cls, db: AsyncSession, company_id: str, user_id: str, dto: CampaignCreate) -> CampaignResponse:
        now = datetime.now(timezone.utc)
        campaign = SourcingCampaign(
            company_id=company_id,
            created_by_id=user_id,
            job_id=dto.jobId,
            name=dto.name,
            criteria=dto.criteria or {},
            status=dto.status or "active",
            results=dto.results or [],
            created_at=now,
            updated_at=now
        )
        db.add(campaign)
        await db.commit()
        await db.refresh(campaign)
        return cls._format_campaign(campaign)

    @classmethod
    async def list_campaigns(cls, db: AsyncSession, company_id: str) -> List[CampaignResponse]:
        query = select(SourcingCampaign).where(SourcingCampaign.company_id == company_id).order_by(SourcingCampaign.created_at.desc())
        result = await db.execute(query)
        campaigns = result.scalars().all()
        return [cls._format_campaign(c) for c in campaigns]

    @classmethod
    async def get_campaign_by_id(cls, db: AsyncSession, company_id: str, campaign_id: str) -> Optional[CampaignResponse]:
        result = await db.execute(select(SourcingCampaign).where(SourcingCampaign.id == campaign_id, SourcingCampaign.company_id == company_id))
        campaign = result.scalars().first()
        return cls._format_campaign(campaign) if campaign else None

    @classmethod
    async def update_campaign(cls, db: AsyncSession, company_id: str, campaign_id: str, dto: CampaignUpdate) -> CampaignResponse:
        result = await db.execute(select(SourcingCampaign).where(SourcingCampaign.id == campaign_id, SourcingCampaign.company_id == company_id))
        c = result.scalars().first()
        if not c:
            raise ValueError(f"Campaign {campaign_id} not found")

        if dto.name is not None:
            c.name = dto.name
        if dto.jobId is not None:
            c.job_id = dto.jobId
        if dto.criteria is not None:
            c.criteria = dto.criteria
        if dto.status is not None:
            c.status = dto.status
        if dto.results is not None:
            c.results = dto.results

        c.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(c)
        return cls._format_campaign(c)

    @classmethod
    async def delete_campaign(cls, db: AsyncSession, company_id: str, campaign_id: str) -> bool:
        result = await db.execute(select(SourcingCampaign).where(SourcingCampaign.id == campaign_id, SourcingCampaign.company_id == company_id))
        c = result.scalars().first()
        if not c:
            return False
        await db.delete(c)
        await db.commit()
        return True

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.db.models import Offer, Application, ApplicationStageHistory, Candidate
from app.application.dto.recruiter_dto import OfferCreate, OfferStatusUpdate, OfferResponse

class OfferService:

    @staticmethod
    def _format_offer(offer: Offer) -> OfferResponse:
        return OfferResponse(
            id=str(offer.id),
            applicationId=str(offer.application_id),
            candidateId=str(offer.candidate_id),
            compensation=offer.compensation,
            currency=offer.currency,
            startDate=offer.start_date.isoformat() if offer.start_date else None,
            expirationDate=offer.expiration_date.isoformat() if offer.expiration_date else None,
            status=offer.status,
            notes=offer.notes,
            issuedAt=offer.issued_at.isoformat() if offer.issued_at else datetime.now(timezone.utc).isoformat(),
            updatedAt=offer.updated_at.isoformat() if offer.updated_at else datetime.now(timezone.utc).isoformat()
        )

    @classmethod
    async def create_offer(cls, db: AsyncSession, company_id: str, user_id: str, dto: OfferCreate) -> OfferResponse:
        now = datetime.now(timezone.utc)

        # Verify application company ownership
        app_check = await db.execute(
            select(Application).where(Application.id == dto.applicationId, Application.company_id == company_id)
        )
        app = app_check.scalars().first()
        if not app:
            raise ValueError(f"Application {dto.applicationId} not found for this company")

        start_dt = datetime.fromisoformat(dto.startDate.replace("Z", "+00:00")) if dto.startDate else None
        exp_dt = datetime.fromisoformat(dto.expirationDate.replace("Z", "+00:00")) if dto.expirationDate else None

        offer = Offer(
            company_id=company_id,
            application_id=dto.applicationId,
            candidate_id=dto.candidateId,
            compensation=dto.compensation,
            currency=dto.currency or "USD",
            start_date=start_dt,
            expiration_date=exp_dt,
            status="SENT",
            notes=dto.notes,
            issued_by_id=user_id,
            issued_at=now,
            created_at=now,
            updated_at=now
        )
        db.add(offer)

        # Update application stage to Offer
        old_stage = app.pipeline_stage
        app.pipeline_stage = "Offer"
        app.updated_at = now

        db.add(ApplicationStageHistory(
            application_id=app.id,
            previous_stage=old_stage,
            new_stage="Offer",
            changed_by_user_id=user_id,
            reason="Offer issued",
            changed_at=now
        ))

        await db.commit()
        await db.refresh(offer)
        return cls._format_offer(offer)

    @classmethod
    async def list_offers(cls, db: AsyncSession, company_id: str) -> List[OfferResponse]:
        query = select(Offer).where(Offer.company_id == company_id).order_by(Offer.created_at.desc())
        result = await db.execute(query)
        offers = result.scalars().all()
        return [cls._format_offer(o) for o in offers]

    @classmethod
    async def get_offer_by_id(cls, db: AsyncSession, company_id: str, offer_id: str) -> Optional[OfferResponse]:
        result = await db.execute(select(Offer).where(Offer.id == offer_id, Offer.company_id == company_id))
        offer = result.scalars().first()
        return cls._format_offer(offer) if offer else None

    @classmethod
    async def update_offer_status(cls, db: AsyncSession, company_id: str, user_id: str, offer_id: str, dto: OfferStatusUpdate) -> OfferResponse:
        now = datetime.now(timezone.utc)
        result = await db.execute(select(Offer).where(Offer.id == offer_id, Offer.company_id == company_id))
        offer = result.scalars().first()
        if not offer:
            raise ValueError(f"Offer {offer_id} not found")

        offer.status = dto.status
        if dto.notes:
            offer.notes = dto.notes
        offer.updated_at = now

        # If ACCEPTED -> trigger hiring workflow
        if dto.status.upper() == "ACCEPTED":
            app_result = await db.execute(select(Application).where(Application.id == offer.application_id))
            app = app_result.scalars().first()
            if app:
                old_stage = app.pipeline_stage
                app.pipeline_stage = "Hired"
                app.status = "Hired"
                app.updated_at = now

                db.add(ApplicationStageHistory(
                    application_id=app.id,
                    previous_stage=old_stage,
                    new_stage="Hired",
                    changed_by_user_id=user_id,
                    reason="Offer accepted by candidate",
                    changed_at=now
                ))

        await db.commit()
        await db.refresh(offer)
        return cls._format_offer(offer)

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.offer_service import OfferService
from app.application.dto.recruiter_dto import OfferCreate, OfferStatusUpdate, OfferResponse

router = APIRouter(prefix="/offers", tags=["Offers & Hiring Workflow"])

@router.get("", response_model=List[OfferResponse])
async def list_offers(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """List all job offers issued by recruiter's company."""
    return await OfferService.list_offers(db, ctx.company_id)

@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    dto: OfferCreate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Create and issue a job offer to a candidate."""
    try:
        return await OfferService.create_offer(
            db=db,
            company_id=ctx.company_id,
            user_id=ctx.user_id,
            dto=dto
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{offer_id}", response_model=OfferResponse)
async def get_offer(
    offer_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details for a specific offer."""
    offer = await OfferService.get_offer_by_id(db, ctx.company_id, offer_id)
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Offer {offer_id} not found.")
    return offer

@router.put("/{offer_id}/status", response_model=OfferResponse)
async def update_offer_status(
    offer_id: str,
    dto: OfferStatusUpdate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Update offer status (ACCEPTING triggers hiring workflow)."""
    try:
        return await OfferService.update_offer_status(
            db=db,
            company_id=ctx.company_id,
            user_id=ctx.user_id,
            offer_id=offer_id,
            dto=dto
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

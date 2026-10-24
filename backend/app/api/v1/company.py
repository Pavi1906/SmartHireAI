from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.company_service import CompanyService
from app.application.dto.recruiter_dto import CompanyResponse, CompanyUpdate

router = APIRouter(prefix="/company", tags=["Company Profile"])

@router.get("/profile", response_model=CompanyResponse)
async def get_company_profile(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve company profile for the authenticated recruiter."""
    company = await CompanyService.get_company_by_id(db, ctx.company_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found.")
    return CompanyResponse(
        id=str(company.id),
        name=company.name,
        industry=company.industry,
        website=company.website,
        created_at=company.created_at
    )

@router.patch("/profile", response_model=CompanyResponse)
async def update_company_profile(
    dto: CompanyUpdate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Update company profile information."""
    try:
        updated = await CompanyService.update_company(db, ctx.company_id, dto)
        return CompanyResponse(
            id=str(updated.id),
            name=updated.name,
            industry=updated.industry,
            website=updated.website,
            created_at=updated.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

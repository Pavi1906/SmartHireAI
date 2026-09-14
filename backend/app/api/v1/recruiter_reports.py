from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.recruiter_analytics_service import RecruiterAnalyticsService
from app.application.dto.recruiter_dto import RecruiterKPIsResponse

router = APIRouter(prefix="/reports", tags=["Recruiter Analytics & KPI Reports"])

@router.get("/kpis", response_model=RecruiterKPIsResponse)
async def get_recruiter_kpis(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve real PostgreSQL-backed recruiter KPIs and dashboard metrics."""
    return await RecruiterAnalyticsService.get_recruiter_kpis(db=db, company_id=ctx.company_id)

@router.get("/overview")
async def get_reports_overview(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve high-level overview metrics."""
    return await RecruiterAnalyticsService.get_overview_analytics(db=db, company_id=ctx.company_id)

@router.get("/pipeline")
async def get_reports_pipeline(
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve pipeline counts by stage."""
    return await RecruiterAnalyticsService.get_pipeline_analytics(db=db, company_id=ctx.company_id)


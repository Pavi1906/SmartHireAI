from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext, get_current_user, TokenData
from app.application.services.job_requisition_service import JobRequisitionService
from app.application.dto.recruiter_dto import JobCreate, JobUpdate, JobResponse

router = APIRouter(prefix="/jobs", tags=["Job Requisitions"])

@router.get("/active", response_model=List[JobResponse])
async def list_active_jobs(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all currently published job requisitions available for student matching."""
    jobs, _ = await JobRequisitionService.list_published_jobs(
        db=db,
        limit=limit,
        offset=offset
    )
    return jobs

@router.get("", response_model=List[JobResponse])
async def list_jobs(
    status: Optional[str] = Query(None, description="Filter by status (draft, published, paused, closed, archived)"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """List all job requisitions for recruiter's company."""
    jobs, _ = await JobRequisitionService.list_jobs(
        db=db,
        company_id=ctx.company_id,
        status=status,
        limit=limit,
        offset=offset
    )
    return jobs

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    dto: JobCreate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Create a new job requisition."""
    return await JobRequisitionService.create_job(
        db=db,
        company_id=ctx.company_id,
        recruiter_id=ctx.recruiter_id,
        dto=dto
    )

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details for a specific job requisition."""
    job = await JobRequisitionService.get_job_by_id(db=db, company_id=ctx.company_id, job_id=job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found.")
    return job

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    dto: JobUpdate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Update a job requisition."""
    try:
        return await JobRequisitionService.update_job(
            db=db,
            company_id=ctx.company_id,
            job_id=job_id,
            dto=dto
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{job_id}/publish", response_model=JobResponse)
async def publish_job(
    job_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Publish a draft or paused job requisition."""
    return await JobRequisitionService.update_status(db, ctx.company_id, job_id, "published")

@router.post("/{job_id}/pause", response_model=JobResponse)
async def pause_job(
    job_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Pause a published job requisition."""
    return await JobRequisitionService.update_status(db, ctx.company_id, job_id, "paused")

@router.post("/{job_id}/close", response_model=JobResponse)
async def close_job(
    job_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Close a job requisition."""
    return await JobRequisitionService.update_status(db, ctx.company_id, job_id, "closed")

@router.post("/{job_id}/archive", response_model=JobResponse)
async def archive_job(
    job_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Archive a job requisition."""
    return await JobRequisitionService.update_status(db, ctx.company_id, job_id, "archived")

@router.post("/{job_id}/reopen", response_model=JobResponse)
async def reopen_job(
    job_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Reopen a closed job requisition."""
    return await JobRequisitionService.update_status(db, ctx.company_id, job_id, "published")

@router.post("/{job_id}/duplicate", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_job(
    job_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Duplicate an existing job requisition."""
    try:
        return await JobRequisitionService.duplicate_job(
            db=db,
            company_id=ctx.company_id,
            recruiter_id=ctx.recruiter_id,
            job_id=job_id
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Delete a job requisition."""
    success = await JobRequisitionService.delete_job(db=db, company_id=ctx.company_id, job_id=job_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found.")
    return None

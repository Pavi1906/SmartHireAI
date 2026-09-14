from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.api.deps import get_current_recruiter, RecruiterContext
from app.application.services.candidate_service import CandidateService
from app.application.dto.recruiter_dto import CandidateCreate, CandidateUpdate, CandidateResponse

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("", response_model=List[CandidateResponse])
async def list_candidates(
    job_id: Optional[str] = Query(None, description="Filter candidates by associated job requisition ID"),
    stage: Optional[str] = Query(None, description="Filter candidates by pipeline stage"),
    search: Optional[str] = Query(None, description="Search candidate name, role, or email"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """List candidates for recruiter's company."""
    candidates, _ = await CandidateService.list_candidates(
        db=db,
        company_id=ctx.company_id,
        job_id=job_id,
        stage=stage,
        search=search,
        limit=limit,
        offset=offset
    )
    return candidates

@router.post("", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    dto: CandidateCreate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Add a candidate record to company talent database."""
    try:
        return await CandidateService.create_candidate(db=db, company_id=ctx.company_id, dto=dto)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details for a specific candidate."""
    cand = await CandidateService.get_candidate_by_id(db=db, company_id=ctx.company_id, candidate_id=candidate_id)
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Candidate {candidate_id} not found.")
    return cand

@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: str,
    dto: CandidateUpdate,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Update candidate details or pipeline stage."""
    try:
        return await CandidateService.update_candidate(
            db=db,
            company_id=ctx.company_id,
            candidate_id=candidate_id,
            dto=dto
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: str,
    ctx: RecruiterContext = Depends(get_current_recruiter),
    db: AsyncSession = Depends(get_db)
):
    """Delete a candidate record."""
    success = await CandidateService.delete_candidate(db=db, company_id=ctx.company_id, candidate_id=candidate_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Candidate {candidate_id} not found.")
    return None

from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.infrastructure.db.models import Candidate, Application, MatchResult, JobRequisition
from app.application.dto.recruiter_dto import CandidateCreate, CandidateUpdate, CandidateResponse
from app.application.services.matching_service import MatchingService

class CandidateService:

    @staticmethod
    def _format_candidate(candidate: Candidate, application: Optional[Application] = None, match: Optional[MatchResult] = None) -> CandidateResponse:
        created_at_dt = candidate.created_at or datetime.now(timezone.utc)

        return CandidateResponse(
            id=str(candidate.id),
            name=candidate.name,
            email=candidate.email,
            role=candidate.role,
            location=candidate.location or "Remote",
            avatar=candidate.avatar,
            resumeData=candidate.resume_data or {},
            matchScore=match.match_score if match else None,
            confidence=match.confidence if match else None,
            matchedSkills=match.matched_skills if match else [],
            missingSkills=match.missing_skills if match else [],
            recommendation=match.recommendation if match else None,
            pipelineStage=application.pipeline_stage if application else "Sourced",
            jobId=str(application.job_id) if application else None,
            applicationId=str(application.id) if application else None,
            appliedAt=application.applied_at.isoformat() if application and application.applied_at else created_at_dt.isoformat(),
            time=created_at_dt.isoformat()
        )

    @classmethod
    async def create_candidate(cls, db: AsyncSession, company_id: str, dto: CandidateCreate) -> CandidateResponse:
        now = datetime.now(timezone.utc)
        resume_data_dict = dto.resumeData.model_dump() if hasattr(dto.resumeData, "model_dump") else dto.resumeData

        candidate = Candidate(
            company_id=company_id,
            name=dto.name,
            email=dto.email,
            role=dto.role,
            location=dto.location,
            avatar=dto.avatar,
            resume_data=resume_data_dict,
            source=dto.source or "Direct",
            status="Active",
            created_at=now,
            updated_at=now
        )
        db.add(candidate)
        await db.commit()
        await db.refresh(candidate)

        application = None
        match_result = None

        if dto.jobId:
            # Verify Job Requisition belongs to company
            job_check = await db.execute(
                select(JobRequisition).where(JobRequisition.id == dto.jobId, JobRequisition.company_id == company_id)
            )
            job = job_check.scalars().first()
            if job:
                # Create Application
                application = Application(
                    company_id=company_id,
                    job_id=job.id,
                    candidate_id=candidate.id,
                    pipeline_stage=dto.pipelineStage or "Sourced",
                    status="Active",
                    applied_at=now,
                    created_at=now,
                    updated_at=now
                )
                db.add(application)

                # Increment job applicant count
                job.applicant_count = (job.applicant_count or 0) + 1
                await db.commit()
                await db.refresh(application)

                # Compute deterministic match score
                match_result = await MatchingService.evaluate_and_save_match(
                    db=db,
                    candidate_id=str(candidate.id),
                    job_id=str(job.id),
                    company_id=company_id,
                    application_id=str(application.id)
                )

        return cls._format_candidate(candidate, application, match_result)

    @classmethod
    async def list_candidates(
        cls,
        db: AsyncSession,
        company_id: str,
        job_id: Optional[str] = None,
        stage: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Tuple[List[CandidateResponse], int]:
        # Query Candidates joined with Application & MatchResult
        query = select(Candidate, Application, MatchResult)\
            .outerjoin(Application, (Application.candidate_id == Candidate.id) & (Application.company_id == company_id))\
            .outerjoin(MatchResult, MatchResult.candidate_id == Candidate.id)\
            .where(Candidate.company_id == company_id)

        if job_id:
            query = query.where(Application.job_id == job_id)
        if stage:
            query = query.where(Application.pipeline_stage == stage)
        if search:
            query = query.where(
                (Candidate.name.ilike(f"%{search}%")) |
                (Candidate.role.ilike(f"%{search}%")) |
                (Candidate.email.ilike(f"%{search}%"))
            )

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(Candidate.created_at.desc()).offset(offset).limit(limit)
        result = await db.execute(query)
        rows = result.all()

        candidates_resp = []
        for cand, app, match in rows:
            candidates_resp.append(cls._format_candidate(cand, app, match))

        return candidates_resp, total

    @classmethod
    async def get_candidate_by_id(cls, db: AsyncSession, company_id: str, candidate_id: str) -> Optional[CandidateResponse]:
        query = select(Candidate, Application, MatchResult)\
            .outerjoin(Application, (Application.candidate_id == Candidate.id) & (Application.company_id == company_id))\
            .outerjoin(MatchResult, MatchResult.candidate_id == Candidate.id)\
            .where(Candidate.id == candidate_id, Candidate.company_id == company_id)

        result = await db.execute(query)
        row = result.first()
        if not row:
            return None

        cand, app, match = row
        return cls._format_candidate(cand, app, match)

    @classmethod
    async def update_candidate(cls, db: AsyncSession, company_id: str, candidate_id: str, dto: CandidateUpdate) -> CandidateResponse:
        cand_query = select(Candidate).where(Candidate.id == candidate_id, Candidate.company_id == company_id)
        result = await db.execute(cand_query)
        candidate = result.scalars().first()
        if not candidate:
            raise ValueError(f"Candidate {candidate_id} not found")

        if dto.name is not None:
            candidate.name = dto.name
        if dto.email is not None:
            candidate.email = dto.email
        if dto.role is not None:
            candidate.role = dto.role
        if dto.location is not None:
            candidate.location = dto.location
        if dto.avatar is not None:
            candidate.avatar = dto.avatar
        if dto.resumeData is not None:
            candidate.resume_data = dto.resumeData.model_dump() if hasattr(dto.resumeData, "model_dump") else dto.resumeData

        candidate.updated_at = datetime.now(timezone.utc)
        await db.commit()

        # Update application stage if provided
        if dto.pipelineStage:
            app_result = await db.execute(
                select(Application).where(Application.candidate_id == candidate.id, Application.company_id == company_id)
            )
            app = app_result.scalars().first()
            if app:
                app.pipeline_stage = dto.pipelineStage
                app.updated_at = datetime.now(timezone.utc)
                await db.commit()

        return await cls.get_candidate_by_id(db, company_id, candidate_id)

    @classmethod
    async def delete_candidate(cls, db: AsyncSession, company_id: str, candidate_id: str) -> bool:
        result = await db.execute(
            select(Candidate).where(Candidate.id == candidate_id, Candidate.company_id == company_id)
        )
        candidate = result.scalars().first()
        if not candidate:
            return False

        await db.delete(candidate)
        await db.commit()
        return True

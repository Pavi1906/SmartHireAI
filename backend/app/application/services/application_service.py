from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.infrastructure.db.models import Application, ApplicationStageHistory, Candidate, JobRequisition
from app.application.dto.recruiter_dto import ApplicationCreate, ApplicationStageUpdate, ApplicationResponse, StageHistoryResponse

class ApplicationService:

    @staticmethod
    def _format_application(app: Application) -> ApplicationResponse:
        return ApplicationResponse(
            id=str(app.id),
            jobId=str(app.job_id),
            candidateId=str(app.candidate_id) if app.candidate_id else None,
            pipelineStage=app.pipeline_stage,
            status=app.status,
            appliedAt=app.applied_at.isoformat() if app.applied_at else datetime.now(timezone.utc).isoformat(),
            updatedAt=app.updated_at.isoformat() if app.updated_at else datetime.now(timezone.utc).isoformat()
        )

    @classmethod
    async def create_application(cls, db: AsyncSession, company_id: str, dto: ApplicationCreate) -> ApplicationResponse:
        now = datetime.now(timezone.utc)

        # Verify candidate and job belong to company
        cand_check = await db.execute(
            select(Candidate).where(Candidate.id == dto.candidateId, Candidate.company_id == company_id)
        )
        if not cand_check.scalars().first():
            raise ValueError(f"Candidate {dto.candidateId} not found for this company")

        job_check = await db.execute(
            select(JobRequisition).where(JobRequisition.id == dto.jobId, JobRequisition.company_id == company_id)
        )
        job = job_check.scalars().first()
        if not job:
            raise ValueError(f"Job Requisition {dto.jobId} not found for this company")

        # Check existing active application
        existing = await db.execute(
            select(Application).where(
                Application.candidate_id == dto.candidateId,
                Application.job_id == dto.jobId,
                Application.company_id == company_id
            )
        )
        if existing.scalars().first():
            raise ValueError("Candidate already has an active application for this job requisition")

        app = Application(
            company_id=company_id,
            job_id=dto.jobId,
            candidate_id=dto.candidateId,
            pipeline_stage="Sourced",
            status="Active",
            applied_at=now,
            created_at=now,
            updated_at=now
        )
        db.add(app)
        job.applicant_count = (job.applicant_count or 0) + 1

        await db.commit()
        await db.refresh(app)

        # Log initial stage history
        history = ApplicationStageHistory(
            application_id=app.id,
            previous_stage=None,
            new_stage="Sourced",
            changed_by_user_id=None,
            reason="Application created",
            changed_at=now
        )
        db.add(history)
        await db.commit()

        return cls._format_application(app)

    @classmethod
    async def update_pipeline_stage(
        cls,
        db: AsyncSession,
        company_id: str,
        application_id: str,
        user_id: str,
        dto: ApplicationStageUpdate
    ) -> ApplicationResponse:
        now = datetime.now(timezone.utc)

        result = await db.execute(
            select(Application).where(
                Application.id == application_id,
                Application.company_id == company_id
            )
        )
        app = result.scalars().first()
        if not app:
            raise ValueError(f"Application {application_id} not found for this company")

        old_stage = app.pipeline_stage
        new_stage = dto.stage

        if old_stage != new_stage:
            app.pipeline_stage = new_stage
            app.updated_at = now

            # Record immutable stage history
            history = ApplicationStageHistory(
                application_id=app.id,
                previous_stage=old_stage,
                new_stage=new_stage,
                changed_by_user_id=user_id,
                reason=dto.reason,
                changed_at=now
            )
            db.add(history)
            await db.commit()
            await db.refresh(app)

        return cls._format_application(app)

    @classmethod
    async def get_stage_history(cls, db: AsyncSession, company_id: str, application_id: str) -> List[StageHistoryResponse]:
        # Verify application company ownership
        app_check = await db.execute(
            select(Application).where(Application.id == application_id, Application.company_id == company_id)
        )
        if not app_check.scalars().first():
            raise ValueError(f"Application {application_id} not found for this company")

        query = select(ApplicationStageHistory)\
            .where(ApplicationStageHistory.application_id == application_id)\
            .order_by(ApplicationStageHistory.changed_at.asc())

        result = await db.execute(query)
        records = result.scalars().all()

        return [
            StageHistoryResponse(
                id=str(h.id),
                applicationId=str(h.application_id),
                previousStage=h.previous_stage,
                newStage=h.new_stage,
                changedByUserId=str(h.changed_by_user_id) if h.changed_by_user_id else None,
                reason=h.reason,
                changedAt=h.changed_at.isoformat()
            )
            for h in records
        ]

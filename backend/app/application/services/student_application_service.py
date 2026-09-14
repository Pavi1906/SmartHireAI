from datetime import datetime, timezone
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.db.models import Application, JobRequisition, Resume, Student
from app.application.dto.student_application_dto import StudentApplicationCreate, StudentApplicationResponse
from fastapi import HTTPException, status

from sqlalchemy.orm import selectinload

class StudentApplicationService:
    """Service handling student-side application creation and retrieval.

    - Ensures the authenticated student owns the provided resume.
    - Prevents duplicate applications for the same job.
    - Safely works with Application.candidate_id being NULL for student applications.
    - Updates JobRequisition.applicant_count only if the column exists.
    """

    @staticmethod
    async def _build_response(app: Application, db: AsyncSession) -> StudentApplicationResponse:
        job = await db.execute(
            select(JobRequisition)
            .options(selectinload(JobRequisition.company))
            .where(JobRequisition.id == app.job_id)
        )
        job_obj = job.scalars().first()
        company_name = None
        if job_obj and job_obj.company:
            company_name = job_obj.company.name
        return StudentApplicationResponse(
            applicationId=app.id,
            jobId=app.job_id,
            jobTitle=getattr(job_obj, "title", None) if job_obj else None,
            companyName=company_name,
            status=app.status,
            appliedAt=app.applied_at.isoformat() if app.applied_at else datetime.now(timezone.utc).isoformat(),
            matchScore=None,
        )

    @classmethod
    async def apply_to_job(cls, db: AsyncSession, student: Student, dto: StudentApplicationCreate) -> StudentApplicationResponse:
        job_res = await db.execute(
            select(JobRequisition).where(JobRequisition.id == dto.job_id, JobRequisition.status == "published")
        )
        job = job_res.scalars().first()
        if not job:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job not found or not published")
        resume_res = await db.execute(select(Resume).where(Resume.id == dto.resume_id, Resume.student_id == student.id))
        resume = resume_res.scalars().first()
        if not resume:
            exists = await db.execute(select(Resume).where(Resume.id == dto.resume_id))
            if exists.scalars().first():
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Resume does not belong to the authenticated student")
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        dup = await db.execute(select(Application).where(Application.student_id == student.id, Application.job_id == dto.job_id, Application.status != "Withdrawn"))
        if dup.scalars().first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Student has already applied to this job")
        now = datetime.now(timezone.utc)
        app = Application(company_id=job.company_id, job_id=dto.job_id, student_id=student.id, pipeline_stage="Sourced", status="Active", applied_at=now, created_at=now, updated_at=now)
        db.add(app)
        if hasattr(job, "applicant_count"):
            job.applicant_count = (job.applicant_count or 0) + 1
        await db.commit()
        await db.refresh(app)
        return await cls._build_response(app, db)

    @classmethod
    async def list_student_applications(cls, db: AsyncSession, student: Student) -> List[StudentApplicationResponse]:
        res = await db.execute(select(Application).where(Application.student_id == student.id))
        apps = res.scalars().all()
        return [await cls._build_response(app, db) for app in apps]

from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, delete

from app.infrastructure.db.models import JobRequisition, Application
from app.application.dto.recruiter_dto import JobCreate, JobUpdate, JobResponse

class JobRequisitionService:

    @staticmethod
    def _format_job(job: JobRequisition) -> JobResponse:
        return JobResponse(
            id=str(job.id),
            title=job.title,
            department=job.department,
            description=job.description,
            responsibilities=job.responsibilities or [],
            requiredSkills=job.required_skills or [],
            preferredSkills=job.preferred_skills or [],
            experience=job.experience,
            education=job.education,
            location=job.location,
            workplaceType=job.workplace_type,
            type=job.employment_type,
            salary=job.salary,
            status=job.status,
            createdAt=job.created_at.isoformat() if job.created_at else datetime.now(timezone.utc).isoformat(),
            updatedAt=job.updated_at.isoformat() if job.updated_at else datetime.now(timezone.utc).isoformat(),
            applicantCount=job.applicant_count or 0,
            viewsCount=job.views_count or 0
        )

    @classmethod
    async def create_job(cls, db: AsyncSession, company_id: str, recruiter_id: str, dto: JobCreate) -> JobResponse:
        now = datetime.now(timezone.utc)
        job = JobRequisition(
            company_id=company_id,
            recruiter_id=recruiter_id,
            title=dto.title,
            department=dto.department,
            description=dto.description,
            responsibilities=dto.responsibilities or [],
            required_skills=dto.requiredSkills,
            preferred_skills=dto.preferredSkills or [],
            experience=dto.experience,
            education=dto.education,
            location=dto.location,
            workplace_type=dto.workplaceType,
            employment_type=dto.type,
            salary=dto.salary,
            status=dto.status,
            applicant_count=0,
            views_count=0,
            created_at=now,
            updated_at=now
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        return cls._format_job(job)

    @classmethod
    async def list_jobs(
        cls,
        db: AsyncSession,
        company_id: str,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Tuple[List[JobResponse], int]:
        query = select(JobRequisition).where(JobRequisition.company_id == company_id)
        if status:
            query = query.where(JobRequisition.status == status)

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(JobRequisition.created_at.desc()).offset(offset).limit(limit)
        result = await db.execute(query)
        jobs = result.scalars().all()

        return [cls._format_job(j) for j in jobs], total

    @classmethod
    async def get_job_by_id(cls, db: AsyncSession, company_id: str, job_id: str) -> Optional[JobResponse]:
        query = select(JobRequisition).where(
            JobRequisition.id == job_id,
            JobRequisition.company_id == company_id
        )
        result = await db.execute(query)
        job = result.scalars().first()
        if not job:
            return None
        
        # Increment views count
        job.views_count = (job.views_count or 0) + 1
        await db.commit()
        return cls._format_job(job)

    @classmethod
    async def update_job(cls, db: AsyncSession, company_id: str, job_id: str, dto: JobUpdate) -> JobResponse:
        query = select(JobRequisition).where(
            JobRequisition.id == job_id,
            JobRequisition.company_id == company_id
        )
        result = await db.execute(query)
        job = result.scalars().first()
        if not job:
            raise ValueError(f"Job Requisition {job_id} not found for this company")

        if dto.title is not None:
            job.title = dto.title
        if dto.department is not None:
            job.department = dto.department
        if dto.description is not None:
            job.description = dto.description
        if dto.responsibilities is not None:
            job.responsibilities = dto.responsibilities
        if dto.requiredSkills is not None:
            job.required_skills = dto.requiredSkills
        if dto.preferredSkills is not None:
            job.preferred_skills = dto.preferredSkills
        if dto.experience is not None:
            job.experience = dto.experience
        if dto.education is not None:
            job.education = dto.education
        if dto.location is not None:
            job.location = dto.location
        if dto.workplaceType is not None:
            job.workplace_type = dto.workplaceType
        if dto.type is not None:
            job.employment_type = dto.type
        if dto.salary is not None:
            job.salary = dto.salary
        if dto.status is not None:
            job.status = dto.status

        job.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(job)
        return cls._format_job(job)

    @classmethod
    async def update_status(cls, db: AsyncSession, company_id: str, job_id: str, new_status: str) -> JobResponse:
        return await cls.update_job(db, company_id, job_id, JobUpdate(status=new_status))

    @classmethod
    async def duplicate_job(cls, db: AsyncSession, company_id: str, recruiter_id: str, job_id: str) -> JobResponse:
        original = await cls.get_job_by_id(db, company_id, job_id)
        if not original:
            raise ValueError("Original Job Requisition not found")

        cloned_dto = JobCreate(
            title=f"{original.title} (Copy)",
            department=original.department,
            description=original.description,
            responsibilities=original.responsibilities,
            requiredSkills=original.requiredSkills,
            preferredSkills=original.preferredSkills,
            experience=original.experience,
            education=original.education,
            location=original.location,
            workplaceType=original.workplaceType,
            type=original.type,
            salary=original.salary,
            status="draft"
        )
        return await cls.create_job(db, company_id, recruiter_id, cloned_dto)

    @classmethod
    async def list_published_jobs(
        cls,
        db: AsyncSession,
        limit: int = 100,
        offset: int = 0
    ) -> Tuple[List[JobResponse], int]:
        query = select(JobRequisition).where(JobRequisition.status == "published")

        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(JobRequisition.created_at.desc()).offset(offset).limit(limit)
        result = await db.execute(query)
        jobs = result.scalars().all()

        return [cls._format_job(j) for j in jobs], total

    @classmethod
    async def delete_job(cls, db: AsyncSession, company_id: str, job_id: str) -> bool:
        result = await db.execute(
            select(JobRequisition).where(
                JobRequisition.id == job_id,
                JobRequisition.company_id == company_id
            )
        )
        job = result.scalars().first()
        if not job:
            return False

        await db.delete(job)
        await db.commit()
        return True

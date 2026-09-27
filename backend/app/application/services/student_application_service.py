from datetime import datetime, timezone
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.db.models import (
    Application,
    Candidate,
    JobRequisition,
    Resume,
    Student,
    User,
)
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
    async def _get_or_create_candidate(
        db: AsyncSession,
        student: Student,
        resume: Resume,
        job: JobRequisition,
    ) -> Candidate:
        """
        Create or reuse a recruiter Candidate for a student application.
        This keeps the student application connected to the recruiter pipeline.
        """

        parsed_data = resume.parsed_json if isinstance(resume.parsed_json, dict) else {}

        candidate_email = parsed_data.get("email")

        # Fallback to the student's account email if resume email is unavailable.
        if not candidate_email:
            user_result = await db.execute(
                select(User).where(User.id == student.id)
            )
            user = user_result.scalars().first()

            if user:
                candidate_email = user.email

        candidate = None

        # Reuse an existing candidate with the same email in this company.
        if candidate_email:
            candidate_result = await db.execute(
                select(Candidate).where(
                    Candidate.company_id == job.company_id,
                    Candidate.email == candidate_email,
                )
            )
            candidate = candidate_result.scalars().first()

        # Create a new recruiter candidate if one does not already exist.
        if candidate is None:
            now = datetime.now(timezone.utc)

            candidate = Candidate(
                company_id=job.company_id,
                name=parsed_data.get("name") or student.full_name,
                email=candidate_email,
                role=job.title,
                location=job.location,
                resume_data=parsed_data,
                source="Student Application",
                status="Active",
                created_at=now,
                updated_at=now,
            )

            db.add(candidate)

            # Generate candidate.id before creating the application.
            await db.flush()

        return candidate

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
    async def apply_to_job(
        cls,
        db: AsyncSession,
        student: Student,
        dto: StudentApplicationCreate,
    ) -> StudentApplicationResponse:

        # 1. Check that the job exists and is published.
        job_res = await db.execute(
            select(JobRequisition).where(
                JobRequisition.id == dto.job_id,
                JobRequisition.status == "published",
            )
        )

        job = job_res.scalars().first()

        if not job:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job not found or not published",
            )

        # 2. Verify that the resume belongs to this student.
        resume_res = await db.execute(
            select(Resume).where(
                Resume.id == dto.resume_id,
                Resume.student_id == student.id,
            )
        )

        resume = resume_res.scalars().first()

        if not resume:
            exists = await db.execute(
                select(Resume).where(Resume.id == dto.resume_id)
            )

            if exists.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Resume does not belong to the authenticated student",
                )

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found",
            )

        # 3. Check for an existing application.
        dup = await db.execute(
            select(Application).where(
                Application.student_id == student.id,
                Application.job_id == dto.job_id,
                Application.status != "Withdrawn",
            )
        )

        existing_app = dup.scalars().first()

        # 4. If the application already exists but is not connected
        #    to a recruiter Candidate, repair that connection.
        if existing_app:
            if existing_app.candidate_id is None:

                candidate = await cls._get_or_create_candidate(
                    db=db,
                    student=student,
                    resume=resume,
                    job=job,
                )

                existing_app.candidate_id = candidate.id
                existing_app.updated_at = datetime.now(timezone.utc)

                await db.commit()
                await db.refresh(existing_app)

                return await cls._build_response(
                    existing_app,
                    db,
                )

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Student has already applied to this job",
            )

        # 5. Create/reuse recruiter Candidate.
        candidate = await cls._get_or_create_candidate(
            db=db,
            student=student,
            resume=resume,
            job=job,
        )

        # 6. Create the application and connect it to the Candidate.
        now = datetime.now(timezone.utc)

        app = Application(
            company_id=job.company_id,
            job_id=dto.job_id,
            candidate_id=candidate.id,
            student_id=student.id,
            pipeline_stage="Sourced",
            status="Active",
            applied_at=now,
            created_at=now,
            updated_at=now,
        )

        db.add(app)

        # 7. Increase applicant count only for a NEW application.
        if hasattr(job, "applicant_count"):
            job.applicant_count = (job.applicant_count or 0) + 1

        await db.commit()
        await db.refresh(app)

        return await cls._build_response(
            app,
            db,
        )

    @classmethod
    async def list_student_applications(cls, db: AsyncSession, student: Student) -> List[StudentApplicationResponse]:
        res = await db.execute(select(Application).where(Application.student_id == student.id))
        apps = res.scalars().all()
        return [await cls._build_response(app, db) for app in apps]

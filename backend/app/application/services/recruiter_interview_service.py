from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.infrastructure.db.models import RecruiterInterview, InterviewFeedback, Application, Candidate, JobRequisition
from app.application.dto.recruiter_dto import (
    InterviewCreate, InterviewUpdate, RecruiterInterviewResponse,
    InterviewFeedbackCreate, InterviewFeedbackResponse
)

class RecruiterInterviewService:

    @staticmethod
    def _format_feedback(fb: InterviewFeedback) -> InterviewFeedbackResponse:
        return InterviewFeedbackResponse(
            id=str(fb.id),
            interviewId=str(fb.interview_id),
            reviewerId=str(fb.reviewer_id) if fb.reviewer_id else None,
            rating=fb.rating,
            recommendation=fb.recommendation,
            strengths=fb.strengths or [],
            weaknesses=fb.weaknesses or [],
            notes=fb.notes,
            submittedAt=fb.submitted_at.isoformat() if fb.submitted_at else datetime.now(timezone.utc).isoformat()
        )

    @classmethod
    def _format_interview(cls, i: RecruiterInterview) -> RecruiterInterviewResponse:
        fb_resp = None
        if hasattr(i, "feedback") and i.feedback:
            # handle list or single item
            fb_item = i.feedback[0] if isinstance(i.feedback, list) and len(i.feedback) > 0 else (i.feedback if not isinstance(i.feedback, list) else None)
            if fb_item:
                fb_resp = cls._format_feedback(fb_item)

        return RecruiterInterviewResponse(
            id=str(i.id),
            applicationId=str(i.application_id),
            candidateId=str(i.candidate_id),
            jobId=str(i.job_id),
            interviewType=i.interview_type,
            scheduledAt=i.scheduled_at.isoformat() if i.scheduled_at else datetime.now(timezone.utc).isoformat(),
            durationMinutes=i.duration_minutes,
            locationUrl=i.location_url,
            status=i.status,
            notes=i.notes,
            createdAt=i.created_at.isoformat() if i.created_at else datetime.now(timezone.utc).isoformat(),
            feedback=fb_resp
        )

    @classmethod
    async def schedule_interview(cls, db: AsyncSession, company_id: str, interviewer_id: str, dto: InterviewCreate) -> RecruiterInterviewResponse:
        now = datetime.now(timezone.utc)
        sched_dt = datetime.fromisoformat(dto.scheduledAt.replace("Z", "+00:00")) if "T" in dto.scheduledAt else now

        # Verify application company ownership
        app_check = await db.execute(
            select(Application).where(Application.id == dto.applicationId, Application.company_id == company_id)
        )
        if not app_check.scalars().first():
            raise ValueError(f"Application {dto.applicationId} not found for company {company_id}")

        interview = RecruiterInterview(
            company_id=company_id,
            application_id=dto.applicationId,
            candidate_id=dto.candidateId,
            job_id=dto.jobId,
            interviewer_id=interviewer_id,
            interview_type=dto.interviewType,
            scheduled_at=sched_dt,
            duration_minutes=dto.durationMinutes,
            location_url=dto.locationUrl,
            status="SCHEDULED",
            notes=dto.notes,
            created_at=now,
            updated_at=now
        )
        db.add(interview)
        await db.commit()
        await db.refresh(interview)
        return cls._format_interview(interview)

    @classmethod
    async def list_interviews(cls, db: AsyncSession, company_id: str) -> List[RecruiterInterviewResponse]:
        query = select(RecruiterInterview)\
            .options(selectinload(RecruiterInterview.feedback))\
            .where(RecruiterInterview.company_id == company_id)\
            .order_by(RecruiterInterview.scheduled_at.desc())

        result = await db.execute(query)
        interviews = result.scalars().all()
        return [cls._format_interview(i) for i in interviews]

    @classmethod
    async def get_interview_by_id(cls, db: AsyncSession, company_id: str, interview_id: str) -> Optional[RecruiterInterviewResponse]:
        query = select(RecruiterInterview)\
            .options(selectinload(RecruiterInterview.feedback))\
            .where(RecruiterInterview.id == interview_id, RecruiterInterview.company_id == company_id)

        result = await db.execute(query)
        i = result.scalars().first()
        return cls._format_interview(i) if i else None

    @classmethod
    async def update_interview(cls, db: AsyncSession, company_id: str, interview_id: str, dto: InterviewUpdate) -> RecruiterInterviewResponse:
        query = select(RecruiterInterview).where(RecruiterInterview.id == interview_id, RecruiterInterview.company_id == company_id)
        result = await db.execute(query)
        i = result.scalars().first()
        if not i:
            raise ValueError(f"Interview {interview_id} not found")

        if dto.scheduledAt is not None:
            i.scheduled_at = datetime.fromisoformat(dto.scheduledAt.replace("Z", "+00:00"))
        if dto.durationMinutes is not None:
            i.duration_minutes = dto.durationMinutes
        if dto.locationUrl is not None:
            i.location_url = dto.locationUrl
        if dto.status is not None:
            i.status = dto.status
        if dto.notes is not None:
            i.notes = dto.notes

        i.updated_at = datetime.now(timezone.utc)
        await db.commit()
        return await cls.get_interview_by_id(db, company_id, interview_id)

    @classmethod
    async def submit_feedback(
        cls,
        db: AsyncSession,
        company_id: str,
        interview_id: str,
        reviewer_id: str,
        dto: InterviewFeedbackCreate
    ) -> InterviewFeedbackResponse:
        query = select(RecruiterInterview).where(RecruiterInterview.id == interview_id, RecruiterInterview.company_id == company_id)
        result = await db.execute(query)
        i = result.scalars().first()
        if not i:
            raise ValueError(f"Interview {interview_id} not found")

        now = datetime.now(timezone.utc)
        feedback = InterviewFeedback(
            interview_id=i.id,
            reviewer_id=reviewer_id,
            rating=dto.rating,
            recommendation=dto.recommendation,
            strengths=dto.strengths or [],
            weaknesses=dto.weaknesses or [],
            notes=dto.notes,
            submitted_at=now
        )
        db.add(feedback)
        i.status = "COMPLETED"
        i.updated_at = now

        await db.commit()
        await db.refresh(feedback)
        return cls._format_feedback(feedback)

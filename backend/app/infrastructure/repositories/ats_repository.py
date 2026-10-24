import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.db.models import ATSReport, JobDescription


class ATSRepository:
    """Repository for ATS scoring reports and job descriptions."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_ats_report(
        self,
        resume_id: str,
        job_description_id: str,
        ats_score: float,
        matched_skills: List[str],
        missing_skills: List[str],
        explanation: Dict[str, Any]
    ) -> ATSReport:
        report = ATSReport(
            id=uuid.uuid4(),
            resume_id=resume_id,
            job_description_id=job_description_id,
            ats_score=ats_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            explanation=explanation
        )
        self.session.add(report)
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def get_by_id(self, report_id: str) -> Optional[ATSReport]:
        result = await self.session.execute(
            select(ATSReport).where(ATSReport.id == report_id)
        )
        return result.scalar_one_or_none()

    async def get_by_resume_id(self, resume_id: str) -> List[ATSReport]:
        result = await self.session.execute(
            select(ATSReport)
            .where(ATSReport.resume_id == resume_id)
            .order_by(ATSReport.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_job_description(
        self,
        raw_text: str,
        company_id: Optional[str] = None,
        title: Optional[str] = None,
        parsed_json: Optional[Dict[str, Any]] = None
    ) -> JobDescription:
        jd = JobDescription(
            id=uuid.uuid4(),
            company_id=company_id,
            title=title,
            raw_text=raw_text,
            parsed_json=parsed_json or {}
        )
        self.session.add(jd)
        await self.session.commit()
        await self.session.refresh(jd)
        return jd

    async def get_job_description(self, jd_id: str) -> Optional[JobDescription]:
        result = await self.session.execute(
            select(JobDescription).where(JobDescription.id == jd_id)
        )
        return result.scalar_one_or_none()

from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.db.models import Resume
from app.core.exceptions import EntityNotFoundException

class ResumeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_resume(self, student_id: str, s3_key: str, status: str = "uploaded") -> Resume:
        resume = Resume(
            student_id=student_id,
            s3_key=s3_key,
            status=status
        )
        self.session.add(resume)
        await self.session.commit()
        await self.session.refresh(resume)
        return resume

    async def get_by_id(self, resume_id: str) -> Optional[Resume]:
        stmt = select(Resume).where(Resume.id == resume_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_student_id(self, student_id: str) -> List[Resume]:
        stmt = select(Resume).where(Resume.student_id == student_id).order_by(Resume.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_status(
        self, resume_id: str, status: str, raw_text: Optional[str] = None, parsed_json: Optional[Dict[str, Any]] = None
    ) -> Resume:
        resume = await self.get_by_id(resume_id)
        if not resume:
            raise EntityNotFoundException("Resume", resume_id)
        
        resume.status = status
        if raw_text is not None:
            resume.raw_text = raw_text
        if parsed_json is not None:
            resume.parsed_json = parsed_json

        await self.session.commit()
        await self.session.refresh(resume)
        return resume

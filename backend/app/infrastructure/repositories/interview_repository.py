import uuid
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.db.models import InterviewSession, InterviewQuestion


class InterviewRepository:
    """Repository for interview sessions and per-question Q&A records."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_session(
        self,
        student_id: str,
        job_description_id: str
    ) -> InterviewSession:
        sess = InterviewSession(
            id=uuid.uuid4(),
            student_id=student_id,
            job_description_id=job_description_id,
            status="in_progress",
        )
        self.session.add(sess)
        await self.session.commit()
        await self.session.refresh(sess)
        return sess

    async def get_session(self, session_id: str) -> Optional[InterviewSession]:
        result = await self.session.execute(
            select(InterviewSession).where(InterviewSession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_student_sessions(self, student_id: str) -> List[InterviewSession]:
        result = await self.session.execute(
            select(InterviewSession)
            .where(InterviewSession.student_id == student_id)
            .order_by(InterviewSession.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_session_status(
        self, session_id: str, status: str, overall_feedback: Optional[dict] = None
    ) -> None:
        from datetime import datetime, timezone
        sess = await self.get_session(session_id)
        if sess:
            sess.status = status
            if overall_feedback is not None:
                sess.overall_feedback = overall_feedback
            if status == "completed":
                sess.completed_at = datetime.now(timezone.utc)
            await self.session.commit()

    async def add_question(
        self,
        session_id: str,
        question_text: str,
        sequence: int
    ) -> InterviewQuestion:
        q = InterviewQuestion(
            id=uuid.uuid4(),
            session_id=session_id,
            question_text=question_text,
            sequence=sequence,
        )
        self.session.add(q)
        await self.session.commit()
        await self.session.refresh(q)
        return q

    async def submit_answer(
        self,
        question_id: str,
        answer_text: str,
        score: float,
        feedback: str
    ) -> Optional[InterviewQuestion]:
        result = await self.session.execute(
            select(InterviewQuestion).where(InterviewQuestion.id == question_id)
        )
        q = result.scalar_one_or_none()
        if q:
            q.answer_text = answer_text
            q.score = score
            q.feedback = feedback
            await self.session.commit()
            await self.session.refresh(q)
        return q

    async def get_session_questions(self, session_id: str) -> List[InterviewQuestion]:
        result = await self.session.execute(
            select(InterviewQuestion)
            .where(InterviewQuestion.session_id == session_id)
            .order_by(InterviewQuestion.sequence)
        )
        return list(result.scalars().all())

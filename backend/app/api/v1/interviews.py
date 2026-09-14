from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.interview_repository import InterviewRepository
from app.application.services.interview_service import InterviewService
from app.application.dto.interview import (
    StartInterviewRequestDTO,
    SubmitAnswerRequestDTO,
    InterviewSessionDTO,
    InterviewFeedbackDTO,
)
from app.api.deps import get_current_user, TokenData

router = APIRouter(prefix="/interviews", tags=["Mock Interview Engine"])


def get_interview_service(db: AsyncSession = Depends(get_db)) -> InterviewService:
    return InterviewService(interview_repo=InterviewRepository(session=db))


@router.post(
    "/start",
    response_model=InterviewSessionDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Start a Mock Interview Session",
    description=(
        "Creates a new AI-powered mock interview session for the authenticated student. "
        "Selects a balanced question set from the question bank and returns all questions upfront."
    )
)
async def start_interview(
    dto: StartInterviewRequestDTO,
    current_user: TokenData = Depends(get_current_user),
    service: InterviewService = Depends(get_interview_service)
) -> InterviewSessionDTO:
    return await service.start_session(
        student_id=current_user.user_id,
        dto=dto
    )


@router.post(
    "/answer",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Submit an Answer to a Question",
    description=(
        "Submits a candidate's answer for a specific question in an active session. "
        "The answer is evaluated immediately and a score + feedback is returned."
    )
)
async def submit_answer(
    dto: SubmitAnswerRequestDTO,
    current_user: TokenData = Depends(get_current_user),
    service: InterviewService = Depends(get_interview_service)
):
    result = await service.submit_answer(dto)
    return {
        "question_id": result.question_id,
        "score": result.score,
        "feedback": result.feedback,
        "message": "Answer submitted and evaluated successfully."
    }


@router.post(
    "/{session_id}/complete",
    response_model=InterviewFeedbackDTO,
    status_code=status.HTTP_200_OK,
    summary="Complete Interview Session & Get Feedback",
    description=(
        "Marks the session as completed and returns aggregate feedback: "
        "overall score, strength areas, improvement areas, and per-question evaluation."
    )
)
async def complete_interview(
    session_id: str,
    current_user: TokenData = Depends(get_current_user),
    service: InterviewService = Depends(get_interview_service)
) -> InterviewFeedbackDTO:
    return await service.complete_session(
        session_id=session_id,
        student_id=current_user.user_id
    )


@router.get(
    "/{session_id}",
    response_model=InterviewSessionDTO,
    status_code=status.HTTP_200_OK,
    summary="Get Interview Session Details",
    description="Returns full session details including all questions and submitted answers."
)
async def get_interview_session(
    session_id: str,
    current_user: TokenData = Depends(get_current_user),
    service: InterviewService = Depends(get_interview_service)
) -> InterviewSessionDTO:
    return await service.get_session(
        session_id=session_id,
        student_id=current_user.user_id
    )

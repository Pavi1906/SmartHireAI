from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, TokenData
from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.resume_repository import ResumeRepository
from app.application.services.resume_service import ResumeService
from app.application.dto.resume import (
    ResumeUploadResponseDTO,
    ResumeDetailDTO,
)

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post(
    "",
    response_model=ResumeUploadResponseDTO,
    status_code=status.HTTP_202_ACCEPTED,
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a student's resume and queue asynchronous parsing.
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required.",
        )

    file_size = 0
    file_content = await file.read()
    file_size = len(file_content)

    # Reset stream so ResumeService can read it.
    from io import BytesIO

    file_stream = BytesIO(file_content)

    resume_repo = ResumeRepository(db)
    resume_service = ResumeService(resume_repo)

    try:
        result = await resume_service.upload_and_process_resume(
            student_id=current_user.user_id,
            file_name=file.filename,
            file_stream=file_stream,
            file_size=file_size,
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/active",
    response_model=ResumeDetailDTO,
)
async def get_active_resume(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the student's most recently created (active) resume.
    This endpoint returns only the student's own resume (identity-based security).
    """

    resume_repo = ResumeRepository(db)
    resume_service = ResumeService(resume_repo)

    try:
        # Get latest resume for current student
        # get_latest_resume already queries by student_id internally
        resume = await resume_service.get_latest_resume(str(current_user.user_id))
        return resume

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/{resume_id}",
    response_model=ResumeDetailDTO,
)
async def get_resume(
    resume_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the real resume record from the database.
    """

    resume_repo = ResumeRepository(db)
    resume_service = ResumeService(resume_repo)

    try:
        resume = await resume_service.get_resume_details(resume_id)

        # Security check:
        # A student can only access their own resume.
        if resume.student_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this resume.",
            )

        return resume

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

import uuid
from typing import BinaryIO, List
from app.infrastructure.repositories.resume_repository import ResumeRepository
from app.infrastructure.storage.s3_client import s3_client
from app.workers.celery_app import celery_app
from app.core.exceptions import ValidationException, EntityNotFoundException
from app.application.dto.resume import ResumeUploadResponseDTO, ResumeDetailDTO

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit
ALLOWED_EXTENSIONS = {".pdf"}

class ResumeService:
    def __init__(self, resume_repo: ResumeRepository):
        self.resume_repo = resume_repo

    async def upload_and_process_resume(
        self, student_id: str, file_name: str, file_stream: BinaryIO, file_size: int
    ) -> ResumeUploadResponseDTO:
        # Validate File Size (< 5MB)
        if file_size > MAX_FILE_SIZE_BYTES:
            raise ValidationException(f"File size exceeds 5MB limit ({file_size / (1024*1024):.2f}MB).")

        # Validate File Extension
        ext = file_name[file_name.rfind("."):].lower() if "." in file_name else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise ValidationException(f"Unsupported extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

        resume_id = str(uuid.uuid4())
        s3_key = f"resumes/{student_id}/{resume_id}_{file_name}"

        # Store File Bytes to Object Storage
        await s3_client.upload_file(file_stream, s3_key)

        # Create Database Record with status 'UPLOADED'
        resume = await self.resume_repo.create_resume(
            student_id=student_id,
            s3_key=s3_key,
            status="UPLOADED"
        )

        # Enqueue Asynchronous Celery Parsing Job
        task = celery_app.send_task(
            "tasks.parse_resume_task",
            args=[str(resume.id), s3_key, student_id]
        )

        # Update DB Status to 'PARSING'
        await self.resume_repo.update_status(str(resume.id), status="PARSING")

        return ResumeUploadResponseDTO(
            resume_id=str(resume.id),
            s3_key=s3_key,
            status="PARSING",
            task_id=task.id,
            message="Resume uploaded successfully. Asynchronous parsing queued."
        )

    async def get_resume_details(self, resume_id: str) -> ResumeDetailDTO:
        resume = await self.resume_repo.get_by_id(resume_id)
        if not resume:
            raise EntityNotFoundException("Resume", resume_id)

        return ResumeDetailDTO(
            resume_id=str(resume.id),
            student_id=str(resume.student_id),
            s3_key=resume.s3_key,
            status=resume.status,
            parsed_json=resume.parsed_json,
            created_at=resume.created_at
        )

    async def list_student_resumes(self, student_id: str) -> List[ResumeDetailDTO]:
        resumes = await self.resume_repo.get_by_student_id(student_id)
        return [
            ResumeDetailDTO(
                resume_id=str(r.id),
                student_id=str(r.student_id),
                s3_key=r.s3_key,
                status=r.status,
                parsed_json=r.parsed_json,
                created_at=r.created_at
            ) for r in resumes
        ]

    async def get_latest_resume(self, student_id: str) -> ResumeDetailDTO:
        """
        Get the most recently created resume for a student (active/current resume).
        Returns None if student has no resumes.
        """
        resumes = await self.resume_repo.get_by_student_id(student_id)
        if not resumes:
            raise EntityNotFoundException("Resume", f"No resumes found for student {student_id}")
        
        # resumes are already ordered by created_at DESC from the repository
        latest = resumes[0]
        return ResumeDetailDTO(
            resume_id=str(latest.id),
            student_id=str(latest.student_id),
            s3_key=latest.s3_key,
            status=latest.status,
            parsed_json=latest.parsed_json,
            created_at=latest.created_at
        )

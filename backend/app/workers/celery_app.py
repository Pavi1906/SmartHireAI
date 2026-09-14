from celery import Celery
from app.core.config import settings
from app.infrastructure.storage.s3_client import s3_client
from app.infrastructure.db.session import create_task_session_factory
from app.infrastructure.repositories.resume_repository import ResumeRepository
from app.application.services.resume_parser import parse_resume_text

celery_app = Celery(
    "smarthireai_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
)


@celery_app.task(name="tasks.parse_resume_task")
def parse_resume_task(resume_id: str, s3_key: str, user_id: str):
    """
    Extract text from the uploaded resume PDF and store
    the result in the Resume database record.
    """

    import asyncio
    from io import BytesIO
    from pypdf import PdfReader

    async def process():
        task_engine, TaskSessionLocal = create_task_session_factory()

        try:
            try:
                # 1. Read uploaded file from local storage
                file_bytes = await s3_client.get_file_bytes(s3_key)

                # 2. Extract text from PDF
                reader = PdfReader(BytesIO(file_bytes))

                pages_text = []

                for page in reader.pages:
                    text = page.extract_text() or ""
                    pages_text.append(text)

                raw_text = "\n\n".join(pages_text).strip()

                # 3. Extract structured resume information
                structured_data = parse_resume_text(raw_text)

                parsed_json = {
                    "file_type": "pdf",
                    "page_count": len(reader.pages),
                    "text_length": len(raw_text),
                    **structured_data,
                }

                # 4. Save parsed information with the task-owned engine.
                async with TaskSessionLocal() as session:
                    repo = ResumeRepository(session)

                    await repo.update_status(
                        resume_id,
                        status="PARSED",
                        raw_text=raw_text,
                        parsed_json=parsed_json,
                    )

                    await session.commit()

                return {
                    "resume_id": resume_id,
                    "status": "parsed",
                    "page_count": len(reader.pages),
                    "text_length": len(raw_text),
                }

            except Exception as exc:

                # Try to mark the resume as failed using the same task-owned engine.
                try:
                    async with TaskSessionLocal() as session:
                        repo = ResumeRepository(session)

                        await repo.update_status(
                            resume_id,
                            status="FAILED",
                            parsed_json={
                                "error": str(exc),
                            },
                        )

                        await session.commit()

                except Exception:
                    pass

                raise

        finally:
            await task_engine.dispose()

    return asyncio.run(process())

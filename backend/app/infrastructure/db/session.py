from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

def create_database_engine():
    return create_async_engine(
        settings.ASYNC_DATABASE_URI,
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        connect_args=settings.ASYNC_DATABASE_CONNECT_ARGS,
    )


def create_session_factory(database_engine):
    return async_sessionmaker(
        bind=database_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


engine = create_database_engine()
AsyncSessionLocal = create_session_factory(engine)


def create_task_session_factory():
    """Create a task-owned engine and session factory inside the task event loop."""
    task_engine = create_database_engine()
    return task_engine, create_session_factory(task_engine)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

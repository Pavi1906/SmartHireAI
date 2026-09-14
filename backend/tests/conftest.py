import os
import uuid
import asyncio
import pytest
from typing import AsyncGenerator
from sqlalchemy import TypeDecorator, String as SAString, JSON as SAJSON
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID

from app.infrastructure.db.models import Base
from app.infrastructure.db.session import get_db
import app.infrastructure.db.session as db_session
from app.main import app

# Ensure SQLite compiler compatibility with PostgreSQL custom types
@compiles(JSONB, 'sqlite')
def compile_jsonb_sqlite(type_, compiler, **kw):
    return 'JSON'

@compiles(PGUUID, 'sqlite')
def compile_uuid_sqlite(type_, compiler, **kw):
    return 'VARCHAR(36)'

_orig_bind = PGUUID.bind_processor
_orig_result = PGUUID.result_processor

def custom_bind_processor(self, dialect):
    if dialect.name == 'sqlite':
        def process(value):
            if value is None:
                return None
            return str(value)
        return process
    return _orig_bind(self, dialect)

def custom_result_processor(self, dialect, coltype):
    if dialect.name == 'sqlite':
        def process(value):
            if value is None:
                return None
            if isinstance(value, uuid.UUID):
                return value
            return uuid.UUID(str(value))
        return process
    return _orig_result(self, dialect, coltype)

PGUUID.bind_processor = custom_bind_processor
PGUUID.result_processor = custom_result_processor

# Create isolated SQLite test engine
TEST_DB_FILE = os.path.join(os.path.dirname(__file__), "test_database.db")
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Patch global db_session so background tasks / services using AsyncSessionLocal use test engine
db_session.engine = test_engine
db_session.AsyncSessionLocal = TestingSessionLocal

def pytest_sessionstart(session):
    """Synchronously create all tables before tests run."""
    async def init_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
    
    asyncio.run(init_tables())

def pytest_sessionfinish(session, exitstatus):
    """Clean up tables and sqlite db file after tests finish."""
    async def cleanup_tables():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await test_engine.dispose()
    
    asyncio.run(cleanup_tables())
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency override providing isolated async test DB session."""
    async with TestingSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

from unittest.mock import MagicMock
from app.workers.celery_app import celery_app

# Mock celery task dispatch for offline testing
def mock_send_task(name, args=None, kwargs=None, **opts):
    mock_task = MagicMock()
    mock_task.id = f"test-task-{uuid.uuid4()}"
    return mock_task

celery_app.send_task = mock_send_task

app.dependency_overrides[get_db] = override_get_db

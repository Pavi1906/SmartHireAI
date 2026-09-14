import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from alembic import command
from alembic.config import Config

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import BaseDomainException, domain_exception_handler, global_exception_handler
from app.infrastructure.cache.redis import redis_cache
from app.api.v1.routes import health, auth
from app.api.v1 import (
    resumes, ats, placement, interviews,
    recruiter, company, jobs, candidates, applications,
    matching, campaigns, recruiter_interviews, offers,
    recruiter_reports, recruiter_settings, recruiter_notifications
)


def run_database_migrations() -> None:
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SmartHireAI Backend Services...")
    try:
        run_database_migrations()
    except Exception as exc:  # pragma: no cover - defensive to keep app booting for local dev
        logger.warning(f"Database migration skipped during startup: {exc}")
    await redis_cache.connect()
    yield
    logger.info("Shutting down SmartHireAI Backend Services...")
    await redis_cache.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Setup
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Request ID & Audit Middleware
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time_ms = (time.time() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time_ms:.2f}ms"
    
    logger.info(
        f"{request.method} {request.url.path} -> {response.status_code} ({process_time_ms:.2f}ms)",
        extra={"request_id": request_id}
    )
    return response

# Exception Handlers
app.add_exception_handler(BaseDomainException, domain_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Register Routers (Student + Shared)
app.include_router(health.router)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(ats.router, prefix=settings.API_V1_STR)
app.include_router(placement.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)

# Register Routers (Recruiter Domain)
app.include_router(recruiter.router, prefix=settings.API_V1_STR)
app.include_router(company.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(candidates.router, prefix=settings.API_V1_STR)
app.include_router(applications.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(campaigns.router, prefix=settings.API_V1_STR)
app.include_router(recruiter_interviews.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
app.include_router(recruiter_reports.router, prefix=settings.API_V1_STR)
app.include_router(recruiter_settings.router, prefix=settings.API_V1_STR)
app.include_router(recruiter_notifications.router, prefix=settings.API_V1_STR)


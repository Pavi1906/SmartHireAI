from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.entities.health import ServiceHealthStatus
from app.infrastructure.repositories.health_repository import HealthRepository
from app.core.config import settings

class HealthService:
    """Application use-case service orchestrating health domain logic."""
    def __init__(self, health_repo: HealthRepository):
        self.health_repo = health_repo

    async def get_health(self, db_session: AsyncSession) -> ServiceHealthStatus:
        db_healthy = await self.health_repo.check_database(db_session)
        redis_healthy = await self.health_repo.check_redis()

        deps = {
            "postgres": db_healthy,
            "redis": redis_healthy
        }

        is_all_ok = all(deps.values())

        return ServiceHealthStatus(
            service_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            status="healthy" if is_all_ok else "degraded",
            timestamp=datetime.now(timezone.utc),
            dependencies=deps
        )

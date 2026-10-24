from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.infrastructure.cache.redis import redis_cache
from app.core.logging import logger

class HealthRepository:
    """Infrastructure repository to verify physical database and Redis connectivity."""

    async def check_database(self, session: AsyncSession) -> bool:
        try:
            result = await session.execute(text("SELECT 1"))
            return result.scalar() == 1
        except Exception as e:
            logger.error(f"Database readiness check failed: {e}")
            return False

    async def check_redis(self) -> bool:
        return await redis_cache.ping()

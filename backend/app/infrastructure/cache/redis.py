from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings
from app.core.logging import logger

class RedisCache:
    """Enterprise async Redis client connection manager."""
    def __init__(self):
        self.client: Optional[aioredis.Redis] = None

    async def connect(self):
        try:
            self.client = aioredis.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}",
                encoding="utf-8",
                decode_responses=True
            )
            await self.client.ping()
            logger.info("Connected to Redis cache pool successfully.")
        except Exception as e:
            logger.warning(f"Redis cache connection failed: {e}. Running without Redis cache.")
            self.client = None

    async def disconnect(self):
        if self.client:
            await self.client.close()
            logger.info("Closed Redis connection pool.")

    async def get(self, key: str) -> Optional[str]:
        if not self.client:
            return None
        return await self.client.get(key)

    async def set(self, key: str, value: str, ttl_seconds: int = 3600):
        if self.client:
            await self.client.set(key, value, ex=ttl_seconds)

    async def ping(self) -> bool:
        if not self.client:
            return False
        try:
            return await self.client.ping()
        except Exception:
            return False

redis_cache = RedisCache()

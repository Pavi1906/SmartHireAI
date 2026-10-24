import pytest
from app.infrastructure.repositories.health_repository import HealthRepository

@pytest.mark.asyncio
async def test_health_repository_checks():
    repo = HealthRepository()
    # Mocking check behavior when DB session is none
    redis_check = await repo.check_redis()
    assert isinstance(redis_check, bool)

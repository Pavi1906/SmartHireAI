import pytest
from unittest.mock import AsyncMock
from app.application.services.health_service import HealthService
from app.infrastructure.repositories.health_repository import HealthRepository

@pytest.mark.asyncio
async def test_health_service_all_dependencies_healthy():
    mock_repo = AsyncMock(spec=HealthRepository)
    mock_repo.check_database.return_value = True
    mock_repo.check_redis.return_value = True

    service = HealthService(health_repo=mock_repo)
    status = await service.get_health(db_session=AsyncMock())

    assert status.status == "healthy"
    assert status.dependencies["postgres"] is True
    assert status.dependencies["redis"] is True

@pytest.mark.asyncio
async def test_health_service_degraded_when_db_down():
    mock_repo = AsyncMock(spec=HealthRepository)
    mock_repo.check_database.return_value = False
    mock_repo.check_redis.return_value = True

    service = HealthService(health_repo=mock_repo)
    status = await service.get_health(db_session=AsyncMock())

    assert status.status == "degraded"
    assert status.dependencies["postgres"] is False
    assert status.dependencies["redis"] is True

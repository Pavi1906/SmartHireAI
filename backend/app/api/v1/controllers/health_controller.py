from sqlalchemy.ext.asyncio import AsyncSession
from app.application.services.health_service import HealthService
from app.application.dto.health import HealthCheckDTO

class HealthController:
    """Presentation Layer controller mapping domain health status to DTO."""
    def __init__(self, health_service: HealthService):
        self.health_service = health_service

    async def get_health_status(self, db_session: AsyncSession) -> HealthCheckDTO:
        domain_status = await self.health_service.get_health(db_session)
        return HealthCheckDTO(
            service=domain_status.service_name,
            version=domain_status.version,
            status=domain_status.status,
            timestamp=domain_status.timestamp,
            dependencies=domain_status.dependencies
        )

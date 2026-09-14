from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.health_repository import HealthRepository
from app.application.services.health_service import HealthService
from app.api.v1.controllers.health_controller import HealthController
from app.application.dto.health import HealthCheckDTO

router = APIRouter(tags=["Health Checks"])

def get_health_controller() -> HealthController:
    repo = HealthRepository()
    service = HealthService(health_repo=repo)
    return HealthController(health_service=service)

@router.get("/health", response_model=HealthCheckDTO, status_code=status.HTTP_200_OK)
async def health_check(
    db: AsyncSession = Depends(get_db),
    controller: HealthController = Depends(get_health_controller)
):
    """Liveness & Readiness probe returning platform health status and dependency checks."""
    return await controller.get_health_status(db)

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.db.session import get_db
from app.infrastructure.repositories.user_repository import UserRepository, RefreshTokenRepository
from app.application.services.auth_service import AuthService
from app.api.v1.controllers.auth_controller import AuthController
from app.application.dto.auth import (
    StudentRegisterDTO, RecruiterRegisterDTO,
    StudentLoginDTO, RecruiterLoginDTO, AdminLoginDTO,
    RefreshTokenRequestDTO, TokenResponseDTO
)

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

def get_auth_controller(db: AsyncSession = Depends(get_db)) -> AuthController:
    user_repo = UserRepository(session=db)
    refresh_repo = RefreshTokenRepository(session=db)
    auth_service = AuthService(user_repo=user_repo, refresh_repo=refresh_repo)
    return AuthController(auth_service=auth_service)

@router.post("/student/register", response_model=TokenResponseDTO, status_code=status.HTTP_201_CREATED)
async def register_student(
    dto: StudentRegisterDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Independent Student Registration endpoint issuing Student-scoped JWT tokens."""
    return await controller.register_student(dto)

@router.post("/student/login", response_model=TokenResponseDTO, status_code=status.HTTP_200_OK)
async def login_student(
    dto: StudentLoginDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Independent Student Login endpoint validating immutable Student role."""
    return await controller.login_student(dto)

@router.post("/recruiter/register", response_model=TokenResponseDTO, status_code=status.HTTP_201_CREATED)
async def register_recruiter(
    dto: RecruiterRegisterDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Independent Recruiter Registration endpoint issuing Recruiter-scoped JWT tokens."""
    return await controller.register_recruiter(dto)

@router.post("/recruiter/login", response_model=TokenResponseDTO, status_code=status.HTTP_200_OK)
async def login_recruiter(
    dto: RecruiterLoginDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Independent Recruiter Login endpoint validating immutable Recruiter role."""
    return await controller.login_recruiter(dto)

@router.post("/admin/login", response_model=TokenResponseDTO, status_code=status.HTTP_200_OK)
async def login_admin(
    dto: AdminLoginDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Independent Admin Login endpoint for platform system administrators."""
    return await controller.login_admin(dto)

@router.post("/refresh", response_model=TokenResponseDTO, status_code=status.HTTP_200_OK)
async def refresh_token(
    dto: RefreshTokenRequestDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Rotates Refresh Token and issues fresh Access Token."""
    return await controller.refresh_tokens(dto)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    dto: RefreshTokenRequestDTO,
    controller: AuthController = Depends(get_auth_controller)
):
    """Revokes Refresh Token in database blacklist store."""
    return await controller.logout(dto)

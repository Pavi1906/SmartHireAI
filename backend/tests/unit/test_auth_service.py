import pytest
from unittest.mock import AsyncMock
from app.application.services.auth_service import AuthService
from app.infrastructure.repositories.user_repository import UserRepository, RefreshTokenRepository
from app.application.dto.auth import StudentLoginDTO
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.infrastructure.db.models import User, UserRole
from app.core.security import get_password_hash

@pytest.mark.asyncio
async def test_student_login_fails_for_recruiter_role():
    mock_user_repo = AsyncMock(spec=UserRepository)
    mock_refresh_repo = AsyncMock(spec=RefreshTokenRepository)

    # Recruiter account trying to log into student portal
    recruiter_user = User(
        id="user-123",
        email="recruiter@company.com",
        hashed_password=get_password_hash("Pass1234"),
        role=UserRole.RECRUITER
    )
    mock_user_repo.get_by_email.return_value = recruiter_user

    service = AuthService(user_repo=mock_user_repo, refresh_repo=mock_refresh_repo)

    with pytest.raises(ForbiddenException) as exc_info:
        await service.login_student(StudentLoginDTO(email="recruiter@company.com", password="Pass1234"))

    assert "cannot log in via Student Portal" in str(exc_info.value.message)

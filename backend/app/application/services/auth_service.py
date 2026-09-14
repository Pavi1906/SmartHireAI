from datetime import datetime, timedelta, timezone
from app.infrastructure.repositories.user_repository import UserRepository, RefreshTokenRepository
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import ValidationException, UnauthorizedException, ForbiddenException
from app.core.config import settings
from app.application.dto.auth import (
    StudentRegisterDTO, RecruiterRegisterDTO, AdminRegisterDTO,
    StudentLoginDTO, RecruiterLoginDTO, AdminLoginDTO,
    TokenResponseDTO
)
from app.infrastructure.db.models import UserRole

class AuthService:
    def __init__(self, user_repo: UserRepository, refresh_repo: RefreshTokenRepository):
        self.user_repo = user_repo
        self.refresh_repo = refresh_repo

    async def register_student(self, dto: StudentRegisterDTO) -> TokenResponseDTO:
        existing = await self.user_repo.get_by_email(dto.email)
        if existing:
            raise ValidationException("An account with this email address already exists.")

        hashed_pw = get_password_hash(dto.password)
        user = await self.user_repo.create_student(
            email=dto.email,
            hashed_password=hashed_pw,
            full_name=dto.full_name,
            college=dto.college,
            graduation_year=dto.graduation_year,
            branch=dto.branch,
            phone_number=dto.phone_number
        )
        return await self._generate_tokens(user.id, user.role.value)

    async def login_student(self, dto: StudentLoginDTO) -> TokenResponseDTO:
        user = await self.user_repo.get_by_email(dto.email)
        if not user or not verify_password(dto.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")
        
        if user.role != UserRole.STUDENT:
            raise ForbiddenException(f"Account role '{user.role.value}' cannot log in via Student Portal.")

        return await self._generate_tokens(user.id, user.role.value)

    async def register_recruiter(self, dto: RecruiterRegisterDTO) -> TokenResponseDTO:
        existing = await self.user_repo.get_by_email(dto.email)
        if existing:
            raise ValidationException("An account with this email address already exists.")

        hashed_pw = get_password_hash(dto.password)
        user = await self.user_repo.create_recruiter(
            email=dto.email,
            hashed_password=hashed_pw,
            company_name=dto.company_name,
            full_name=dto.full_name,
            designation=dto.designation
        )
        return await self._generate_tokens(user.id, user.role.value)

    async def login_recruiter(self, dto: RecruiterLoginDTO) -> TokenResponseDTO:
        user = await self.user_repo.get_by_email(dto.email)
        if not user or not verify_password(dto.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")
        
        if user.role != UserRole.RECRUITER:
            raise ForbiddenException(f"Account role '{user.role.value}' cannot log in via Recruiter Portal.")

        return await self._generate_tokens(user.id, user.role.value)

    async def login_admin(self, dto: AdminLoginDTO) -> TokenResponseDTO:
        user = await self.user_repo.get_by_email(dto.email)
        if not user or not verify_password(dto.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")
        
        if user.role != UserRole.ADMIN:
            raise ForbiddenException("Access denied: Admin credentials required.")

        return await self._generate_tokens(user.id, user.role.value)

    async def refresh_tokens(self, refresh_token: str) -> TokenResponseDTO:
        is_valid = await self.refresh_repo.is_valid(refresh_token)
        if not is_valid:
            raise UnauthorizedException("Refresh token is invalid, expired, or revoked.")

        payload = decode_token(refresh_token)
        user_id = payload.get("sub")
        
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("Associated user account is disabled or missing.")

        # Revoke old refresh token & issue new rotated tokens
        await self.refresh_repo.revoke_token(refresh_token)
        return await self._generate_tokens(user.id, user.role.value)

    async def logout(self, refresh_token: str):
        await self.refresh_repo.revoke_token(refresh_token)

    async def _generate_tokens(self, user_id: str, role: str) -> TokenResponseDTO:
        access_token = create_access_token(subject=user_id, role=role)
        refresh_token = create_refresh_token(subject=user_id)

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.refresh_repo.save_token(user_id=user_id, refresh_token=refresh_token, expires_at=expires_at)

        return TokenResponseDTO(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            role=role,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

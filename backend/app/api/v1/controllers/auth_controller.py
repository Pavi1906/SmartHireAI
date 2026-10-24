from app.application.services.auth_service import AuthService
from app.application.dto.auth import (
    StudentRegisterDTO, RecruiterRegisterDTO, AdminRegisterDTO,
    StudentLoginDTO, RecruiterLoginDTO, AdminLoginDTO,
    RefreshTokenRequestDTO, TokenResponseDTO
)

class AuthController:
    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service

    async def register_student(self, dto: StudentRegisterDTO) -> TokenResponseDTO:
        return await self.auth_service.register_student(dto)

    async def login_student(self, dto: StudentLoginDTO) -> TokenResponseDTO:
        return await self.auth_service.login_student(dto)

    async def register_recruiter(self, dto: RecruiterRegisterDTO) -> TokenResponseDTO:
        return await self.auth_service.register_recruiter(dto)

    async def login_recruiter(self, dto: RecruiterLoginDTO) -> TokenResponseDTO:
        return await self.auth_service.login_recruiter(dto)

    async def login_admin(self, dto: AdminLoginDTO) -> TokenResponseDTO:
        return await self.auth_service.login_admin(dto)

    async def refresh_tokens(self, dto: RefreshTokenRequestDTO) -> TokenResponseDTO:
        return await self.auth_service.refresh_tokens(dto.refresh_token)

    async def logout(self, dto: RefreshTokenRequestDTO) -> dict:
        await self.auth_service.logout(dto.refresh_token)
        return {"success": True, "message": "Successfully logged out and revoked refresh token."}

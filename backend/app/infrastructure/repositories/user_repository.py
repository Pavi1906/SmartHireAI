from typing import Optional
import hashlib
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.infrastructure.db.models import User, Student, Recruiter, Company, RefreshToken, UserRole
from app.core.exceptions import EntityNotFoundException, ValidationException

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower())
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, user_id: str) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create_student(
        self, email: str, hashed_password: str, full_name: str, college: str, graduation_year: int, branch: str, phone_number: Optional[str]
    ) -> User:
        user = User(
            email=email.lower(),
            hashed_password=hashed_password,
            role=UserRole.STUDENT
        )
        self.session.add(user)
        await self.session.flush()

        student = Student(
            id=user.id,
            full_name=full_name,
            college=college,
            graduation_year=graduation_year,
            branch=branch,
            phone_number=phone_number
        )
        self.session.add(student)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def create_recruiter(
        self, email: str, hashed_password: str, company_name: str, full_name: str, designation: str
    ) -> User:
        # Resolve or create Company
        stmt = select(Company).where(Company.name == company_name)
        result = await self.session.execute(stmt)
        company = result.scalars().first()
        if not company:
            company = Company(name=company_name)
            self.session.add(company)
            await self.session.flush()

        user = User(
            email=email.lower(),
            hashed_password=hashed_password,
            role=UserRole.RECRUITER
        )
        self.session.add(user)
        await self.session.flush()

        recruiter = Recruiter(
            id=user.id,
            company_id=company.id,
            full_name=full_name,
            designation=designation,
            work_email=email.lower()
        )
        self.session.add(recruiter)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def create_admin(self, email: str, hashed_password: str) -> User:
        user = User(
            email=email.lower(),
            hashed_password=hashed_password,
            role=UserRole.ADMIN
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

class RefreshTokenRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    async def save_token(self, user_id: str, refresh_token: str, expires_at: datetime):
        token_hash = self._hash_token(refresh_token)
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await self.session.execute(stmt)
        existing = result.scalars().first()

        if existing:
            existing.user_id = user_id
            existing.expires_at = expires_at
            existing.is_revoked = False
            await self.session.commit()
            return

        entry = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_revoked=False
        )
        self.session.add(entry)
        await self.session.commit()

    async def is_valid(self, refresh_token: str) -> bool:
        token_hash = self._hash_token(refresh_token)
        stmt = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at > datetime.now(timezone.utc)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first() is not None

    async def revoke_token(self, refresh_token: str):
        token_hash = self._hash_token(refresh_token)
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await self.session.execute(stmt)
        token_obj = result.scalars().first()
        if token_obj:
            token_obj.is_revoked = True
            await self.session.commit()

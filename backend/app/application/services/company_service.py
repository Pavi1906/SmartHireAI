from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.infrastructure.db.models import Company, Recruiter, User
from app.application.dto.recruiter_dto import CompanyResponse, CompanyUpdate, RecruiterProfileResponse, RecruiterProfileUpdate

class CompanyService:
    @staticmethod
    async def get_company_by_id(db: AsyncSession, company_id: str) -> Optional[Company]:
        result = await db.execute(select(Company).where(Company.id == company_id))
        return result.scalars().first()

    @staticmethod
    async def update_company(db: AsyncSession, company_id: str, dto: CompanyUpdate) -> Company:
        company = await CompanyService.get_company_by_id(db, company_id)
        if not company:
            raise ValueError(f"Company {company_id} not found")

        if dto.name is not None:
            company.name = dto.name
        if dto.industry is not None:
            company.industry = dto.industry
        if dto.website is not None:
            company.website = dto.website

        await db.commit()
        await db.refresh(company)
        return company

    @staticmethod
    async def get_recruiter_profile(db: AsyncSession, recruiter_id: str) -> RecruiterProfileResponse:
        result = await db.execute(
            select(Recruiter, Company)
            .join(Company, Recruiter.company_id == Company.id)
            .where(Recruiter.id == recruiter_id)
        )
        row = result.first()
        if not row:
            raise ValueError("Recruiter profile not found")

        recruiter, company = row
        return RecruiterProfileResponse(
            id=str(recruiter.id),
            company_id=str(recruiter.company_id),
            full_name=recruiter.full_name,
            work_email=recruiter.work_email,
            designation=recruiter.designation,
            company_name=company.name
        )

    @staticmethod
    async def update_recruiter_profile(db: AsyncSession, recruiter_id: str, dto: RecruiterProfileUpdate) -> RecruiterProfileResponse:
        result = await db.execute(select(Recruiter).where(Recruiter.id == recruiter_id))
        recruiter = result.scalars().first()
        if not recruiter:
            raise ValueError("Recruiter profile not found")

        if dto.full_name is not None:
            recruiter.full_name = dto.full_name
        if dto.designation is not None:
            recruiter.designation = dto.designation

        await db.commit()
        return await CompanyService.get_recruiter_profile(db, recruiter_id)

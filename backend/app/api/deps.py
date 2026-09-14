from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from pydantic import BaseModel

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_token
from app.infrastructure.db.session import get_db
from app.infrastructure.db.models import Student


bearer_scheme = HTTPBearer()


class TokenData(BaseModel):
    user_id: str
    role: str


class RecruiterContext(BaseModel):
    user_id: str
    recruiter_id: str
    company_id: str
    role: str
    full_name: str
    work_email: str
    designation: str


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials

        payload = decode_token(token)

        user_id: str = payload.get("sub")
        role: str = payload.get("role")

        if user_id is None or role is None:
            raise credentials_exception

        return TokenData(user_id=user_id, role=role)

    except (jwt.exceptions.PyJWTError, Exception):
        raise credentials_exception


def require_role(required_role: str):
    def role_checker(current_user: TokenData = Depends(get_current_user)):
        if (
            current_user.role.lower() != required_role.lower()
            and current_user.role.lower() != "admin"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"User role '{current_user.role}' "
                    f"lacks '{required_role}' authorization."
                ),
            )

        return current_user

    return role_checker


async def get_current_recruiter(
    token_data: TokenData = Depends(require_role("RECRUITER")),
    db: AsyncSession = Depends(get_db)
) -> RecruiterContext:
    from sqlalchemy.future import select
    from app.infrastructure.db.models import Recruiter

    result = await db.execute(
        select(Recruiter).where(Recruiter.id == token_data.user_id)
    )
    recruiter = result.scalars().first()

    if not recruiter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recruiter profile not found for authenticated user."
        )

    return RecruiterContext(
        user_id=str(recruiter.id),
        recruiter_id=str(recruiter.id),
        company_id=str(recruiter.company_id),
        role=token_data.role,
        full_name=recruiter.full_name,
        work_email=recruiter.work_email,
        designation=recruiter.designation
    )

async def get_current_student(
    token_data: TokenData = Depends(require_role("STUDENT")),
    db: AsyncSession = Depends(get_db)
) -> Student:
    from sqlalchemy.future import select
    from app.infrastructure.db.models import Student

    result = await db.execute(
        select(Student).where(Student.id == token_data.user_id)
    )
    student = result.scalars().first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found for authenticated user."
        )
    return student

# Optional context model for convenience
class StudentContext(BaseModel):
    user_id: str
    student_id: str
    role: str

async def get_student_context(
    student: Student = Depends(get_current_student)
) -> StudentContext:
    return StudentContext(
        user_id=str(student.id),
        student_id=str(student.id),
        role="STUDENT"
    )

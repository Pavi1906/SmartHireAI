from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

class StudentRegisterDTO(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, json_schema_extra={"example": "StrongPass123!"})
    full_name: str = Field(..., min_length=2, json_schema_extra={"example": "Alex Rivera"})
    college: str = Field(..., json_schema_extra={"example": "Stanford University"})
    graduation_year: int = Field(..., json_schema_extra={"example": 2026})
    branch: str = Field(..., json_schema_extra={"example": "Computer Science & Engineering"})
    phone_number: Optional[str] = Field(None, json_schema_extra={"example": "+1-555-0199"})

    @field_validator("password")
    @classmethod
    def validate_strong_password(cls, v: str) -> str:
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit.")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        return v

class RecruiterRegisterDTO(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    company_name: str = Field(..., json_schema_extra={"example": "Google LLC"})
    full_name: str = Field(..., json_schema_extra={"example": "Sarah Jenkins"})
    designation: str = Field(..., json_schema_extra={"example": "Technical Recruiter"})

    @field_validator("password")
    @classmethod
    def validate_strong_password(cls, v: str) -> str:
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit.")
        return v

class AdminRegisterDTO(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=12)
    admin_secret_key: str

class StudentLoginDTO(BaseModel):
    email: EmailStr
    password: str

class RecruiterLoginDTO(BaseModel):
    email: EmailStr
    password: str

class AdminLoginDTO(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequestDTO(BaseModel):
    refresh_token: str

class TokenResponseDTO(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    role: str
    expires_in: int = 900  # 15 minutes

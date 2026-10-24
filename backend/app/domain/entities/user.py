from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class UserEntity:
    id: str
    email: str
    hashed_password: str
    role: str
    is_active: bool
    created_at: datetime

    def validate_role(self, expected_role: str):
        if self.role.upper() != expected_role.upper():
            raise ValueError(f"User role '{self.role}' is immutable and cannot act as '{expected_role}'.")

@dataclass
class StudentProfileEntity:
    user_id: str
    full_name: str
    college: str
    graduation_year: int
    branch: str
    phone_number: Optional[str] = None

@dataclass
class RecruiterProfileEntity:
    user_id: str
    company_id: str
    full_name: str
    designation: str
    work_email: str

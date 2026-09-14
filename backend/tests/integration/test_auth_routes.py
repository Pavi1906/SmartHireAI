import pytest
from app.application.dto.auth import StudentRegisterDTO

@pytest.mark.asyncio
async def test_student_register_dto_validation():
    # Invalid password without uppercase
    with pytest.raises(ValueError):
        StudentRegisterDTO(
            email="student@university.edu",
            password="weakpassword123",
            full_name="Student Test",
            college="MIT",
            graduation_year=2026,
            branch="CS"
        )

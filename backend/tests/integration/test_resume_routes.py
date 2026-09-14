import io
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from pypdf import PdfWriter, PdfReader
from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject

from app.main import app
from app.core.security import create_access_token
from app.application.services.resume_parser import parse_resume_text
from app.workers.celery_app import parse_resume_task

@pytest.fixture
def anyio_backend():
    return 'asyncio'

def create_valid_pdf_bytes(text_lines: list[str]) -> bytes:
    """Generate a real valid PDF binary with embedded text stream."""
    writer = PdfWriter()
    page = writer.add_blank_page(width=300, height=300)

    stream_content = []
    y_pos = 250
    for line in text_lines:
        stream_content.append(f"BT /F1 12 Tf 50 {y_pos} Td ({line}) Tj ET")
        y_pos -= 20

    content = DecodedStreamObject()
    content.set_data(" ".join(stream_content).encode("latin-1"))
    page[NameObject('/Contents')] = writer._add_object(content)

    fonts = DictionaryObject()
    f1 = DictionaryObject()
    f1[NameObject('/Type')] = NameObject('/Font')
    f1[NameObject('/Subtype')] = NameObject('/Type1')
    f1[NameObject('/BaseFont')] = NameObject('/Helvetica')
    fonts[NameObject('/F1')] = f1

    resources = DictionaryObject()
    resources[NameObject('/Font')] = fonts
    page[NameObject('/Resources')] = resources

    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


@pytest.mark.anyio
async def test_resume_upload_and_student_ownership():
    student_a_id = str(uuid.uuid4())
    student_b_id = str(uuid.uuid4())

    token_a = create_access_token(subject=student_a_id, role="STUDENT")
    token_b = create_access_token(subject=student_b_id, role="STUDENT")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    pdf_bytes = create_valid_pdf_bytes(["Jane Developer", "Skills: Python, FastAPI, Docker, SQL, PostgreSQL"])

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Unauthenticated upload fails with 401
        res_unauth = await ac.post("/api/v1/resumes", files={"file": ("resume.pdf", pdf_bytes, "application/pdf")})
        assert res_unauth.status_code == 401

        # 2. Authenticated student A uploads real PDF resume -> 202 Accepted & returns resume_id
        res_upload = await ac.post(
            "/api/v1/resumes",
            files={"file": ("jane_developer_resume.pdf", pdf_bytes, "application/pdf")},
            headers=headers_a
        )
        assert res_upload.status_code == 202
        upload_data = res_upload.json()
        assert "resume_id" in upload_data
        resume_id = upload_data["resume_id"]
        assert upload_data["status"] in ["UPLOADED", "PARSING"]

        # 3. Owner (Student A) can retrieve their resume
        res_get_a = await ac.get(f"/api/v1/resumes/{resume_id}", headers=headers_a)
        assert res_get_a.status_code == 200
        resume_detail = res_get_a.json()
        assert resume_detail["resume_id"] == resume_id
        assert resume_detail["student_id"] == student_a_id

        # 4. Another student (Student B) receives 403 Forbidden for Student A's resume
        res_get_b = await ac.get(f"/api/v1/resumes/{resume_id}", headers=headers_b)
        assert res_get_b.status_code == 403
        assert "not authorized" in res_get_b.json()["detail"].lower()

        # 5. Non-existent resume returns 404
        non_existent_id = str(uuid.uuid4())
        res_get_missing = await ac.get(f"/api/v1/resumes/{non_existent_id}", headers=headers_a)
        assert res_get_missing.status_code == 404


@pytest.mark.anyio
async def test_real_pdf_text_extraction_and_parsing():
    """Verify backend accurately extracts text from a real valid PDF fixture and parses structured fields."""
    sample_text_lines = [
        "Alex Rivera",
        "Email: alex.rivera@example.com",
        "Skills: Python, FastAPI, Docker, Kubernetes, React.js",
        "Experience: Senior Software Engineer at AI Tech",
        "Education: Bachelor of Science in Computer Science"
    ]
    pdf_bytes = create_valid_pdf_bytes(sample_text_lines)

    # 1. Verify PdfReader extracts the actual text
    reader = PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) == 1
    extracted_text = reader.pages[0].extract_text()
    assert "Alex Rivera" in extracted_text
    assert "Python" in extracted_text

    # 2. Verify deterministic resume parser extracts skills and sections
    parsed_result = parse_resume_text(extracted_text)
    assert "skills" in parsed_result
    skills = parsed_result["skills"]
    assert any("Python" in s for s in skills)
    assert any("FastAPI" in s for s in skills)
    assert any("Docker" in s for s in skills)


@pytest.mark.anyio
async def test_ats_scoring_endpoint():
    """Verify backend ATS scoring endpoint processes resume skills against JD requirements."""
    student_id = str(uuid.uuid4())
    token = create_access_token(subject=student_id, role="STUDENT")
    headers = {"Authorization": f"Bearer {token}"}

    ats_payload = {
        "resume_id": str(uuid.uuid4()),
        "job_description_id": "test-target-job-001",
        "resume_skills": ["Python", "FastAPI", "Docker", "SQL"],
        "jd_skills": ["python", "fastapi", "docker", "kubernetes", "aws"]
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Unauthenticated request returns 401
        res_unauth = await ac.post("/api/v1/ats/score", json=ats_payload)
        assert res_unauth.status_code == 401

        # 2. Authenticated request returns 200 with score and breakdown
        res_auth = await ac.post("/api/v1/ats/score", json=ats_payload, headers=headers)
        assert res_auth.status_code == 200
        data = res_auth.json()
        assert "ats_score" in data
        assert data["ats_score"] > 0
        assert "matched_skills" in data
        assert "missing_skills" in data
        assert "breakdown" in data
        assert len(data["matched_skills"]) == 3  # Python, FastAPI, Docker
        assert "kubernetes" in data["missing_skills"]
        assert "aws" in data["missing_skills"]
        assert "semantic" in data["breakdown"]
        assert "keywords" in data["breakdown"]

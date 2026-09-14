import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

from app.infrastructure.db.session import engine

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.anyio
async def test_company_isolation_and_cross_company_access_prevention():
    await engine.dispose()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register Recruiter A (Company A)
        reg_a = await ac.post("/api/v1/auth/recruiter/register", json={
            "email": f"recruiter_a_{uuid.uuid4().hex[:6]}@comp-a.com",
            "password": "Password123!",
            "company_name": f"Company A {uuid.uuid4().hex[:4]}",
            "full_name": "Alice Recruiter",
            "designation": "Talent Lead A"
        })
        assert reg_a.status_code == 201
        token_a = reg_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Register Recruiter B (Company B)
        reg_b = await ac.post("/api/v1/auth/recruiter/register", json={
            "email": f"recruiter_b_{uuid.uuid4().hex[:6]}@comp-b.com",
            "password": "Password123!",
            "company_name": f"Company B {uuid.uuid4().hex[:4]}",
            "full_name": "Bob Recruiter",
            "designation": "Talent Lead B"
        })
        assert reg_b.status_code == 201
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. Recruiter A creates a job post in Company A
        res_job_a = await ac.post("/api/v1/jobs", json={
            "title": "Backend Engineer A",
            "department": "Engineering",
            "description": "Python FastAPI",
            "requiredSkills": ["Python", "FastAPI"],
            "experience": "2 years",
            "education": "BS CS",
            "location": "Remote",
            "workplaceType": "Remote",
            "type": "Full-time",
            "salary": "$120k",
            "status": "published"
        }, headers=headers_a)
        assert res_job_a.status_code == 201
        job_id_a = res_job_a.json()["id"]

        # 4. Recruiter A creates candidate in Company A
        res_cand_a = await ac.post("/api/v1/candidates", json={
            "name": "Candidate A",
            "email": f"cand_a_{uuid.uuid4().hex[:6]}@example.com",
            "role": "Python Dev",
            "resumeData": {"skills": ["Python"]},
            "jobId": job_id_a
        }, headers=headers_a)
        assert res_cand_a.status_code == 201
        cand_id_a = res_cand_a.json()["id"]

        # --- SECURITY VERIFICATIONS ---

        # Test 1: Recruiter B tries to GET Recruiter A's Job -> 404 (Isolated by Company)
        get_job_b = await ac.get(f"/api/v1/jobs/{job_id_a}", headers=headers_b)
        assert get_job_b.status_code == 404

        # Test 2: Recruiter B tries to UPDATE Recruiter A's Job -> 400 or 404
        update_job_b = await ac.put(f"/api/v1/jobs/{job_id_a}", json={"title": "Hacked Title"}, headers=headers_b)
        assert update_job_b.status_code in [400, 404]

        # Test 3: Recruiter B tries to DELETE Recruiter A's Job -> 404
        del_job_b = await ac.delete(f"/api/v1/jobs/{job_id_a}", headers=headers_b)
        assert del_job_b.status_code == 404

        # Test 4: Recruiter B tries to GET Recruiter A's Candidate -> 404
        get_cand_b = await ac.get(f"/api/v1/candidates/{cand_id_a}", headers=headers_b)
        assert get_cand_b.status_code == 404

        # Test 5: Recruiter B lists jobs -> MUST NOT contain Company A's job
        list_jobs_b = await ac.get("/api/v1/jobs", headers=headers_b)
        assert list_jobs_b.status_code == 200
        b_job_ids = [j["id"] for j in list_jobs_b.json()]
        assert job_id_a not in b_job_ids

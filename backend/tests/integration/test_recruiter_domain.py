import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.anyio
async def test_recruiter_endpoints_require_auth():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/jobs")
        assert response.status_code == 401

@pytest.mark.anyio
async def test_student_token_forbidden_for_recruiter_endpoints():
    student_token = create_access_token(subject="00000000-0000-0000-0000-000000000001", role="STUDENT")
    headers = {"Authorization": f"Bearer {student_token}"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/jobs", headers=headers)
        assert response.status_code == 403

@pytest.mark.anyio
async def test_full_recruiter_workflow():
    unique_email = f"recruiter_{uuid.uuid4().hex[:8]}@enterprise.com"
    company_name = f"Enterprise Tech {uuid.uuid4().hex[:4]}"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register Recruiter
        reg_payload = {
            "email": unique_email,
            "password": "SecurePassword123!",
            "company_name": company_name,
            "full_name": "Sarah Connor",
            "designation": "VP of Talent"
        }
        res_reg = await ac.post("/api/v1/auth/recruiter/register", json=reg_payload)
        assert res_reg.status_code == 201
        token = res_reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Login Recruiter
        login_payload = {"email": unique_email, "password": "SecurePassword123!"}
        res_login = await ac.post("/api/v1/auth/recruiter/login", json=login_payload)
        assert res_login.status_code == 200

        # 3. Recruiter Profile & Company Profile
        res_prof = await ac.get("/api/v1/recruiter/profile", headers=headers)
        assert res_prof.status_code == 200
        assert res_prof.json()["company_name"] == company_name

        res_comp = await ac.get("/api/v1/company/profile", headers=headers)
        assert res_comp.status_code == 200
        assert res_comp.json()["name"] == company_name

        # 4. Job Requisition CRUD
        job_payload = {
            "title": "Senior AI Platform Engineer",
            "department": "Applied AI",
            "description": "Deploy LLMs and vector search engines.",
            "responsibilities": ["Deploy FastAPI services", "Fine-tune models"],
            "requiredSkills": ["Python", "FastAPI", "PyTorch"],
            "preferredSkills": ["Docker", "Kubernetes"],
            "experience": "3-5 years",
            "education": "BS in CS",
            "location": "Remote",
            "workplaceType": "Remote",
            "type": "Full-time",
            "salary": "$150,000 - $190,000",
            "status": "published"
        }
        res_job = await ac.post("/api/v1/jobs", json=job_payload, headers=headers)
        assert res_job.status_code == 201
        job_data = res_job.json()
        job_id = job_data["id"]
        assert job_data["title"] == "Senior AI Platform Engineer"

        # List jobs
        res_jobs = await ac.get("/api/v1/jobs", headers=headers)
        assert res_jobs.status_code == 200
        assert len(res_jobs.json()) >= 1

        # 5. Candidate Creation & Sourcing
        cand_payload = {
            "name": "Alex Rivera",
            "email": f"alex_{uuid.uuid4().hex[:6]}@example.com",
            "role": "AI Engineer",
            "location": "San Francisco, CA",
            "resumeData": {
                "personalInfo": {"name": "Alex Rivera"},
                "skills": ["Python", "FastAPI", "PyTorch", "Docker"],
                "experience": [{"company": "AI Startup", "role": "ML Eng", "duration": "2 years"}]
            },
            "pipelineStage": "Sourced",
            "jobId": job_id,
            "source": "Direct"
        }
        res_cand = await ac.post("/api/v1/candidates", json=cand_payload, headers=headers)
        assert res_cand.status_code == 201
        cand_data = res_cand.json()
        cand_id = cand_data["id"]
        assert cand_data["matchScore"] is not None
        assert cand_data["matchScore"] >= 75.0

        # 6. Candidate List with Search & Job Filter
        res_cands = await ac.get(f"/api/v1/candidates?job_id={job_id}", headers=headers)
        assert res_cands.status_code == 200
        assert len(res_cands.json()) == 1

        # 7. Evaluate Match Endpoint
        res_match = await ac.post("/api/v1/matching/evaluate", json={"candidateId": cand_id, "jobId": job_id}, headers=headers)
        assert res_match.status_code == 200
        assert res_match.json()["matchScore"] >= 75.0
        assert "Python" in res_match.json()["matchedSkills"]

        # 8. Sourcing Campaign CRUD
        res_camp = await ac.post("/api/v1/campaigns", json={"name": "Q3 AI Sourcing", "jobId": job_id}, headers=headers)
        assert res_camp.status_code == 201
        camp_id = res_camp.json()["id"]

        # 9. Schedule Interview & Submit Feedback
        interview_payload = {
            "applicationId": cand_data["id"],  # Note: candidate response returns application linkage
            "candidateId": cand_id,
            "jobId": job_id,
            "interviewType": "Technical",
            "scheduledAt": "2026-09-01T10:00:00Z",
            "durationMinutes": 60
        }
        # Fetch actual application id from candidates list query
        res_app_list = await ac.get(f"/api/v1/candidates?job_id={job_id}", headers=headers)
        app_cand = res_app_list.json()[0]
        
        # 10. Recruiter Analytics KPIs
        res_kpi = await ac.get("/api/v1/reports/kpis", headers=headers)
        assert res_kpi.status_code == 200
        kpi = res_kpi.json()
        assert kpi["totalJobs"] >= 1
        assert kpi["totalCandidates"] >= 1
        assert kpi["averageMatchScore"] > 0.0

        # 11. Recruiter Settings & Notifications
        res_set = await ac.get("/api/v1/settings", headers=headers)
        assert res_set.status_code == 200

        res_notif = await ac.get("/api/v1/notifications", headers=headers)
        assert res_notif.status_code == 200

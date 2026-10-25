# API reference

The backend is a FastAPI application. Its live OpenAPI schema is available at `/api/v1/openapi.json`, Swagger UI at `/docs`, and ReDoc at `/redoc` after the server starts.

> **Important:** This guide describes router groups currently registered by `backend/app/main.py`. Router modules elsewhere in the source tree are not automatically active. Treat the runtime OpenAPI schema as authoritative.

## Base URL

Local development:

```text
http://127.0.0.1:8000/api/v1
```

Protected endpoints expect an access token in the header:

```http
Authorization: Bearer <access-token>
```

Request and response schemas are declared by Pydantic DTOs; use the live API schema for required fields and exact payloads.

## Registered route groups

| Prefix / route | Purpose | Typical operations |
|---|---|---|
| `/health` and `/api/v1/health` | Health check | GET |
| `/auth` | Student/recruiter registration and login, admin login, refresh, logout | POST |
| `/resumes` | Upload a resume, get the active resume, get resume details | POST, GET |
| `/ats` | ATS-style score and skill comparison | POST `/score` |
| `/jobs` | Published jobs and recruiter job requisitions | GET, POST, PUT, DELETE; job status actions |
| `/candidates` | Recruiter candidate discovery/records | See live schema |
| `/applications` | Student applications and recruiter application/pipeline operations | See live schema |
| `/recruiter` | Current recruiter profile | GET, PATCH `/profile` |
| `/company` | Company profile | GET, PATCH `/profile` |
| `/campaigns` | Talent sourcing campaigns | GET, POST, PUT, DELETE |
| `/recruiter/interviews` | Recruiter interview scheduling and feedback | GET, POST, PUT and feedback |
| `/offers` | Offer records and status changes | GET, POST, PUT |
| `/reports` | Recruiter KPIs, overview, and pipeline counts | GET `/kpis`, `/overview`, `/pipeline` |
| `/settings` | Recruiter settings/preferences | GET, PUT |

The health router is intentionally included both at the root health path and under the configured API prefix.

## Authentication routes

All paths below are relative to `/api/v1`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/student/register` | Register a student |
| POST | `/auth/student/login` | Authenticate a student |
| POST | `/auth/recruiter/register` | Register a recruiter |
| POST | `/auth/recruiter/login` | Authenticate a recruiter |
| POST | `/auth/admin/login` | Authenticate an administrator |
| POST | `/auth/refresh` | Rotate/refresh tokens |
| POST | `/auth/logout` | Revoke a refresh token |

The DTO fields and token response shape are defined in `backend/app/application/dto/auth.py`.

## Resume and ATS flow

| Method | Path | Purpose |
|---|---|---|
| POST | `/resumes` | Upload a resume as multipart form data; requires authentication |
| GET | `/resumes/active` | Return the authenticated student's active resume |
| GET | `/resumes/{resume_id}` | Return a resume after enforcing owner access |
| POST | `/ats/score` | Calculate an ATS-style score from supplied resume and job skill lists |

The current resume worker uses pypdf to extract PDF text. The local storage adapter writes to a development filesystem directory. Do not assume DOCX parsing or cloud object storage is fully implemented.

## Job and recruiter workflows

The registered job router includes published-job listing for authenticated users and company-scoped recruiter operations, including creating/updating job requisitions and changing job status (publish, pause, close, archive, reopen, duplicate). Recruiter endpoints use role/company context dependencies.

Other registered router groups cover candidates, applications, sourcing campaigns, recruiter interviews and feedback, offers, recruiter settings, company profile, and recruiter reports. Consult the live schema for exact route paths and request DTOs.

## Routes not necessarily active

A Python module existing in `backend/app/api/v1/` does not mean FastAPI serves it. Review `backend/app/main.py` before calling the matching, student mock-interview, placement, or recruiter-notification modules; they are not all registered in the main application at the time of writing. Register a router explicitly and add/adjust tests before documenting it as a live API.

# SmartHireAI

SmartHireAI is a web-based placement and recruitment platform that brings student career preparation and recruiter hiring workflows into one application. The repository contains a React/TypeScript frontend and a Python/FastAPI backend, with PostgreSQL persistence, JWT-based authentication, resume parsing, ATS-style skill comparison, job/application workflows, interview tools, and recruiter reporting.

> **Project status:** This is an evolving academic/prototype project, not a validated production hiring system. Some screens contain illustrative or demo values while backend integration is being completed. ATS scores and placement indicators are experimental decision-support outputs; they have not been demonstrated to be statistically valid and must not be the sole basis for hiring or career decisions.

## 🚀 Live Demo

- **Frontend Application:** [SmartHireAI — Open App](https://smarthireai-frontend.vercel.app)
- **Backend API:** [SmartHireAI Backend](https://smarthireai-backend-mbnz.onrender.com/api/v1)
- **API Documentation (Swagger):** [View API Docs](https://smarthireai-backend-mbnz.onrender.com/docs)

> **Note:** The backend may take a little time to wake up if the hosting service is idle. These links should be tested to confirm the deployments are currently available.

## Contents

- [What it does](#what-it-does)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [Tests and quality checks](#tests-and-quality-checks)
- [API documentation](#api-documentation)
- [Deployment notes](#deployment-notes)
- [Known limitations and troubleshooting](#known-limitations-and-troubleshooting)
- [Project documentation](#project-documentation)

## What it does

### Student experience

- Student registration and login.
- Resume upload, asynchronous parsing, and extracted profile information.
- ATS-style scoring with matched and missing skills.
- Job discovery/matching and application tracking screens.
- Skill-gap visualisation and career/learning roadmap screens.
- Mock-interview preparation, sessions, and reports.
- Company-readiness and analytics dashboards.
- Account and preference settings.

### Recruiter experience

- Recruiter registration/login and profile/company settings.
- Job requisition creation, editing, publishing, pausing, closing, reopening, archiving, and duplication.
- Candidate and applicant review with hiring-pipeline workflows.
- Talent sourcing campaigns.
- Recruiter interview scheduling and structured feedback.
- Offer workflows.
- Recruiter KPI, pipeline, and report endpoints.

An admin login route and admin-facing dashboard are present in the frontend; check the live API schema before assuming every admin operation is exposed by the backend.

## Technology stack

| Area | Main technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Redux Toolkit, TanStack Query, Axios, Tailwind CSS |
| Backend API | Python 3.12+, FastAPI, Pydantic, Uvicorn |
| Data | SQLAlchemy async, PostgreSQL, Alembic migrations |
| Authentication | JWT access/refresh tokens, role-aware API dependencies |
| Resume handling | PDF text extraction with pypdf, structured parsing, ATS-style skill comparison |
| Background jobs/cache | Celery with Redis broker/result backend; Redis cache integration |
| Testing | pytest, pytest-asyncio, HTTPX; frontend TypeScript check |
| Local infrastructure | Docker Compose definitions for PostgreSQL, Redis, RabbitMQ, API, and worker |

The current object-storage adapter writes to a local `storage_bucket/` directory for development; it does not implement durable AWS S3 uploads.

## Repository structure

```text
SmartHireAI/
├── backend/
│   ├── app/              # API, application services, core, infrastructure, workers
│   ├── alembic/          # Database migrations
│   ├── docker/           # Dockerfile and Compose configuration
│   ├── tests/            # Unit and integration tests
│   ├── pyproject.toml
│   └── .env.example
├── frontend/
│   ├── src/              # React components, pages, routes, services, Redux store
│   ├── server.ts         # Express host and Vite development middleware
│   ├── package.json
│   └── vercel.json       # SPA rewrite for Vercel
├── docs/
├── CONTRIBUTING.md
└── SECURITY.md
```

## Run locally

### Prerequisites

Install Python 3.12+, Node.js/npm (current LTS recommended), Docker with Compose, and Git.

### 1. Start PostgreSQL and Redis

From the repository root:

```bash
docker compose -f backend/docker/docker-compose.yml up -d postgres redis
```

The Compose file uses local development defaults: database `smarthireai`, user `postgres`, password `postgres`. Do not reuse these defaults in production. If you change the database password, update it in both Compose configuration and the backend environment file.

### 2. Configure and run the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and replace `SECRET_KEY` with a unique, randomly generated secret. Generate one with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Then install and start the API:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e .
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

For Windows PowerShell, activate with `.venv\Scripts\Activate.ps1`. Database migrations run on startup by default.

### 3. Configure and run the frontend

In another terminal from the repository root:

```bash
cd frontend
npm ci
```

Create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend API client defaults to `http://127.0.0.1:8000/api/v1`; set `VITE_API_URL` when the API is hosted elsewhere.

### 4. Start the resume worker

In a third terminal, from `backend/` and with the same virtual environment/environment values:

```bash
celery -A app.workers.celery_app worker --loglevel=info
```

Resume parsing uses Celery with Redis. For the current local filesystem storage adapter, run the API and worker from the backend directory so they share the same `storage_bucket/` path. RabbitMQ is included in Compose but is not the configured Celery broker.

## Configuration

See [`backend/.env.example`](backend/.env.example). Key values include:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Required private signing key for authentication tokens |
| `POSTGRES_SERVER`, `POSTGRES_PORT` | PostgreSQL host and port |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Database credentials and name |
| `REDIS_HOST`, `REDIS_PORT` | Redis cache and Celery connection settings |
| `RUN_MIGRATIONS_ON_STARTUP` | Whether Alembic migrations run when the API starts |
| `BACKEND_CORS_ORIGINS` | JSON array of allowed frontend origins |
| `GEMINI_API_KEY` | Optional key for features that call Gemini |

Never commit `.env` files, API keys, tokens, database credentials, private resumes, or production configuration. Variables prefixed with `VITE_` are bundled for browser use and must not contain private secrets.

## Tests and quality checks

Backend, from `backend/`:

```bash
pip install aiosqlite
pytest -q
```

The test fixture uses an isolated SQLite database; `aiosqlite` is needed for that setup. The test paths selected in `pyproject.toml` cover a subset of the test files.

Frontend, from `frontend/`:

```bash
npm run lint
npm run build
```

The `lint` script currently runs `tsc --noEmit` (a TypeScript check, not a full formatting/lint suite). A successful build does not prove every frontend/backend flow works end to end.

## API documentation

When the backend is running:

- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- OpenAPI JSON: [http://127.0.0.1:8000/api/v1/openapi.json](http://127.0.0.1:8000/api/v1/openapi.json)
- Health endpoint: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

The runtime OpenAPI schema is authoritative. Some router modules exist in the tree but are not registered by `backend/app/main.py`; verify the live schema before relying on those endpoints. See [the API reference](docs/API_REFERENCE.md).

## Deployment notes

- `frontend/vercel.json` provides a single-page-app rewrite for Vercel hosting.
- Configure the hosted frontend's `VITE_API_URL` as the full backend API base URL ending with `/api/v1`.
- Configure database, Redis, `SECRET_KEY`, CORS origins, and other settings with the hosting provider's environment/secret settings.
- Ensure the API and Celery worker share access to durable resume storage. The included filesystem adapter is not a production object-storage implementation.
- Use HTTPS, restrictive CORS, least-privilege credentials, database backups, monitoring, and privacy controls before processing real candidate information.

The repository contains deployment entry points; successful deployment and production readiness must be verified separately in the target environment.

## Known limitations and troubleshooting

- **Login/register returns 404 or 405:** Confirm the frontend calls the backend and that the API base URL includes `/api/v1`. Student login is `POST /api/v1/auth/student/login`; recruiter login is `POST /api/v1/auth/recruiter/login`.
- **CORS error:** Add the exact frontend origin (scheme/host/port) to `BACKEND_CORS_ORIGINS` and restart the API. Hosted frontend domains are not covered by localhost defaults.
- **Database/migration failure:** Verify PostgreSQL is running and `.env` matches the database settings.
- **Resume remains queued:** Check Redis, the Celery worker, API/worker logs, and that both use the same storage directory. The current backend parsing path is PDF-based.
- **Dashboard appears populated but seems inaccurate:** Some values are illustrative/prototype data. Inspect the corresponding service call and backend route before considering them real metrics.

## Project documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Development setup and troubleshooting](docs/DEVELOPMENT.md)
- [API reference](docs/API_REFERENCE.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [GitHub repository](https://github.com/Pavi1906/SmartHireAI)

## Academic use

SmartHireAI is a student project exploring placement intelligence and recruitment workflows. Treat scoring and analytics as experimental until their quality, fairness, security, accessibility, and operational reliability have been independently evaluated.

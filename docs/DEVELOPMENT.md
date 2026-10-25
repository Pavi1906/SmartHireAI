# Development setup

Commands assume macOS/Linux unless a Windows alternative is shown.

## Prerequisites

- Python 3.12+
- Node.js/npm (current LTS recommended)
- Docker with Compose
- Git

## 1. Clone and start local services

```bash
git clone https://github.com/Pavi1906/SmartHireAI.git
cd SmartHireAI
docker compose -f backend/docker/docker-compose.yml up -d postgres redis
```

The Compose file's default local database is `smarthireai`, user `postgres`, password `postgres`. These values are for development only. If you override the password, change it in both the database service configuration and `backend/.env`.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e .
```

Edit `.env` and set `SECRET_KEY`. Generate a secret with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Start the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The application reads `.env` relative to the backend working directory. Database migrations are configured to run during startup by default. If startup fails, check database credentials, PostgreSQL availability, and migration logs.

Windows PowerShell activation:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 3. Background worker

Open another terminal, activate the same virtual environment, change to `backend/`, then run:

```bash
celery -A app.workers.celery_app worker --loglevel=info
```

The current Celery configuration uses Redis on `REDIS_HOST` and `REDIS_PORT`. Keep the worker and API running while testing asynchronous resume parsing. With the local filesystem adapter, both processes must use the same working directory so they share the same `storage_bucket/` path.

## 4. Frontend setup

```bash
cd frontend
npm ci
```

Create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Then start:

```bash
npm run dev
```

Browse to [http://localhost:3000](http://localhost:3000). Frontend environment variables prefixed with `VITE_` are included in the browser bundle; never put private API secrets in a `VITE_` variable.

## 5. Tests and static checks

Backend tests use an isolated SQLite database via pytest fixtures. Install the SQLite async driver if needed, then run:

```bash
cd backend
source .venv/bin/activate
pip install aiosqlite
pytest -q
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

The current `lint` script runs `tsc --noEmit`; it is a type check, not a full lint/format suite. Test actual browser-to-backend workflows separately.

## Environment values

The starter template is [`backend/.env.example`](../backend/.env.example). At minimum, set:

- `SECRET_KEY`: required token-signing secret.
- `POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: database connection.
- `REDIS_HOST`, `REDIS_PORT`: Redis connection.
- `BACKEND_CORS_ORIGINS`: JSON array of allowed origins for the frontend.
- `GEMINI_API_KEY`: optional; only required for code paths that call Gemini.

For a hosted frontend, configure backend CORS to include the exact deployed frontend origin. Set the frontend's `VITE_API_URL` to the fully qualified backend API base URL ending in `/api/v1`.

## Useful URLs

| Purpose | Local URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API docs | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |
| Versioned health check | http://127.0.0.1:8000/api/v1/health |
| OpenAPI JSON | http://127.0.0.1:8000/api/v1/openapi.json |

## Troubleshooting

### CORS errors

Add the exact frontend origin (protocol, host, and port) to `BACKEND_CORS_ORIGINS` as a JSON list. Restart the API afterwards.

### 404 or 405 from login/register

Inspect the browser Network tab. Student login should target `POST /api/v1/auth/student/login`; recruiter login should target `POST /api/v1/auth/recruiter/login`. Confirm `VITE_API_URL` includes `/api/v1` and points to the backend rather than the frontend origin.

### Resume remains queued

Confirm Redis and the Celery worker are running. Inspect API and worker logs. The current parser extracts text from PDF files; other file types are not verified end-to-end. The worker must be able to read the same storage location written by the API.

### Frontend compiles but the workflow fails

Compilation verifies the frontend's TypeScript/build pipeline only. Check that the relevant backend route is mounted, that the user has the required role, that the database is accessible, and that API response fields match the frontend service's expectations.

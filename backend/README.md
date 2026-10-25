# SmartHireAI backend

FastAPI backend for SmartHireAI. It exposes role-aware APIs for authentication, resumes, ATS-style scoring, job requisitions, candidates, applications, sourcing campaigns, recruiter interviews, offers, company/recruiter settings, and reporting.

## Local setup

From the repository root, start PostgreSQL and Redis:

```bash
docker compose -f backend/docker/docker-compose.yml up -d postgres redis
cd backend
cp .env.example .env
```

Edit `.env`, especially `SECRET_KEY`, then install and run:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e .
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The service expects PostgreSQL. Alembic migrations run on startup by default. See [development setup](../docs/DEVELOPMENT.md) for the Celery worker, frontend setup, and troubleshooting.

## Resume worker

Start a second terminal in `backend/`, activate the virtual environment, then run:

```bash
celery -A app.workers.celery_app worker --loglevel=info
```

The current worker parses PDF text using pypdf and the development storage adapter writes to a local `storage_bucket/` directory. The adapter does not currently provide durable AWS S3 storage.

## API docs

With the API running, browse to:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- OpenAPI: http://127.0.0.1:8000/api/v1/openapi.json

Only routes registered in `app/main.py` are active. The OpenAPI schema is the authoritative route list.

## Tests

```bash
pip install aiosqlite
pytest -q
```

Tests use a separate SQLite database fixture. Do not use production candidate data in tests.

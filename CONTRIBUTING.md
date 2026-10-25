# Contributing to SmartHireAI

Thank you for helping improve SmartHireAI. Changes should be small enough to review, tested where practical, and documented when they change setup or user-visible behavior.

## Before you start

1. Read the [README](README.md), [development guide](docs/DEVELOPMENT.md), and [architecture notes](docs/ARCHITECTURE.md).
2. Check the existing issues and pull requests to avoid duplicate work.
3. For a large feature or change to a public API, open an issue or proposal before implementation.
4. Never use real candidate resumes, personal data, production credentials, or live user tokens in tests or examples.

## Branch and pull-request workflow

- Create a topic branch from the current `main` branch, for example `docs/improve-setup` or `fix/resume-status`.
- Keep each pull request focused on one problem.
- Explain motivation, implementation, test coverage, and configuration or migration impact.
- Link related issues when applicable.
- Include screenshots for meaningful UI changes, using synthetic/demo information only.
- Call out endpoints or migrations that are added, removed, renamed, or changed.

## Checks

For backend changes, from `backend/`:

```bash
pytest -q
```

If needed, install `aiosqlite` for the isolated SQLite fixture.

For frontend changes, from `frontend/`:

```bash
npm run lint
npm run build
```

Also test the changed feature against the running API if it makes HTTP requests. A TypeScript build alone does not verify API integration.

## Coding expectations

- Follow the existing project structure and naming conventions.
- Validate inputs at the API boundary and keep business logic in application services where practical.
- Keep tenant/company and user ownership checks server-side; frontend route guards are not security controls.
- Avoid broad exception handling that hides useful diagnostics. Do not return secrets or internal stack traces to clients.
- Add or update tests for fixes and new behavior.
- Update documentation, environment examples, and migrations together when behavior or configuration changes.
- Do not add credentials, generated build output, local databases, logs, or private data.

## Pull-request checklist

- [ ] Change is focused and has a clear description.
- [ ] Relevant tests/checks were run; any unrun checks are stated.
- [ ] No secrets or real personal data are included.
- [ ] API contracts and authorization rules remain correct.
- [ ] Documentation and environment templates are updated where needed.
- [ ] UI screenshots use synthetic/demo data and do not expose personal information.

# Security policy

SmartHireAI is an evolving academic/prototype project. Do not deploy it with real candidate data until authentication, authorization, data handling, storage, dependencies, and operational controls have been independently reviewed.

## Reporting a vulnerability

Please do not publish exploit details, credentials, personal data, or a working attack in a public issue.

If GitHub private vulnerability reporting is enabled for this repository, use the repository's **Security → Report a vulnerability** workflow. Otherwise, contact the repository owner through contact details listed on their GitHub profile and include a concise description, impact, affected component/commit, and reproduction steps. Allow maintainers time to investigate before public disclosure.

## Sensitive information

Never commit or attach:

- API keys, JWT signing keys, access/refresh tokens, passwords, database URLs containing credentials, or cloud credentials.
- Private candidate resumes, extracted resume text, email addresses, phone numbers, or other personal information.
- Production logs, database dumps, or uploaded-file storage directories that may contain private data.

If a secret is accidentally committed, revoke or rotate it immediately. Removing it in a later commit does not make the exposed secret safe.

## Security considerations for deployments

Before using the project with real users, review at least:

- Role and company/tenant authorization for every protected API route.
- Access-token storage, refresh-token rotation/revocation, logout, and session expiry.
- Password handling, brute-force/rate limiting, account recovery, and audit logging.
- CORS allowlists and HTTPS enforcement.
- Resume upload limits, content validation, malware scanning, retention/deletion, and private object storage.
- Dependency scanning, backups, database least privilege, error handling, and secret management.
- Fairness, explainability, and human oversight for candidate scoring or placement indicators.

The platform's ATS and placement-related values are experimental and must not be treated as validated or unbiased hiring decisions.

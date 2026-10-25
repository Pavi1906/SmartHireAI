# SmartHireAI frontend

React + TypeScript frontend for the SmartHireAI student, recruiter, and admin-facing experiences. The application uses Vite, React Router, Redux Toolkit, TanStack Query, and Axios. The Express host in `server.ts` serves Vite middleware during development and the built single-page app in production mode.

## Local setup

```bash
npm ci
```

Create `.env.local` in this directory:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000. Start the backend separately; see [`../docs/DEVELOPMENT.md`](../docs/DEVELOPMENT.md).

## Checks

```bash
npm run lint
npm run build
```

`npm run lint` runs the TypeScript compiler without emitting files. Successful compilation does not prove that all API-backed flows work. Check browser Network requests and the backend's OpenAPI schema when debugging integration problems.

## Environment security

`VITE_*` values are available to browser-side code and are not secret. Do not put private API keys, tokens, or passwords in such variables. Set `VITE_API_URL` to the complete backend API base URL ending in `/api/v1`.

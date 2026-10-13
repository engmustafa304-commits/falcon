# AI Guide

This guide is for AI assistants working in the Falcon repository.

## Source Of Truth

Base all answers and edits on current repository files. Do not invent features, routes, schemas, environment variables, or deployment behavior that are not present in the repo.

Important source files:

- `package.json`
- `pnpm-workspace.yaml`
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/services/`
- `apps/frontend/src/design-system/`
- `apps/backend/src/app.ts`
- `apps/backend/src/routes/`
- `apps/backend/src/controllers/`
- `apps/backend/src/config/env.ts`
- `apps/backend/src/database/prismaClient.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/schema.postgresql.prisma`
- `railway.json`
- `apps/frontend/vercel.json`

## Hard Rules

- Do not print secrets.
- Do not read or display full `.env` files.
- Do not commit `.env`, `.env.*`, SQLite `.db`, `dist`, `node_modules`, or upload artifacts.
- Do not change UI, backend behavior, routes, auth, or Prisma schemas unless the task explicitly asks for it.
- Keep local SQLite development working.
- Keep PostgreSQL staging/production preparation working.
- Prefer focused edits over broad refactors.

## Repo Checks

Use fast search:

```bash
rg "pattern"
rg --files
```

Common verification commands:

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
corepack pnpm --filter @falcon/backend run build:railway
corepack pnpm --filter @falcon/backend storage:doctor
corepack pnpm --filter @falcon/backend staging:doctor
```

## Environment Handling

Backend env loading is implemented in `apps/backend/src/config/env.ts`.

Default backend env file:

```text
apps/backend/.env
```

Staging env file:

```text
apps/backend/.env.staging
```

Both are ignored by Git. Example env files are committed.

Never echo values for:

- `DATABASE_URL`
- `DATABASE_URL_STAGING`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- tokens
- passwords

If a task requires checking env presence, print booleans or variable names only.

## Frontend Notes

The frontend uses:

- React
- TypeScript
- Vite
- TailwindCSS
- React Router
- Framer Motion
- Lucide icons

The homepage is eagerly imported. Most other route pages are lazy-loaded in `App.tsx`.

API calls go through `apps/frontend/src/services/apiClient.ts`, which attaches Bearer tokens from local storage.

## Backend Notes

The backend uses:

- Express
- TypeScript
- Prisma
- Zod
- JWT
- bcrypt
- multer
- helmet
- express-rate-limit
- Cloudinary SDK

Route groups are mounted in `apps/backend/src/routes/index.ts`.

Admin routes require `SUPER_ADMIN`.

Dealer ownership is enforced inside controller logic for dealer profile and car operations.

## Database Notes

Do not assume migrations are committed. The repo currently ignores `apps/backend/prisma/migrations`.

Local schema:

```text
apps/backend/prisma/schema.prisma
```

PostgreSQL schema:

```text
apps/backend/prisma/schema.postgresql.prisma
```

Use local Prisma commands for SQLite and PostgreSQL-specific scripts for managed environments.

## Documentation Guidance

When updating docs:

- Describe only what exists.
- Link behavior to actual files where possible.
- Mark placeholders as placeholders.
- Avoid future-tense claims unless backed by current config or docs.


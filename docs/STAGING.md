# Falcon Staging Guide

This guide prepares Falcon for a private staging environment. It does not deploy anything.

## Required Services

- Frontend hosting for the Vite build.
- Backend Node.js runtime.
- Managed PostgreSQL staging database.
- Cloudinary account for managed image uploads.
- Secret manager or encrypted environment variables.

## Environment Files

Frontend templates:

- `apps/frontend/.env.example`
- `apps/frontend/.env.staging.example`
- `apps/frontend/.env.production.example`

Backend templates:

- `apps/backend/.env.example`
- `apps/backend/.env.staging.example`
- `apps/backend/.env.production.example`

Never commit real staging secrets.

## Startup Order

1. Provision staging PostgreSQL.
2. Configure backend staging environment variables.
3. Run `corepack pnpm --filter @falcon/backend staging:doctor`.
4. Run Prisma generate and migration deploy.
5. Seed staging super admin with env-provided credentials.
6. Start backend with `corepack pnpm --filter @falcon/backend dev:staging`.
7. Confirm `GET /health`.
8. Confirm `GET /ready`.
9. Start frontend with `VITE_API_BASE_URL` pointing to the staging API.

## Database Migration

See `docs/STAGING_DATABASE.md`.

Staging should use PostgreSQL through `apps/backend/prisma/schema.postgresql.prisma`. Local development remains SQLite through `apps/backend/prisma/schema.prisma`.

## Storage Setup

See `docs/STAGING_STORAGE.md`.

Local uploads are for development. Recommended staging provider is Cloudinary through `STORAGE_PROVIDER=cloudinary`.

## Seed

Required staging seed env:

- `STAGING_SUPER_ADMIN_EMAIL`
- `STAGING_SUPER_ADMIN_PASSWORD`
- `STAGING_SUPER_ADMIN_NAME`
- `STAGING_SUPER_ADMIN_TENANT_ID`

Run:

```bash
corepack pnpm --filter @falcon/backend seed:staging:pg
```

The seed script fails clearly if staging credentials are missing.

## Staging Doctor And Safe Start

Run:

```bash
corepack pnpm --filter @falcon/backend staging:doctor
```

It prints only safe diagnostics:

- `.env.staging` loaded status.
- database host and database name only.
- storage provider.
- configured port and whether it is occupied.
- Prisma schema: `prisma/schema.postgresql.prisma`.

Start the staging backend:

```bash
corepack pnpm --filter @falcon/backend dev:staging
```

The safe start command validates `.env.staging`, rejects placeholder database URLs such as `HOST`, `USER`, `PASSWORD`, or `localhost:5432`, maps `DATABASE_URL_STAGING` into the single runtime `DATABASE_URL`, generates Prisma Client from the PostgreSQL schema, and refuses to start if the port is already occupied.

## Smoke Test Checklist

- `GET /health` returns `ok`.
- `GET /ready` returns `ready`.
- Login as staging super admin.
- Register/login customer and dealer owner.
- Dealer owner gets a dealer profile.
- Dealer owner can create a car.
- Upload a car image.
- Public `/cars` shows API data.
- Car details can submit lead and finance request.
- Dealer dashboard sees leads/finance requests.
- Admin dashboard can view users, dealers, cars, leads, and finance requests.
- Notifications appear for dealer owner.

## Rollback Checklist

- Keep previous frontend/backend artifacts available.
- Keep database backup before migration.
- If `/ready` fails, stop traffic to the new backend.
- Roll back backend artifact.
- Restore database backup if migration changed data incorrectly.
- Preserve logs for failed requests and migration output.

## Deployment Preparation

See `docs/DEPLOY_STAGING.md` for the Railway, Vercel, Neon, and Cloudinary deployment runbook.

## Deployment Blockers

- Real Railway and Vercel domains must be created and inserted into env variables.
- Real Cloudinary credentials and upload/delete smoke testing are still required.
- PostgreSQL migrations must be deployed with `prisma migrate deploy`.
- Staging seed must be run manually once with env-provided credentials.
- Production-grade observability and audit logging still need more depth.

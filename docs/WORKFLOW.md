# Workflow

This document describes the current local development and verification workflow from the repository state.

## Install

```bash
corepack pnpm install --frozen-lockfile --prod=false
```

The `--prod=false` flag is also used by Railway build configuration so build dependencies are available even when `NODE_ENV=production`.

## Local Development

Run both apps:

```bash
corepack pnpm dev
```

Run only frontend:

```bash
corepack pnpm --filter @falcon/frontend dev
```

Run only backend:

```bash
corepack pnpm --filter @falcon/backend dev
```

## Local Database

Local development uses SQLite via `apps/backend/prisma/schema.prisma`.

Common commands:

```bash
corepack pnpm --filter @falcon/backend prisma:generate
corepack pnpm --filter @falcon/backend prisma:push
corepack pnpm --filter @falcon/backend seed
```

## Verification

Run all tests:

```bash
corepack pnpm test
```

Run typecheck:

```bash
corepack pnpm typecheck
```

Run build:

```bash
corepack pnpm build
```

Backend-only:

```bash
corepack pnpm --filter @falcon/backend test
corepack pnpm --filter @falcon/backend typecheck
corepack pnpm --filter @falcon/backend build
```

Frontend-only:

```bash
corepack pnpm --filter @falcon/frontend test
corepack pnpm --filter @falcon/frontend typecheck
corepack pnpm --filter @falcon/frontend build
```

## Storage Verification

Safe storage diagnostics:

```bash
corepack pnpm --filter @falcon/backend storage:doctor
```

The storage doctor prints provider and presence booleans only. It does not print Cloudinary credentials and does not upload files.

## Staging Runtime Checks

Staging doctor:

```bash
corepack pnpm --filter @falcon/backend staging:doctor
```

Start staging locally:

```bash
corepack pnpm --filter @falcon/backend dev:staging
```

The staging scripts use `.env.staging`, map `DATABASE_URL_STAGING` into runtime `DATABASE_URL`, and use `prisma/schema.postgresql.prisma`.

## Deployment Build Paths

Railway backend build is configured in root `railway.json`.

Railway build command:

```bash
corepack enable && corepack pnpm install --frozen-lockfile --prod=false && corepack pnpm --filter @falcon/backend run build:railway
```

Railway start command:

```bash
corepack pnpm --filter @falcon/backend run start:railway
```

Vercel frontend configuration lives in `apps/frontend/vercel.json`.

## Git Workflow

Current branch is expected to be `main`. Existing remote:

```text
origin https://github.com/engmustafa304-commits/falcon.git
```

Before pushing:

```bash
git status --short
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

Never commit real `.env` files, SQLite `.db` files, `node_modules`, `dist`, or upload artifacts.


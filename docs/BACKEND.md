# Backend

The Falcon backend lives in `apps/backend`. It is a TypeScript Express API using Prisma, SQLite for local development, and a separate PostgreSQL Prisma schema for staging/production.

## Commands

From the repository root:

```bash
corepack pnpm --filter @falcon/backend dev
corepack pnpm --filter @falcon/backend typecheck
corepack pnpm --filter @falcon/backend build
corepack pnpm --filter @falcon/backend test
```

Prisma local commands:

```bash
corepack pnpm --filter @falcon/backend prisma:generate
corepack pnpm --filter @falcon/backend prisma:push
```

Railway build command:

```bash
corepack pnpm --filter @falcon/backend run build:railway
```

## App Composition

`apps/backend/src/app.ts` wires:

- `helmet()`
- CORS with `CORS_ORIGINS`
- static `/uploads`
- `express.json({ limit: "1mb" })`
- request context
- request logging
- `/health`
- `/ready`
- auth/upload/API rate limiters
- `/api/v1` route groups
- legacy `/api/cars` and `/api/dealers` route mounts
- not found and error handlers

`apps/backend/src/server.ts` starts the app on `env.PORT` and disconnects Prisma on `SIGINT` and `SIGTERM`.

## Environment Loading

`apps/backend/src/config/env.ts` loads:

- `.env` by default
- `.env.staging` when `NODE_ENV=staging`
- an explicit file when `FALCON_ENV_FILE` is provided

The env file path is resolved from the backend package root. Values are validated with Zod.

Important variables:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `DATABASE_URL_STAGING`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`
- `FRONTEND_URL`
- `API_PUBLIC_URL`
- `STORAGE_PROVIDER`
- `PUBLIC_UPLOAD_BASE_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

## Authentication

Auth controller:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Registration accepts `CUSTOMER` or `DEALER_OWNER` as optional role. If a `DEALER_OWNER` is registered, the backend creates a dealer profile in the same transaction.

Passwords are hashed with bcrypt. Access tokens are JWTs signed with `JWT_ACCESS_SECRET` and expire in 7 days.

`requireAuth` verifies Bearer tokens, loads the user from the database, rejects inactive users, and attaches `request.auth`.

## Authorization

Admin routes use:

- `requireAuth`
- `requireSuperAdmin`

Dealer-owned writes verify ownership in controller logic. Dealer owners/managers can only manage their own dealer profile and cars. Admin roles can manage broader resources where controller logic allows.

## Storage

Storage providers live in `apps/backend/src/services/storage/`.

Current providers:

- `LocalStorageProvider`
- `CloudinaryStorageProvider`

Uploads use `POST /api/v1/uploads/car-images`, require auth, accept multipart field `image`, validate filename/type/size, and return `{ url, publicId }`.

The upload limit is 5 MB and allowed formats are JPG, JPEG, PNG, and WebP.

## Health And Readiness

Top-level endpoints:

- `GET /health`
- `GET /ready`

`/health` is process-level. `/ready` checks database connectivity through the active Prisma client.

## Tests

Backend tests live in `apps/backend/src/__tests__/`.

The test setup uses `apps/backend/scripts/prepare-test-db.mjs` and a SQLite test database.


# Falcon Backend

Node.js API service for Falcon tenant-aware platform operations, integrations, background work, and data access.

## Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite for local development

## Current API Foundation

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/role`
- `PATCH /api/v1/admin/users/:id/status`
- `DELETE /api/v1/admin/users/:id`
- `GET /api/v1/dealers`
- `POST /api/v1/dealers`
- `GET /api/v1/dealers/me`
- `PATCH /api/v1/dealers/me`
- `GET /api/v1/cars`
- `POST /api/v1/cars`

Compatibility aliases are also available at `/api/dealers` and `/api/cars`.

## Local Setup

Create `apps/backend/.env` from `.env.example`, then run:

```bash
corepack pnpm --filter @falcon/backend prisma:generate
corepack pnpm --filter @falcon/backend prisma:push
corepack pnpm --filter @falcon/backend seed
corepack pnpm --filter @falcon/backend dev
```

## Scripts

- `dev` - run the backend in watch mode.
- `dev:staging` - load `.env.staging`, generate the PostgreSQL Prisma client, and run the backend in watch mode.
- `build` - compile TypeScript to `dist`.
- `build:railway` - generate PostgreSQL Prisma Client and compile the backend for Railway.
- `build:staging` - load `.env.staging`, generate the PostgreSQL Prisma client, and compile TypeScript.
- `start` - run the compiled backend.
- `start:railway` - validate deployed env, generate PostgreSQL Prisma Client, run `prisma migrate deploy`, and start the compiled backend.
- `start:production` - same deployed runtime start path for production hosting.
- `start:staging` - load `.env.staging` and run the compiled backend.
- `staging:doctor` - validate `.env.staging` and print safe staging diagnostics without secrets.
- `typecheck` - run backend TypeScript checks without emitting files.
- `prisma:generate` - generate Prisma Client from `prisma/schema.prisma`.
- `prisma:generate:pg` - generate Prisma Client from the dedicated PostgreSQL staging schema.
- `prisma:generate:pg:staging` - load `.env.staging` and generate the PostgreSQL Prisma Client.
- `prisma:push` - push the local SQLite schema for development.
- `prisma:migrate` - local migration helper; production should use reviewed migrations.
- `prisma:deploy` - apply reviewed migrations in staging/production.
- `prisma:migrate:dev:pg` - create PostgreSQL migrations using `prisma/schema.postgresql.prisma`.
- `prisma:migrate:init:pg:staging` - create the initial Neon staging migration named `init_postgresql_staging`.
- `prisma:migrate:deploy:pg` - deploy reviewed PostgreSQL migrations.
- `prisma:migrate:deploy:pg:staging` - load `.env.staging` and deploy reviewed PostgreSQL migrations.
- `prisma:status:pg` - inspect PostgreSQL migration status.
- `prisma:status:pg:staging` - load `.env.staging` and inspect PostgreSQL migration status.
- `seed` - create or refresh the local super admin.
- `seed:staging` - same seed entry point for staging when staging env credentials are present.
- `seed:staging:pg` - generate the PostgreSQL Prisma client and seed staging with env-provided credentials.

## Staging Runtime

Use the doctor before starting staging:

```bash
corepack pnpm --filter @falcon/backend staging:doctor
```

The doctor prints only safe values: env file status, database host/name, storage provider, port status, and Prisma schema. It never prints the full database URL or password.

Start staging safely:

```bash
corepack pnpm --filter @falcon/backend dev:staging
```

This loads `.env.staging`, validates `DATABASE_URL_STAGING`, maps it into the single runtime `DATABASE_URL` before Prisma initializes, generates Prisma Client from `prisma/schema.postgresql.prisma`, checks the configured port, and refuses to start if the port is occupied.

## Security Middleware

- `helmet()` is enabled globally.
- JSON request bodies are capped at 1 MB.
- CORS is controlled by the `CORS_ORIGINS` environment allowlist.
- General API requests are limited to 100 requests per 15 minutes per IP.
- Auth endpoints are limited to 10 requests per 15 minutes per IP.
- Upload endpoints are limited to 20 uploads per 15 minutes per IP.
- Rate-limit responses return: `تم تجاوز عدد المحاولات المسموح بها. حاول لاحقًا.`
- Car image uploads allow only JPG, JPEG, PNG, and WebP files up to 5 MB.

## Storage

- Current provider: `STORAGE_PROVIDER=local`.
- Local public URL base: `PUBLIC_UPLOAD_BASE_URL=http://localhost:4000/uploads`.
- Local files are stored under `apps/backend/uploads/cars`.
- Set `STORAGE_PROVIDER=cloudinary` with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLOUDINARY_FOLDER` for managed image uploads.
- Verify local storage configuration without uploading files or printing secrets:

```bash
corepack pnpm --filter @falcon/backend storage:doctor
```

- Upload routes use `src/services/storage` so S3 or Supabase Storage can be added later without changing the upload API contract.

## Local Super Admin

Run the seed command to create or refresh the local platform owner:

```bash
corepack pnpm --filter @falcon/backend seed
```

Default local credentials:

- Email: `engmustafa304@gmail.com`
- Password: `Admin12345!`
- Role: `SUPER_ADMIN`

Detailed endpoint notes live in `API_DOCS.md`.

## Health And Readiness

- `GET /health` - process health.
- `GET /ready` - readiness check with database connectivity.
- `GET /api/v1/health` - API namespace compatibility health endpoint.

## Railway Staging Runtime

Railway uses the repository-root `railway.json`.

Required deployed staging values are managed in Railway environment variables. Neon should provide `DATABASE_URL`; deployed Railway runtime does not use `DATABASE_URL_STAGING`.

The Railway start command runs:

```bash
corepack pnpm --filter @falcon/backend run start:railway
```

This command validates required env vars, rejects placeholders, generates Prisma Client from `prisma/schema.postgresql.prisma`, runs `prisma migrate deploy`, and starts `dist/index.js`. It does not run `prisma db push`.

Run the staging seed manually once:

```bash
corepack pnpm --filter @falcon/backend run seed:staging:pg
```

## Production Notes

- SQLite is local-only. Production must use PostgreSQL.
- Use `apps/backend/prisma/schema.postgresql.prisma` and `DATABASE_URL` for deployed PostgreSQL staging/production.
- Use `DATABASE_URL_STAGING` only for local staging scripts that load `apps/backend/.env.staging`.
- Use `apps/backend/.env.production.example` as the future production PostgreSQL environment template.
- Local uploads in `apps/backend/uploads` are development-only. Production should use the Cloudinary provider or another managed object storage provider.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` must be strong deployment-managed secrets.
- `CORS_ORIGINS` must list only trusted frontend origins in production.

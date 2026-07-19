# Environment

Environment variables are defined in `.env.example`, `apps/backend/.env.example`, and `apps/frontend/.env.example`.

## Local Development

Use SQLite for local database development. SQLite is local-only and must not be used for production.

```bash
corepack pnpm install
corepack pnpm dev
```

## Required Runtime Variables

- `NODE_ENV` - Runtime mode. Supported backend values: `development`, `test`, `staging`, `production`.
- `DATABASE_URL` - Prisma database connection string. Local default: `file:./dev.db`.
- `DATABASE_URL_STAGING` - Dedicated PostgreSQL staging database URL used by `apps/backend/prisma/schema.postgresql.prisma`.
- `PORT` - Backend HTTP server port.
- `JWT_ACCESS_SECRET` - Secret for signed access tokens.
- `JWT_REFRESH_SECRET` - Secret reserved for refresh-token flows.
- `CORS_ORIGINS` - Comma-separated frontend origins allowed by the backend.
- `FRONTEND_URL` - Public frontend origin for backend-generated links and staging checks.
- `API_PUBLIC_URL` - Public backend origin.
- `STORAGE_PROVIDER` - Backend storage adapter. Local value: `local`; staging/production can use `cloudinary`.
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name when `STORAGE_PROVIDER=cloudinary`.
- `CLOUDINARY_API_KEY` - Cloudinary API key when `STORAGE_PROVIDER=cloudinary`.
- `CLOUDINARY_API_SECRET` - Cloudinary API secret when `STORAGE_PROVIDER=cloudinary`.
- `CLOUDINARY_FOLDER` - Cloudinary folder for uploaded car images.
- `PUBLIC_UPLOAD_BASE_URL` - Public base URL used to build uploaded file URLs.
- `VITE_API_BASE_URL` - Frontend API base URL, including `/api/v1`.
- `VITE_PUBLIC_SITE_URL` - Public frontend site URL.
- `VITE_APP_NAME` - Frontend application name, if needed by the deployment.

Production secrets must be managed by the deployment platform and must not be committed. Backend PostgreSQL production placeholders live in `apps/backend/.env.production.example`.

## Staging

Staging templates live in:

- `apps/backend/.env.staging.example`
- `apps/frontend/.env.staging.example`

See `docs/STAGING.md` for service setup, startup order, seed, smoke tests, and rollback.

## PostgreSQL Staging Target

Falcon keeps `apps/backend/prisma/schema.prisma` on SQLite for local development. PostgreSQL staging uses `apps/backend/prisma/schema.postgresql.prisma` and `DATABASE_URL_STAGING`. See `docs/STAGING_DATABASE.md`.

## Storage

Local uploads in `apps/backend/uploads` are development-only. Before launch, replace local disk storage with Cloudinary, S3, Supabase Storage, or another managed object storage provider. See `docs/STORAGE.md`.

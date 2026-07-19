# Falcon Deployment Readiness

Falcon is not ready to deploy to production yet. This document defines the checklist for a future production deployment.

## Required Checks

- Run `corepack pnpm install`.
- Run `corepack pnpm --filter @falcon/backend run prisma:generate`.
- Run `corepack pnpm typecheck`.
- Run `corepack pnpm build`.
- Run backend seed only in controlled environments: `corepack pnpm --filter @falcon/backend run seed`.

## Runtime Services

- Frontend: static Vite build from `apps/frontend`.
- Backend: Node.js process from `apps/backend/dist/index.js`.
- Database: PostgreSQL in production.
- Storage: managed object storage in production.

## Environment Variables

Backend:

- `NODE_ENV=production`
- `PORT`
- `DATABASE_URL`
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

Frontend:

- `VITE_API_BASE_URL`
- `VITE_PUBLIC_SITE_URL`

## Database

Local development currently uses SQLite. Before production:

- Change Prisma datasource provider to `postgresql`.
- Use a managed PostgreSQL database.
- Replace `prisma db push` with Prisma migrations.
- Run migration checks in CI before deployment.
- Back up production data before every migration.

## Storage

Local uploads are development-only. Before production:

- Use `STORAGE_PROVIDER=cloudinary` or move car image uploads to another managed storage provider.
- Replace the local storage provider with a cloud `StorageProvider` implementation.
- Store only public object URLs or object keys in the database.
- Add image scanning and stricter MIME validation if the storage provider supports it.

## SEO

The static `sitemap.xml` is a placeholder. Generate a production sitemap from:

`GET /api/v1/seo/sitemap-data`

The generated sitemap must use the final public domain.

## Not A Deployment Command

This repository should not be deployed until the production blockers in `README.md` and `SECURITY.md` are resolved.

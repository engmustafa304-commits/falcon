# Falcon Staging Deployment

This runbook prepares a real private staging deployment using Vercel, Railway, Neon PostgreSQL, and Cloudinary. Do not commit real secrets.

## Target Services

- Frontend: Vercel
- Backend: Railway
- Database: Neon PostgreSQL
- Image storage: Cloudinary

## 1. Create Cloudinary Credentials

1. Create a Cloudinary cloud for Falcon staging.
2. Create API credentials with upload and delete permissions.
3. Use this folder for staging car images:

```env
CLOUDINARY_FOLDER=falcon/staging/cars
```

Cloudinary upload responses must be HTTPS `secure_url` values. Falcon stores the URL and optional `storagePublicId`; it never stores image binaries in the database.

## 2. Add Cloudinary Env Vars

Set these on the Railway backend service:

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
CLOUDINARY_FOLDER=falcon/staging/cars
```

Do not add these values to source control.

## 3. Create Railway Backend Service

Recommended setup:

1. Create a Railway service from this repository.
2. Use the repository root as the Railway service root.
3. Railway reads `railway.json`.
4. The build command installs with Corepack/pnpm and builds `@falcon/backend`.
5. The start command runs `corepack pnpm --filter @falcon/backend run start:railway`.

`start:railway` validates required env vars, generates Prisma Client from `apps/backend/prisma/schema.postgresql.prisma`, runs `prisma migrate deploy`, then starts `dist/index.js`.

## 4. Add Railway Environment Variables

Required Railway staging variables:

```env
NODE_ENV=staging
DATABASE_URL=<Neon pooled or direct PostgreSQL URL>
JWT_ACCESS_SECRET=<long random secret>
JWT_REFRESH_SECRET=<long random secret>
CORS_ORIGINS=https://falcon-staging.vercel.app
FRONTEND_URL=https://falcon-staging.vercel.app
API_PUBLIC_URL=https://<railway-backend-domain>
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
CLOUDINARY_FOLDER=falcon/staging/cars
STAGING_SUPER_ADMIN_EMAIL=<owner-email>
STAGING_SUPER_ADMIN_PASSWORD=<one-time strong password>
STAGING_SUPER_ADMIN_NAME=Falcon Staging Owner
STAGING_SUPER_ADMIN_TENANT_ID=platform
```

Neon provides `DATABASE_URL`. In deployed Railway runtime, use `DATABASE_URL`, not `DATABASE_URL_STAGING`.

## 5. Deploy Backend

Deploy the Railway backend. The service should:

1. install dependencies with pnpm,
2. generate PostgreSQL Prisma Client,
3. build TypeScript,
4. run PostgreSQL migrations with `prisma migrate deploy`,
5. start the compiled API.

Production and staging must not use `prisma db push`.

## 6. Test Health And Readiness

Check:

```bash
curl https://<railway-backend-domain>/health
curl https://<railway-backend-domain>/ready
```

Expected:

- `/health` returns `status: ok` without requiring database access.
- `/ready` returns `status: ready` only when Neon connectivity succeeds.

## 7. Run Staging Seed

Run manually once after the backend deploys:

```bash
corepack pnpm --filter @falcon/backend run seed:staging:pg
```

The seed uses environment-provided credentials, creates or updates the `SUPER_ADMIN`, hashes the password, and is safe to run repeatedly. Do not run the seed automatically on every server restart.

## 8. Create Vercel Frontend Project

Recommended setup:

1. Create a Vercel project for the same repository.
2. Set the Vercel project root directory to `apps/frontend`.
3. Vercel reads `apps/frontend/vercel.json`.
4. The config installs from the monorepo root and builds `@falcon/frontend`.
5. SPA rewrites send browser refreshes back to `index.html`.

## 9. Add Vercel Environment Variables

Required Vercel staging variables:

```env
VITE_API_BASE_URL=https://<railway-backend-domain>/api/v1
VITE_PUBLIC_SITE_URL=https://<vercel-frontend-domain>
```

Do not hardcode localhost in staging or production frontend builds.

## 10. Deploy Frontend

Deploy the Vercel frontend. Verify direct browser refresh works on:

- `/cars/:id`
- `/dealers/:id`
- `/admin/dashboard/*`
- `/dealer/dashboard/*`
- `/account`

## 11. Update Backend CORS

After Vercel gives the staging URL, update Railway:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://<vercel-frontend-domain>
FRONTEND_URL=https://<vercel-frontend-domain>
```

Redeploy or restart the Railway backend after changing CORS.

## 12. Verify Cloudinary Status

Login as `SUPER_ADMIN`, then call:

```bash
curl https://<railway-backend-domain>/api/v1/admin/storage/status \
  -H "Authorization: Bearer <token>"
```

Expected safe shape:

```json
{
  "data": {
    "provider": "cloudinary",
    "configured": true,
    "cloudNamePresent": true,
    "folder": "falcon/staging/cars"
  }
}
```

The endpoint must never return Cloudinary API keys, secrets, database URLs, or passwords.

## 13. Complete Smoke Test

- Login as `SUPER_ADMIN`.
- Register `DEALER_OWNER`.
- Confirm dealer profile is created.
- Verify dealer from admin dashboard.
- Add a car from dealer dashboard.
- Upload multiple images.
- Set main image.
- Confirm public car listing appears.
- Open car detail page.
- Favorite and compare work.
- Submit lead from car detail.
- Confirm lead reaches dealer and admin dashboards.
- Submit finance request.
- Confirm finance request reaches dealer and admin dashboards.
- Confirm notifications work.
- Confirm analytics update.
- Logout and login again.
- Refresh protected routes and verify no redirect loop.

## Deployment Blockers To Clear

- Real Railway backend URL is needed for Vercel `VITE_API_BASE_URL`.
- Real Vercel frontend URL is needed for Railway `CORS_ORIGINS`.
- Real Cloudinary credentials are needed before upload smoke testing.
- Neon migration must be applied through `prisma migrate deploy`.
- Staging super admin seed must be run manually once.

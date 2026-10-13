# Falcon Architecture

Falcon is a pnpm monorepo for an automotive SaaS platform. The repository currently contains a React/Vite frontend, an Express/Prisma backend, shared package placeholders, deployment configuration, and documentation.

## Workspace Layout

```text
apps/
  frontend/        React, TypeScript, Vite, TailwindCSS application.
  backend/         Node.js, Express, TypeScript, Prisma API.
packages/
  api-contracts/   Placeholder package for shared API contracts.
  config/          Placeholder package for shared configuration primitives.
  design-tokens/   Active shared design token package used by the frontend.
  security/        Placeholder package for shared security primitives.
  shared/          Placeholder package for shared utilities/types.
  tenant/          Placeholder package for tenant primitives.
  types/           Placeholder package for shared platform types.
docs/              Project documentation.
infrastructure/    Placeholder infrastructure documentation folders.
scripts/           Repository-level script documentation.
```

The root workspace is configured by `pnpm-workspace.yaml`, which includes `apps/*` and `packages/*`.

## Runtime Shape

```text
Browser
  |
  | VITE_API_BASE_URL, Bearer token
  v
React frontend
  |
  | REST JSON API / multipart upload
  v
Express backend
  |
  | Prisma Client
  v
SQLite locally / PostgreSQL schema for staging and production
```

Image uploads go through a storage abstraction. Local development can use filesystem uploads, while Cloudinary is implemented for managed storage.

## Frontend Architecture

The frontend is route-based and mostly page-level code split with `React.lazy` and `Suspense`. The homepage is eagerly imported. The frontend stores auth token and user data in `localStorage`, then sends the token as a Bearer token through the API client.

Important frontend roots:

- `apps/frontend/src/App.tsx` defines all public, dealer dashboard, admin dashboard, account, auth, favorites, compare, and design-system routes.
- `apps/frontend/src/services/` contains API service wrappers.
- `apps/frontend/src/design-system/` contains brand, primitive, token, and preview components.
- `apps/frontend/src/pages/` contains public marketplace pages, auth pages, dashboards, and account pages.

## Backend Architecture

The backend is an Express API with:

- global `helmet()`
- CORS allowlist from `CORS_ORIGINS`
- static `/uploads`
- JSON body limit of `1mb`
- request context and request logging middleware
- rate limiters for API, auth, and upload routes
- `/health` and `/ready`
- versioned API under `/api/v1`

Main files:

- `apps/backend/src/app.ts` creates and wires the Express app.
- `apps/backend/src/server.ts` starts the app and handles graceful shutdown.
- `apps/backend/src/routes/index.ts` mounts API route groups.
- `apps/backend/src/controllers/` implements route handlers.
- `apps/backend/src/database/prismaClient.ts` owns the singleton Prisma client.
- `apps/backend/src/config/env.ts` loads and validates runtime environment.

## Data Architecture

Local development uses `apps/backend/prisma/schema.prisma` with SQLite.

Staging/production preparation uses `apps/backend/prisma/schema.postgresql.prisma` with PostgreSQL. The two schemas currently mirror the same models and relations.

Core models:

- `User`
- `Dealer`
- `Car`
- `CarImage`
- `Lead`
- `FinanceRequest`
- `Favorite`
- `CompareItem`
- `Notification`

The current tenant field is `tenantId`. The implementation enforces dealer ownership in backend controllers for dealer-owned resources.

## Deployment Configuration

Railway backend deployment is configured at root `railway.json`.

Railway build command:

```bash
corepack enable && corepack pnpm install --frozen-lockfile --prod=false && corepack pnpm --filter @falcon/backend run build:railway
```

Railway start command:

```bash
corepack pnpm --filter @falcon/backend run start:railway
```

Vercel frontend deployment is configured in `apps/frontend/vercel.json`.

## Current Boundaries

- Public marketplace GET routes are available without auth.
- Write operations for cars, dealers, uploads, notifications, saved cars, and dashboard resources are protected where implemented.
- Admin API routes are protected by `requireAuth` and `requireSuperAdmin`.
- The shared packages are mostly structural placeholders except `@falcon/design-tokens`.


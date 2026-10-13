# Falcon AI Context

This file is the first-read memory for future AI assistants working on Falcon. Keep it factual, current, and short enough to understand the project before making changes.

## Project Overview

Falcon is a private monorepo for an enterprise-grade, Arabic-first automotive operating system. It combines a public marketplace experience, dealer dashboards, admin dashboards, authentication, marketplace APIs, local and cloud-ready image storage, and deployment preparation.

The repository is a TypeScript workspace managed by pnpm:

- Frontend: `apps/frontend`
- Backend: `apps/backend`
- Shared packages: `packages/*`
- Documentation: `docs`

The product is not only a dealership website. It is intended to support dealers, customers, marketplace listings, leads, finance requests, favorites, compare, notifications, analytics, admin management, and future multi-tenant expansion.

## Business Goals

- Support car buyers searching, viewing, saving, comparing, and requesting contact or financing.
- Support dealer owners managing their dealer profile, vehicles, leads, finance requests, and dashboard analytics.
- Support platform administrators managing users, dealers, cars, brands, categories, leads, finance requests, and analytics.
- Preserve a scalable SaaS foundation for future multi-country, multi-language, white-label, and production PostgreSQL/cloud-storage deployment.
- Maintain a premium Arabic-first user experience with Falcon's visual identity.

## Folder Responsibilities

### Root

- `package.json`: workspace-level scripts for dev, build, test, typecheck, Prisma generate/push, and seed.
- `pnpm-workspace.yaml`: workspace package registration.
- `tsconfig.base.json`: shared TypeScript compiler base.
- `railway.json`: Railway backend build/deploy configuration.
- `docs/`: developer documentation.

### Frontend: `apps/frontend`

- `src/App.tsx`: route map and route-level lazy loading.
- `src/pages/home`: homepage.
- `src/pages/marketplace`: public marketplace pages, detail pages, favorites, and compare.
- `src/pages/auth`: login/register pages.
- `src/pages/dashboard`: dealer dashboard pages.
- `src/pages/admin`: platform admin dashboard pages.
- `src/components`: reusable UI, navigation, cards, dashboard, SEO, notifications, and action components.
- `src/design-system`: Falcon visual foundation, primitives, tokens, preview route.
- `src/services`: frontend API service layer.
- `src/router`: protected route handling.
- `src/config`: shared frontend config and asset references.
- `src/styles`: global styles, font declarations, Tailwind layers.
- `public/images`: runtime public image assets and placeholders.

### Backend: `apps/backend`

- `src/app.ts`: Express app setup, middleware, health/readiness, route mounting.
- `src/index.ts` and `src/server.ts`: backend startup path.
- `src/config`: environment loading and seed config.
- `src/database/prismaClient.ts`: runtime Prisma client singleton.
- `src/routes`: API route modules.
- `src/controllers`: request handlers.
- `src/middlewares`: auth, optional auth, rate limits, request logging, errors, not found.
- `src/services/storage`: storage abstraction with local and Cloudinary providers.
- `src/services/notifications.ts`: notification helper service.
- `src/health`: health and readiness controllers.
- `prisma/schema.prisma`: local SQLite schema.
- `prisma/schema.postgresql.prisma`: PostgreSQL staging/production schema.
- `prisma/seed.ts`: local seed support.
- `scripts`: staging, deployment, storage doctor, test database, and PostgreSQL helper scripts.
- `uploads`: local development upload target; do not rely on it for production storage.

### Packages: `packages/*`

Workspace packages exist for future shared concerns:

- `api-contracts`
- `config`
- `design-tokens`
- `security`
- `shared`
- `tenant`
- `types`

Several packages currently expose minimal placeholder-style TypeScript entry points. Do not assume they contain complete domain logic.

## Architecture Summary

Frontend:

- React 19, TypeScript, Vite, React Router 7, TailwindCSS, Framer Motion, Lucide icons.
- Homepage is eagerly loaded.
- Most routes are lazy loaded with `Suspense`.
- Marketplace pages use API-first data with mock fallback where implemented.
- Auth state is stored client-side and used by `ProtectedRoute`.

Backend:

- Node.js, Express, TypeScript, Prisma.
- Local development uses SQLite through `prisma/schema.prisma`.
- Staging/production preparation uses PostgreSQL through `prisma/schema.postgresql.prisma`.
- Express mounts public and protected APIs under `/api/v1`.
- Legacy non-v1 routes exist for `/api/cars` and `/api/dealers`; prefer `/api/v1`.
- Security middleware includes Helmet, CORS allowlist handling, JSON body size limit, and rate limiting.
- Uploads use a storage abstraction. Local is default unless `STORAGE_PROVIDER=cloudinary`.

Database:

- Prisma models include users, dealers, cars, car images, leads, finance requests, favorites, compare items, notifications, brands, and categories.
- Auth roles include `SUPER_ADMIN`, `ADMIN`, `DEALER_OWNER`, `DEALER_MANAGER`, and `CUSTOMER`.
- Dealer-owner ownership rules are enforced in protected car/dealer flows.

Deployment:

- Railway backend build is prepared for PostgreSQL Prisma generation and TypeScript compilation.
- Local SQLite behavior must remain intact.

## Coding Conventions

- TypeScript everywhere.
- Prefer existing service, controller, route, and component patterns before adding new abstractions.
- Keep API code split by route/controller/service concerns.
- Use Zod validation where request validation already exists or where adding new API input.
- Use the Prisma singleton instead of creating duplicate `new PrismaClient()` instances.
- Keep GET marketplace endpoints public unless the existing authorization model says otherwise.
- Keep write/admin/dealer operations protected.
- Use Arabic UX messages in user-facing UI and API errors where the existing code does.
- Keep UI responsive and RTL-first.
- Avoid hardcoded secrets, credentials, database URLs, or Cloudinary values.

## Naming Conventions

- React components: `PascalCase`.
- Page files: `SomethingPage.tsx` for public/auth pages, descriptive names for dashboards.
- Services: `carsApi.ts`, `dealersApi.ts`, `authApi.ts`, etc.
- Backend route files: plural resource names such as `cars.ts`, `dealers.ts`, `leads.ts`.
- Backend controller files: resource-oriented names such as `cars.ts`, `adminCars.ts`.
- Prisma IDs are strings.
- Public API paths should prefer `/api/v1/...`.
- Arabic labels should be clear, short, and consistent with existing copy.

## Business Rules

- `SUPER_ADMIN` can access admin dashboard and admin endpoints.
- Dealer dashboard is for `SUPER_ADMIN`, `ADMIN`, `DEALER_OWNER`, and `DEALER_MANAGER` according to current frontend route protection.
- Customer users must not access dealer/admin dashboards.
- Registering a `DEALER_OWNER` should create or associate a dealer profile as implemented in the backend.
- Dealer owners should manage only their own dealer profile and cars.
- Public car/dealer/brand/category marketplace browsing remains public.
- Car images support legacy `Car.imageUrl` and gallery images through `CarImage`.
- Use gallery main image first where the existing mapping supports it, then `imageUrl`, then placeholder fallback.
- Local uploads store URLs, never image binary in the database.

## Current Limitations

- SQLite is local-development only.
- PostgreSQL has a separate schema and workflow; do not replace local SQLite without explicit review.
- Cloudinary provider exists, but production/staging credentials must remain in env/secret managers only.
- Some shared packages are foundation placeholders.
- Some UI and dashboard flows still use mock fallback data when APIs fail or return empty.
- Lint scripts are placeholders for frontend/backend.
- This is not a fully deployed production system yet.

## Design System

Falcon is Arabic-first, premium, minimal, and automotive-focused.

Core visual direction:

- White dominant backgrounds.
- Dark navy headings: `#0F172A`.
- Body text: `#475569`.
- Muted text: `#64748B`.
- Accent turquoise: `#43BFC7`; use as accent, not as the dominant surface color.
- Rounded cards, soft shadows, minimal borders.
- RTL-first layouts.
- Lucide icons only for interface icons.
- Local fonts are prepared through frontend font CSS; Arabic and English font variables exist.

Important:

- Do not touch the homepage hero design unless explicitly requested.
- Do not redesign existing UI while doing backend, docs, env, or deployment work.
- Reuse existing design-system primitives and components before creating new ones.

## Common Commands

From the repository root:

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
```

Backend:

```bash
corepack pnpm --filter @falcon/backend dev
corepack pnpm --filter @falcon/backend typecheck
corepack pnpm --filter @falcon/backend build
corepack pnpm --filter @falcon/backend test
corepack pnpm --filter @falcon/backend prisma:generate
corepack pnpm --filter @falcon/backend prisma:push
corepack pnpm --filter @falcon/backend seed
corepack pnpm --filter @falcon/backend storage:doctor
corepack pnpm --filter @falcon/backend staging:doctor
```

Frontend:

```bash
corepack pnpm --filter @falcon/frontend dev
corepack pnpm --filter @falcon/frontend typecheck
corepack pnpm --filter @falcon/frontend build
corepack pnpm --filter @falcon/frontend test
```

PostgreSQL schema validation:

```bash
corepack pnpm --filter @falcon/backend exec prisma validate --schema=prisma/schema.postgresql.prisma
```

## Development Workflow

1. Read this file and the relevant docs in `docs/`.
2. Inspect existing code before changing anything.
3. Keep changes scoped to the user request.
4. Preserve local SQLite unless the user explicitly asks for PostgreSQL migration changes.
5. Preserve existing routes and UI unless explicitly requested.
6. Use API services on the frontend instead of direct fetch calls in page components where practical.
7. For backend changes, update route/controller/validation/storage patterns consistently.
8. Run focused checks first, then root `typecheck`, `build`, and `test` when the change justifies it.
9. Never print or commit secrets.
10. Report exactly what changed and what was verified.

## Files That Should Never Be Modified Without Review

These files affect runtime, deployment, secrets, schema, or major UX and should be changed only with clear user intent:

- `apps/backend/.env`
- `apps/backend/.env.staging`
- `apps/backend/.env.production`
- `apps/frontend/.env`
- `apps/frontend/.env.staging`
- `apps/frontend/.env.production`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/schema.postgresql.prisma`
- `apps/backend/src/database/prismaClient.ts`
- `apps/backend/src/config/env.ts`
- `apps/backend/scripts/start-staging.mjs`
- `apps/backend/scripts/start-deployed.mjs`
- `apps/backend/scripts/deployment-runtime.mjs`
- `railway.json`
- `apps/frontend/src/pages/home/HomePage.tsx`
- `apps/frontend/src/App.tsx`
- `.gitignore`

Never commit generated secrets, database files, local uploads, or credentials.

## Recommended Workflow For Future AI Development

- Start by identifying whether the task is frontend, backend, database, docs, deployment, or environment-only.
- Use `rg` and focused file reads before editing.
- If the task is UI-related, check existing components and design-system tokens first.
- If the task is API-related, inspect route, controller, validation, service, and Prisma schema together.
- If the task touches auth or ownership, verify role restrictions and dealer ownership rules.
- If the task touches storage, preserve both local and Cloudinary provider behavior.
- If the task touches staging or Railway, keep local SQLite untouched and avoid printing secrets.
- If adding data fields, update both SQLite and PostgreSQL schemas only when explicitly required.
- Keep mock fallback behavior unless the user explicitly asks to remove it.
- Do not create new business features during foundation, docs, env, or deployment tasks.
- Prefer small, verifiable changes and run the closest relevant checks before final reporting.

# Falcon

Falcon is the foundation for a world-class enterprise Automotive Operating System for car dealerships.

This is not a dealership website. This is not a marketplace only. Falcon is a multi-tenant SaaS platform foundation for dealership operations, tenant websites, internal dashboards, inventory, customers, employees, finance workflows, integrations, analytics, localization, white-label deployments, and future automotive commerce infrastructure.

## Scale Target

Falcon must be able to support:

- 100,000+ dealerships.
- Millions of vehicles.
- Millions of visitors.
- Multi-country expansion.
- Multi-language experiences.
- White-label tenant deployments.

## Product Philosophy

Falcon should feel simple, elegant, minimal, fast, professional, and premium.

The quality bar is inspired by Apple, Stripe, Linear, Notion, Vercel, and Shopify: clear systems, beautiful restraint, high performance, excellent details, and developer-friendly architecture.

## Tech Stack

- Frontend: React, TypeScript, Vite, TailwindCSS, Framer Motion, React Router.
- Backend: Node.js, Express, TypeScript, Prisma.
- Database: SQLite for local development. PostgreSQL is the production target.
- Architecture: Multi-tenant SaaS.

## Repository Scope

This repository currently contains the project foundation plus local working platform flows:

- Workspace configuration.
- Folder architecture.
- Documentation.
- Design system direction.
- Brand guidelines.
- Module boundaries.
- Public marketplace pages.
- Dealer and admin dashboard prototypes connected to local API data.
- Local authentication, dealer ownership, cars, galleries, leads, finance requests, favorites, compare, analytics, notifications, and SEO foundations.

Falcon is not production-ready yet and must not be deployed until the blockers below are addressed.

## Production Readiness Checklist

Ready foundations:

- TypeScript monorepo structure.
- React/Vite frontend and Express/Prisma backend.
- Local SQLite development database.
- JWT auth foundation using environment-based secrets.
- Role-protected dealer and admin routes.
- Env-driven CORS allowlist.
- Upload MIME/extension/size validation for local development.
- SEO metadata foundation and sitemap data endpoint.
- Local super admin seed.

Production blockers:

- Replace SQLite with PostgreSQL and Prisma migrations.
- Replace local disk uploads with managed object storage.
- Add rate limiting and abuse protection.
- Add structured logging, audit logs, monitoring, and alerting.
- Add automated tests for auth, permissions, uploads, payments/finance, and admin actions.
- Generate dynamic production sitemap with absolute public URLs.
- Configure production secrets in the hosting platform.
- Review all fallback/mock data paths before launch.

## Core Commands

- `corepack pnpm dev`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- `corepack pnpm prisma:generate`
- `corepack pnpm prisma:push`
- `corepack pnpm seed`

## Core Documents

- `VISION.md`
- `ARCHITECTURE.md`
- `PROJECT_STRUCTURE.md`
- `DESIGN_SYSTEM.md`
- `BRAND_GUIDELINES.md`
- `ROADMAP.md`
- `CONTRIBUTING.md`
- `ENVIRONMENT.md`
- `docs/ENGINEERING_PRINCIPLES.md`
- `DEPLOYMENT.md`
- `SECURITY.md`
- `docs/DATABASE.md`
- `docs/STORAGE.md`
- `docs/STAGING.md`
- `docs/STAGING_DATABASE.md`
- `docs/STAGING_STORAGE.md`
- `docs/SEO.md`

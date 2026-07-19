# Falcon Staging Database

Falcon local development stays on SQLite. PostgreSQL staging uses a separate Prisma schema so staging can be tested safely without overwriting the local schema.

## Schema Files

Local development:

```text
apps/backend/prisma/schema.prisma
```

Provider:

```prisma
provider = "sqlite"
url      = env("DATABASE_URL")
```

PostgreSQL staging:

```text
apps/backend/prisma/schema.postgresql.prisma
```

Provider:

```prisma
provider = "postgresql"
url      = env("DATABASE_URL")
```

The PostgreSQL schema mirrors the current models, enums, indexes, relations, tenant fields, auth models, galleries, leads, finance requests, favorites, compare items, and notifications.

## Environment Contract

Keep local SQLite in `DATABASE_URL`:

```env
DATABASE_URL="file:./dev.db"
```

Use `DATABASE_URL_STAGING` in `apps/backend/.env.staging` for local staging scripts; the local staging runtime maps it into the single runtime `DATABASE_URL` before Prisma initializes. Neon URLs should use SSL:

```env
DATABASE_URL_STAGING="postgresql://USER:PASSWORD@HOST:5432/falcon_staging?sslmode=require"
```

For Railway deployed staging, set Neon's connection string directly as `DATABASE_URL`. Do not set or depend on `DATABASE_URL_STAGING` in deployed runtime.

Use separate credentials for local, staging, and production. Never point staging scripts at production.

## Create A Staging Database

1. Create a Neon project for Falcon staging.
2. Create a database named `falcon_staging`.
3. Create a staging-only database role with migration permissions.
4. Copy the pooled or direct Neon connection string.
5. Add `?sslmode=require` if Neon did not include it.
6. Store the value in `apps/backend/.env.staging` as `DATABASE_URL_STAGING`.
7. Do not commit `apps/backend/.env.staging`.

## Migration Commands

Validate both schemas:

```bash
corepack pnpm --filter @falcon/backend exec prisma validate --schema=prisma/schema.prisma
corepack pnpm --filter @falcon/backend exec prisma validate --schema=prisma/schema.postgresql.prisma
```

Validate the real Neon staging env:

```bash
corepack pnpm --filter @falcon/backend prisma:validate:pg:staging
```

Generate the PostgreSQL Prisma client:

```bash
corepack pnpm --filter @falcon/backend prisma:generate:pg
```

Create the initial reviewed staging migration against Neon:

```bash
corepack pnpm --filter @falcon/backend prisma:migrate:init:pg:staging
```

Review the generated SQL before deploying. It should contain table, enum, foreign-key, and index creation. It should not contain destructive statements such as `DROP TABLE`, `DROP COLUMN`, or broad `DELETE`.

Generate the PostgreSQL client using `apps/backend/.env.staging`:

```bash
corepack pnpm --filter @falcon/backend prisma:generate:pg:staging
```

Deploy reviewed migrations in staging:

```bash
corepack pnpm --filter @falcon/backend prisma:migrate:deploy:pg:staging
```

Check migration status:

```bash
corepack pnpm --filter @falcon/backend prisma:status:pg:staging
```

After PostgreSQL-specific work, regenerate the local SQLite client before returning to local development:

```bash
corepack pnpm --filter @falcon/backend prisma:generate
```

## Staging Super Admin Seed

Set these only in staging secrets:

```env
NODE_ENV=staging
STAGING_SUPER_ADMIN_EMAIL="engmustafa304@gmail.com"
STAGING_SUPER_ADMIN_PASSWORD="replace-with-a-one-time-strong-staging-password"
STAGING_SUPER_ADMIN_NAME="Falcon Staging Owner"
STAGING_SUPER_ADMIN_TENANT_ID="platform"
```

Then run:

```bash
corepack pnpm --filter @falcon/backend seed:staging:pg
```

The seed script fails in staging if the email or password is missing. It does not print the email or password.

## Staging Backend Runtime

Build and start staging mode with the PostgreSQL-generated Prisma client:

```bash
corepack pnpm --filter @falcon/backend build:staging
corepack pnpm --filter @falcon/backend start:staging
```

For local staging development:

```bash
corepack pnpm --filter @falcon/backend dev:staging
```

These commands load `apps/backend/.env.staging` and use `schema.postgresql.prisma`.

Before starting, run:

```bash
corepack pnpm --filter @falcon/backend staging:doctor
```

The doctor rejects placeholder database URLs and prints only the database host/name, not the full connection string.

At runtime, staging maps `DATABASE_URL_STAGING` into `DATABASE_URL` before Prisma initializes. The PostgreSQL schema also reads `DATABASE_URL`, so migrations, seed, `/ready`, and every controller point at the same Neon database.

## Data Portability Review

Current schema risks and notes:

- Enums: PostgreSQL stores enums as database enum types. Review enum changes carefully because removing or renaming enum values requires explicit migrations.
- Unique constraints: `User.email`, favorites, and compare items have unique constraints that should migrate cleanly.
- Indexes: tenant, city, dealer, status, and relation indexes are portable. Add compound indexes later only after query patterns stabilize.
- Text lengths: string fields currently use default unbounded text semantics. Add explicit length constraints later if product rules require them.
- Optional relations: lead, finance request, and dealer owner relations use optional foreign keys with `SetNull`, which is safe for deletion workflows.
- Cascade behavior: cars cascade from dealers; favorites, compare items, car images, and notifications cascade from their owners. Confirm this is still desired before production data grows.
- Integer pricing: prices use `Int` in SAR. This is safe for current SAR values; use `BigInt` only if future requirements exceed 32-bit integer range.
- JSON fields: none currently exist. If added later, prefer Prisma `Json` and validate shapes at API boundaries.
- Timestamp fields: `createdAt` and `updatedAt` are portable. PostgreSQL timezone policy should be UTC.

## SQLite-To-PostgreSQL Data Migration Notes

This repo does not include an automated SQLite-to-PostgreSQL data migration yet.

Recommended future approach:

1. Freeze writes in the source environment.
2. Export SQLite data table-by-table in dependency order.
3. Normalize enum values and timestamps.
4. Import users, dealers, cars, car images, leads, finance requests, favorites, compare items, and notifications.
5. Rebuild indexes through Prisma migrations.
6. Run count checks and sampled record checks.
7. Run smoke tests against the PostgreSQL API.

## Verification Checklist

- SQLite schema validates.
- PostgreSQL schema validates.
- PostgreSQL migrations apply to an empty staging database.
- `/health` returns `ok`.
- `/ready` returns `ready`.
- Staging super admin seed succeeds.
- Auth register/login/me works.
- Dealer owner auto-creates a dealer profile.
- Dealer owner can create and edit cars.
- Car image upload works with Cloudinary.
- Public `/cars` and `/cars/:id` use API data.
- Leads, finance requests, favorites, compare, notifications, and admin dashboards still work.

## Rollback Checklist

- Take a staging database backup before migration.
- Keep the previous backend artifact available.
- If migration fails, stop rollout and restore the pre-migration backup.
- If `/ready` fails, route traffic away from the new backend.
- Re-run `prisma:status:pg` after rollback.
- Preserve migration and app logs for diagnosis.

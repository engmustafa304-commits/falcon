# Falcon Database Guide

Falcon uses SQLite for local development today and is designed to move to PostgreSQL before production.

## Current Local Setup

The backend Prisma datasource currently remains:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Local backend environment:

```env
DATABASE_URL="file:./dev.db"
```

Use SQLite only for local development, prototypes, and isolated testing. It is not suitable for Falcon production scale, multi-tenant concurrency, backups, operational analytics, or managed high availability.

## Production Target

Staging and production should use managed PostgreSQL. Staging uses the dedicated PostgreSQL Prisma schema:

```text
apps/backend/prisma/schema.postgresql.prisma
```

The staging connection string is:

```env
DATABASE_URL_STAGING="postgresql://USER:PASSWORD@HOST:5432/falcon_staging?sslmode=require"
```

The future production backend environment should use a PostgreSQL connection string:

```env
DATABASE_URL="postgresql://falcon_user:replace-password@postgres.example.com:5432/falcon?schema=public"
```

Recommended production database requirements:

- Managed PostgreSQL with automated backups.
- Point-in-time recovery.
- Connection pooling.
- Private networking where supported.
- Separate production, staging, and development databases.
- Monitored CPU, memory, storage, locks, and slow queries.

## Prisma Commands

Local development:

```bash
corepack pnpm --filter @falcon/backend prisma:generate
corepack pnpm --filter @falcon/backend prisma:push
```

Production deployment:

```bash
corepack pnpm --filter @falcon/backend prisma:generate:pg
corepack pnpm --filter @falcon/backend prisma:migrate:deploy:pg
```

Use `prisma db push` only for local development. Production must use reviewed Prisma migrations.

## Migration Checklist

Before switching production to PostgreSQL:

1. Keep `apps/backend/prisma/schema.prisma` on SQLite for local development.
2. Use `apps/backend/prisma/schema.postgresql.prisma` for PostgreSQL staging.
3. Set `DATABASE_URL_STAGING` from `apps/backend/.env.staging.example`; staging startup maps it into the runtime `DATABASE_URL` before Prisma initializes.
4. Generate an initial Prisma migration against PostgreSQL with `prisma:migrate:dev:pg`.
5. Review generated SQL before applying it to staging or production.
6. Run migrations in staging with `corepack pnpm --filter @falcon/backend prisma:migrate:deploy:pg`.
7. Run backend typecheck/build.
8. Smoke test auth, dealer ownership, car writes, image gallery, leads, finance requests, favorites, compare, analytics, and notifications.
9. Regenerate the local SQLite client with `corepack pnpm --filter @falcon/backend prisma:generate` after PostgreSQL-specific work.
10. Apply the same migration flow to production during a controlled release window.
11. Verify backups and restore procedures before accepting production traffic.

## Compatibility Review

The current Prisma schema avoids provider-specific native types. This is good preparation for PostgreSQL:

- IDs use `String @id @default(cuid())`, which is portable.
- Money-like values use integer SAR fields such as `price`, `downPayment`, and `monthlyIncome`.
- Dates use Prisma `DateTime`.
- Enums are Prisma enums and become PostgreSQL enum types in `schema.postgresql.prisma` migrations.
- Relations use standard `Cascade` and `SetNull` referential actions.
- The schema does not use `@db.*` native types.

## Schema Risks To Review Before Launch

- `User.email` is globally unique. Confirm this is the desired policy for multi-tenant operation.
- PostgreSQL enum changes require careful migrations. Renaming enum values is more sensitive than in SQLite.
- Text fields currently have no database length limits. Add application validation and consider PostgreSQL-specific `@db.VarChar` only after choosing final limits.
- High-volume marketplace queries will need production indexes beyond the current local foundation, especially composite tenant/status/city/brand/price indexes.
- Integer SAR pricing is correct for whole-riyal prices. If halalas or multi-currency precision become required, introduce a minor-unit strategy or decimal strategy deliberately.
- `CarImage.isMain` is not uniquely constrained per car. Application logic currently manages this, but PostgreSQL can later enforce it with a partial unique index if needed.

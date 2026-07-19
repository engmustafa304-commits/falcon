# Falcon Backend API Docs

This API is an early production-oriented foundation for Falcon. It uses Express, TypeScript, Prisma, SQLite for local development, and versioned REST routes.

## Base URLs

- Versioned API: `/api/v1`
- Compatibility routes requested during setup:
  - `/api/cars`
  - `/api/dealers`

## Health

### `GET /api/v1/health`

Returns service health metadata.

```json
{
  "data": {
    "service": "falcon-api",
    "status": "ok",
    "timestamp": "2026-07-06T00:00:00.000Z"
  }
}
```

## Dealers

### `GET /api/v1/dealers`

Returns all dealers with a car count.

### `POST /api/v1/dealers`

Creates a dealer.

```json
{
  "name": "معرض الخليج للسيارات",
  "city": "الرياض",
  "email": "sales@example.com",
  "phone": "+966550000000",
  "isVerified": true,
  "tenantId": "tenant_riyadh_001"
}
```

Compatibility aliases:

- `GET /api/dealers`
- `POST /api/dealers`

## Cars

### `GET /api/v1/cars`

Returns all cars with selected dealer information.

### `POST /api/v1/cars`

Creates a car listing.

```json
{
  "dealerId": "dealer_id_from_database",
  "brand": "Mercedes",
  "model": "E300 AMG",
  "year": 2025,
  "price": 375000,
  "city": "الرياض",
  "mileage": 1200,
  "status": "ACTIVE",
  "tenantId": "tenant_riyadh_001"
}
```

Compatibility aliases:

- `GET /api/cars`
- `POST /api/cars`

## Authentication Placeholder

`src/middlewares/authMiddleware.ts` provides a JWT bearer-token guard for future protected endpoints. Current car and dealer endpoints are intentionally unprotected while the API foundation is being shaped.

## Environment

Create `apps/backend/.env` from `apps/backend/.env.example`.

Required values:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## Commands

```bash
corepack pnpm --filter @falcon/backend prisma:generate
corepack pnpm --filter @falcon/backend prisma:push
corepack pnpm --filter @falcon/backend dev
```

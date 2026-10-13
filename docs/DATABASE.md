# Database

Falcon uses Prisma. The repository currently keeps two Prisma schemas:

- `apps/backend/prisma/schema.prisma` for local SQLite development.
- `apps/backend/prisma/schema.postgresql.prisma` for staging/production PostgreSQL preparation.

The schemas currently mirror the same models, relations, enums, indexes, and table mappings.

## Local SQLite

Local datasource:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Local env example uses:

```env
DATABASE_URL="file:./dev.db"
```

Common local commands:

```bash
corepack pnpm --filter @falcon/backend prisma:generate
corepack pnpm --filter @falcon/backend prisma:push
```

Local SQLite `.db` files are ignored by Git.

## PostgreSQL Schema

PostgreSQL datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

PostgreSQL commands:

```bash
corepack pnpm --filter @falcon/backend prisma:generate:pg
corepack pnpm --filter @falcon/backend prisma:migrate:dev:pg
corepack pnpm --filter @falcon/backend prisma:migrate:deploy:pg
corepack pnpm --filter @falcon/backend prisma:status:pg
```

Railway runtime uses `DATABASE_URL` with the PostgreSQL schema and runs `prisma migrate deploy`.

## Models

### User

Represents platform users.

Fields include:

- `id`
- `tenantId`
- `name`
- `email`
- `phone`
- `passwordHash`
- `role`
- `isActive`
- relations to dealers, favorites, compare items, notifications, leads, and finance requests

Roles:

- `SUPER_ADMIN`
- `ADMIN`
- `DEALER_OWNER`
- `DEALER_MANAGER`
- `CUSTOMER`

### Dealer

Represents a dealership profile.

Fields include:

- `id`
- `name`
- `city`
- `email`
- `phone`
- `isVerified`
- `tenantId`
- `ownerUserId`
- relations to cars, leads, and finance requests

Dealer owners are linked through `ownerUserId`.

### Car

Represents a vehicle listing.

Fields include:

- `id`
- `dealerId`
- `name`
- `brand`
- `model`
- `year`
- `price`
- `city`
- `mileage`
- `imageUrl`
- `transmission`
- `fuel`
- `status`
- `tenantId`
- relations to leads, finance requests, favorites, compare items, and images

Statuses:

- `DRAFT`
- `ACTIVE`
- `SUSPENDED`
- `SOLD`

### CarImage

Represents gallery image metadata for a car.

Fields include:

- `id`
- `carId`
- `url`
- `storagePublicId`
- `alt`
- `sortOrder`
- `isMain`
- `createdAt`

`storagePublicId` supports Cloudinary deletion when present.

### Lead

Represents contact interest.

Fields include:

- `tenantId`
- optional `userId`
- optional `carId`
- optional `dealerId`
- `name`
- `phone`
- optional `email`
- optional `message`
- `source`
- `status`

Sources:

- `CAR_DETAIL`
- `DEALER_PAGE`
- `FINANCE_REQUEST`
- `WHATSAPP_CLICK`

Statuses:

- `NEW`
- `CONTACTED`
- `WON`
- `LOST`

### FinanceRequest

Represents a finance inquiry.

Fields include:

- `tenantId`
- optional `userId`
- optional `carId`
- optional `dealerId`
- `customerName`
- `phone`
- optional `email`
- optional `monthlyIncome`
- optional `downPayment`
- optional `financingPeriod`
- optional `employmentType`
- `status`

Statuses:

- `NEW`
- `REVIEWING`
- `APPROVED`
- `REJECTED`

### Favorite

Links a user to a saved car. The schema enforces unique `userId + carId`.

### CompareItem

Links a user to a compared car. The schema enforces unique `userId + carId`.

### Notification

Stores in-app notifications for a user.

Types:

- `INFO`
- `SUCCESS`
- `WARNING`
- `ERROR`
- `LEAD`
- `FINANCE`
- `CAR`
- `DEALER`

## Indexes And Relations

The schemas include indexes for common access paths:

- `tenantId`
- dealer owner
- dealer city
- car dealer
- car brand/model
- car city
- car image main/public ID
- lead/finance status and foreign keys
- notification read state and created date

Cascade behavior is used where child rows should be removed with parent records, such as cars under dealers and car images under cars. Optional relations such as lead car/dealer/user references use `SetNull`.

## Current Migration Notes

The repository includes schema files and scripts. It does not include committed Prisma migration folders. `apps/backend/prisma/migrations` is ignored by `.gitignore`.

Use `prisma db push` only for local development. Use reviewed PostgreSQL migrations and `prisma migrate deploy` for managed environments.


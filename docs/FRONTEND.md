# Frontend

The Falcon frontend lives in `apps/frontend`. It is a React 19, TypeScript, Vite, TailwindCSS application with React Router and a local design-system layer.

## Commands

From the repository root:

```bash
corepack pnpm --filter @falcon/frontend dev
corepack pnpm --filter @falcon/frontend typecheck
corepack pnpm --filter @falcon/frontend build
corepack pnpm --filter @falcon/frontend test
```

Root scripts also run frontend tasks:

```bash
corepack pnpm dev
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
```

## Environment

Frontend env examples are:

- `apps/frontend/.env.example`
- `apps/frontend/.env.staging.example`
- `apps/frontend/.env.production.example`

The frontend API client reads `VITE_API_BASE_URL`. Production builds throw if it is missing. Development falls back to a local API URL.

## Routing

Routes are defined in `apps/frontend/src/App.tsx`.

Public routes:

- `/`
- `/login`
- `/register`
- `/cars`
- `/cars/:id`
- `/dealers`
- `/dealers/:id`
- `/brands`
- `/brands/:slug`
- `/categories`
- `/categories/:slug`
- `/favorites`
- `/compare`
- `/design-system`

Authenticated account route:

- `/account`

Dealer/dashboard routes:

- `/dashboard` redirects to `/dealer/dashboard`
- `/dealer/dashboard`
- `/dealer/dashboard/cars`
- `/dealer/dashboard/leads`
- `/dealer/dashboard/finance-requests`
- `/dealer/dashboard/customers`
- `/dealer/dashboard/reports`
- `/dealer/dashboard/settings`

Admin dashboard routes:

- `/admin/dashboard`
- `/admin/dashboard/dealers`
- `/admin/dashboard/dealers/:dealerId/cars`
- `/admin/dashboard/cars`
- `/admin/dashboard/leads`
- `/admin/dashboard/finance-requests`
- `/admin/dashboard/users`
- `/admin/dashboard/brands`
- `/admin/dashboard/categories`
- `/admin/dashboard/reports`
- `/admin/dashboard/settings`

## Route Protection

`apps/frontend/src/router/ProtectedRoute.tsx` checks:

- token from `localStorage`
- stored user object from `localStorage`
- user role against route `allowedRoles`

If either token or role check fails, the user is redirected to `/login`.

## API Services

Frontend API wrappers live in `apps/frontend/src/services/`.

Important services:

- `apiClient.ts` - base URL, JSON request helpers, auth header helper.
- `authApi.ts` - login, register, me, logout, stored user helpers.
- `carsApi.ts` - cars, car images, search query params, backend-to-card mapping.
- `dealersApi.ts` - dealers and current dealer profile.
- `uploadsApi.ts` - multipart car image uploads.
- `leadsApi.ts` - public/dealer/admin lead calls.
- `financeRequestsApi.ts` - public/dealer/admin finance request calls.
- `savedCarsApi.ts` - favorites and compare.
- `notificationsApi.ts` - notification center calls.
- `analyticsApi.ts` - dealer/admin analytics.
- `adminCarsApi.ts`, `adminDealersApi.ts`, `adminUsersApi.ts` - admin resources.

## Data Fallbacks

Several public marketplace pages use API-first data and static mock data as fallback. Mock marketplace data lives near marketplace pages, for example `apps/frontend/src/pages/marketplace/marketplaceData.ts` and home data in `apps/frontend/src/pages/home/homeData.ts`.

## Assets

Asset constants are centralized in `apps/frontend/src/config/assets.ts`.

Public assets live under `apps/frontend/public/`, including:

- `fonts/`
- `images/`
- `robots.txt`
- `sitemap.xml`

Hero animation assets are imported from `apps/frontend/src/assets/hero/`.

## Tests

Frontend tests live in `apps/frontend/src/__tests__/` and run with Vitest plus Testing Library.


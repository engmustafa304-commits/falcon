# Falcon — المرحلة 1: تجهيز الـ Backend للإنتاج والموبايل

> الترتيب إلزامي. نفّذ برومبت واحد في جلسة Codex واحدة، راجع قائمة القبول، وبعدين انتقل للي بعده.
> كل برومبت مستقل (Codex يبدأ بدون ذاكرة)، لذلك القواعد الثابتة مكررة في كل واحد.

| # | البرومبت | الهدف | الخطورة |
|---|---|---|---|
| 1 | Auth & Tenant Security Fixes | قفل ثغرات التسجيل والتوثيق الذاتي والـ tenant | 🔴 حرجة |
| 2 | Refresh Tokens & Sessions | جلسات آمنة تصلح للويب والموبايل | 🔴 حرجة |
| 3 | Authorization Audit + Test Matrix | إثبات الصلاحيات endpoint بـ endpoint | 🟠 عالية |
| 4 | Brands & Categories (real data) | تحويل الماركات والفئات من mock إلى DB | 🟠 عالية |
| 5 | Vehicle Data Model Extension | حقول السيارة اللي يحتاجها السوق الخليجي | 🟡 متوسطة |
| 6 | Dashboards Real Data + Demo Fallback Gate | إزالة البيانات الوهمية من اللوحات | 🟡 متوسطة |
| 7 | Mobile-Ready API Layer | OpenAPI + pagination + app-config للموبايل | 🟡 متوسطة |
| 8 | Lint + Verify Gate | فحص موحّد قبل أي نشر | 🟢 أساس |

---

## البرومبت 1 — Auth & Tenant Security Fixes

```text
You are working in the Falcon monorepo (pnpm workspace: apps/backend = Express + Prisma + Zod, apps/frontend = React + Vite).

STANDING RULES
- First read AI_CONTEXT.md, then inspect every file listed under "Scope" BEFORE editing anything. Summarize what you found in 5–10 lines before changing code.
- Keep changes strictly scoped to this task. Do not refactor, rename, restyle, or touch unrelated files. Do not touch HomePage.tsx or any UI design.
- Do not modify .env files, railway.json, or deployment scripts. Do not run git commit/push.
- Preserve existing API response shapes unless this prompt explicitly changes them.
- After changes run, from repo root: corepack pnpm --filter @falcon/backend typecheck, corepack pnpm --filter @falcon/backend test, corepack pnpm --filter @falcon/frontend typecheck, corepack pnpm --filter @falcon/frontend build. All must pass. Report exact results.

GOAL
Close privilege-escalation and tenant-isolation holes where clients can set server-owned fields.

CONFIRMED PROBLEMS (verify each in code first)
1. apps/backend/src/controllers/auth.ts → registerSchema accepts `tenantId` from the client. Any registrant can place themselves in any tenant.
2. apps/backend/src/controllers/dealers.ts → createDealerSchema/updateDealerSchema accept `isVerified`, `tenantId`. A DEALER_OWNER can self-verify via POST /api/v1/dealers or PATCH /api/v1/dealers/me (payload is spread into prisma data).
3. apps/backend/src/controllers/cars.ts → createCarSchema accepts `tenantId` (and `dealerId`). Verify how non-admin create/update uses them; non-admins must never control tenantId or move cars across dealers.
4. Search all controllers for any other `...payload` spread into prisma create/update where the schema contains server-owned fields (tenantId, ownerUserId, isVerified, role, isActive, userId, dealerId for non-admins). List every finding.

REQUIRED CHANGES
A. Registration
- Remove `tenantId` from registerSchema. Server assigns tenant from a new optional env var DEFAULT_TENANT_ID (add to src/config/env.ts with default "platform"; add to .env.example files only — not real .env files).
- Keep `role` limited to CUSTOMER | DEALER_OWNER (dealer self-signup is a valid business flow). Dealer profile stays auto-created with isVerified=false.
- Use `.strict()` or explicit picking so unknown fields are rejected or ignored consistently (choose one approach and apply it to all schemas you touch; document which).
B. Dealers
- Split schemas: `dealerOwnerWritableSchema` (name, city, email, phone only) and `adminDealerWritableSchema` (adds isVerified, tenantId, ownerUserId if currently supported).
- Non-admin create/update must use the owner schema and server-set ownerUserId/tenantId. isVerified can ONLY change via the existing admin endpoint PATCH /api/v1/admin/dealers/:id/verify (or admin PATCH).
C. Cars
- Non-admin create: tenantId and dealerId are derived from the authenticated user's dealer, never from the body. Non-admin update must not change dealerId/tenantId.
D. Apply the same pattern to any other findings from step 4.
E. Frontend: apps/frontend/src/services/authApi.ts — remove tenantId from RegisterInput. Do not change any UI.

TESTS (add to apps/backend/src/__tests__/api.test.ts following existing style)
- Registering with tenantId "evil-tenant" results in user.tenantId === DEFAULT_TENANT_ID.
- DEALER_OWNER POST /dealers/me or PATCH /dealers/me with isVerified:true → dealer stays isVerified=false.
- DEALER_OWNER creating a car with tenantId/dealerId of another dealer → car is created under own dealer/tenant (or 400/403 — be explicit which, and consistent).
- DEALER_OWNER cannot update another dealer's car's dealerId.
- SUPER_ADMIN can still verify dealers (existing behavior preserved).

DELIVERABLE
- List of every file changed with a one-line reason.
- Table of all server-owned fields found and how each is now protected.
- Test + typecheck + build results.
```

**قائمة القبول:**
- [ ] كل الاختبارات القديمة والجديدة تنجح
- [ ] تسجيل الدخول والتسجيل في الواجهة شغالين بدون أي تغيير بصري
- [ ] الجدول اللي يسلّمه Codex يغطي كل الحقول اللي يحددها السيرفر

---

## البرومبت 2 — Refresh Tokens & Sessions

```text
You are working in the Falcon monorepo (apps/backend = Express + Prisma, apps/frontend = React + Vite).

STANDING RULES
- First read AI_CONTEXT.md and docs/DATABASE.md, then inspect: src/controllers/auth.ts, src/routes/auth.ts, src/middlewares/authMiddleware.ts, src/config/env.ts, src/controllers/adminUsers.ts, prisma/schema.prisma, prisma/schema.postgresql.prisma, prisma/migrations/, apps/frontend/src/services/apiClient.ts, apps/frontend/src/services/authApi.ts. Summarize before editing.
- Scope strictly to this task. No UI redesign. No .env edits (only *.example files). No git commit/push.
- Any Prisma model change MUST be applied to BOTH schema.prisma (SQLite) and schema.postgresql.prisma, and a new PostgreSQL migration must be created under prisma/migrations (do not edit the existing init migration). Local SQLite continues to use db push.
- After changes run backend typecheck + test, frontend typecheck + build. All must pass.

GOAL
Replace the single 7-day JWT with short-lived access tokens + rotating refresh tokens, suitable for both web and a future React Native app.

DESIGN
- Access token: JWT, 15 minutes (env JWT_ACCESS_TTL, default "15m"), same claims as today (sub, role, tenantId).
- Refresh token: opaque random 64-byte value (crypto.randomBytes), returned to client once; DB stores only SHA-256 hash.
- New model RefreshToken: id, userId (relation, cascade delete), tokenHash (unique), familyId, expiresAt, revokedAt?, replacedById?, createdAt, lastUsedAt?, userAgent?, ip?, deviceName? (optional, sent by client). Indexes on userId, familyId, expiresAt.
- TTL: 30 days (env JWT_REFRESH_TTL_DAYS, default 30).
- Rotation: POST /api/v1/auth/refresh { refreshToken } → revokes the used token, issues a new pair in the same family.
- Reuse detection: if a revoked token is presented, revoke the ENTIRE family and return 401 code REFRESH_TOKEN_REUSED.
- POST /api/v1/auth/logout { refreshToken } → revoke that token (idempotent, 204).
- POST /api/v1/auth/logout-all (requireAuth) → revoke all user tokens.
- GET /api/v1/auth/sessions (requireAuth) → list active sessions (id, deviceName, userAgent, createdAt, lastUsedAt). DELETE /api/v1/auth/sessions/:id revokes one owned session.
- Revoke all refresh tokens automatically when an admin deactivates a user, changes their role, or deletes them (adminUsers.ts).
- Login/register response: keep `token` (= access token) for backward compatibility AND add `accessToken`, `refreshToken`, `accessTokenExpiresAt`. Document `token` as deprecated.
- Use the existing JWT_REFRESH_SECRET only if needed (opaque tokens don't need it); explain the choice.
- Put token logic in a new service file src/services/authTokens.ts (issue, rotate, revoke, revokeAllForUser). Controllers stay thin.
- Apply the existing authRateLimiter to /refresh as well (verify mounting).
- Add a cleanup function deleteExpiredRefreshTokens() (not scheduled yet; just exported and tested).

FRONTEND (minimal, no UI changes)
- authApi.ts: persist refreshToken alongside access token; logout() calls /auth/logout then clears storage.
- apiClient.ts: on 401 for an authenticated request, call /auth/refresh ONCE (single in-flight promise shared by concurrent requests), retry the original request, and on failure clear auth and let ProtectedRoute redirect. Must not loop.

TESTS
- login returns accessToken + refreshToken; /auth/me works with access token.
- refresh rotates: old refresh token no longer works; new one does.
- reuse of rotated token → 401 REFRESH_TOKEN_REUSED and the newest token in the family is also revoked.
- logout revokes; logout-all revokes all.
- admin deactivating a user → that user's refresh fails.
- expired refresh token → 401.

DELIVERABLE: files changed + reasons, migration name, new env vars (added to .env.example files), test/typecheck/build results, and a short note on how the mobile app should store tokens (SecureStore).
```

**قائمة القبول:**
- [ ] `prisma validate` ينجح على الـ schema الخاصة بـ PostgreSQL
- [ ] في الويب: تسجيل الدخول، ثم الانتظار 15 دقيقة (أو تقليل المدة مؤقتاً للتجربة)، والصفحات تكمل شغلها بدون ما تطلع المستخدم
- [ ] تسجيل الخروج يلغي الجلسة من السيرفر فعلاً

---

## البرومبت 3 — Authorization Audit + Test Matrix

```text
You are working in the Falcon monorepo backend (apps/backend).

STANDING RULES
- First read AI_CONTEXT.md and ROLE_PERMISSIONS.md, then read EVERY file in src/routes and src/controllers. Do not edit before producing the audit table.
- Scope: authorization only. No feature additions, no schema changes, no UI changes. No git commit/push.
- Run backend typecheck + test at the end; all must pass.

GOAL
Prove, endpoint by endpoint, who can do what — and fix any gap.

STEP 1 — Audit table: create docs/AUTHZ_MATRIX.md with one row per endpoint under /api/v1 (method, path, middleware chain, roles allowed, ownership/tenant rule, notes). Columns for: anonymous, CUSTOMER, DEALER_OWNER (own), DEALER_OWNER (other dealer), DEALER_MANAGER, ADMIN, SUPER_ADMIN.
STEP 2 — Flag gaps, including but not limited to:
- Legacy routes /api/cars and /api/dealers mounted in app.ts WITHOUT the /api/v1 rate limiter. Recommend: keep them but apply apiRateLimiter, and mark deprecated (add `Deprecation: true` response header). Do not remove them.
- ADMIN role: admin routes require SUPER_ADMIN only, while some controllers treat ADMIN as admin (isAdminRole). Make behavior consistent: document current intent and align code with ROLE_PERMISSIONS.md. If intent is unclear, keep current behavior and list it as an open decision — do NOT guess.
- DEALER_MANAGER: has no relation to a dealer in the schema (only Dealer.ownerUserId). Verify what a DEALER_MANAGER can actually access today. Do NOT add a schema relation in this task; document it as an open decision.
- GET /api/v1/dealers returns all dealers including emails/phones/ownerUserId — check what public fields are exposed and restrict the public select to safe fields (id, name, city, isVerified, phone if business-public, car count). Admin endpoints keep full data.
- Public GET /cars/:id — ensure DRAFT/SUSPENDED cars are not visible to the public (only owner/admin).
- Lead/finance status updates — dealer can only update records for their own dealer.
- Notifications — user can only read/delete their own.
STEP 3 — Fix each confirmed gap with minimal changes using existing patterns (requireAuth, ApiError, asyncHandler). Prefer a small reusable helper (e.g. src/security/authorization.ts with isPlatformAdmin(role), getOwnedDealerOrThrow(auth)) and replace duplicated isAdminRole functions ONLY in files you already must touch.
STEP 4 — Tests: add a table-driven test file src/__tests__/authorization.test.ts covering every row of the matrix that is protected (expected status per role).

DELIVERABLE: docs/AUTHZ_MATRIX.md, list of gaps found/fixed, list of open decisions for the product owner, test results.
```

**قائمة القبول:**
- [ ] ملف `AUTHZ_MATRIX.md` موجود ويغطي كل الـ endpoints
- [ ] القرارات المفتوحة (دور ADMIN و DEALER_MANAGER) ترجع لك وتحسمها أنت، وما يقرّرها Codex لوحده

---

## البرومبت 4 — Brands & Categories (Real Data)

```text
You are working in the Falcon monorepo (apps/backend + apps/frontend).

STANDING RULES
- First read AI_CONTEXT.md, then inspect: prisma/schema.prisma, prisma/schema.postgresql.prisma, src/controllers/cars.ts (brand filtering, listCars), apps/frontend/src/pages/admin/ManageBrands.tsx, ManageCategories.tsx, adminData.ts, apps/frontend/src/pages/marketplace/BrandsPage.tsx, BrandDetailsPage.tsx, CategoriesPage.tsx, CategoryDetailsPage.tsx, marketplaceData.ts, src/services/carsApi.ts. Summarize before editing.
- Preserve existing UI design exactly — only replace data sources and wire existing buttons/forms. Keep mock fallback where it exists today, gated by the existing isDemoFallbackEnabled mechanism.
- Schema changes go to BOTH Prisma schemas + a new PostgreSQL migration. No .env edits. No git commit/push.
- Run backend typecheck + test, frontend typecheck + build.

GOAL
Brands and categories are currently mock data and Car.brand is a free string. Make them real, without breaking existing cars.

BACKEND
- Models:
  Brand: id, slug (unique), nameAr, nameEn, logoUrl?, isActive (default true), sortOrder (default 0), createdAt, updatedAt.
  Category: id, slug (unique), nameAr, nameEn, iconKey? (lucide icon name), isActive, sortOrder, createdAt, updatedAt. (Category = body type style grouping: SUV, Sedan, Pickup, Luxury, etc. — confirm against current mock data and keep the same set.)
- Car: add optional brandId (relation to Brand, onDelete SetNull) and optional categoryId (relation to Category, onDelete SetNull). KEEP the existing `brand` and `model` string columns for backward compatibility.
- Seed: extend prisma/seed.ts (and scripts/seed-postgresql.mjs if it seeds data) to upsert brands/categories from the current frontend mock lists (move the canonical list to the backend; idempotent upserts by slug).
- Backfill script scripts/backfill-car-brands.mjs: match existing Car.brand strings to Brand (case-insensitive on nameEn/nameAr/slug) and set brandId; print a report of unmatched values. Idempotent. Dry-run flag --dry-run.
- Public endpoints: GET /api/v1/brands (active only, with ACTIVE car count), GET /api/v1/brands/:slug, GET /api/v1/categories, GET /api/v1/categories/:slug.
- Admin endpoints (requireAuth + requireSuperAdmin, existing pattern): POST/PATCH/DELETE /api/v1/admin/brands, /api/v1/admin/categories. Delete = soft (isActive=false) if cars reference it; hard delete only when unused.
- listCars: accept brandId/brandSlug and categoryId/categorySlug filters, while keeping the existing `brand` string filter working.
- Car create/update: accept optional brandId/categoryId; when brandId is given, also set the `brand` string from Brand.nameEn (or current convention — check existing data language) to keep old consumers consistent.

FRONTEND
- New services: brandsApi.ts, categoriesApi.ts (follow existing service style).
- Wire ManageBrands/ManageCategories to real CRUD (existing layout and components only; logo upload reuses existing uploadsApi if suitable, otherwise URL input).
- Marketplace brand/category pages read from API; keep fallback behavior consistent with other pages.
- Dealer car form (dashboard/ManageCars.tsx): brand + category become selects from API, without visual redesign.

TESTS: public list/detail, admin CRUD auth (customer → 403), soft-delete when referenced, listCars filter by brandSlug, backfill dry-run on seeded data.
DELIVERABLE: files changed, migration name, backfill report output, results.
```

---

## البرومبت 5 — Vehicle Data Model Extension

```text
You are working in the Falcon monorepo (apps/backend + apps/frontend).

STANDING RULES
- First read AI_CONTEXT.md, inspect both Prisma schemas, src/controllers/cars.ts, apps/frontend/src/pages/dashboard/ManageCars.tsx, marketplace/CarDetailsPage.tsx, CarsPage.tsx (filters), services/carsApi.ts. Summarize before editing.
- No visual redesign: new fields must use existing form/input/chip components and existing spec-grid patterns on the details page.
- Both Prisma schemas + new PostgreSQL migration. All new columns optional or with defaults so existing rows stay valid. No git commit/push.
- Run backend typecheck + test, frontend typecheck + build.

GOAL
Add the vehicle attributes buyers in the Gulf market filter on.

NEW CAR FIELDS
- condition: enum CarCondition { NEW, USED, CERTIFIED } default USED
- bodyType: keep via categoryId from prompt 4 — do NOT duplicate
- exteriorColor?: String, interiorColor?: String
- specsRegion: enum SpecsRegion { GCC, AMERICAN, EUROPEAN, JAPANESE, KOREAN, CHINESE, OTHER } optional
- engineSizeCc?: Int, cylinders?: Int, horsepower?: Int
- drivetrain: enum Drivetrain { FWD, RWD, AWD, FOUR_WD } optional
- seats?: Int, doors?: Int
- vin?: String — unique per tenant (@@unique([tenantId, vin])); validate 17 chars [A-HJ-NPR-Z0-9] when provided
- description?: String (max 5000)
- features: String stored as JSON array of feature keys (SQLite has no native arrays; use String with zod-validated JSON on write and parse on read; document this). Provide a fixed allowed list of feature keys (e.g. sunroof, leather_seats, rear_camera, cruise_control, apple_carplay, android_auto, navigation, keyless_entry, heated_seats, ventilated_seats, parking_sensors, blind_spot) with Arabic labels in the frontend.
- warrantyMonths?: Int, isNegotiable Boolean default false

Also normalize transmission/fuel: they are free strings with default "غير محدد". Do NOT migrate them to enums now; instead add zod-validated allowed values for new writes (accept legacy values on read) and list current distinct values from dev.db in your report.

API
- create/update accept the new fields with zod validation.
- listCars filters: condition, specsRegion, drivetrain, minYear/maxYear, minPrice/maxPrice, maxMileage (check which already exist and reuse), colors, features (all-of).
- Car detail response includes all fields; list response includes only card-relevant ones (condition, specsRegion, mileage, year, price, city, main image) — check current list select and extend minimally.

FRONTEND
- ManageCars form: add fields grouped in the existing layout (basic / specs / features / description).
- CarDetailsPage: render new specs in existing spec grid; features as existing chips.
- CarsPage filters: add condition + specsRegion + price/year range if not present, using existing filter components.

TESTS: create with full payload, VIN validation + per-tenant uniqueness, filters, legacy cars without new fields still list and render.
```

---

## البرومبت 6 — Dashboards Real Data + Demo Fallback Gate

```text
You are working in the Falcon monorepo (apps/frontend + apps/backend).

STANDING RULES
- First read AI_CONTEXT.md. Then grep the frontend for imports of dashboardData, adminData, marketplaceData, homeData and for isDemoFallbackEnabled. Produce a table: page → mock data used → real API available? → plan. Do not edit before the table.
- Preserve visual design exactly. Replace data sources only. No git commit/push.
- Run backend typecheck + test, frontend typecheck + build + test.

GOAL
No production screen should show fabricated numbers.

1. Demo fallback gate: find how isDemoFallbackEnabled is computed (src/utils/runtime.ts or similar). Ensure it is driven by VITE_ENABLE_DEMO_FALLBACK, defaulting to false in production builds and true only in dev when explicitly set. Add the var to frontend .env*.example files. When disabled, pages must show the existing EmptyState / ApiErrorNotice components instead of mock data.
2. Dealer dashboard:
   - Customers.tsx: backend endpoint GET /api/v1/dealer/customers deriving customers from the dealer's leads + finance requests, grouped by normalized phone (name, phone, email, firstSeen, lastActivity, leadsCount, financeCount, latest status). Paginated. Dealer-scoped.
   - Reports.tsx: use existing /api/v1/dealer/analytics; extend it (minimally) with time series needed by the existing charts (e.g. leads per day for last 30 days, cars added per month). If a chart has no real data source (e.g. "visits"), replace it with an honest empty state labeled "قريبًا" — do not invent data.
   - DashboardHome / Leads / ManageCars / Settings: remove remaining mock fallbacks behind the gate.
3. Admin dashboard:
   - AdminReports.tsx: wire to /api/v1/admin/analytics; extend minimally with real series; "revenue" has no data source → honest empty state.
   - AdminSettings.tsx: if it saves nothing to the backend, keep the UI but disable the submit button with a "قريبًا" hint. Do not build a settings backend now.
   - ManageUsers / ManageDealers / AdminLeads / AdminOverview: ensure real data, mocks only behind the gate.
4. Delete mock data files ONLY if no remaining imports; otherwise leave them and list remaining usages.

TESTS: frontend page-state tests for disabled fallback (empty + error), backend test for /dealer/customers scoping (dealer A cannot see dealer B customers).
```

---

## البرومبت 7 — Mobile-Ready API Layer

```text
You are working in the Falcon monorepo backend (apps/backend), preparing the API for a React Native (Expo) client.

STANDING RULES
- First read AI_CONTEXT.md, docs/API.md, src/app.ts, src/routes/*, src/middlewares/errorHandler.ts, src/errors/ApiError.ts, packages/api-contracts and packages/types. Summarize before editing.
- No breaking changes to existing response shapes used by the web frontend. No git commit/push.
- Run backend typecheck + test, frontend typecheck + build.

GOAL
1. Consistent error envelope: verify every error returns { error: { code, message, details?, requestId } } (check current errorHandler shape and keep it if already consistent). Make sure Zod errors map to 400 VALIDATION_ERROR with field paths. Add Arabic `messageAr` alongside existing messages only where codes are user-facing (auth, validation, not found, forbidden).
2. Pagination everywhere lists can grow: dealers (public + admin), leads, finance requests, notifications, favorites, admin users. Use the same { data, page, pageSize, total } envelope listCars already uses. Default pageSize 20, max 100. Update frontend services to pass/accept pagination without changing UI (fetch first page with a pageSize large enough to preserve current behavior where a page shows "all").
3. OpenAPI: generate an OpenAPI 3.1 spec from the existing Zod schemas using @asteasolutions/zod-to-openapi (pin an exact version). Serve JSON at GET /api/v1/openapi.json (public in dev/staging; in production only if env EXPOSE_OPENAPI=true). Cover at least: auth, cars, dealers, brands, categories, leads, finance requests, favorites, compare, notifications. Move shared request/response schemas into packages/api-contracts so both web and mobile can import types.
4. App config endpoint: GET /api/v1/app-config (public) → { minSupportedVersion: { ios, android }, latestVersion: { ios, android }, forceUpdate: boolean, maintenance: { enabled, messageAr, messageEn }, supportWhatsapp?, supportedCities: string[] }. Values from env vars with safe defaults (add to .env.example files). This lets us force-update mobile apps later.
5. Device registration groundwork (no push sending yet): model PushDevice { id, userId, platform (IOS|ANDROID), expoPushToken (unique), appVersion?, locale?, lastSeenAt, createdAt } in both schemas + PG migration. Endpoints: POST /api/v1/devices (requireAuth, upsert by token), DELETE /api/v1/devices/:token (owner only). Revoke/delete devices on logout-all.
6. Image URLs: ensure all image URLs in API responses are absolute (using PUBLIC_UPLOAD_BASE_URL / API_PUBLIC_URL for local storage; Cloudinary already absolute). Mobile cannot resolve relative paths.

TESTS: error envelope on validation error, pagination metadata on each paginated list, app-config shape, device upsert/delete ownership, absolute image URLs.
DELIVERABLE: files changed, new dependencies with exact versions, new env vars, results, and the openapi.json path.
```

---

## البرومبت 8 — Lint + Verify Gate

```text
You are working in the Falcon monorepo (pnpm workspace).

STANDING RULES
- Inspect package.json files (root, apps/*, packages/*) and tsconfig files first. Scope: tooling only. Do NOT reformat the whole codebase, do NOT change runtime code except to fix genuine lint ERRORS (not warnings). No git commit/push.

GOAL
1. ESLint 9 flat config at repo root (typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh for frontend). Pin exact versions. Rules: recommended sets; no-floating-promises for backend; react-hooks/rules-of-hooks as error, exhaustive-deps as warn. Ignore dist, node_modules, uploads, prisma/migrations.
2. Replace placeholder `lint` scripts in apps/frontend and apps/backend with real eslint commands.
3. Root script `verify`: typecheck → lint → test → build (backend + frontend), failing fast.
4. Fix lint ERRORS only; report warning counts per package without fixing them.
5. Add a short section to docs/WORKFLOW.md: "Before any deploy, run corepack pnpm verify".
DELIVERABLE: config files, error count before/after, warning count, verify run output.
```

---

## بعد المرحلة 1
- **المرحلة 2:** `apps/mobile` باستخدام Expo SDK + Expo Router + TanStack Query + SecureStore، مع NativeWind أو Tamagui. يستخدم أنواع `packages/api-contracts`، وأول إصدار يكون لتطبيق المشتري.
- **مؤجل لحين القرار:** تسجيل الدخول بالجوال (OTP) وإرسال إشعارات Push، والاتنين محتاجين مزوّد (Unifonic أو Twilio أو Expo Push).

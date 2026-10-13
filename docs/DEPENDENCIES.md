# Dependencies

Falcon uses pnpm workspaces with package manager pinned in root `package.json`:

```json
"packageManager": "pnpm@9.15.0"
```

## Root

Root dev dependencies:

- `@types/node`
- `prettier`
- `typescript`

Root scripts orchestrate workspace commands:

- `dev`
- `build`
- `lint`
- `test`
- `test:backend`
- `test:frontend`
- `typecheck`
- `prisma:generate`
- `prisma:push`
- `seed`
- `format`

## Frontend Dependencies

Frontend app: `apps/frontend`

Runtime dependencies:

- `@falcon/design-tokens`
- `@vitejs/plugin-react`
- `class-variance-authority`
- `clsx`
- `framer-motion`
- `lucide-react`
- `react`
- `react-dom`
- `react-router-dom`
- `tailwind-merge`

Dev dependencies:

- `@testing-library/jest-dom`
- `@testing-library/react`
- `@types/react`
- `@types/react-dom`
- `autoprefixer`
- `jsdom`
- `postcss`
- `tailwindcss`
- `typescript`
- `vite`
- `vitest`

## Backend Dependencies

Backend app: `apps/backend`

Runtime dependencies:

- `@prisma/client`
- `bcrypt`
- `cloudinary`
- `cors`
- `dotenv`
- `express`
- `express-rate-limit`
- `helmet`
- `jsonwebtoken`
- `multer`
- `prisma`
- `zod`

`prisma` is in backend dependencies because deployed runtime executes `prisma migrate deploy`.

Dev dependencies:

- `@types/bcrypt`
- `@types/cors`
- `@types/express`
- `@types/jsonwebtoken`
- `@types/multer`
- `@types/node`
- `@types/supertest`
- `supertest`
- `ts-node`
- `ts-node-dev`
- `tsx`
- `typescript`
- `vitest`

## Workspace Packages

Active package:

- `@falcon/design-tokens` exports `falconTokens` and `falconColors`.

Structural placeholder packages:

- `@falcon/api-contracts`
- `@falcon/config`
- `@falcon/security`
- `@falcon/shared`
- `@falcon/tenant`
- `@falcon/types`

Each workspace package currently has `build`, `typecheck`, and placeholder `lint` scripts.

## Deployment Dependency Notes

Railway build installs all dependencies with:

```bash
corepack pnpm install --frozen-lockfile --prod=false
```

Backend Railway build then runs:

```bash
corepack pnpm --filter @falcon/backend run build:railway
```

This generates the PostgreSQL Prisma client and compiles TypeScript.


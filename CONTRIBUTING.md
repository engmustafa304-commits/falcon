# Contributing

Falcon is a long-term enterprise SaaS platform. Contributions must protect scalability, maintainability, security, accessibility, and developer experience.

## Standards

- Do not introduce quick hacks.
- Do not duplicate logic or components.
- Do not add business logic to presentation components.
- Do not bypass tenant isolation.
- Do not introduce untyped API contracts.
- Do not add REST endpoints without validation, authorization, pagination where needed, and structured errors.
- Do not add UI that ignores the design system.

## Development Workflow

```bash
pnpm install
pnpm typecheck
pnpm build
```

## Architecture Expectations

- Frontend pages compose reusable layouts, primitives, patterns, hooks, services, and typed contracts.
- Backend controllers stay thin.
- Services own use-case orchestration.
- Repositories own persistence boundaries.
- Modules own their domain boundaries.
- Shared packages own cross-app contracts and primitives.

## Quality Bar

Every contribution should be production-ready, accessible, type-safe, and designed for future scale.

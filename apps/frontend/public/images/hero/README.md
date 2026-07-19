# hero

Hero image assets belong here.

Expected files:

- `hero-background.webp`
- `hero-placeholder.webp`

The `InteractiveHeroCar` component (`apps/frontend/src/components/hero/InteractiveHeroCar.tsx`) uses the bundled
car renders in `apps/frontend/src/assets/hero/` (imported via `@/assets/hero`), not this folder — see that
directory's README for those files. If the exploded car render is missing, the hero shows only the complete car.
If the complete car render is also missing, a neutral placeholder is shown instead.

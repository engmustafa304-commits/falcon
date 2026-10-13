# UI

The Falcon UI is implemented in `apps/frontend` with TailwindCSS, local design-system primitives, Lucide icons, and shared design tokens.

## Design Direction In Code

The current UI is Arabic-first and RTL by default.

Global direction is set in `apps/frontend/src/styles/global.css`:

```css
html {
  direction: rtl;
}
```

The visual language uses:

- white dominant backgrounds
- dark navy text
- turquoise accent
- soft gray sections
- rounded cards
- restrained shadows
- responsive page layouts

## Token Sources

Shared tokens are exported from `packages/design-tokens/src/index.ts` and consumed by frontend design-system tokens.

Current color tokens include:

- accent `#43BFC7`
- accent end `#36B4BC`
- dark `#0F172A`
- background `#FFFFFF`
- section `#F8FAFC`
- border `#E5E7EB`
- success `#10B981`
- warning `#F59E0B`
- danger `#EF4444`
- muted `#64748B`
- soft `#F1F5F9`

Spacing, radius, shadows, z-index, and breakpoints are also defined in the design-token package.

## Fonts

`apps/frontend/src/styles/fonts.css` registers local font faces:

- Arabic: `SA Hazm`
- English: `Inter`

CSS variables:

- `--font-arabic`
- `--font-english`

Typography utility classes are defined for hero, section, title, subtitle, body, caption, button, and label text.

## Design-System Structure

Design-system code lives in `apps/frontend/src/design-system/`.

Key folders:

- `brand/` - `Logo`, `BrandMark`, `BrandWordmark`, `BrandBadge`
- `foundation/` - typography preview
- `preview/` - `/design-system` handbook route
- `primitives/` - reusable primitives such as `Button`, `Card`, `Input`, `Badge`, `CarImageCard`, `EmptyState`, `LoadingState`, `Skeleton`, `SectionContainer`, and `PageShell`
- `tokens/` - frontend token exports

## Main Components

Reusable non-design-system components live in `apps/frontend/src/components/`.

Current component areas:

- actions
- brand
- cards
- cars
- dashboard
- feedback
- filters
- hero
- home
- navigation
- notifications
- SEO

## Page Areas

Page implementations live under `apps/frontend/src/pages/`.

Current page areas:

- `home`
- `marketplace`
- `auth`
- `account`
- `dashboard`
- `admin`
- placeholder page directories for brands, dealer, dealers, and finance

## Responsive Behavior

Responsive behavior is implemented with Tailwind utility classes. The app uses route-level lazy loading and a shared RTL loading fallback in `App.tsx`.

## Known Build Note

The frontend build currently warns when Inter `.woff2` files are not present in `public/fonts`. This is a runtime asset warning, not a TypeScript compile failure.


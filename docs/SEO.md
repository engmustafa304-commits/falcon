# Falcon SEO Foundation

Falcon public pages use `apps/frontend/src/components/seo/Seo.tsx` for route-level metadata:

- document title
- meta description
- canonical URL
- OpenGraph tags
- Twitter card tags
- optional JSON-LD structured data

## Public Files

- `apps/frontend/public/robots.txt`
- `apps/frontend/public/sitemap.xml`

The current sitemap is a static placeholder for local development. Before production, generate a full absolute-URL sitemap during deployment using:

`GET /api/v1/seo/sitemap-data`

That endpoint returns public cars, dealers, brands, categories, and static routes needed to build a production sitemap.

Production sitemap URLs must use the final public Falcon domain, not relative paths.

# Falcon Security Readiness

Falcon has a working local security foundation, but additional hardening is required before production launch.

## Current Controls

- JWT auth uses `JWT_ACCESS_SECRET` from environment variables.
- Inactive users are rejected by auth middleware.
- Admin routes are protected by `SUPER_ADMIN`.
- Dealer write routes are scoped to the authenticated dealer owner.
- CORS uses `CORS_ORIGINS` allowlist.
- Helmet is enabled on the backend.
- JSON request bodies are limited to 1 MB.
- General API requests are rate limited to 100 requests per 15 minutes per IP.
- Auth requests are rate limited to 10 requests per 15 minutes per IP.
- Upload requests are rate limited to 20 requests per 15 minutes per IP.
- Rate-limit responses use the Arabic message: `تم تجاوز عدد المحاولات المسموح بها. حاول لاحقًا.`
- Uploads validate file extension and MIME type.
- Uploads reject unsafe filenames before replacing them with generated safe filenames.
- Car image uploads are limited to 5 MB.
- Upload persistence is isolated behind a storage provider abstraction.
- Production/staging error responses hide stack traces.
- Deployed runtime scripts reject placeholder database URLs and placeholder secrets.
- Storage diagnostics expose only safe booleans and provider/folder names, never Cloudinary keys or secrets.

## Required Before Production

- Use strong unique JWT secrets managed by the hosting provider.
- Rotate any secrets ever used outside local development.
- Configure `CORS_ORIGINS` with only production frontend domains.
- Move from SQLite to PostgreSQL.
- Replace local disk uploads with managed storage.
- Review rate-limit thresholds against production traffic and add route-specific limits for high-risk flows where needed.
- Add request logging and security audit logging.
- Add CSRF strategy if cookie-based auth is introduced.
- Add automated dependency scanning.
- Add validation and authorization tests around every protected endpoint.
- Add production backup, restore, and incident-response procedures.
- Confirm Railway and Vercel environment variables are managed as secrets before staging access is shared.

## Upload Security

Current local upload constraints:

- Field name: `image`
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Original filenames must not contain path separators, unsafe filename characters, control characters, or exceed 180 characters.
- Stored filenames are generated as safe `car-<timestamp>-<random>.<ext>` values.
- Max size: 5 MB
- Stored under `apps/backend/uploads/cars`

Local uploads are not production-safe because files are stored on the application server. Use Cloudinary, S3, Supabase Storage, or equivalent before launch. See `docs/STORAGE.md`.

## Secrets

Do not commit `.env` files. Use only `.env.example` templates in source control.

Required backend secrets:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL`
- `CLOUDINARY_API_SECRET` when `STORAGE_PROVIDER=cloudinary`

## Local Database Warning

SQLite is for local development only. It is not suitable for Falcon production scale, concurrent writes, multi-region operation, backups, or operational analytics.

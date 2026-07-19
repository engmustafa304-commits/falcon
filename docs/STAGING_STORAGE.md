# Falcon Staging Storage

Local uploads remain filesystem-based for development. Staging should use Cloudinary for managed image storage before any external users test the platform.

## Current Behavior

The local backend storage provider remains:

```env
STORAGE_PROVIDER=local
PUBLIC_UPLOAD_BASE_URL=https://staging-api.falcon.example.com/uploads
```

Use this only for temporary local development. Staging should switch to Cloudinary.

## Recommended Staging Provider

Recommended provider: Cloudinary.

Why Cloudinary for staging:

- Image-focused hosting and CDN delivery.
- HTTPS `secure_url` responses work with current public car cards and galleries.
- Folder-based organization for staging and production.
- API deletion support through Cloudinary `public_id`.

Staging env vars are included in `apps/backend/.env.staging.example`:

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME="replace-with-staging-cloud-name"
CLOUDINARY_API_KEY="replace-with-staging-api-key"
CLOUDINARY_API_SECRET="replace-with-staging-api-secret"
CLOUDINARY_FOLDER=falcon/staging/cars
```

These values are consumed by the backend Cloudinary storage provider. Keep them in a secret manager for real staging.

## Migration Checklist

1. Create or choose a Cloudinary cloud for staging.
2. Create API credentials with upload/delete permissions.
3. Set `STORAGE_PROVIDER=cloudinary`.
4. Set the Cloudinary env vars in the staging backend.
5. Keep upload response shape unchanged:

```json
{ "url": "https://...", "publicId": "falcon/staging/cars/car-..." }
```

6. Store only URLs and optional `storagePublicId` metadata in the database.
7. Confirm deletion lifecycle handling for removed car gallery images.
8. Smoke test dashboard upload, gallery management, public car cards, and car details.

## Storage Diagnostics

After backend deployment, login as `SUPER_ADMIN` and verify:

```http
GET /api/v1/admin/storage/status
```

For Cloudinary staging, the safe response should show:

```json
{
  "provider": "cloudinary",
  "configured": true,
  "cloudNamePresent": true,
  "folder": "falcon/staging/cars"
}
```

The endpoint intentionally omits API key and secret values.

## Staging Warning

Do not use local filesystem storage for long-lived staging data. App-server disk is temporary on many hosting providers and is not a source of truth.

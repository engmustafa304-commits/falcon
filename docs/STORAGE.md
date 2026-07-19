# Falcon Storage Guide

Falcon stores uploaded car images through a storage provider abstraction. Local development uses filesystem storage by default, while staging and production can use Cloudinary without changing API consumers.

## Current Local Uploads

Current provider:

```env
STORAGE_PROVIDER=local
PUBLIC_UPLOAD_BASE_URL=http://localhost:4000/uploads
```

Local files are saved under:

```text
apps/backend/uploads/cars/
```

The default local public URL format remains:

```text
http://localhost:4000/uploads/cars/<filename>
```

For hosted environments that temporarily use local storage, set:

```env
PUBLIC_UPLOAD_BASE_URL=https://api.example.com/uploads
```

If `PUBLIC_UPLOAD_BASE_URL` is omitted, Falcon falls back to `API_PUBLIC_URL + /uploads`. `localhost` should only appear in local development.

The backend serves local uploads through:

```ts
app.use("/uploads", express.static("uploads"))
```

## Upload Constraints

Current local image constraints:

- Field name: `image`
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Max size: 5 MB
- Unsafe original filenames are rejected.
- Stored filenames are generated as `car-<timestamp>-<random>.<ext>`.

## Cloudinary Provider

Staging and production should use Cloudinary:

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=replace-with-cloud-name
CLOUDINARY_API_KEY=replace-with-api-key
CLOUDINARY_API_SECRET=replace-with-api-secret
CLOUDINARY_FOLDER=falcon/staging/cars
```

Cloudinary uploads return secure HTTPS URLs. Falcon stores:

- `CarImage.url`
- optional `CarImage.storagePublicId`

When a gallery image is deleted and `storagePublicId` exists, Falcon asks Cloudinary to delete the remote asset. Legacy image URLs continue to work; if no public ID exists, deletion is skipped safely.

## Admin Diagnostics

`SUPER_ADMIN` users can verify storage configuration:

```http
GET /api/v1/admin/storage/status
```

The endpoint returns safe configuration status only: provider, configured flag, Cloudinary cloud-name presence, and folder. It never returns Cloudinary keys or secrets.

## Storage Abstraction

Storage code lives in:

```text
apps/backend/src/services/storage/
```

Key files:

- `storageProvider.ts` - shared provider contract.
- `localStorageProvider.ts` - current local filesystem implementation.
- `cloudinaryStorageProvider.ts` - Cloudinary implementation for managed image hosting.
- `index.ts` - provider selection entry point.

The upload endpoint should call the storage service and should not know whether the file is stored locally or in a cloud provider.

## Cloudinary Provider

Set:

```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=replace-with-cloud-name
CLOUDINARY_API_KEY=replace-with-api-key
CLOUDINARY_API_SECRET=replace-with-api-secret
CLOUDINARY_FOLDER=falcon/cars
```

Cloudinary uploads return HTTPS `secure_url` values. The API response remains backward compatible:

```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "falcon/cars/car-..."
}
```

Gallery rows can store the optional `storagePublicId` so Cloudinary images are deleted when a gallery image is removed. Legacy rows without a public id continue to work.

## Production Requirement

Local uploads are development-only. Production must move uploaded car images to managed object storage.

Supported options:

- Cloudinary
- Amazon S3
- Supabase Storage
- Any equivalent object storage with signed upload and public delivery support

## Cloud Migration Checklist

1. Choose the storage provider and delivery strategy.
2. Add provider-specific environment variables to backend env templates.
3. Set `STORAGE_PROVIDER=cloudinary` for staging or production.
4. Keep the upload endpoint response shape unchanged: `{ "url": "..." }`.
5. Store only image URLs or object keys in the database.
6. Configure file-size, extension, MIME, and malware scanning where supported.
7. Add deletion lifecycle rules for removed car images.
8. Backfill existing local files to cloud storage if needed.
9. Test car creation, gallery management, public car cards, and car detail galleries.
10. Disable local filesystem persistence in production.

## Do Not Do In Production

- Do not rely on application-server disk storage.
- Do not store image binary data in the database.
- Do not expose private bucket credentials to the frontend.

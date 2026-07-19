# storage

Storage provider abstractions live here. The default provider writes car images to the local filesystem for development.

Available providers:

- `local` - filesystem storage for local development.
- `cloudinary` - managed image storage for staging and production.

Future providers such as S3 or Supabase Storage should implement the same `StorageProvider` interface without changing upload route behavior.

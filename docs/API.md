# API

Falcon exposes a JSON REST API under `/api/v1`. Responses generally use a `data` envelope. List endpoints may also include `page`, `pageSize`, and `total`.

Top-level health endpoints also exist outside `/api/v1`:

- `GET /health`
- `GET /ready`

## Authentication

Auth routes:

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | Registers customer or dealer owner. Dealer-owner registration creates a dealer profile. |
| POST | `/api/v1/auth/login` | Public | Returns token and public user. |
| GET | `/api/v1/auth/me` | Bearer | Returns current user. |

Bearer tokens are sent with:

```http
Authorization: Bearer <token>
```

## Cars

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/cars` | Public | Supports search, filters, sorting, and pagination. |
| POST | `/api/v1/cars` | Bearer | Creates a car under an allowed dealer. |
| GET | `/api/v1/cars/dealer/mine` | Bearer dealer | Lists current dealer cars. |
| GET | `/api/v1/cars/:id` | Public | Gets one car. |
| PATCH | `/api/v1/cars/:id` | Bearer | Updates a car if allowed. |
| DELETE | `/api/v1/cars/:id` | Bearer | Deletes a car if allowed. |

Supported `GET /cars` query params:

- `q`
- `brand`
- `model`
- `city`
- `yearMin`
- `yearMax`
- `priceMin`
- `priceMax`
- `mileageMax`
- `fuel`
- `transmission`
- `status`
- `dealerId`
- `sort`
- `page`
- `pageSize`

Supported sort values:

- `newest`
- `price_asc`
- `price_desc`
- `mileage_asc`
- `year_desc`

## Car Images

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/cars/:id/images` | Public | Lists gallery images. |
| POST | `/api/v1/cars/:id/images` | Bearer | Attaches image URL/public ID metadata. |
| PATCH | `/api/v1/cars/:id/images/:imageId` | Bearer | Updates image metadata. |
| DELETE | `/api/v1/cars/:id/images/:imageId` | Bearer | Deletes image metadata and asks provider to delete when possible. |
| PATCH | `/api/v1/cars/:id/images/:imageId/main` | Bearer | Sets main image. |

## Dealers

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/dealers` | Public | Lists dealers. |
| POST | `/api/v1/dealers` | Bearer | Creates dealer profile if allowed. |
| GET | `/api/v1/dealers/me` | Bearer dealer | Returns current dealer profile. |
| PATCH | `/api/v1/dealers/me` | Bearer dealer | Updates current dealer profile. |
| GET | `/api/v1/dealers/:id` | Public | Gets dealer and cars. |
| PATCH | `/api/v1/dealers/:id` | Bearer | Updates dealer if allowed. |
| DELETE | `/api/v1/dealers/:id` | Bearer | Deletes dealer if allowed. |

## Leads

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/leads` | Optional | Creates lead. |
| GET | `/api/v1/leads/me` | Bearer | Lists current user leads. |
| GET | `/api/v1/dealer/leads` | Bearer dealer | Lists leads for current dealer. |
| PATCH | `/api/v1/dealer/leads/:id/status` | Bearer dealer | Updates dealer lead status. |

## Finance Requests

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/finance-requests` | Optional | Creates finance request. |
| GET | `/api/v1/finance-requests/me` | Bearer | Lists current user finance requests. |
| GET | `/api/v1/dealer/finance-requests` | Bearer dealer | Lists dealer finance requests. |
| PATCH | `/api/v1/dealer/finance-requests/:id/status` | Bearer dealer | Updates dealer finance status. |

## Favorites And Compare

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/favorites` | Bearer | Lists saved favorite cars. |
| POST | `/api/v1/favorites/:carId` | Bearer | Adds favorite. |
| DELETE | `/api/v1/favorites/:carId` | Bearer | Removes favorite. |
| GET | `/api/v1/compare` | Bearer | Lists compare cars. |
| POST | `/api/v1/compare/:carId` | Bearer | Adds compare item. |
| DELETE | `/api/v1/compare/:carId` | Bearer | Removes compare item. |

## Notifications

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/notifications` | Bearer | Lists notifications. |
| PATCH | `/api/v1/notifications/read-all` | Bearer | Marks all read. |
| PATCH | `/api/v1/notifications/:id/read` | Bearer | Marks one read. |
| DELETE | `/api/v1/notifications/:id` | Bearer | Deletes notification. |

## Uploads

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/v1/uploads/car-images` | Bearer | Multipart upload, field name `image`. |

Allowed upload types are JPG, JPEG, PNG, and WebP. Max file size is 5 MB.

## Dealer Analytics

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/dealer/analytics` | Bearer dealer | Current dealer analytics. |

## Admin

All `/api/v1/admin/*` routes require `SUPER_ADMIN`.

| Method | Path |
| --- | --- |
| GET | `/api/v1/admin/analytics` |
| GET | `/api/v1/admin/storage/status` |
| GET | `/api/v1/admin/cars` |
| PATCH | `/api/v1/admin/cars/:id` |
| PATCH | `/api/v1/admin/cars/:id/status` |
| DELETE | `/api/v1/admin/cars/:id` |
| GET | `/api/v1/admin/dealers` |
| PATCH | `/api/v1/admin/dealers/:id` |
| PATCH | `/api/v1/admin/dealers/:id/verify` |
| DELETE | `/api/v1/admin/dealers/:id` |
| GET | `/api/v1/admin/finance-requests` |
| PATCH | `/api/v1/admin/finance-requests/:id/status` |
| DELETE | `/api/v1/admin/finance-requests/:id` |
| GET | `/api/v1/admin/leads` |
| PATCH | `/api/v1/admin/leads/:id/status` |
| DELETE | `/api/v1/admin/leads/:id` |
| GET | `/api/v1/admin/users` |
| PATCH | `/api/v1/admin/users/:id/role` |
| PATCH | `/api/v1/admin/users/:id/status` |
| DELETE | `/api/v1/admin/users/:id` |

## SEO

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/v1/seo/sitemap-data` | Public | Returns public sitemap data. |


# Falcon Private Sellers Foundation

Falcon does not expose private seller listing flows publicly yet. The current product remains focused on Falcon Direct, verified dealers, customers, dealer owners, and super admin operations.

## Recommended Model

- Add a future `PRIVATE_SELLER` role or keep `CUSTOMER` with a verified private seller profile.
- Add a listing type such as `PRIVATE` alongside dealer/Falcon listing classifications.
- Require authenticated submission for private listings.
- Keep private listings hidden until reviewed and approved by a platform admin.
- Allow the private seller to manage only their own submitted listing.
- Keep admin moderation actions for approve, reject, suspend, and request changes.

## Suggested Flow

1. Customer starts "Sell your car".
2. Customer enters vehicle details, ownership/contact information, and uploads images.
3. Listing is saved as `DRAFT` or `PENDING_REVIEW`.
4. Admin reviews identity, vehicle quality, images, and price.
5. Approved listings become public as `PRIVATE`.
6. Suspended or rejected listings stay hidden from public marketplace search.

## Visibility Rules

- Public marketplace should only show approved, active private listings.
- Private sellers should see their own draft, pending, active, suspended, and sold listings.
- Dealers should never manage private seller listings.
- Super admins can moderate all listings.

## Implementation Notes

- Do not reuse dealer ownership checks for private listings.
- Add dedicated tests for owner isolation before exposing UI.
- Add anti-spam/rate-limit rules before public release.
- Add a clear support and dispute workflow before accepting real sellers.

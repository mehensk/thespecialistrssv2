# Admin Listing Unpublish Feature Plan

## Summary
Add an admin-only `unpublish` action for listings so a currently published listing can be moved back to pending state. This reuses existing workflow fields (`isPublished`, `approvedBy`, `approvedAt`) and existing cache revalidation behavior.

Chosen policy:
- On unpublish, set `isPublished = false`
- Clear approval metadata: `approvedBy = null`, `approvedAt = null`

UI scope:
- Admin listing management only (`/admin/listings`)

---

## Phase 1: Backend API + State Transition

### Objective
Create an admin-only endpoint to unpublish a listing with consistent auth, logging, and cache invalidation.

### Changes
1. Add route:
   - `src/app/api/admin/listings/[id]/unpublish/route.ts`
2. Implement `POST` handler:
   - Verify admin via `verifyAdminRole(request)`
   - Return `401` if unauthorized
   - Lookup listing by `id`, return `404` if missing
   - Update listing:
     - `isPublished: false`
     - `approvedBy: null`
     - `approvedAt: null`
   - Log activity with `logListingActivity` and `ActivityAction.REJECT` (metadata includes `reason: "unpublished_by_admin"`)
   - Call `revalidateListingCaches(id)`
   - Return success payload with updated listing

### Testable and Verifiable Instructions
1. Start app and authenticate as admin.
2. Pick a published listing ID.
3. Call endpoint:
   - `POST /api/admin/listings/:id/unpublish`
4. Verify API result:
   - Status `200`
   - Response includes `listing.isPublished === false`
5. Verify unauthorized path:
   - Call same endpoint as non-admin, expect `401`
6. Verify missing listing path:
   - Use invalid ID, expect `404`
7. Verify DB fields (Prisma Studio or SQL):
   - `isPublished = false`
   - `approvedBy = null`
   - `approvedAt = null`

Phase 1 done when all 7 checks pass.

---

## Phase 2: Admin UI Action (Table + Compact Card)

### Objective
Expose unpublish action in admin listings UI only for published listings.

### Changes
1. Add unpublish action component (similar to approve button):
   - `src/app/admin/listings/unpublish-button.tsx`
2. Wire into table view:
   - `src/app/admin/listings/listings-view.tsx`
   - Show `Unpublish` action when `listing.isPublished` is `true`
3. Wire into compact card:
   - `src/components/admin/CompactListingCard.tsx`
   - Show `Unpublish` action when `listing.isPublished` is `true`
4. Keep existing approve button behavior for unpublished listings unchanged.
5. On success:
   - Show toast
   - `router.refresh()`

### Testable and Verifiable Instructions
1. Open `/admin/listings`.
2. For a published listing, confirm `Unpublish` action is visible.
3. Click `Unpublish`.
4. Verify success toast appears.
5. Verify row/card status changes from `Published` to `Pending` after refresh.
6. Verify `Approve` action now appears for that listing.
7. Verify unpublished listings do not show `Unpublish` button.

Phase 2 done when all 7 checks pass in both table and compact views.

---

## Phase 3: Public Visibility and Cache Validation

### Objective
Confirm unpublished listings are removed from public surfaces immediately after unpublish.

### Changes
No new code beyond Phase 1/2; this phase validates existing revalidation integration.

### Testable and Verifiable Instructions
1. Open public listings page `/listings` in one tab.
2. In admin tab, unpublish a listing that is currently visible publicly.
3. Refresh `/listings`; verify listing no longer appears.
4. Request `GET /api/listings?published=true`; verify listing is absent.
5. Visit listing detail URL directly:
   - Unauthenticated user should not get public access.
6. As owner/admin, verify internal access rules still behave as currently implemented.

Phase 3 done when all 6 checks pass.

---

## Phase 4: Regression + Activity Log Verification

### Objective
Ensure no regression in existing approve/delete flows and verify activity logging behavior.

### Changes
No intended behavior change outside unpublish path.

### Testable and Verifiable Instructions
1. Approve flow regression:
   - Unpublished listing -> approve -> status becomes published
2. Delete flow regression:
   - Delete still works for admin listings
3. Activity logs:
   - Confirm unpublish event is recorded for item type `LISTING`
4. Dashboard/admin stats sanity:
   - Pending and published counts reflect state changes after refresh
5. Error path UX:
   - Force API error (invalid ID or unauthorized) and verify UI shows failure feedback

Phase 4 done when all 5 checks pass.

---

## Impact Assessment

### Functional Impact
- Positive:
  - Admin gains reversible publishing control without deleting listings.
  - Supports moderation corrections and temporary takedowns.
- Neutral:
  - Existing create/edit/delete and approve workflows remain intact.

### Technical Impact
- Database schema:
  - No migration required (fields already exist).
- API surface:
  - Adds one admin endpoint: `POST /api/admin/listings/:id/unpublish`.
- UI:
  - Adds one new admin listing action.
- Caching:
  - Reuses `revalidateListingCaches`; no new cache strategy introduced.

### Security and Access Impact
- Endpoint remains admin-only through existing `verifyAdminRole`.
- Public listing exposure remains controlled by `isPublished` checks already present.

### Performance Impact
- Minimal:
  - One additional API mutation path with single update + activity log + revalidation.
  - No expected query-cost increase on public read paths.

### Risk Assessment
- Low risk:
  - Reuses established approve/delete route patterns.
  - Uses existing publication state model.
- Primary risks:
  - UI inconsistency if button visibility conditions are incorrect.
  - Missing revalidation call could cause temporary stale public data.

### Mitigations
- Mirror existing approve-button architecture and response handling.
- Keep verification checklist focused on:
  - status transitions,
  - public visibility removal,
  - activity logging,
  - regression of approve/delete.

---

## Acceptance Criteria
- Admin can unpublish any published listing from `/admin/listings`.
- Unpublished listing changes to pending state and clears approval metadata.
- Listing no longer appears in public published listings API/page after revalidation.
- Existing approve/delete flows still work.
- Activity log captures the unpublish action.

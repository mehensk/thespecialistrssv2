# Listing Data Loading Optimization Plan

## Summary
This plan improves listing load speed, data accuracy, and update/delete reflect time by implementing 4 testable phases.
Each phase is shipped and validated before moving to the next.

## Goals
- Public listing loads are fast and stable.
- Updates/deletes reflect quickly (target: under 5 seconds).
- Filters/pagination remain accurate.
- Performance scales as listing volume grows.

## Phase 1: Cache Invalidation + Freshness

### Scope
- Ensure every listing mutation route consistently revalidates:
  - Listing collection cache tag
  - Listing detail cache tag
  - `/listings` path
  - `/listings/[id]` path
- Reduce stale window for public listing cache.

### Expected Outcome
- Updated/deleted listings reflect much faster.
- Fewer stale listing states after admin actions.

### Risks
- More revalidation can increase backend load slightly.
- Need route-by-route validation to avoid missed invalidation paths.

---

## Phase 2: API Fast Path for Public Listings

### Scope
- Optimize `GET /api/listings?published=true` to avoid unnecessary auth/session work.
- Keep auth path only for authenticated/private listing scenarios.
- Keep response payload minimal for listing cards.

### Expected Outcome
- Lower and more stable API latency.
- Fewer random slow responses.

### Risks
- Must preserve security boundaries between public and private listing access.

---

## Phase 3: Server-side Filtering/Pagination + Client Resilience

### Scope
- Move filtering/sorting/pagination logic to API.
- Return paginated response with total count metadata.
- Add client timeout + retry + explicit error/retry state.
- Normalize critical filter fields (`listingType`, `propertyType`) for consistency.

### Expected Outcome
- Faster page load for larger datasets.
- More accurate filtered results.
- Better UX during transient failures.

### Risks
- Requires UI updates and query contract changes.
- Must ensure old query behavior is preserved or migrated cleanly.

---

## Phase 4: Database Query Optimization + Monitoring

### Scope
- Add index optimized for public listing browse query pattern:
  - `isPublished + createdAt desc`
- Capture endpoint/query timing before and after changes.
- Add basic monitoring for cache hit/miss and reflect-time checks.

### Expected Outcome
- Better DB performance at scale.
- Clear visibility into regressions.

### Risks
- Index migration must be tested in staging first.
- Need baseline metrics before optimization for proper comparison.

---

## Rollout Strategy
- Implement phase-by-phase (not one large merge).
- Validate each phase with its QA checklist before moving forward.
- Roll back only the current phase if issues appear.

## Success Criteria
- Reflect time after update/delete: usually under 5 seconds.
- Public listings endpoint latency improves and is stable.
- No known stale cache gaps after mutations.
- Filter/pagination accuracy confirmed by test cases.

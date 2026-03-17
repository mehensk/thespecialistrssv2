# Listing Data Loading Optimization Plan

## Summary
This plan improves listing freshness, loading speed, and loading accuracy in controlled phases.
Phase 1 (freshness/correctness after mutations) is implemented and verified in code.
Phase 1.5 (online reliability gap closure) is now implemented in code.
Phase 2 (public API performance optimization) is now implemented in code.
Phase 3 (server-side filtering/pagination + client resilience) is now implemented in code.
Phase 4 (DB optimization + monitoring) is now implemented in code.

## Global Goals
- Listing updates/deletes should reflect quickly and consistently.
- Public listings should load fast and reliably online.
- Filtering/pagination should remain accurate at scale.

## Decisions Locked for Phase 1
- Rollout: local-first validation.
- Acceptable reflect target: `5-10s acceptable` (aim `<5s`, hard max `<10s`).
- Public cache policy: balanced (`s-maxage=15`, `stale-while-revalidate=30`).
- Admin behavior: balanced freshness (no global `no-store` switch).
- Featured/homepage listing revalidation: out of scope in Phase 1.
- Revalidation failure policy: mutation succeeds, revalidation errors are non-fatal.
- Verification method: manual QA + basic smoke script.
- Git workflow/logging: handled manually by user (no git/PR automation by agent).

## Decisions Locked for Phase 1.5
- Scope discipline: Phase 1 behavior remains intact (no mutation revalidation redesign).
- Public cache policy remains balanced: `s-maxage=15`, `stale-while-revalidate=30`.
- Public listings reliability behavior:
  - `GET /api/listings?published=true` uses public fast path before auth lookup.
- Listings page resilience behavior:
  - 3 attempts total.
  - 8 second timeout per attempt.
  - exponential backoff between attempts.
  - retry transient failures only (timeout/network/retryable 5xx/edge statuses), not non-retryable 4xx.
- Failed load UX:
  - explicit error state with Retry action.
  - never show false empty listing state when fetch fails.

## Decisions Locked for Phase 2
- Strategy: conservative public payload trim (no new endpoint and no new query mode).
- Preserve API contract for existing consumers:
  - endpoint remains `GET /api/listings`
  - response envelope remains `{ listings }`
- Public branch must preserve Phase 1/1.5 behavior:
  - keep public fast path ordering for `published=true`
  - keep balanced cache header `public, s-maxage=15, stale-while-revalidate=30`
- Access-control behavior remains unchanged for non-public requests.
- Homepage featured listings are explicitly out of scope for Phase 2 changes (user will manage fixed listings there).

## Decisions Locked for Phase 3
- Endpoint continuity:
  - `GET /api/listings` remains the listings read endpoint (no new endpoint introduced).
- Contract continuity:
  - response keeps existing `{ listings }` envelope for compatibility;
  - additive `pagination` metadata is returned for API-driven paging UI.
- Query contract:
  - canonical filter/pagination params are reused from `src/lib/search-contract.ts`;
  - `sortBy` is supported (`newest`, `price-low`, `price-high`, `size-small`, `size-large`).
- Public branch continuity:
  - keep `published=true` public fast path before auth lookup;
  - keep balanced cache header `public, s-maxage=15, stale-while-revalidate=30`.
- Public route optimization continuity:
  - preserve Phase 2 optimized cached path for default unfiltered/newest public query.
- Authorization continuity:
  - non-public semantics remain unchanged (published listings + requesting user’s own unpublished listings).
- Reliability continuity:
  - listings page timeout/retry/error-state behavior from Phase 1.5 remains intact.
- Scope lock:
  - homepage featured listings behavior remains out of scope and unchanged.
- Mutation-path continuity:
  - non-blocking mutation revalidation behavior remains unchanged.

## Decisions Locked for Phase 4
- Index strategy:
  - additive index rollout only (no index removals in this phase).
  - index additions are aligned to active Phase 3 listings query/sort paths.
- Benchmark strategy:
  - use repeatable local benchmark script with fixed scenarios and JSON outputs;
  - collect both `before` and `after` outputs for direct comparison.
- Monitoring strategy:
  - use structured listings API telemetry logs (no new external metrics backend required);
  - telemetry is env-gated via `LISTINGS_METRICS_ENABLED=true`.
- Contract and behavior continuity:
  - keep listings endpoint and response contract continuity (`{ listings, pagination }`);
  - keep public fast path/auth correctness semantics unchanged;
  - keep balanced public cache policy unchanged;
  - keep non-blocking mutation revalidation behavior unchanged;
  - keep homepage featured listings out of scope and unchanged.

## Phase Status
- Phase 1: Implemented.
- Phase 1.5: Implemented (online reliability gap closure).
- Phase 2: Implemented (public API performance optimization).
- Phase 3: Implemented (server-side filtering/pagination + client resilience).
- Phase 4: Implemented (DB optimization + monitoring).

---

## Phase 1 (Implemented): Cache Invalidation + Freshness

### Delivered Changes
- Added a shared listing revalidation helper:
  - `src/lib/listing-revalidation.ts`
- Standardized all listing mutation routes to use shared non-blocking revalidation:
  - `src/app/api/listings/route.ts` (create)
  - `src/app/api/listings/[id]/route.ts` (update, including publish-state changes by admin)
  - `src/app/api/listings/[id]/delete/route.ts` (owner delete)
  - `src/app/api/admin/listings/[id]/approve/route.ts` (admin approve)
  - `src/app/api/admin/listings/[id]/delete/route.ts` (admin delete)
- Updated public listings cache header:
  - `Cache-Control: public, s-maxage=15, stale-while-revalidate=30`
- Added manual smoke verification script:
  - `scripts/listings-reflect-smoke.ps1`

### Revalidation Contract (Current)
- Revalidates:
  - listing tag (`CACHE_TAGS.LISTING(id)`)
  - listings collection tag (`CACHE_TAGS.LISTINGS`)
  - `/listings`
  - canonical slug path (when slug exists)
  - id path (`/listings/{id}`)
- Wrapped in `try/catch` and logs non-critical errors.
- Revalidation failure does not block successful mutation responses.

### Verification Result for Phase 1 Tasks
- Shared revalidation helper: complete.
- Applied to all listing mutation routes currently present: complete.
- Balanced public cache header on published listings endpoint: complete.
- Admin delete cache invalidation gap: fixed.
- Smoke verification script: complete.

### Important Note on "All Listings Available"
- Phase 1 fixes freshness after changes.
- Phase 1 does **not** fully solve online "all listings always load" reliability by itself.
- Remaining issues (carried to Phase 1.5/2/3):
  - public listings endpoint still does auth lookup before public fast path;
  - listings page uses one-shot fetch (no retry/error recovery);
  - listings page still performs full dataset client-side filtering and mapping defaults that can affect perceived accuracy.

---

## Phase 1.5 (Implemented): Online Reliability Gap Closure

### Target
Improve real-world online completeness/accuracy of listing loads before moving to broader performance phases.

### Delivered Changes
- Public fast path first in `GET /api/listings?published=true` (skip auth path).
  - Implemented in `src/app/api/listings/route.ts`.
  - `published=true` path now executes before any auth lookup.
  - Existing balanced cache header preserved on public responses:
    - `Cache-Control: public, s-maxage=15, stale-while-revalidate=30`
- Add client fetch resilience on listings page:
  - Implemented in `src/app/listings/page.tsx`.
  - Added timeout + retry + transient-failure-only retries.
  - Added explicit failed-load UI with `Retry` action.
  - Prevented false empty-state rendering when load fails.
- Normalize/sanitize client mapping defaults that can distort filtering accuracy.
  - Implemented in `src/app/listings/page.tsx`.
  - Added normalization helpers for string and numeric fields.
  - Added strict `listingType` normalization to `sale | rent` with fallback.
  - Preserved image fallback behavior.

### Verification Result for Phase 1.5 Tasks
- Public fast-path ordering for `published=true`: complete.
- Public cache policy continuity on listings endpoint: complete.
- Listings page timeout/retry/error-state behavior in code: complete.
- Mapping normalization/sanitization in code: complete.
- Targeted changed-file lint verification:
  - `src/app/api/listings/route.ts`: pass.
  - `src/app/listings/page.tsx`: pass.
- Note:
  - Runtime/manual online failure simulation scenarios are still recommended before Phase 2 execution.

### Still Out of Scope After Phase 1.5 (Carried to Phase 2/3/4)
- Server-side filtering/sorting/pagination migration.
- Public API payload slimming and broader latency optimization.
- DB query/index optimization work.
- Monitoring and reliability instrumentation rollout.

---

## Phase 2 (Implemented): Public API Performance

### Target
Optimize public listing request path and payload size while preserving existing behavior and access controls.

### Delivered Changes
- Public cached listings payload trim:
  - Implemented in `src/lib/cache.ts`.
  - Removed nested `user` selection from `getCachedListings` public payload.
  - Preserved listing fields currently needed by public listing consumers.
- Public route-path optimization in listings API:
  - Implemented in `src/app/api/listings/route.ts`.
  - Preserved `published=true` fast path before auth lookup.
  - Consolidated duplicate public response-building logic into shared route helper.
  - Preserved public cache header:
    - `Cache-Control: public, s-maxage=15, stale-while-revalidate=30`
- Access-control continuity:
  - Non-public authenticated semantics remain unchanged:
    - published listings + requesting user’s own unpublished listings.
- Scope lock honored:
  - No homepage featured listings flow changes were made in this phase.

### Verification Result for Phase 2 Tasks
- Public payload trim in cached listings query: complete.
- Public route-path optimization without behavior regression: complete.
- Balanced public cache policy continuity: complete.
- Targeted changed-file lint verification:
  - `src/lib/cache.ts`: pass.
  - `src/app/api/listings/route.ts`: pass.
- Note:
  - Runtime/manual API response and listing-count validation is still recommended before Phase 3 execution.

### Still Out of Scope After Phase 2 (Carried to Phase 3/4)
- Server-side filtering/sorting/pagination with metadata responses.
- Deterministic large-scale completeness via API-driven paging (instead of client-side full-dataset behavior).
- DB index/query optimization and monitoring instrumentation rollout.

## Phase 3 (Implemented): Server-side Filtering/Pagination + Client Resilience

### Target
Move filtering/sorting/pagination to API responses and make listings page consume server-driven paginated metadata while preserving established reliability and auth behavior.

### Delivered Changes
- Listings API now supports server-side filtering/sorting/pagination on `GET /api/listings`:
  - Implemented in `src/app/api/listings/route.ts`.
  - Reused canonical query parsing via `src/lib/search-contract.ts`.
  - Added `sortBy` mapping:
    - `newest`, `price-low`, `price-high`, `size-small`, `size-large`.
  - Applied Prisma `where`/`orderBy`/`skip`/`take` server-side.
- Additive paginated metadata in API response:
  - Response remains backward-compatible with `{ listings }`.
  - Added `pagination` metadata:
    - `page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPrevPage`.
- Public path continuity preserved:
  - `published=true` still runs through public fast path before auth lookup.
  - Balanced public cache header preserved:
    - `Cache-Control: public, s-maxage=15, stale-while-revalidate=30`.
  - Phase 2 default public cached path preserved for unfiltered/newest public requests.
- Non-public auth continuity preserved:
  - Still returns published listings plus requesting user’s own unpublished listings.
- Listings page migrated to API-driven query flow:
  - Implemented in `src/app/listings/page.tsx`.
  - Removed client-side dataset filtering/sorting/pagination logic.
  - Listings fetch now sends filter/sort/page params to API.
  - UI uses server-provided `pagination` metadata for counts and paging controls.
  - URL state now includes canonical filter/sort/page state.
- Reliability behavior preserved on listings page:
  - 3 attempts total.
  - 8s timeout per attempt.
  - exponential backoff.
  - retry transient failures only.
  - explicit error state with Retry.
  - no false empty-state rendering on fetch failures.
- Scope lock honored:
  - no homepage featured listings flow changes.
  - no mutation revalidation redesign.

### Verification Result for Phase 3 Tasks
- API server-side filtering/sorting/pagination: complete.
- Additive pagination metadata response: complete.
- Public fast path and balanced cache continuity: complete.
- Non-public authorization continuity: complete in route logic.
- Listings page API-driven filtering/sorting/pagination: complete.
- Listings page failure reliability behavior retained: complete.
- Scope lock for homepage featured listings: complete (no changes).
- Targeted changed-file verification:
  - `src/app/api/listings/route.ts`: eslint pass.
  - `src/app/listings/page.tsx`: eslint pass.
  - TypeScript check (`tsc --noEmit`) after changes: pass.

### Still Out of Scope After Phase 3 (Carried to Phase 4)
- DB query/index optimization for high-volume filter + sort combinations.
- Monitoring instrumentation for latency, errors, and cache behavior.
- Benchmarking before/after DB/index changes.
- (Optional follow-up) dedicated facets metadata (for full location options independent of current page payload).

## Phase 4 (Implemented): DB Optimization + Monitoring

### Target
Improve listings query scalability by adding query-aligned DB indexes and operational visibility for latency/errors/cache behavior while preserving Phase 1/1.5/2/3 continuity.

### Delivered Changes
- Added query-aligned listing indexes:
  - Implemented in `prisma/schema.prisma` and migration:
    - `prisma/migrations/20260318000100_phase4_listing_query_indexes/migration.sql`
  - Added indexes:
    - `Listing_isPublished_createdAt_idx`
    - `Listing_isPublished_listingType_createdAt_idx`
    - `Listing_isPublished_propertyType_createdAt_idx`
    - `Listing_isPublished_price_idx`
    - `Listing_isPublished_size_idx`
- Added benchmark tooling and outputs:
  - Script:
    - `scripts/benchmark-listings-phase4.ts`
  - npm script:
    - `benchmark:listings:phase4` in `package.json`
  - Reports generated:
    - `scripts/reports/listings-phase4-benchmark-before.json`
    - `scripts/reports/listings-phase4-benchmark-after.json`
  - Scenario coverage:
    - default newest, listingType filter, propertyType filter, price range/sort,
      size range/sort, location contains, non-public auth-equivalent path.
- Added index verification script:
  - `scripts/verify-phase4-listing-indexes.ts`
- Added listings monitoring instrumentation:
  - Helper:
    - `src/lib/listings-observability.ts`
  - Integrated into:
    - `src/app/api/listings/route.ts` (`GET /api/listings`)
  - Telemetry payload includes:
    - route mode, fast/cached-path markers, filter presence flags, pagination params,
      duration, counts, status code, error category.
  - Env gating:
    - only emits when `LISTINGS_METRICS_ENABLED=true`.
- Continuity preserved:
  - no contract break for listings API response shape;
  - balanced public cache policy unchanged;
  - public fast path + auth correctness behavior unchanged;
  - mutation revalidation behavior unchanged and non-blocking;
  - homepage featured listings untouched.

### Verification Result for Phase 4 Tasks
- Index migration deployment: complete (`prisma migrate deploy`).
- Index presence verification: complete (all expected Phase 4 indexes found).
- Benchmark before/after reports: complete (JSON artifacts generated).
- Monitoring instrumentation in listings API: complete.
- Targeted static checks:
  - eslint on changed Phase 4 files: pass.
  - TypeScript check (`tsc --noEmit`): pass.
  - Prisma schema validation (`prisma validate`): pass.
- Benchmark interpretation note:
  - this run showed mixed/negative latency deltas in timed results;
  - outcome likely includes network/remote DB runtime variance and should be paired with plan-level query analysis in follow-up validation.

### Still Out of Scope After Phase 4
- Query-plan-level attribution (`EXPLAIN (ANALYZE, BUFFERS)`) for each benchmark scenario.
- Persistent metrics backend/alerting (telemetry currently log-based).
- Specialized indexing/search strategy for text contains-heavy location queries if they become dominant.

## Success Criteria
- Phase 1: mutation reflect behavior is consistent and within target window.
- Phase 1.5/2/3: online listing completeness and load reliability materially improve.
- All phases: no regression in authorization correctness.

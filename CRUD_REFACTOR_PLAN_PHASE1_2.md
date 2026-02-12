# CRUD Refactor: Tightened Phase 1/2 Plan

## Scope (actual API surface)
### Blog
- API: src/app/api/blog-posts/route.ts
- API: src/app/api/blog-posts/[id]/route.ts
- API: src/app/api/blog-posts/slug/[slug]/route.ts
- API: src/app/api/blogs/[id]/delete/route.ts
- Page: src/app/blog/[slug]/page.tsx

### Listings
- API: src/app/api/listings/route.ts
- API: src/app/api/listings/[id]/route.ts
- API: src/app/api/listings/[id]/delete/route.ts
- Admin approve: src/app/api/admin/listings/[id]/approve/route.ts

### Admin approve (blog)
- Admin approve: src/app/api/admin/blogs/[id]/approve/route.ts

### Shared libs
- Cache: src/lib/cache.ts
- Dashboard cache: src/lib/dashboard-cache.ts
- Auth helpers: src/lib/auth-helpers.ts, src/lib/get-user-from-token.ts, src/lib/verify-admin-role.ts
- Prisma: src/lib/prisma.ts
- Logger: src/lib/logger.ts

### Out of scope (not CRUD service)
- Contact page: src/app/contact/page.tsx

## Phase 1: Cache/Approval Fixes (fast wins)
Goal: eliminate stale-cache 404s after approvals and normalize cache invalidation.

### Tasks
1) Normalize revalidateTag usage everywhere
   - Replace all calls using a second argument with the correct signature.
   - Targets:
     - src/app/api/blog-posts/route.ts
     - src/app/api/blog-posts/[id]/route.ts
     - src/app/api/listings/route.ts
     - src/app/api/listings/[id]/route.ts
     - src/app/api/listings/[id]/delete/route.ts
     - src/app/api/blogs/[id]/delete/route.ts
     - src/app/blog/[slug]/page.tsx

2) Re-enable cache revalidation on admin approval
   - Un-comment and verify revalidateTag calls in:
     - src/app/api/admin/blogs/[id]/approve/route.ts
     - src/app/api/admin/listings/[id]/approve/route.ts

3) Remove or justify page-level revalidateTag
   - Revalidate calls inside src/app/blog/[slug]/page.tsx can cause unnecessary invalidations.
   - Decision: remove or gate behind explicit admin action.

### Testable deliverables
- Approved blogs/listings appear publicly without 404.
- Public blog/listing fetches reflect approval within tag revalidation.
- No TypeScript errors from revalidateTag call sites.

## Phase 2: Auth Consistency + Access Rules
Goal: consistent, predictable access checks across CRUD routes.

### Tasks
1) Standardize auth helper usage in API routes
   - Choose one helper for API routes (recommended: getAuthenticatedUser(request)).
   - Replace getUserFromToken usage in:
     - src/app/api/blog-posts/route.ts
     - src/app/api/blog-posts/[id]/route.ts
     - src/app/api/listings/[id]/route.ts
   - Keep verifyAdminRole for admin routes, or refactor it to use the same helper.

2) Standardize public vs authenticated visibility
   - Ensure all public endpoints return published-only content.
   - Ensure authenticated users can access their own unpublished content.
   - Verify consistent response codes (404 vs 403) for unauthorized access.

3) Align cache behavior with access model
   - Cached methods should only ever return published content.
   - Access to drafts should bypass cache (direct DB query).

### Testable deliverables
- Authenticated users can see their drafts; unauthenticated users cannot.
- Public endpoints never leak unpublished content.
- Cache usage matches visibility rules in every CRUD route.

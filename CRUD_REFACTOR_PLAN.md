# CRUD Service Refactoring Plan

## Overview
This document outlines a phased approach to refactoring the CRUD services in the Specialist Realty application. The refactoring will address critical issues in cache invalidation, session management, and data consistency while ensuring minimal disruption to the live application.

## Services Impacted

### Core CRUD Services
- **Blog Service** 
  - API: `src/app/api/blog-posts/route.ts`
  - API: `src/app/api/blog-posts/[id]/route.ts`
  - API: `src/app/api/blog-posts/slug/[slug]/route.ts`
  - API: `src/app/api/blogs/[id]/delete/route.ts`
  - Page: `src/app/blog/[slug]/page.tsx`
  - Admin approve: `src/app/api/admin/blogs/[id]/approve/route.ts`

- **Listing Service**
  - API: `src/app/api/listings/route.ts`
  - API: `src/app/api/listings/[id]/route.ts`
  - API: `src/app/api/listings/[id]/delete/route.ts`
  - Admin approve: `src/app/api/admin/listings/[id]/approve/route.ts`

### Supporting Services
- **Cache Management**: `src/lib/cache.ts`, `src/lib/dashboard-cache.ts`
- **Authentication**: `src/lib/auth-helpers.ts`, `src/lib/get-user-from-token.ts`, `src/lib/verify-admin-role.ts`
- **Database Access**: `src/lib/prisma.ts`
- **Error Handling**: `src/lib/logger.ts`

### Out of Scope
- Contact page: `src/app/contact/page.tsx` (not a CRUD service)
- Upload service: `src/app/api/upload/route.ts` (not directly impacted by cache/auth refactoring)

## Phased Refactoring Approach

### Phase 1: Cache/Approval Fixes (High Urgency, High Importance)
**Timeline**: 1-2 weeks
**Goal**: Eliminate stale-cache 404s after approvals and normalize cache invalidation.

#### Tasks:
1) Normalize revalidateTag usage everywhere
   - Replace all calls using a second argument with the correct signature.
   - Targets:
     - `src/app/api/blog-posts/route.ts`
     - `src/app/api/blog-posts/[id]/route.ts`
     - `src/app/api/listings/route.ts`
     - `src/app/api/listings/[id]/route.ts`
     - `src/app/api/listings/[id]/delete/route.ts`
     - `src/app/api/blogs/[id]/delete/route.ts`
     - `src/app/blog/[slug]/page.tsx`

2) Re-enable cache revalidation on admin approval
   - Un-comment and verify revalidateTag calls in:
     - `src/app/api/admin/blogs/[id]/approve/route.ts`
     - `src/app/api/admin/listings/[id]/approve/route.ts`

3) Remove or justify page-level revalidateTag
   - Revalidate calls inside `src/app/blog/[slug]/page.tsx` can cause unnecessary invalidations.
   - Decision: remove or gate behind explicit admin action.

**Status (Jan 2026)**:
- **Completed**: `revalidateTag` usage normalized to one-tag-per-call across CRUD routes.
- **Completed**: admin approval now also triggers `revalidatePath` for `/blog` and `/blog/[slug]`.
- **Completed**: blog detail page forced dynamic to avoid cached 404s.
- **Result**: approved posts appear immediately without edit/update workaround.

**Testable Deliverables:**
- Approved blogs/listings appear publicly without 404.
- Public blog/listing fetches reflect approval within tag revalidation.
- No TypeScript errors from revalidateTag call sites.

**Impact Assessment:**
- **Authentication**: High - Prevents unintended logouts
- **Blog Service**: High - Resolves 404 errors on valid content
- **User Experience**: High - Eliminates confusing error states

### Phase 2: Auth Consistency + Access Rules (Medium Urgency, High Importance)
**Timeline**: 2-3 weeks
**Goal**: Ensure consistent, predictable access checks across CRUD routes.

#### Tasks:
1) Standardize auth helper usage in API routes
   - Choose one helper for API routes (recommended: `getAuthenticatedUser(request)`).
   - Replace `getUserFromToken` usage in:
     - `src/app/api/blog-posts/route.ts`
     - `src/app/api/blog-posts/[id]/route.ts`
     - `src/app/api/listings/[id]/route.ts`
   - Keep `verifyAdminRole` for admin routes, or refactor it to use the same helper.

2) Standardize public vs authenticated visibility
   - Ensure all public endpoints return published-only content.
   - Ensure authenticated users can access their own unpublished content.
   - Verify consistent response codes (404 vs 403) for unauthorized access.

3) Align cache behavior with access model
   - Cached methods should only ever return published content.
   - Access to drafts should bypass cache (direct DB query).

**Testable Deliverables:**
- Authenticated users can see their drafts; unauthenticated users cannot.
- Public endpoints never leak unpublished content.
- Cache usage matches visibility rules in every CRUD route.

**Status (Jan 2026)**:
- **In progress**: `getAuthenticatedUser` is used in core blog endpoints.
- **Gap**: `src/app/api/blog-posts/slug/[slug]/route.ts` only supports published content; no authenticated preview by slug.
- **Remaining**: verify listing endpoints mirror blog access rules and that all admin routes consistently use the shared auth helper.


### Phase 3: Robust Error Handling (Medium Urgency, Medium Importance)
**Timeline**: 2-3 weeks
**Goal**: Implement comprehensive error handling and retry mechanisms

**Status (Jan 2026)**:
- **Deferred**: no systematic retry or cache error handling added yet.
- **Recommendation**: keep as optional unless cache or DB failures are observed in production.

#### Milestones:
- [ ] Add try/catch blocks around all cache operations
- [ ] Implement retry logic for transient failures
- [ ] Create proper error boundaries for user-facing components
- [ ] Add monitoring for failed operations

**Testable Deliverables:**
- ✅ No silent failures in cache operations
- ✅ Automatic retries for transient errors
- ✅ User-friendly error messages
- ✅ Monitoring alerts for critical failures

**Impact Assessment:**
- **Reliability**: High - Reduces downtime
- **User Experience**: Medium - Better error recovery
- **Debugging**: High - Easier issue identification

### Phase 4: Performance Optimization (Low Urgency, Medium Importance)
**Timeline**: 3-4 weeks
**Goal**: Improve performance and efficiency of CRUD operations

**Status (Jan 2026)**:
- **Not started**: current caching is sufficient for public reads.
- **Recommendation**: defer unless DB load or latency becomes an issue.

#### Milestones:
- [ ] Optimize database queries
- [ ] Implement selective caching strategies
- [ ] Add lazy loading for large datasets
- [ ] Implement pagination for listing services

**Testable Deliverables:**
- ✅ 30% reduction in database query time
- ✅ 50% reduction in cache miss rates
- ✅ Smooth loading for large datasets
- ✅ Efficient pagination implementation

**Impact Assessment:**
- **Performance**: High - Improves response times
- **Scalability**: Medium - Better handling of large datasets
- **User Experience**: Medium - Faster page loads

### Phase 5: Advanced Features (Low Urgency, Low Importance)
**Timeline**: 4-6 weeks
**Goal**: Add advanced caching and session management features

**Status (Jan 2026)**:
- **Optional**: no immediate need unless scaling/traffic increases.

#### Milestones:
- [ ] Implement cache warming strategies
- [ ] Add session expiration handling
- [ ] Create cache invalidation scheduling
- [ ] Implement optimistic UI updates

**Testable Deliverables:**
- ✅ Pre-loading of frequently accessed data
- ✅ Graceful session expiration handling
- ✅ Automated cache maintenance
- ✅ Smooth user experience during updates

**Impact Assessment:**
- **Performance**: Medium - Proactive caching improvements
- **User Experience**: Medium - Smoother interactions
- **Maintainability**: Low - Nice-to-have features

## Additional Recommendations (Jan 2026)
- Add a preview endpoint by slug for owners/admins (unpublished access without leaking publicly).
- Introduce a small helper wrapper for cache invalidation to prevent multi-arg `revalidateTag` misuse.
- Add a lightweight integration test/script: create draft -> approve -> verify `/blog/[slug]` and `/api/blog-posts?published=true` update immediately.

## Implementation Strategy

### Development Approach
1. **Branch-based development**: Create feature branches for each phase
2. **Testing**: Comprehensive unit and integration tests for each milestone
3. **Staging**: Deploy to staging environment before production
4. **Monitoring**: Track key metrics during and after deployment

### Risk Mitigation
- **Rollback capability**: Ensure each phase can be rolled back
- **A/B testing**: Test critical changes with a subset of users
- **Monitoring**: Real-time monitoring of system health
- **Documentation**: Clear documentation for each change

## Success Metrics

### Primary Metrics
- **Error Rate**: Reduction in 404 and session errors
- **Response Time**: Improvement in CRUD operation speed
- **User Satisfaction**: Feedback on error handling and performance
- **Uptime**: Maintenance of 99.9% uptime during refactoring

### Secondary Metrics
- **Cache Hit Rate**: Improvement in caching efficiency
- **Database Load**: Reduction in database query load
- **Error Resolution Time**: Faster identification and fixing of issues
- **Code Quality**: Improved test coverage and maintainability

## Communication Plan

### Stakeholder Updates
- **Daily standups** for the development team
- **Weekly progress reports** for stakeholders
- **Milestone celebrations** for completed phases
- **Risk alerts** for any issues encountered

### User Communication
- **Release notes** for each phase
- **Change logs** for documentation
- **Support training** for new features
- **Feedback channels** for user input

## Conclusion

This phased approach ensures that the most critical issues are addressed first while maintaining system stability. Each phase builds on the previous one, creating a more robust and maintainable CRUD system. The testable milestones provide clear checkpoints for measuring progress and ensuring quality at each stage of the refactoring process.

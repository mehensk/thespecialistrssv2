# Site Feature Baseline (Living Document)

Last audited: 2026-03-19
Scope: Implemented + In Progress
Format: Feature Matrix

## Purpose
Single source of truth for what this site already has (and what is partially implemented) so future similar builds can reuse proven patterns faster.

## Evidence Rules
- Mark `implemented` only when directly verified in current code.
- Mark `in-progress` only when code exists but a clear missing piece remains.
- Do not use planning docs as implementation proof.
- Include code evidence paths for every row.

## Project Snapshot

| Area | Current Baseline | Evidence |
|---|---|---|
| Framework | Next.js App Router (`next@16`), React 19, TypeScript | `package.json`, `src/app` |
| Styling/UI | Tailwind v4 + custom CSS, lucide icons, Geist fonts | `package.json`, `src/app/globals.css`, `src/app/layout.tsx` |
| Auth model | NextAuth v5 credentials, JWT session, role-based access (`ADMIN`, `AGENT`, `WRITER`) | `src/lib/auth.ts`, `prisma/schema.prisma` |
| Data layer | Prisma + PostgreSQL with `User`, `Listing`, `BlogPost`, `Activity` | `prisma/schema.prisma`, `src/lib/prisma.ts` |
| Search/filter contract | Canonical query parsing + Metro Manila location normalization for listing filters | `src/lib/search-contract.ts`, `src/lib/location-utils.ts` |
| Media pipeline | Sharp preprocessing + Cloudinary (prod/serverless), local file fallback (dev) | `src/app/api/upload/route.ts`, `src/lib/cloudinary.ts` |
| Caching/ISR | `unstable_cache`, tag/path revalidation, sitemap generation | `src/lib/cache.ts`, `src/lib/listing-revalidation.ts`, `src/app/sitemap.ts` |
| Deployment targets | Netlify build, standalone output for server/VPS | `netlify.toml`, `next.config.ts` |

## Frontend Features Matrix

| Feature/Page | Audience | Status | API Dependency | Reusable Pattern Notes | Evidence |
|---|---|---|---|---|---|
| Global shell (navbar, footer, session/toast providers) | Public + Auth users | implemented | NextAuth session read | Keep top-level providers in root layout | `src/app/layout.tsx`, `src/components/ui/navbar.tsx` |
| Home landing page with hero search and featured listings | Public | implemented | `/api/listings?published=true` | Split above-the-fold static + client fetched listing cards | `src/app/page.tsx`, `src/components/ui/hero-search.tsx`, `src/components/featured-listings.tsx` |
| Listings browse page (server-driven filters, facets, pagination, URL sync, retry/timeout handling) | Public | implemented | `/api/listings`, `/api/listings/facets` | Canonical query state + abortable fetch + resilient retry flow | `src/app/listings/page.tsx`, `src/lib/search-contract.ts` |
| Listing detail page (canonical slug path, gallery zoom, inquiry CTA) | Public + owner/admin for unpublished | implemented | `/api/listings/[id]` data contract, SEO schema | Canonical slug resolver + fallback redirect + rich detail client | `src/app/listings/[id]/page.tsx`, `src/components/listings/ListingDetailClient.tsx` |
| Blog index page | Public | implemented | `/api/blog-posts?published=true` | Card feed with client fetch and lightweight loading state | `src/app/blog/page.tsx` |
| Blog detail page with metadata + schema | Public (published only) | implemented | Prisma query via server page | Server-rendered article with SEO metadata and JSON-LD | `src/app/blog/[slug]/page.tsx`, `src/components/seo/blog-schema.tsx` |
| Contact page with EmailJS + reCAPTCHA verification | Public | implemented | `/api/verify-recaptcha` | Form flow: execute recaptcha, verify server-side, then send mail | `src/app/contact/page.tsx`, `src/lib/emailjs.ts` |
| Hidden login page (`/noisy-pixel-8146`) | Internal/auth users | implemented | `/api/auth/*` (NextAuth) | Secret route plus role-based redirect after auth | `src/app/noisy-pixel-8146/page.tsx`, `src/components/auth/LoginPageContent.tsx` |
| Deprecated `/login` route blocked | Public | implemented | none | Explicitly return 404 and log access attempts | `src/app/login/page.tsx` |
| Dashboard layout (agent/writer) with activity tracker and mobile nav | Authenticated non-admin | implemented | Session + logout endpoint | Shared mobile nav + logout sync + activity heartbeat | `src/app/dashboard/layout.tsx`, `src/components/dashboard/DashboardLayout.tsx` |
| Dashboard listings/blogs/settings pages | Authenticated non-admin | implemented | Listings/blog APIs + password API | Reusable card/action patterns for owner CRUD | `src/app/dashboard/listings/page.tsx`, `src/app/dashboard/blogs/page.tsx`, `src/app/dashboard/settings/page.tsx` |
| Admin layout and admin dashboard | Admin | implemented | Admin API + stats/activity queries | Unified admin shell plus personal links in same nav | `src/app/admin/layout.tsx`, `src/components/admin/AdminLayout.tsx`, `src/app/admin/dashboard/page.tsx` |
| Admin management screens (users, listings, blogs, logs) | Admin | implemented | `/api/admin/*` + DB queries | Split desktop table + mobile card views | `src/app/admin/users/page.tsx`, `src/app/admin/listings/page.tsx`, `src/app/admin/blogs/page.tsx`, `src/app/admin/logs/page.tsx` |
| Role-aware dashboard redirection for admins | Admin | implemented | Session role | Admins hitting `/dashboard` are routed into admin panel flow | `src/app/dashboard/page.tsx`, `src/app/dashboard/layout.tsx` |

## Backend Features Matrix

| Capability | Routes/Domain | Auth/Role | Data Touched | Cache/Revalidation | Status | Missing Piece (if any) | Evidence |
|---|---|---|---|---|---|---|---|
| Credentials auth, session, JWT role injection, timeout checks | `/api/auth/[...nextauth]`, `auth` callbacks | Public login; protected session checks | `User`, JWT token claims | n/a | implemented | none | `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth.ts` |
| Logout cookie invalidation endpoint | `/api/auth/logout` | Auth user expected | Auth cookies | n/a | implemented | none | `src/app/api/auth/logout/route.ts` |
| Middleware route protection for dashboard/admin + probe blocking | middleware | Token presence/validity | n/a | n/a | implemented | Admin role enforced in layouts, not middleware | `src/middleware.ts` |
| Listings list + create | `/api/listings` | GET public; POST admin/agent | `Listing`, `Activity` | Public GET is currently `no-store`; writes still trigger listing revalidation | implemented | none | `src/app/api/listings/route.ts` |
| Listings facets for dynamic city options | `/api/listings/facets` | Public | `Listing` (published subset) | `no-store` response; supports filter-aware city facet generation | implemented | none | `src/app/api/listings/facets/route.ts` |
| Listing read + update | `/api/listings/[id]` | Published public; unpublished owner/admin; PUT owner/admin | `Listing`, `Activity` | Cached read except dashboard edit no-store, write revalidation | implemented | none | `src/app/api/listings/[id]/route.ts` |
| Listing delete (owner) | `/api/listings/[id]/delete` | Owner only | `Listing`, `Activity` | Listing revalidation | implemented | none | `src/app/api/listings/[id]/delete/route.ts` |
| Blog list + create | `/api/blog-posts` | GET public for published; POST auth user | `BlogPost`, `Activity` | Cached GET, tag/path revalidation on writes | implemented | none | `src/app/api/blog-posts/route.ts` |
| Blog read by ID + update | `/api/blog-posts/[id]` | Published public; unpublished owner/admin; PUT owner/admin | `BlogPost`, `Activity` | Tag/path revalidation | implemented | none | `src/app/api/blog-posts/[id]/route.ts` |
| Blog read by slug | `/api/blog-posts/slug/[slug]` | Published public; unpublished owner/admin | `BlogPost` | Cached helper use | implemented | none | `src/app/api/blog-posts/slug/[slug]/route.ts` |
| Blog delete (owner) | `/api/blogs/[id]/delete` | Owner only | `BlogPost`, `Activity` | Tag/path revalidation | implemented | none | `src/app/api/blogs/[id]/delete/route.ts` |
| Admin listing approve/delete | `/api/admin/listings/[id]/approve`, `/delete` | Admin | `Listing`, `Activity` | Listing revalidation | implemented | none | `src/app/api/admin/listings/[id]/approve/route.ts`, `src/app/api/admin/listings/[id]/delete/route.ts` |
| Admin blog approve/delete | `/api/admin/blogs/[id]/approve`, `/delete` | Admin | `BlogPost`, `Activity` | Approve route revalidates; delete route currently does not | in-progress | Add cache/path revalidation parity for admin blog delete | `src/app/api/admin/blogs/[id]/approve/route.ts`, `src/app/api/admin/blogs/[id]/delete/route.ts` |
| Admin user management (create/read/update/delete/reset password) | `/api/admin/users*` | Admin | `User`, `Activity` | n/a | implemented | none | `src/app/api/admin/users/route.ts`, `src/app/api/admin/users/[id]/route.ts`, `src/app/api/admin/users/[id]/delete/route.ts`, `src/app/api/admin/users/[id]/reset-password/route.ts` |
| Upload pipeline (image validate, optimize, cloud/local storage) | `/api/upload` | Admin/agent/writer | Image files + URLs | n/a | implemented | none | `src/app/api/upload/route.ts` |
| Password change (self-service) | `/api/user/change-password` | Auth user | `User.password` | n/a | implemented | none | `src/app/api/user/change-password/route.ts` |
| reCAPTCHA verification | `/api/verify-recaptcha` | Public | External reCAPTCHA validation | n/a | implemented | none | `src/app/api/verify-recaptcha/route.ts` |
| DB health check | `/api/health/database` | Public/internal ops | DB connectivity | n/a | implemented | none | `src/app/api/health/database/route.ts`, `src/lib/prisma.ts` |
| Rate limiting utility | shared library | n/a | in-memory store | n/a | in-progress | Utility exists but not broadly enforced on high-risk routes | `src/lib/rate-limit.ts` |

## Cross-Cutting Systems

| System | Status | Current Behavior | Evidence |
|---|---|---|---|
| Auth/session lifecycle | implemented | JWT strategy, inactivity timeout, max-age timeout, fallback auth helpers | `src/lib/auth.ts`, `src/lib/auth-helpers.ts` |
| Role enforcement | implemented | Middleware gate + layout/API role checks (`verifyAdminRole`, helper role checks) | `src/middleware.ts`, `src/lib/verify-admin-role.ts` |
| Approval workflow | implemented | Listings/blogs default unpublished, explicit admin approval endpoints set approver and timestamp | `prisma/schema.prisma`, `src/app/api/admin/listings/[id]/approve/route.ts`, `src/app/api/admin/blogs/[id]/approve/route.ts` |
| Media handling | implemented | Sharp optimization, Cloudinary in serverless/prod, local storage in dev | `src/app/api/upload/route.ts`, `src/lib/cloudinary.ts` |
| SEO | implemented | Metadata, canonical listing paths, JSON-LD for listing/blog, sitemap | `src/app/layout.tsx`, `src/app/listings/[id]/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/sitemap.ts` |
| Caching and revalidation | implemented | Mixed strategy: tag/path revalidation for mutations, blog cache paths, and `no-store` listings search responses | `src/lib/cache.ts`, `src/lib/listing-revalidation.ts`, listings/blog API routes |
| Observability/activity logs | implemented | Activity log model + helper instrumentation in auth/content/admin actions | `prisma/schema.prisma`, `src/lib/activity-logger.ts`, `src/app/admin/logs/page.tsx` |
| Listings request telemetry | implemented | Optional env-gated request metrics for `/api/listings` (filters, duration, result counts, status) | `src/lib/listings-observability.ts`, `src/app/api/listings/route.ts` |
| Security hardening | in-progress | Probe blocking and hidden login are present; route-level rate limiting not fully rolled out | `src/middleware.ts`, `src/lib/rate-limit.ts`, `src/app/login/page.tsx` |

## Reuse Blueprint (Copy-First Modules)

| Reuse Module | Why Reuse First | Primary Files |
|---|---|---|
| Auth scaffold | Full credentials + JWT role/session lifecycle already integrated | `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts` |
| Role-aware dashboard/admin shell | Unified desktop/mobile nav and role routing patterns | `src/components/dashboard/DashboardLayout.tsx`, `src/components/admin/AdminLayout.tsx`, `src/components/navigation/nav-config.ts` |
| Listings CRUD + approval workflow | End-to-end create/read/update/delete + publish approval + activity logging | `src/app/api/listings/*`, `src/app/api/admin/listings/*`, `src/lib/listing-revalidation.ts` |
| Blog CRUD + approval workflow | Parallel structure to listings for fast duplication in other content domains | `src/app/api/blog-posts/*`, `src/app/api/blogs/*`, `src/app/api/admin/blogs/*` |
| Media upload flow | Production-safe upload path with clear environment fallback strategy | `src/app/api/upload/route.ts`, `src/lib/cloudinary.ts` |
| SEO + canonical URL pattern | Reusable canonical slug resolver and metadata wiring | `src/lib/listing-slug.ts`, `src/app/listings/[id]/page.tsx`, `src/app/sitemap.ts` |
| Activity logging | Centralized helper for audit trails with per-item metadata | `src/lib/activity-logger.ts`, `src/app/admin/logs/page.tsx` |

## Update Workflow (Per Feature Merge)
1. Confirm changed behavior in code (not docs).
2. Update exactly one relevant row in the frontend or backend matrix:
   - Keep status vocabulary to `implemented` or `in-progress`.
   - If `in-progress`, include one short missing-piece note.
3. Update `Last audited` date at top of this file.
4. Append one line in Update Log with date, change summary, and touched row(s).
5. If a feature changes auth exposure, also review Cross-Cutting Systems rows.

## Validation Checklist (Ongoing)
- Public pages accounted for: `/`, `/how-we-work`, `/developer-selling`, `/investor-relations`, `/listings`, `/listings/[id]`, `/blog`, `/blog/[slug]`, `/contact`, `/403`, secret login route.
- Protected app routes accounted for: `/dashboard/*`, `/admin/*`.
- API groups accounted for: auth, listings, listings facets, blogs/blog-posts, admin users, admin listings/blogs actions, upload, recaptcha, health, user password.
- Core systems accounted for: auth, middleware, prisma schema, caching/revalidation, sitemap.
- Consistency check: protected backend rows include auth/role constraints.

## Update Log
- 2026-03-16: Initial baseline created from direct code audit of frontend pages, dashboard/admin surfaces, API groups, auth, media, caching, SEO, and ops config.
- 2026-03-19: Updated baseline to current codebase: added listings facets endpoint coverage, updated listings browse/search architecture notes, and aligned caching/observability entries with current behavior.

## Suggested Features Before Final Launch

### Frontend Suggestions

| Feature | Priority | Why It Matters | Suggested Backend Dependency |
|---|---|---|---|
| Saved listings (persistent favorites) | High | Turns casual visitors into returning users and improves lead quality | `saved-listings` API + user-linked table |
| Compare listings view (2-4 properties) | High | Helps buyers decide faster and keeps them on-site longer | Listing read endpoints (existing) + optional compare analytics |
| Advanced search UX (sticky filter bar + quick chips + clear state) | High | Reduces friction on `/listings`, especially on mobile | Existing listings API, optional server-side filtering |
| Listing inquiry history in dashboard | Medium | Lets agents/admin track follow-ups and response quality | Inquiry model + inquiry APIs |
| Blog category/tag pages | Medium | Improves discoverability and SEO topic clustering | Blog schema/tag support + filtered blog API |
| Recently viewed listings | Medium | Increases return conversion and session depth | Client storage initially; optional server sync |
| Map view for listings (toggle grid/map) | Medium | Important for location-first buyers | Geocoding data + listings geo fields/API |
| Shareable search URLs with richer meta preview | Low | Better social sharing for curated searches | Search params + dynamic metadata route |

### Backend Suggestions

| Feature | Priority | Why It Matters | Implementation Notes |
|---|---|---|---|
| Route-level rate limiting on auth/contact/upload endpoints | High | Reduces abuse risk before production traffic scales | Integrate `src/lib/rate-limit.ts` into high-risk routes |
| Inquiry/lead management module | High | Converts contact actions into trackable pipeline data | Add `Inquiry` model + admin/dashboard views + status workflow |
| Audit trail enrichment (before/after snapshots on updates) | High | Safer admin operations and easier issue diagnosis | Extend `Activity.metadata` on UPDATE/DELETE |
| Soft delete + restore for listings/blogs | Medium | Prevents accidental permanent loss by users/admins | Add `deletedAt` + restore endpoints; exclude deleted in public queries |
| Draft autosave for blog/listing editors | Medium | Prevents data loss and improves editor UX | Draft table or draft fields + autosave endpoints |
| Unified validation schemas (zod or equivalent) | Medium | Keeps API input contracts consistent and easier to maintain | Centralize validators used by listings/blog/users APIs |
| Job/queue for heavy tasks (image migration, cleanup, bulk ops) | Medium | Avoids long request times and serverless timeouts | Background worker or cron-triggered script pattern |
| API pagination metadata standardization | Low | Improves frontend reliability for larger datasets | Return `{items, total, page, pageSize}` format consistently |

### Cross-Cutting Suggestions

| Feature | Priority | Why It Matters | Implementation Notes |
|---|---|---|---|
| Error monitoring (Sentry or similar) | High | Captures production errors early with stack/context | Add global app + API route instrumentation |
| Uptime/health monitoring alerts | High | Detects DB/auth/upload outages quickly | Poll `/api/health/database` + external uptime checks |
| Security headers hardening | Medium | Improves baseline web security posture | Add CSP, HSTS, X-Frame-Options, Referrer-Policy |
| Performance budget + Lighthouse CI | Medium | Prevents regressions as features grow | Add CI thresholds for LCP/CLS/JS weight |
| Backup + restore runbook for DB/media | Medium | Critical for launch readiness and incident recovery | Document and test recovery steps |
| Test coverage expansion (critical flows) | Medium | Reduces launch regressions | Add API integration tests + key UI flow smoke tests |

### Recommended Pre-Finish Shortlist (Practical Order)
1. Route-level rate limiting for auth/contact/upload.
2. Inquiry/lead management (capture, status, assignment, dashboard visibility).
3. Saved listings (persistent favorites) + dashboard surface.
4. Soft delete + restore for listings/blogs.
5. Error monitoring + uptime alerts.

### Update Log
- 2026-03-16: Added pre-finish suggested feature set (frontend, backend, cross-cutting, and prioritized shortlist).

## Commentary: Path To 100% Completion

This project is already strong as a marketing platform. To assess it as "100%" for this business model (brokerage marketing + lead generation, not SaaS), the goal is not more auth complexity. The goal is reliable lead capture, stronger discoverability, and safer operations.

### 1) Must-Have To Reach 100% (High Impact)

| Area | What To Add/Improve | Why This Is 100%-Critical |
|---|---|---|
| Lead capture reliability | Add an `Inquiry` database flow in parallel with EmailJS (store every form submission + source page/listing) | Prevents lost leads and gives a trackable pipeline |
| Follow-up workflow | Add inquiry status + assignment + notes in admin/dashboard (`new`, `contacted`, `qualified`, `closed`, `lost`) | Turns inquiries into managed outcomes, not just inbox messages |
| SEO local intent | Add city/area landing pages with unique metadata and internal links | Biggest organic reach unlock for local real estate |
| Internal linking program | Add "related listings", "related blog posts", and service-to-listing link modules | Increases crawl depth, user session depth, and conversion paths |
| Route-level abuse protection | Apply rate limiting to auth, upload, recaptcha verify, and contact submission paths | Hardens production behavior and prevents spam/abuse spikes |

### 2) Existing Features To Improve Before Final Sign-Off

| Existing Feature | Improvement Needed | Completion Signal |
|---|---|---|
| Blog/listing admin delete flows | Ensure cache revalidation parity on all admin delete routes | Public pages reflect deletes immediately and consistently |
| Contact form | Add anti-duplicate guard (short-window dedupe by email+message hash) | Fewer accidental duplicates and cleaner lead pipeline |
| Dashboard analytics cards | Include inquiry metrics (new today, unassigned, overdue follow-ups) | Dashboard becomes operationally useful, not just content counts |
| Activity logging | Include more actionable metadata for lead and status transitions | Better auditability for team handoffs |
| Mobile performance | Optimize heavy pages (listing grid/detail and blog detail) for consistent CWV | Stable LCP/INP on real mid-range mobile devices |

### 3) "Nice-To-Have" After 100% (Do Not Block Launch)

| Area | Feature |
|---|---|
| UX | Saved listings for anonymous users with optional sync when logged in |
| UX | Compare listings view |
| Growth | Automated OG image templates per listing/blog |
| Ops | Background job queue for long-running maintenance tasks |

### 4) Practical Definition Of 100% For This Site

The site can be considered 100% when all conditions below are true:
- Every inquiry is both delivered (email) and persisted (database) with status workflow.
- SEO foundation includes canonical metadata, schema, sitemap, and city/area intent pages.
- Internal linking is systematic across listings, blogs, and service pages.
- Critical endpoints are rate-limited and monitored.
- Admin team can reliably process leads from capture to closure.
- Core mobile pages meet acceptable performance targets.

### Update Log
- 2026-03-16: Added "Path To 100% Completion" commentary with launch-critical priorities and completion criteria.

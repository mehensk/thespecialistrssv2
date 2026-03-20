# Database and Listing System Blueprint

## 1) Current System Blueprint (As Implemented)

### 1.1 Platform and runtime
- Application: Next.js App Router (`src/app`)
- Data access: Prisma ORM (`src/lib/prisma.ts`)
- Database: PostgreSQL via `DATABASE_URL` (`prisma/schema.prisma`)
- AuthN/AuthZ: NextAuth JWT + role checks (`src/lib/auth-helpers.ts`, `src/lib/verify-admin-role.ts`)
- Media pipeline: Sharp preprocessing + Cloudinary/local fallback (`src/app/api/upload/route.ts`)
- Caching/revalidation: `unstable_cache`, cache tags, route revalidation (`src/lib/cache.ts`, `src/lib/listing-revalidation.ts`)

### 1.2 Core domain model

#### User
- PK: `id` (cuid)
- Unique: `email`
- Core fields: `name`, `password`, `role`, timestamps
- Role enum: `ADMIN`, `AGENT`, `WRITER`
- Relationships:
  - One-to-many listings (`User.listings`)
  - One-to-many approved listings (`User.approvedListings`)
  - One-to-many blog posts + approved blog posts
  - One-to-many activity records

#### Listing
- PK: `id` (cuid)
- Public identifier: `slug` (required, unique)
- Business identifier: `propertyId` (generated TSR-prefixed ID, app-enforced uniqueness)
- Publication workflow:
  - `isPublished` (default false)
  - `approvedBy`, `approvedAt`
- Listing details:
  - Core: `title`, `description`, `location`, `city`, `address`, `images`
  - Commercial: `price`, `listingType`, `propertyType`, `available`
  - Specs: `bedrooms`, `bathrooms`, `size`, `parking`, `yearBuilt`, `floor`, `totalFloors`
  - Flexible field: `amenities` (JSON)
- Ownership:
  - `userId` (agent/uploader)

#### Activity
- PK: `id`
- Foreign key: `userId`
- Event model:
  - `action` enum (`LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`, `APPROVE`, `REJECT`)
  - `itemType` enum (`LISTING`, `BLOG`, `USER`, `AUTH`)
  - `itemId`, `metadata`, `ipAddress`, `userAgent`, `timestamp`

### 1.3 Listing indexes (query-facing)
- `@@index([isPublished, createdAt(sort: Desc)])`
- `@@index([isPublished, listingType, createdAt(sort: Desc)])`
- `@@index([isPublished, propertyType, createdAt(sort: Desc)])`
- `@@index([isPublished, price])`
- `@@index([isPublished, size])`
- Also: `userId`, `isPublished`, `(userId, isPublished)`

Implication:
- Good fit for current browse filters + newest/price/size sorts on published inventory.
- Better than baseline for pagination and common dashboard counts.

### 1.4 Listing lifecycle (current)

#### Create (Agent/Admin)
1. `POST /api/listings`
2. Auth + role check (`ADMIN`/`AGENT`)
3. Payload validation (`validateListingInput`)
4. City normalization for Metro Manila variants
5. Transaction:
  - Insert listing with placeholder slug
  - Generate/verify `propertyId`
  - Compute canonical slug from title
  - Update slug with conflict-safe suffix fallback
6. Activity log (`CREATE`)
7. Cache revalidation
8. Record remains unpublished pending approval

#### Approve (Admin)
1. `POST /api/admin/listings/[id]/approve`
2. Admin verification
3. Set `isPublished = true`, `approvedBy`, `approvedAt`
4. Activity log (`APPROVE`)
5. Cache/path revalidation

#### Browse/Search (Public + Authenticated variants)
1. `GET /api/listings`
2. Parse canonical search contract (`location`, `type`, `listingType`, ranges, page/limit)
3. Build Prisma where clause
4. Published-only fast path for `published=true`
5. Authenticated fallback can include own unpublished records
6. Return list + pagination metadata

#### Detail
- Route: `/listings/[id]` where segment supports canonical slug-shortId form.
- Resolution:
  - Parse canonical segment
  - Resolve ID by short suffix matching
  - Redirect to canonical path if needed
- Access:
  - Published listings are public
  - Unpublished listings restricted to owner/admin

#### Update/Delete
- `PUT /api/listings/[id]` owner or admin
- `POST /api/listings/[id]/delete` owner-only
- `POST /api/admin/listings/[id]/delete` admin path
- All mutation endpoints trigger listing cache/path revalidation.

### 1.5 Query contract and normalization layer
- Search parameter parsing is centralized (`src/lib/search-contract.ts`):
  - Canonical property/listing type validation
  - Numeric range parsing
  - Query canonicalization utility
- Location logic normalized around Metro Manila (`src/lib/location-utils.ts`):
  - City canonicalization, alias handling (e.g., Manila, Las Pinas/Las Piñas)
  - Tokenized structured filters (`metro`, `outside`, specific NCR city)

### 1.6 Caching and consistency behavior
- `unstable_cache` wrappers for listings/blog data
- Tag + path invalidation after mutations
- Public list endpoint currently sets `Cache-Control: no-store`
- Detail API has conditional cache headers for published records

Net effect:
- Correctness is prioritized over aggressive edge caching.
- Revalidation hooks are present and integrated into mutation routes.

### 1.7 Observability and operational controls
- Listing API telemetry hook (`LISTINGS_METRICS_ENABLED`) emits request-mode/filter/sort/latency payloads.
- DB health probe endpoint (`/api/health/database`).
- Activity logging with configurable noise controls (`ENABLE_ACTIVITY_LOGGING`, `LOG_UPDATE_ACTIONS`, etc).

## 2) Reusable MLS-Style Reference Architecture (for future projects)

### 2.1 Multi-tenant base (recommended for reusability)
Add `Tenant` and scope all records with `tenantId`.

Core tables:
- `Tenant`
- `User` (tenant-scoped roles)
- `Office` (brokerage office/branch)
- `AgentProfile` (license, contact, office mapping)
- `Listing` (tenant + agent ownership)
- `ListingMedia`
- `ListingAmenity` / `AmenityCatalog`
- `ListingStatusHistory`
- `ActivityLog`
- `SavedSearch`, `SavedListing`, `LeadInquiry`

Why:
- Enables one codebase to power multiple regional MLS-like deployments with strict data separation.

### 2.2 Listing data model target
Current model is good for MVP; for MLS-grade systems split into:
- `Listing` (identity + lifecycle + pricing headline)
- `ListingDetails` (specs and text-heavy fields)
- `ListingAddress` (normalized location fields)
- `ListingMedia` (ordered photos/videos/floor plans with metadata)
- `ListingCompliance` (legal/disclaimer fields, publish constraints)

Benefits:
- Cleaner indexing, less row bloat, easier schema evolution.

### 2.3 Recommended status machine
Replace boolean publication with explicit lifecycle enum:
- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `ACTIVE`
- `PAUSED`
- `SOLD_OR_LEASED`
- `ARCHIVED`
- `REJECTED`

Track transitions in `ListingStatusHistory`.

### 2.4 Search architecture target
Stage 1 (DB-native):
- Keep PostgreSQL + Prisma
- Add materialized search columns where needed
- Add composite indexes per filter/sort combination observed in telemetry

Stage 2 (when inventory/query complexity grows):
- Introduce OpenSearch/Meilisearch/Typesense sync for full-text and faceted search
- Keep PostgreSQL as source of truth

Stage 3 (geo-heavy):
- Use PostGIS for geo queries (radius, commute, polygon neighborhoods)

### 2.5 Media architecture target
- Keep upload preprocessing with Sharp
- Persist media in separate table:
  - `id`, `listingId`, `url`, `kind`, `order`, `width`, `height`, `bytes`, `provider`, `checksum`
- Add async derivative generation (thumb, card, detail, OG image)
- Add moderation flags where needed

### 2.6 API boundary target
Keep route contracts like your current `search-contract`, but formalize:
- Versioned APIs (`/api/v1/listings`)
- Shared schema validation (Zod/Valibot) for request and response
- Cursor pagination for high-page browse
- Idempotency keys for create/update operations in external integrations

## 3) Assessment of Current Setup

### Overall rating
- **Current setup: 7.8 / 10**

### Breakdown
- Data model clarity: **8.0/10**
- Auth and role boundaries: **8.0/10**
- Query/index alignment for current filters: **8.5/10**
- Caching strategy: **7.0/10**
- Extensibility for multi-project MLS reuse: **6.5/10**
- Operational resilience/observability: **7.5/10**
- Data governance/compliance readiness: **6.5/10**

### What is strong now
- Clean role-gated workflow for create/approve/publish.
- Good pragmatic indexing improvements aligned with browse patterns.
- Canonical URL + slug hygiene strategy.
- Mature location normalization for regional consistency.
- Activity and metrics hooks already present.

### Gaps to address for “platform-grade MLS reuse”
- No tenant boundary in schema.
- Publication state is too simple for brokerage operations.
- Search is DB-filter based only (no full-text/geo engine).
- Some field typing and validation paths are inconsistent.
- Public list API is not leveraging cache despite cache infrastructure.

## 4) High-Impact Improvement Plan

### Priority 0: correctness and contract hardening (1-2 sprints)
- Align schema and validators for numeric types and required fields.
- Consolidate listing DTO contracts so API/UI/DB types cannot drift.
- Make approval/delete logging non-blocking in all endpoints.
- Return and optionally enforce `parseSearchParams` validation errors.

### Priority 1: productization for reuse (2-4 sprints)
- Introduce `Tenant` + `tenantId` scoping across all core entities.
- Move from `isPublished` boolean to lifecycle enum + history table.
- Extract listing schema into reusable module package for future projects.

### Priority 2: search and performance scale (parallel track)
- Add trigram/full-text indexes for location/title/description search.
- Shift list endpoints to cacheable responses for stable public queries.
- Add query plan regression checks in CI (`EXPLAIN ANALYZE` snapshots for top queries).

### Priority 3: MLS-grade capabilities
- Saved search + alerting.
- Inquiry/lead pipeline tables and assignment logic.
- Audit trail hardening and immutable event stream for compliance.
- Data import/export adapters (CSV/RESO-style mapping layer).

## 5) Suggested “Template Stack” for your future local-MLS projects

- Framework: Next.js + Prisma (keep)
- DB: PostgreSQL (+ PostGIS when geo is needed)
- Cache/session: Redis for high read throughput and rate-limit state
- Search: PostgreSQL first, OpenSearch/Typesense when query volume/complexity justifies
- Media: Cloudinary/S3 + derivative worker
- Queue: BullMQ/SQS for async workflows (media, notifications, feed sync)
- Observability: structured logs + metrics + tracing (OpenTelemetry)

## 6) Immediate Tactical Recommendations for this repo

1. Add `tenantId` columns behind feature flags (start with `Listing`, `User`, `Activity`).
2. Replace `isPublished` with `status` enum while keeping backward-compatible read mapping.
3. Split listing media into its own table and keep `images` as legacy projection during migration.
4. Implement strict schema validation layer (Zod) at API boundary.
5. Activate safe cache policy for public browse queries (short TTL + stale-while-revalidate).
6. Add load tests for `GET /api/listings` with top 10 filter combinations.
7. Add migration guardrails: preflight checks, zero-downtime index rollout, rollback runbooks.


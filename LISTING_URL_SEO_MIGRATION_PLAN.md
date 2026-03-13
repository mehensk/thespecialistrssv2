# SEO-First Listing URL Migration Plan

## Scope
This document defines the plan to transition listing detail URLs from ID-based paths to SEO-friendly canonical paths.

No implementation is included in this document.

## Final Decisions Locked
- URL format: `/listings/{title-slug}-{idSuffix}`
- Slug behavior: stable after creation (no automatic slug change on title edits)
- Legacy handling: permanent `301` from `/listings/{id}` to canonical URL
- Canonical policy: new title URL only
- Sitemap policy: include canonical new URLs only
- Slug cleanup: standard normalization (lowercase, hyphens, remove symbols, collapse duplicates)
- Release style: phased rollout
- Admin/dashboard slug handling: read-only visibility (no manual editing)
- Redirect retention: permanent
- Structured data: include in this migration
- Index control: explicit `noindex` for unpublished/private listing states
- Monitoring: full post-launch SEO checklist

## Plain Language: Critical Changes and Why They Matter

### 1) New public URL format
We will show listing pages with readable URLs like:
`/listings/luxury-condo-makati-7xk2p9`

Why this is important:
- It is easier for users to understand and trust.
- It gives better SEO clarity than raw IDs.
- The short ID suffix keeps URLs unique and stable without changing internal IDs.

### 2) Keep old links working forever
Old links like `/listings/{id}` will still work, but they will permanently redirect (`301`) to the new URL.

Why this is important:
- Old bookmarks and shared links will not break.
- SEO value from existing indexed/linked pages is preserved.
- Search engines learn the new canonical URL and consolidate ranking signals.

### 3) One official URL per listing (canonical)
Each listing will have a single official URL: the new slug+suffix URL.

Why this is important:
- Prevents duplicate-page SEO issues.
- Consolidates crawl and ranking signals into one address.

### 4) Sitemap will only list canonical listing URLs
Sitemap entries for listings will use only new canonical URLs.

Why this is important:
- Search engines focus on the correct pages faster.
- Reduces indexing confusion caused by duplicate URL formats.

### 5) Slug remains stable after publish
Slug is generated on creation and does not auto-change when title changes.

Why this is important:
- Avoids link breakage and redirect churn.
- Reduces volatility in organic search performance.

### 6) Unpublished/private pages are explicitly non-indexable
If unpublished/private listing pages are ever renderable in restricted contexts, they must send explicit `noindex`.

Why this is important:
- Prevents accidental indexing of non-public content.
- Keeps SEO clean and focused on public pages.

### 7) Structured data URLs must match canonical URLs
Listing schema markup must reference the same canonical listing URL.

Why this is important:
- Reinforces SEO consistency across metadata layers.
- Reduces conflicting signals in search engines.

## Public Interface Changes
- Canonical listing detail path changes:
  - From: `/listings/{id}`
  - To: `/listings/{title-slug}-{idSuffix}`
- Legacy ID path remains available as redirect-only.

## Data and URL Rules
- Keep `Listing.id` unchanged (primary/internal identifier stays as-is).
- Use/confirm `Listing.slug` storage for canonical title slug.
- Build canonical path from:
  1. Normalized slug from title
  2. Deterministic short suffix derived from `Listing.id`
- Default suffix length: 6 characters
- Collision handling: extend suffix length if required

## Implementation Phases (Plan Only)

### Phase 1: Foundations
- Add shared URL helper utilities:
  - title -> slug conversion
  - ID -> short suffix extraction
  - canonical path builder
  - route param parser
- Ensure listing create flow writes slug.
- Backfill/repair slug values for existing records if needed.
- Confirm DB uniqueness/indexing support for slug.

### Phase 2: Canonical Route
- Add/adjust listing detail route to resolve canonical slug+suffix URLs.
- Resolve listing by suffix/ID mapping.
- If URL slug mismatch is detected, redirect to correct canonical URL.
- Update metadata canonical and OG URL outputs.

### Phase 3: Legacy Compatibility
- Add permanent `301` redirect from `/listings/{id}` to canonical URL.
- Ensure one-hop redirect only (no chains).

### Phase 4: Internal Link Transition
- Update all internal public-facing listing links to canonical URL builder:
  - listing cards
  - featured listings
  - admin “view” links
  - dashboard “view” links
  - share/contact-inquiry links

### Phase 5: Cache/Revalidation Alignment
- Update cache and revalidation paths to canonical listing URLs.
- Keep ID-based invalidation where practical, but ensure canonical page path is revalidated.

### Phase 6: SEO Hardening
- Structured data alignment for listing pages.
- Explicit `noindex` behavior for non-public listing states.
- Sitemap contains only canonical listing URLs.

### Phase 7: Monitoring and Verification
- Validate redirects, canonicals, sitemap output, and crawl behavior.
- Watch for crawl errors, 404 trends, and URL indexing consolidation.

## Expected Change Areas
- Routing/page logic for listing detail path
- Listing metadata generation (canonical/OG)
- Listing link generation in public/admin/dashboard components
- Listing API response fields and create/update slug handling
- Cache/revalidation helper logic
- Listing types/interfaces where slug/canonical path data is needed
- Sitemap generation and structured data output

## Acceptance Criteria
- Canonical listing URL renders correctly.
- `/listings/{id}` redirects with permanent `301` to canonical URL.
- Canonical tags and OG URLs match canonical listing URL.
- Sitemap includes only canonical listing URLs.
- Unpublished/private listings are not indexable.
- No user-facing regressions in listing view/edit/admin workflows.

## Risks and Mitigations
- Risk: Duplicate URL indexing during migration
  - Mitigation: strict canonical policy + permanent 301 + sitemap cleanup
- Risk: Link regressions in internal UI surfaces
  - Mitigation: full code search for `/listings/${id}` usage + regression checks
- Risk: Redirect chains
  - Mitigation: enforce single-step legacy -> canonical redirect

## Post-Launch SEO Checklist
- Submit updated sitemap in Google Search Console.
- Validate canonical tags on representative listing pages.
- Confirm 301 behavior for legacy ID URLs.
- Track crawl errors and “Duplicate/Alternate with canonical” coverage statuses.
- Monitor index consolidation to canonical URLs.

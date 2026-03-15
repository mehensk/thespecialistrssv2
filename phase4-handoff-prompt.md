# Phase 4 Implementation Handoff (Must Review Plan Updates First)

Use `seo plan final.md` as the single source of truth.  
Before writing any code, read the **MVP Execution Status (Updated 2026-03-15)** section and confirm Phase 1-3 status, locked decisions, and validation evidence.

## Required context to preserve
- Phase 1: complete and validated.
- Phase 2: canonical routing + canonical metadata behavior implemented.
- Phase 3: `/listings/{id}` permanently redirects in one hop to canonical slug URL using `308` (`permanentRedirect`), and this behavior must remain unchanged.
- Unpublished access policy must remain unchanged:
  - Unauthorized unpublished access: not found.
  - Authorized unpublished views: non-indexable (`noindex, nofollow`).

## Phase 4 goal
Switch internal app links from `/listings/{id}` to canonical listing URLs `/listings/{storedSlug}-{idTail6}`.

## Constraints
- Do not regress Phase 2/3 behavior.
- Do not change redirect status policy (keep current `308` behavior for legacy path).
- Keep canonical metadata/OG alignment intact.
- Keep unpublished access and indexability behavior intact.

## What to implement
Update internal link generation to canonical URLs in listing-related UI flows, including:
- Listing cards and featured listing sections
- Dashboard/admin "view listing" links
- Share/inquiry links that currently embed `/listings/{id}`

Prefer existing canonical helpers in `src/lib/listing-slug.ts` (especially `buildCanonicalListingPath`) instead of duplicating URL logic.

## Deliverables expected in that chat
1. Brief Phase 4 plan referencing current state from `seo plan final.md`.
2. Code changes for internal link switching to canonical URLs.
3. Validation evidence:
   - Updated links now render canonical URL shape in UI/server output.
   - Legacy `/listings/{id}` still redirects one-hop to canonical.
   - Canonical pages still load correctly.
   - No regressions to unpublished access/noindex behavior.
4. Clear checklist: done/not done mapped to Phase 4 acceptance criteria.

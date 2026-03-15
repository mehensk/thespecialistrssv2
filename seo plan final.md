# SEO Plan Final

## Source of Truth
This file replaces prior planning docs as the active plan for listing URL SEO migration.

## Goal (Plain Language)
Make listing URLs readable using listing titles, while keeping old links working and protecting SEO.

Target public URL:
- `/listings/{title-slug}-{shortId}`

Example:
- `/listings/luxury-condo-makati-7xk2p9`

## MVP Scope (4 + 4.5 Phases)

### Phase 1: Slug Readiness (Existing + Future Listings)
What we do:
- Ensure every existing listing has a slug.
- Ensure every new listing gets a slug at creation.

Why this matters:
- Without this, title-based URLs cannot be reliably generated.

Testable checks:
- Existing listings return valid slug values.
- New listing creation stores slug automatically.

Phase 1 operational gate (required before Phase 2):
1. Run Migration A (add nullable listing slug).
2. Run backfill command:
   - `npm run backfill:listings:slug`
3. Run validation command:
   - `npm run validate:listings:slug`
4. Run Migration B (enforce `slug` not null).
5. Proceed to deploy only if steps 2 and 3 exit successfully.

Hard-gate verification sequence (example):
1. `npx prisma migrate deploy`
2. `npm run backfill:listings:slug`
3. `npm run validate:listings:slug`
4. `npx prisma migrate deploy`
5. deploy app

---

### Phase 2: Canonical Listing Route
What we do:
- Serve listing detail pages using `{title-slug}-{shortId}` URL.
- If someone lands on the wrong slug for a valid listing, redirect to the correct canonical URL.

Why this matters:
- One clean URL per listing avoids SEO duplication.

Testable checks:
- Canonical URL loads listing page correctly.
- Wrong slug + valid listing redirects to canonical URL.

---

### Phase 3: Legacy ID Redirect
What we do:
- Keep `/listings/{id}` working.
- Permanently redirect (`301`) to canonical slug URL.

Why this matters:
- Old bookmarks and shared links keep working.
- SEO value from old indexed URLs is preserved.

Testable checks:
- `/listings/{id}` returns one-hop `301` to canonical URL.
- No redirect chain.

---

### Phase 4: Internal Link Switch
What we do:
- Update listing links in the app from ID URLs to canonical URLs.
- Includes listing cards, featured sections, dashboard/admin "view" links, and share/inquiry links.

Why this matters:
- Users and crawlers should mostly see canonical URLs.

Testable checks:
- UI links point to canonical URL format.
- Share/contact links use canonical URLs.

---

### Phase 4.5: MVP SEO Completion Hardening (Low-Risk Two-Deploy Path)
What we do:
- Complete remaining MVP SEO checks in a controlled sequence:
  1. Deploy A: listing sitemap + listing structured data.
  2. Deploy B: canonical-aware cache revalidation + final MVP verification pass.

Why this matters:
- Finishes MVP acceptance requirements without changing core routing behavior.
- Reduces SEO ambiguity by aligning sitemap, structured data, and canonical URLs.
- Lowers release risk by isolating cache behavior changes from schema/sitemap rollout.

Deploy A: Sitemap + Structured Data
What we do:
- Add listing sitemap output using canonical listing URLs only (`/listings/{slug}-{idTail6}`).
- Add listing JSON-LD (`RealEstateListing` + `Offer`) on listing detail pages.
- Ensure structured data `url` matches canonical metadata/OG URL.

How to test success:
- `/sitemap.xml` is reachable and includes canonical listing URLs only.
- No legacy `/listings/{id}` URLs appear in sitemap.
- Listing detail page contains JSON-LD for listing schema.
- JSON-LD `url`, `<link rel="canonical">`, and `og:url` are identical on sampled pages.

Validation evidence to capture:
- Sample sitemap entries (canonical-only).
- Sample listing page source snippet showing JSON-LD.
- Canonical/OG/schema URL equality on at least 3 listings.

Deploy B: Revalidation + Final MVP Verification
What we do:
- Update listing cache revalidation to target:
  - `/listings`
  - canonical listing URL
  - legacy ID URL (backward safety)
- Keep Phase 2/3/4 behavior unchanged (canonical routing, one-hop `308`, access/noindex policy).

How to test success:
- After listing update, canonical listing page reflects changes without stale content.
- Legacy `/listings/{id}` still one-hop redirects (`308`) to canonical URL.
- Canonical mismatch behavior remains redirect to canonical.
- Internal links continue using canonical URL format.

Validation evidence to capture:
- Before/after listing update check on canonical page.
- Redirect chain output (`num_redirects=1`) from legacy URL.
- Internal-link audit showing canonical links and only defensive fallback for missing slug.
- `tsc --noEmit` pass.

Phase 4.5 exit criteria:
- MVP acceptance criteria #4 and #5 are explicitly satisfied:
  - Canonical metadata/OG URL and structured data align with canonical URL.
  - Sitemap lists canonical listing URLs only.
- Prior accepted behavior for redirects/access/indexability remains unchanged.

## SEO Rules (Required)
- Canonical policy: new slug URL only.
- Sitemap policy: include canonical listing URLs only.
- Slug policy: generated once and stable after creation.
- Slug formatting: lowercase, hyphens, remove symbols, collapse duplicates.
- Structured data URL fields must match canonical URL.
- Unpublished/private listings must be non-indexable (`noindex`) if renderable in restricted contexts.
- Keep legacy redirect permanently.

## Data/ID Rule
- Keep existing internal `Listing.id` unchanged.
- Use short deterministic suffix derived from `Listing.id` for public URL uniqueness.

## MVP Execution Status (Updated 2026-03-15)

### Phase 1 Status: Completed and validated
- Existing listings have valid slugs.
- New listing creation assigns slug safely.
- Backfill + validation gate completed with zero failures in prior validation handoff.

### Phase 2 Status: Completed (implemented)
Implemented files:
- `src/lib/listing-slug.ts`
- `src/app/listings/[id]/page.tsx`

Locked behaviors:
- Canonical helpers added:
  - `shortIdFromListingId`
  - `buildCanonicalListingSegment`
  - `buildCanonicalListingPath`
  - `parseCanonicalListingSegment`
  - `isCanonicalListingSegment`
- Listing route resolves canonical slug segment and legacy raw ID.
- Canonical mismatch redirects permanently to canonical URL.
- Metadata canonical + OG URL aligned to canonical URL.
- Unpublished authorized pages are non-indexable (`noindex, nofollow`).
- Internal links intentionally not switched in Phase 2.

### Phase 3 Status: Completed (implemented + revalidated)
Implementation update:
- Legacy raw ID path `/listings/{id}` now permanently redirects to canonical slug URL in one hop.
- Redirect status used in implementation is **308 Permanent Redirect** (Next.js `permanentRedirect` behavior), by explicit decision.
- Access control ordering is preserved: access check runs before redirect, keeping unpublished privacy behavior intact.

Phase 3 validation evidence (latest re-check against running local server):
- Legacy URL:
  - `/listings/cmieor3mv0001uskgmf64f8zt`
  - Response: `308 Permanent Redirect`
  - `Location`: `/listings/3-bedroom-fully-furnished-penthouse-corner-unit-for-sale-kasa-luntian-tagaytay-by-alveo-64f8zt`
- Canonical URL direct request:
  - Response: `200`
  - Redirects: `0`
- Chain test from legacy with follow:
  - Final response: `200`
  - Redirects: `1` (one-hop only)
- Canonical mismatch still preserved:
  - `/listings/wrong-slug-64f8zt` returns `308` to canonical URL
- Type-check:
  - `node .\\node_modules\\typescript\\bin\\tsc --noEmit` passed

Notes:
- Unpublished runtime scenario could not be re-exercised in this re-check because no unpublished fixture was available in the active local dataset. Code path remains unchanged and still enforces `notFound()` for unauthorized users and `noindex, nofollow` metadata for authorized unpublished views.

### Next Target: Phase 4
- Switch internal listing links from ID URLs to canonical slug URLs.
- Preserve Phase 3 redirect behavior and canonical metadata consistency.

## Full SEO Maturity Roadmap (After MVP)

### Phase 5: Crawl Control and Robots Hygiene
What we do:
- Tighten `robots.txt` and crawl rules so search engines prioritize valuable pages.
- Limit crawl waste on low-value/duplicate URL patterns.

Why this matters (plain language):
- If crawlers spend time on the wrong pages, important pages get less attention.

How to test success:
- Key pages remain crawlable and indexable.
- Low-value URLs show reduced crawl volume in logs/Search Console.
- No accidental blocking of listing or core content pages.

---

### Phase 6: Sitemap and Indexing Governance
What we do:
- Maintain sitemap quality (canonical-only URLs, freshness, correct status).
- Add routine validation for sitemap integrity.

Why this matters (plain language):
- Sitemap is a roadmap for search engines; if it is noisy or outdated, indexing quality drops.

How to test success:
- Sitemap contains only valid canonical URLs.
- Submitted sitemap in Search Console shows clean processing.
- Indexed URL coverage aligns with intended public pages.

---

### Phase 7: Structured Data Expansion
What we do:
- Expand schema beyond basic listing URL alignment (for example, Breadcrumb and Organization where valid).
- Ensure schema consistently uses canonical URLs.

Why this matters (plain language):
- Structured data helps search engines understand your content and site relationships better.

How to test success:
- Rich Results/Test tools show valid schema markup.
- Search Console structured data errors stay low or zero.
- No schema URLs conflict with canonical URLs.

---

### Phase 8: Core Web Vitals and Performance SEO
What we do:
- Improve speed/stability metrics on high-value templates (home, listing index, listing detail).
- Address slow-render and layout-shift issues.

Why this matters (plain language):
- Faster pages improve rankings and user experience, especially on mobile.

How to test success:
- Measurable improvements in LCP/CLS/INP on target templates.
- Better page speed audit results.
- Lower bounce/drop-off on organic landing pages.

---

### Phase 9: On-Page and Content Quality Standards
What we do:
- Standardize title tags, meta descriptions, and content quality rules.
- Reduce thin or duplicate listing copy and metadata.

Why this matters (plain language):
- Clean, relevant page text improves ranking relevance and click-through.

How to test success:
- Lower duplicate/empty metadata rates.
- Improved CTR trends for listing pages in Search Console.
- Fewer pages flagged as low-quality/thin in audits.

---

### Phase 10: Internal Linking and Image SEO Program
What we do:
- Strengthen internal links (breadcrumbs, related listings, contextual links).
- Improve image SEO (alt text quality, optimized image delivery).

Why this matters (plain language):
- Better linking helps search engines and users discover important pages.
- Better image optimization supports both SEO and speed.

How to test success:
- Important listing pages have improved crawl discovery and depth.
- Alt text coverage and quality meet defined standards.
- Image payload/performance metrics improve.

---

### Phase 11: Authority, Local SEO, and Expansion
What we do:
- Build off-page authority (quality backlinks and citations).
- Strengthen local SEO signals.
- Add international/multilingual SEO only if business expands there.

Why this matters (plain language):
- Technical SEO gets pages ready; authority and local signals help them outrank competitors.

How to test success:
- Growth in quality referring domains/citations.
- Better rankings for target location and transactional terms.
- If multilingual is enabled, correct language targeting with no cross-indexing conflicts.

## Acceptance Criteria for MVP
1. Existing listings and new listings both resolve with canonical slug URLs.
2. `/listings/{id}` permanently redirects to canonical URL.
3. Internal app links use canonical URL format.
4. Canonical metadata/OG URL and structured data align with canonical URL.
5. Sitemap lists only canonical listing URLs.
6. Unpublished/private listing pages are not indexable.

## Acceptance Criteria for Full SEO Maturity
1. Crawl control is intentional and validated (no major crawl waste patterns).
2. Sitemap governance is stable and continuously validated.
3. Structured data is valid across target templates.
4. Core Web Vitals trend toward target thresholds on primary SEO landing templates.
5. Metadata/content quality standards are enforced at scale.
6. Internal linking and image SEO improvements are measurable.
7. Off-page/local SEO programs show authority and ranking gains over time.

## Post-Launch Monitoring (Minimum)
- Check redirect health and 404 spikes.
- Check canonical consistency on sample listing pages.
- Validate sitemap indexing behavior in Search Console.
- Watch for duplicate URL indexing issues.

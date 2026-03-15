# Search Function Revamp

## Why This Revamp Is Needed
Search behavior became inconsistent because logic was split across multiple layers:
- Hero search builds URL params but does not control filtering rules.
- Listings page historically parsed/filterd locally with ad-hoc rules.
- API currently focuses on listing retrieval and cache behavior, not full filter enforcement.
- Data values can drift over time (case, accents, enum formatting), causing hard-to-explain misses.

The result is user-visible inconsistency and maintenance risk.

## Revamp Goals
- Define one shared search contract for parsing, normalization, and canonical query behavior.
- Ensure Hero and Listings page use the same rules.
- Prepare the codebase for backend-first filtering in later phases.

## Phase 1 Closure (Completed)
### Completed
- Added shared search contract module: `src/lib/search-contract.ts`.
- Centralized utilities introduced:
  - `normalizeText(value)` for accent/case-insensitive normalization.
  - `canonicalizeListingType(value)` for canonical `sale|rent`.
  - `canonicalizePropertyType(value)` for canonical property type values.
  - `parseSearchParams(input)` for typed parsing and structured errors.
  - `toCanonicalQuery(input)` for canonical query-string generation.
- Updated Hero search flow: `src/components/ui/hero-search.tsx`.
  - Replaced manual query creation with `toCanonicalQuery(...)`.
  - Navigation now uses canonicalized query output.
- Updated Listings page URL/state contract: `src/app/listings/page.tsx`.
  - Initial filter state now comes from `parseSearchParams(...)`.
  - URL sync now uses `toCanonicalQuery(...)`.
  - Dev-only warning added for invalid known query params.
- Preserved Phase 0 bug fix behavior:
  - Accent-insensitive location matching remains active via `normalizeText`.
  - Canonicalized property/listing type comparison remains active.

### Changed (Behavioral)
- URL parameters are now normalized/canonicalized through one shared module in both Hero and Listings page.
- Known invalid query parameters are now surfaced in development logs instead of being silently trusted.
- Query serialization order/format is now stable and centralized.

### Validation Rules Introduced
- Supported params:
  - `location`, `type`, `listingType`
  - `minPrice`, `maxPrice`, `minSize`, `maxSize`
  - `bedrooms`, `bathrooms`, `page`, `limit`
- Unknown params are ignored.
- Known invalid params are captured as structured errors by the parser.
- Numeric constraints:
  - `min*`/`max*`, `bedrooms`, `bathrooms` must be non-negative.
  - `page >= 1`
  - `1 <= limit <= 100`

### Decisions Locked In Phase 1
- Canonical enums:
  - Listing type: `sale`, `rent`.
  - Property type: `condominium`, `house-and-lot`, `townhouse`, `apartment`, `penthouse`, `lot`, `building`, `commercial`.
- `location` is whitespace-normalized (trim + collapse spaces) for query consistency.
- Unknown params are non-fatal and ignored.
- Parser can report known invalid params in structured form for diagnostics.
- No backend filtering contract changes were made in this phase.

### Deferred From Phase 1 (Intentional)
- Backend-filtered search execution in `/api/listings`.
- Schema changes for normalized searchable columns.
- Backfill migration and index updates.
- Full automated test suite addition for search contract behavior.

### Verification Status (Current)
- `eslint` passes on:
  - `src/lib/search-contract.ts`
  - `src/components/ui/hero-search.tsx`
- `src/app/listings/page.tsx` still has pre-existing lint issues unrelated to this phase scope:
  - `@typescript-eslint/no-explicit-any` (existing pattern in file)
  - existing hook dependency warning (`router`)

## Impact Assessment (Phase 1)
- **Risk:** Low (no schema or API behavior migration yet).
- **Behavioral impact:** Moderate improvement in URL consistency and input handling.
- **Code health impact:** High positive; all UI query parsing/canonicalization now has a single source of truth.
- **Performance impact:** Neutral.

## Remaining Phases
1. Backend-filtered `/api/listings` query contract and pagination metadata.
2. Data normalization columns + migration/backfill.
3. Listings page switch from local filtering to backend-driven filtered fetch.
4. Cache hardening and telemetry for invalid query/zero-results diagnostics.

## Phase 1 Acceptance Checks
- Hero query output is canonical and stable.
- Listings page initializes from parsed/canonical URL values.
- Accent and casing normalization is standardized in one utility.
- Invalid known query values are not silently trusted in development.

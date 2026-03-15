# Metro Manila City Normalization Plan

## Goal
Make Metro Manila city data consistent across:
- Browse filter dropdown
- Listing cards and city displays
- Dashboard create/edit flows
- API storage and existing database records

This plan implements your display rules:
- Show `City of Manila` at the top of the Metro Manila dropdown.
- Show other Metro Manila city labels as `____ City`.
- Show `Municipality of Pateros` at the bottom of the Metro Manila dropdown.

---

## Phase 1: Canonical City Model + Display Rules (UI read path)

### Plain-language explanation
Right now, the app treats city text as raw strings. If old data has small variations (for example `Muntinlupa` vs `Muntinlupa City`), the UI can display them differently and classify them differently.  
In this phase, we add one shared city-normalization utility so all UI surfaces read and display Metro Manila city names consistently.

### Planned changes
- Add canonical NCR city mapping and aliases in `src/lib/location-utils.ts`.
- Add helper functions:
  - Normalize incoming city text to a canonical internal value.
  - Convert canonical values to display labels:
    - `Manila` -> `City of Manila`
    - `Pateros` -> `Municipality of Pateros`
    - others -> `____ City` (with safe handling for names already ending in `City`).
- Update listing-card and related display formatting to always use normalized labels.
- Update browse filter option rendering to use label rules and Metro Manila ordering:
  - `City of Manila` first
  - remaining Metro Manila cities alphabetically
  - `Municipality of Pateros` last in Metro Manila group

### How to verify
- Browse listings page:
  - Confirm Metro Manila dropdown starts with `City of Manila`.
  - Confirm `Municipality of Pateros` appears at the bottom of Metro Manila options.
  - Confirm other Metro Manila options use `____ City`.
- Listing cards/details:
  - Confirm city text is consistently formatted, not mixed raw variants.
- Manual spot checks for known values:
  - `Manila`, `Quezon City`, `Muntinlupa`, `Pateros`.

### Evidence to collect
- Before/after screenshots of:
  - Browse city dropdown
  - Listing cards with Metro Manila addresses
- Short verification notes listing exact entries seen (top, middle, bottom order).

---

## Phase 2: Filter and API Write Normalization (future-proof behavior)

### Plain-language explanation
Even with better display logic, inconsistent data can return if save/update APIs keep accepting raw variants.  
In this phase, the app will save city values in a canonical form and filter by normalized city values so equivalent variants match correctly.

### Planned changes
- Update browse filter matching logic to compare normalized/canonical city values.
- Normalize city values in API create/update endpoints before database write.
- Keep display labels separate from stored canonical values (storage consistency, UI friendliness).

### How to verify
- Create or edit listings using Metro Manila city selections and confirm stored value is canonical.
- Filter test:
  - Select `Muntinlupa City` label in UI and confirm listings that previously differed by variant still match as one city set.
- Regression check:
  - Outside-Metro-Manila city/province behavior still works.

### Evidence to collect
- API request/response samples from create and update showing normalized city values.
- Query output from DB (or API payload checks) confirming canonical stored city values for NCR listings.
- Filter result counts before/after normalization logic on a known city sample.

---

## Phase 3: One-time Database Cleanup + Validation

### Plain-language explanation
Existing records may already contain mixed city variants from historical data or earlier form behavior.  
This phase cleans old records once so current listings become consistent immediately.

### Planned changes
- Add a one-time cleanup script:
  - Dry-run mode: reports rows that would change.
  - Apply mode: updates city values to canonical forms.
- Run cleanup once in the target environment after review.

### How to verify
- Dry-run report:
  - Review affected row count and mapping preview.
- Apply run:
  - Confirm updated row count equals expected rows.
- Post-check:
  - No Metro Manila rows remain with alias variants (example: `Muntinlupa City` raw storage if canonical is `Muntinlupa`).
- UI check:
  - Browse cards/dropdown now consistent for existing listings.

### Evidence to collect
- Saved dry-run and apply command outputs.
- Before/after aggregate query results by city for Metro Manila records.
- Final QA note confirming `Muntinlupa` issue is resolved in browse cards and filters.

---

## Acceptance Criteria (Overall)
- Metro Manila dropdown follows required ordering and labels:
  - `City of Manila` first
  - alphabetized Metro Manila city labels in the middle
  - `Municipality of Pateros` last
- No visible mismatch between `Muntinlupa` and `Muntinlupa City` on listing cards.
- City filtering treats Metro Manila aliases as the same city.
- New/updated records persist canonical city values.
- Existing records are normalized through one-time cleanup and verified.

---

## Risks and mitigations
- Risk: unintended rewrite of non-NCR city names.  
  Mitigation: restrict normalization mappings to Metro Manila aliases only.
- Risk: sorting/ordering confusion after label transformation.  
  Mitigation: apply explicit order rules for Manila (first) and Pateros (last), then sort remainder.
- Risk: cleanup script over-updates records.  
  Mitigation: mandatory dry-run output review before apply.

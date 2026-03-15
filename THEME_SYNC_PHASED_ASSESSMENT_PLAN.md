# Theme Sync Assessment and Phased Plan

## Is This a Big Change?
Short answer: **moderate-to-large visual refactor**, but **low backend risk** if scoped correctly.

Why:
- It touches multiple user-facing pages with custom styling (`/listings`, `/listings/[id]`, `/contact`), not just one component.
- The current divergence is mostly in layout rhythm, card surfaces, spacing, typography hierarchy, and color token usage.
- Business logic can remain intact if we isolate to visual classes and shared style primitives.

## Expected Code Impact
### High-impact areas (UI only)
- `src/app/listings/page.tsx`
- `src/components/listings/ListingDetailContent.tsx`
- `src/app/contact/page.tsx`

### Medium-impact supporting areas
- `src/app/globals.css` (shared visual primitives/tokens/classes)
- Possibly `src/components/listings/ListingCard.tsx` only if browse card style needs alignment

### Low/No impact areas
- API routes, Prisma schema, server data fetching, filtering logic, contact submission logic, recaptcha flow

## Risk Assessment
- **Functional risk:** Low (if no logic touched)
- **Visual regression risk:** Medium (layout, spacing, and contrast changes across breakpoints)
- **Merge/churn risk:** Medium-high (these files are actively edited in this repo)
- **Testing effort:** Medium

## Phased Delivery Plan (4 Phases)

### Phase 1: Baseline & Theme Primitives
Goal: establish shared visual rules before page-level restyling.

Scope:
- Add/normalize reusable CSS primitives in `globals.css` for:
  - section spacing and section headers
  - panel/card surfaces
  - form input/select/textarea controls
  - primary/secondary button variants
- Define strict token mapping for target pages (avoid ad hoc `gray-*` where not semantic).
- No structural JSX refactor yet.

Acceptance:
- New primitives exist and are documented in comments.
- No visible changes outside target pages.

Risk level: Low

---

### Phase 2: Browse Listings Theme Sync
Goal: align `/listings` with the marketing theme rhythm and surfaces.

Scope:
- Restyle page header, filter area, sorting row, grid shell, pagination, and empty state to use Phase 1 primitives.
- Keep filtering/sorting/pagination logic unchanged.
- Keep existing data loading unchanged.

Acceptance:
- `/listings` visually aligns with Home/How-We-Work style language.
- Filters, sorting, and pagination behavior unchanged.

Risk level: Medium

---

### Phase 3: Individual Listing Theme Sync
Goal: align `/listings/[id]` detail experience with the same theme.

Scope:
- Restyle detail layout surfaces (gallery controls, stats row, content blocks, sidebar cards, CTA block).
- Replace divergent gray border/surface styling with shared primitives and theme tokens.
- Keep zoom carousel, share/save/request-info interactions unchanged.

Acceptance:
- Listing detail looks brand-consistent with main marketing pages.
- All interactions (gallery, zoom, actions) function exactly as before.

Risk level: Medium

---

### Phase 4: Contact Theme Sync + Final Harmonization
Goal: align `/contact` and run cross-page consistency pass.

Scope:
- Restyle contact hero, info sidebar, and form surfaces to match section rhythm and theme primitives.
- Keep recaptcha/email submission logic untouched.
- Final consistency pass across `/`, `/listings`, `/listings/[id]`, `/contact` for spacing/typography/button parity.

Acceptance:
- Contact page visual language matches site baseline.
- Submission flow and prefill URL behavior unchanged.
- No obvious typography/color/layout drift across the four routes.

Risk level: Medium

## Validation Checklist Per Phase
- Desktop + mobile checks for target page(s)
- No console errors introduced
- Interactive controls still function
- No changes to API/server behavior

## Recommended Execution Strategy
- Implement one phase per PR/commit so rollback is easy.
- Freeze token decisions in Phase 1; avoid adding new color values later.
- Do visual QA after each phase before proceeding.

## Overall Effort Estimate
- Engineering effort: **Medium**
- Review effort: **Medium**
- Most complexity is design-system consistency, not implementation difficulty.

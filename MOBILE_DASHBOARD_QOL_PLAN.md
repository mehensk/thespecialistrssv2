# Mobile Dashboard QoL Plan (Implementation Phases)

Date: 2026-02-12

## Summary
Improve mobile usability for listing create/edit flows and reset dashboard navigation to a mobile-first model. Navigation will be rebuilt around an always-visible bottom tab bar with a More sheet on mobile, while desktop remains sidebar-based.

## Goals
- Make mobile navigation reliable and always reachable after login (admin and non-admin).
- Reduce navigation taps for common actions.
- Keep listing upload/edit mobile-friendly (upload-first + touch-friendly image controls).
- Preserve desktop workflows with minimal disruption.

## Non-Goals
- No backend/API/schema changes.
- No auth or permission model changes.
- No redesign of public-facing pages.

## Planned Changes (Plain Language)
1. Mobile-first nav reset (Bottom Tabs + More Sheet)
- What: Replace mobile drawer-first behavior with a fixed bottom tab bar for primary routes and a More button that opens a full-height sheet for secondary links + logout.
- Why: Bottom tabs are always visible and avoid hidden/hard-to-reach menu triggers.
- Code impact: New shared mobile nav component used by both admin and standard dashboard layouts.

2. Unified nav configuration
- What: Define route lists once and reuse across mobile + desktop for admin and non-admin.
- Why: Prevent route drift and inconsistent labels between layouts.
- Code impact: Add a nav config module and consume it from both layouts.

3. Listing upload/edit QoL remains in scope
- What: Keep upload-first ordering, mobile accordions, shared image uploader, and touch-friendly actions.
- Why: Agents need fast photo-first mobile entry.
- Code impact: Existing updates in New/Edit listing pages and shared components stay active.

## Implementation Phases (With Testable Subphases)

### Phase 0: Navigation baseline and ownership
**0.1 Create centralized nav config**
- Testable outcome:
  - Admin and non-admin route sets resolve from one source.
  - Desktop and mobile nav render the same route labels/targets.

**0.2 Define primary mobile tabs vs secondary links**
- Testable outcome:
  - Primary tabs map to 3-4 highest-frequency destinations.
  - Remaining destinations appear in More sheet.

### Phase 1: New mobile navigation shell
**1.1 Build `MobileDashboardNav` component**
- Contains:
  - Fixed bottom tab bar.
  - Active state by pathname.
  - More button to open sheet.
- Testable outcome:
  - On mobile widths, tab bar is always visible.
  - Active tab updates correctly with route changes.

**1.2 Build More sheet behavior**
- Contains:
  - Full-height panel with secondary links and logout.
  - Backdrop close + route-change auto-close.
  - Body scroll lock while sheet is open.
- Testable outcome:
  - Sheet opens/closes reliably on touch.
  - No inaccessible links.

### Phase 2: Apply mobile nav to both layouts
**2.1 Update `AdminLayout`**
- Testable outcome:
  - Mobile admin routes use bottom tabs + More sheet.
  - No dependency on top-bar menu button for access.

**2.2 Update `DashboardLayout`**
- Testable outcome:
  - Mobile non-admin routes use same nav pattern.
  - Desktop sidebar behavior remains.

### Phase 3: Listing flow integration checks
**3.1 New listing page mobile checks**
- Testable outcome:
  - Images section first on mobile.
  - Basic Info open by default; other sections collapsed.
  - Upload, remove, cover selection work.

**3.2 Edit listing page mobile checks**
- Testable outcome:
  - Same behavior as New listing.
  - Existing edit save/cancel flows unchanged.

### Phase 4: Mobile-first QA and desktop sanity
**4.1 Mobile QA (375px, 390px, 768px)**
- Testable outcome:
  - No hidden nav controls.
  - Any destination reachable in max 2 taps.
  - No horizontal overflow.

**4.2 Desktop sanity (>=1024px)**
- Testable outcome:
  - Sidebar nav still functions.
  - No regressions in dashboard/listing pages.

## Files to Add
- `src/components/navigation/MobileDashboardNav.tsx`
- `src/components/navigation/nav-config.ts`

## Files to Update
- `src/components/admin/AdminLayout.tsx`
- `src/components/dashboard/DashboardLayout.tsx`
- `src/app/dashboard/listings/new/page.tsx`
- `src/app/dashboard/listings/[id]/edit/page.tsx`
- `src/components/shared/CollapsibleSection.tsx`
- `src/components/listings/ListingImagesSection.tsx`
- `src/hooks/useIsMobile.ts`

## UX Acceptance Criteria
- Mobile admin dashboard: navigation is always visible and usable after login.
- Mobile non-admin dashboard: same navigation behavior and reliability.
- Mobile listing New/Edit: upload-first layout remains intact.
- Desktop: sidebar navigation remains available and functional.

## Testing Notes
- Validate on real mobile viewport sizes (375px/390px/768px).
- Validate admin and non-admin accounts separately.
- Validate that logout is reachable from mobile More sheet.
- Validate no overlap between bottom nav and page actions.

## Risks
- Medium: nav architecture shift touches both admin and non-admin layouts.
- Mitigation: central nav config + phased rollout + route-by-route QA.

---

## Admin Dashboard Mobile Redesign (From Scratch)

### Why this reset
- Current implementation attempts mixed desktop/mobile behavior in the same layout path.
- Visual parity drift happened between wireframe intent and actual runtime behavior.
- Mobile admin requires a task-first presentation, not a desktop dashboard compressed into small screens.

### Mobile-first product goal
- After login, admins should complete the top 3 tasks with minimal friction:
- `Create Listing`
- `Edit Listing`
- `Approve/Moderate Listings`

### Information architecture (mobile first)
1. Above-the-fold task hub
- Primary action buttons for `Create`, `Edit`, `Approve`.
- No dependency on hidden menus for core tasks.

2. Work queue block
- Pending approvals and draft/action-required items.
- Queue cards with clear status and next action.

3. Secondary analytics block
- KPI stack below task/queue sections.
- Keep analytics visible but not dominant over workflows.

### Navigation model
- Mobile: fixed bottom tabs + `More` sheet.
- Desktop: existing sidebar remains.
- Mobile tabs prioritize task routes, not legacy admin grouping.

### Design-to-code contract (to avoid mismatch)
1. Fixed dimensions
- Mobile top panel height and bottom nav height are explicit constants.
- No runtime growth from safe-area padding inside nav container.

2. Layering rules
- `z-index` contract for top panel, content, bottom nav, and overlays.
- No competing fixed containers on mobile.

3. Behavior rules
- No hover-only interactions on mobile.
- All critical navigation actions visible at first paint.
- No layout shifts after hydration.

### Implementation phases (frontend only, no route/data changes)
#### Phase A: Wireframe contract
- Deliver approved wireframes for:
  - Admin mobile dashboard home
  - Create/Edit entry flow
  - Approvals queue flow
- Testable outcome:
  - Wireframe states fully describe spacing, hierarchy, and nav behavior.

#### Phase B: Parallel mobile shell
- Build new mobile admin shell components in parallel with existing layout.
- No deletions of old components; desktop remains unchanged.
- Testable outcome:
  - New shell can be toggled on mobile widths only.

#### Phase C: Task hub and queue presentation
- Implement top 3 task cards and moderation queue cards first.
- Move secondary KPIs below fold.
- Testable outcome:
  - Top 3 tasks are reachable in 1 tap from mobile dashboard.

#### Phase D: Integration and QA
- Validate on 375, 390, 412, 768 widths.
- Validate no footer on `/admin/*` and `/dashboard/*`.
- Testable outcome:
  - No overflow, no hidden navigation, no post-login layout expansion.

### Deliverables before further implementation
- `docs/wireframes/admin-mobile-redesign-from-scratch.html`
- `docs/wireframes/admin-mobile-redesign-task-flows.html`

# Theme Design System Rollout Plan (Safe, Page-by-Page)

**Purpose:** Apply `THEME_DESIGN_SYSTEM.md` across the site *without* breaking shared layouts or non-target pages.

---

## Guiding Principles

1) **Scope first, expand later**  
   All design-system styles should be opt-in per page until the landing page is finalized.

2) **No global regressions**  
   Avoid changes that affect shared components (navbar, listing cards) unless they can be toggled by route or variant.

3) **One page at a time**  
   Each page gets its own scoped rollout, review, and approval before moving on.

**Plain-language explanation:**  
We’ll start small and safe. Instead of changing the whole site at once, we’ll only apply the new look to one page at a time so nothing else breaks.

---

## Phase 1 — Landing Page Only (Current Focus)

**Goal:** Finish the landing page revamp safely, without affecting other routes.

**Approach:**
- Add a page wrapper class (e.g., `.landing`) around the landing page root.
- Scope all new CSS under `.landing` (e.g., `.landing .section`, `.landing .card`).
- Keep `:root` vars as-is and **merge** new theme variables instead of replacing.
- Keep navbar and shared components unchanged unless they are explicitly scoped to `/`.

**Why this matters:**  
The landing page uses shared components and global styles. Scoping ensures no regressions on listings, contact, blog, or dashboard pages.

**Plain-language explanation:**  
We’ll rebuild the landing page first, but wrap it in a “bubble” so the new styles don’t touch other pages. That keeps the rest of the site stable while we perfect the homepage.

---

## Phase 2 — Prepare a Reusable Theme Wrapper

**Goal:** Create a reusable opt‑in layout that can be applied to other pages after landing is done.

**Approach:**
- Introduce a `ThemeLayout` (or wrapper class like `.theme`) that *only* applies theme variables and base styles.
- Do **not** make it global in `layout.tsx`. Use it per page.

**Reasoning:**  
This keeps the theme isolated and lets us gradually migrate pages without global breakage.

**Plain-language explanation:**  
We’ll set up a simple “theme switch” we can turn on per page later. It won’t change anything by itself, but it makes future updates safer and faster.

---

## Phase 3 — Page-by-Page Rollout (After Landing Page Approval)

Roll out in this order (lowest risk to highest):

1) **Browse Listings** (`src/app/listings/page.tsx`)  
   - Apply `ThemeLayout` wrapper.  
   - Update grid spacing, filters, and listing cards using a variant or scoped class.

2) **Contact Us** (`src/app/contact/page.tsx`)  
   - Apply theme typography, spacing, and CTA styles.

3) **Individual Listing** (`src/app/listings/[id]/page.tsx`)  
   - Apply theme typography and card styling.  
   - Ensure pricing/details layout matches theme.

4) **How We Work (New Page)**  
   - Build using theme sections and card patterns from day one.

**Plain-language explanation:**  
Once the landing page is approved, we’ll update the rest of the site one page at a time, starting with the easiest. That way we can review each page and fix issues before moving on.

---

## Shared Component Strategy (Avoid Global Breakage)

**Navbar (`src/components/ui/navbar.tsx`)**
- Keep global nav stable.
- Add route‑based conditional styling if needed for landing only.

**ListingCard (`src/components/listings/ListingCard.tsx`)**
- Add a `variant` or `className` prop for theme styling.
- Apply theme styles only where the wrapper is active.

**Plain-language explanation:**  
Some pieces (like the top menu and listing cards) appear on multiple pages. We’ll add a safe “option” to these parts so they can look new on the updated pages, but stay unchanged everywhere else.

---

## Review & QA Checklist Per Page

- [ ] Visual review against the design system
- [ ] No regressions on other routes
- [ ] Mobile + tablet breakpoints verified
- [ ] Interaction states (hover/focus) verified
- [ ] Accessibility spot check (contrast, focus)

**Plain-language explanation:**  
After each page update, we’ll do a quick check to make sure it looks right, works on mobile, and doesn’t break other pages.

---

## Summary

We’ll finish the landing page first with fully scoped styles.  
Then we’ll introduce a reusable theme wrapper and migrate pages one at a time, using component variants to avoid cross‑page regressions.

This approach is safest, keeps the current site stable, and gives us room to iterate.

**Plain-language explanation:**  
We’ll finish the homepage first, then carefully roll out the same style to other pages one by one. This avoids surprises and keeps the site running smoothly while it’s updated.

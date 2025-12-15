# MVP Services Breakdown

## Overview
Scope for the broker-facing static site builder MVP: what can be customized, how listings work, and homepage section limits. This is a constrained, opinionated builder aimed at fast setup and consistent performance.

## Site Builder Extent (MVP)
- Layout model: page = stack of sections; limited set of prebuilt sections. No freeform canvas; drag-drop reorders sections and cards within supported sections.
- Pages: Homepage, About, Contact, Listings index, Listing detail (auto-generated per listing).
- Section library (homepage): Hero, Listing grid, Highlighted listing (single feature), About blurb, Testimonials, FAQ, Contact CTA, Map/embed, Footer. (Roughly 6–10 sections allowed per homepage.)
- Customization controls:
  - Theme tokens: primary/secondary colors, background, text colors, font pairings (preset + optional overrides).
  - Layout knobs per section: alignment, background style (solid/gradient), CTA button style, card density (compact/comfortable).
  - Imagery: hero background image, logo upload, favicons, listing images.
  - Content fields: text for headings, subheads, CTA labels, FAQ Q/A, testimonials, about text, contact info.
- What’s fixed:
  - Component shapes: card templates, spacing scale, button shapes remain consistent.
  - No custom CSS/JS injection in MVP.
  - No arbitrary new page types (beyond the listed core pages).
  - No nested layouts or columns beyond what sections expose.

## Listings Limits (MVP)
- Intended scale: up to ~200 listings per broker without degrading build times; above that, consider pagination and CDN build tuning. Hard cap can be set at 300 for MVP to keep builds predictable.
- Input format: CSV or JSON upload; re-upload to update (no in-app CRUD).
- Assets: listing images referenced by URL; no media storage pipeline in MVP.
- Generated outputs: listing grid (paged) and per-listing detail pages; optional featured listing section on homepage.

## Homepage Section Limits (MVP)
- Total sections per homepage: recommend 6–10 to preserve performance and simplicity.
- Suggested default stack (editable order):
  1) Hero
  2) Featured listing (single)
  3) Listing grid (paged or limited to N cards + “View all” link)
  4) About blurb
  5) Testimonials
  6) FAQ
  7) Contact CTA
  8) Map/embed (optional)
  9) Footer (fixed)

## Guardrails & Performance
- Static generation with host-based routing; all content pre-rendered.
- Enforce image dimensions/ratios on upload URLs; lazy-load listing grids.
- Cap homepage listing grid preview to N cards (e.g., 6–12) with link to full listings index.
- Build budget: aim <3–5 minutes per publish at upper listing limit; queue/pipeline should reject oversized imports early.

## Future (post-MVP) considerations
- Allow custom CSS tokens or section-level style variants.
- Add new sections (blog, stats, video hero), and additional page types.
- Media upload pipeline with optimization/CDN.
- Higher listing caps with incremental static regeneration or on-demand revalidation.


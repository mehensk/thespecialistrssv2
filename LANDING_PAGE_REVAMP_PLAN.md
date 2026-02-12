# Landing Page Revamp Plan
## The Specialist Realty - Theme Design System Implementation

**Created:** January 26, 2026  
**Reference Wireframe:** `docs/wireframes/landing-page-new-content-option-2.html`  
**Design System:** `THEME_DESIGN_SYSTEM.md`

---

## Overview

This document outlines the systematic approach to implementing the new design system and content from the wireframe to the existing Next.js landing page (`src/app/page.tsx`).

---

## Global Impact Review (Summary)

These plan items can affect **other routes** because they touch shared/global files:

**Highâ€‘impact areas**
1) `src/app/globals.css`
   - Risk: Replacing `:root` can remove existing vars (`--background`, `--foreground`, `--border`, `--cta`, `--cta-hover`).
   - Risk: New generic classes (`.container`, `.section`, `.card`, `.nav`, `.cta`, `.stats`) become global.

2) `src/components/ui/navbar.tsx`
   - Risk: Navbar is in `src/app/layout.tsx`, so changes apply siteâ€‘wide (home, listings, blog, contact, admin, dashboard).
   - Risk: Removing blog link or hiding nav on mobile affects all routes.

3) `src/components/listings/ListingCard.tsx`
   - Risk: Listing card is reused on `/listings`. Styling changes impact both landing and listings pages.

**Safe scoping recommendation**
- Add a landing wrapper (e.g., `<main className="landing">`) in `src/app/page.tsx`.
- Prefix new styles in `globals.css` under `.landing` to avoid crossâ€‘page changes.
- Keep existing `:root` values and **merge** new variables instead of replacing.
- For listings card styling, add a `variant="landing"` (or className) and apply only on the homepage.
- For nav changes, keep global nav intact or conditionally adjust only on `/`.

## Objectives

1. âœ… Apply new design system (colors, typography, spacing, components)
2. âœ… Implement content from wireframe (Hero, Why Choose Us, Services, Featured Listings, Stats, CTA)
3. âœ… Update navigation: Home, How We Work, Listings, Contact
4. âœ… Keep existing footer
5. âœ… Hide blog section (preserve code, hide from UI)
6. âœ… Maintain responsive design and accessibility

---

## Confirmed Decisions

### 1. Implementation Approach
**Hybrid Approach - Foundation first, then content + styling together section-by-section**
- Phase 1: Foundation setup only (fonts, CSS variables, layout)
- Phases 2-7: Content + styling for each section together
- Each phase is testable and reviewable
- Wait for approval after each phase before proceeding

### 2. Timeline
**One Section at a Time with Approval**
- Implement one phase
- Test and review
- Get approval
- Proceed to next phase

### 3. Navigation Links
- Links: Home, How We Work, Services (dropdown), Contact
- Services dropdown contains: Listings, Investor Relations, Developer Selling
- Services link is unclickable (hover to show dropdown)
- "How We Work" â†’ Create page later (prioritize landing page first)
- For now: Use placeholder link (`#`) or remove temporarily
- Keep Login button for testing (will be removed in production)
- Keep Contact CTA button

### 4. Hero Background
**CORRECTED: Both gradient AND background image**
- Gradient background on hero container: `linear-gradient(120deg, #f0f2f4 0%, #e7ecef 50%, #dfe5ea 100%)`
- Background image on hero section: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80`
- Dark overlay gradient on image: `linear-gradient(135deg, rgba(8, 12, 18, 0.88) 0%, rgba(10, 16, 22, 0.82) 55%, rgba(13, 19, 26, 0.78) 100%)`
- Glassmorphism panels inside hero

### 5. Content Source
- Use exact content from `docs/wireframes/landing-page-new-content-option-2.html`
- Copy verbatim - no rewriting
- Use wireframe text exactly as written

### 6. Featured Listings
- Keep dynamic listings from database (FeaturedListings component)
- Update styling only to match new design system
- Use new card design from wireframe

### 7. Stats Section
- Keep stats from wireframe exactly:
  - "10+ Years Experience"
  - "Licensed PRC Broker"
  - "Metro Manila & Beyond"
  - "Developer Selling Specialist"

### 8. Images
- Use existing property images from database
- Update CTA section image to wireframe's Unsplash image
- Keep property listing images dynamic
- Hero background: Use wireframe's Unsplash image

### 9. SVG Icons
- Use SVG icons from wireframe for Why Choose Us section (5 custom SVGs)
- Keep Lucide icons for other sections if needed
- Custom SVGs will be inline in components

### 10. Mobile Navigation
- Hide desktop navigation links on mobile (â‰¤860px) as per wireframe
- **Keep existing hamburger menu for mobile navigation access**
- Desktop nav links hidden on mobile, but mobile drawer remains functional
- This provides navigation access on mobile while hiding desktop nav structure

### 11. Footer
- Keep existing footer design (no changes)
- Do NOT implement wireframe footer

### 12. Blog Section
- Hide from navigation (remove blog link)
- Keep all blog code in codebase (don't delete anything)
- Just hide from UI

---

## Testable Phases

### Phase 1: Foundation Setup

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Set up fonts, CSS variables, and layout foundation without visual changes

**Files to modify:**
1. `src/app/lib/fonts.ts` - Add Space Grotesk and Space Mono fonts
2. `src/app/layout.tsx` - Update font imports and apply to body
3. `src/app/globals.css` - Add all design system CSS variables

**Changes:**

**1.1 Font Setup (`src/app/lib/fonts.ts`)**
```typescript
import { Space_Grotesk, Space_Mono } from 'next/font/google'

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  weight: ['400'],
})
```

**1.2 Layout Update (`src/app/layout.tsx`)**
```typescript
import { spaceGrotesk, spaceMono } from '@/app/lib/fonts'

className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
```

**1.3 CSS Variables (`src/app/globals.css`)**
```css
:root {\r\n  /* Keep existing variables intact; add new variables below */
  /* Primary Colors */
  --ink: #0d0f12;
  --steel: #1e2a36;
  --mist: #f0f2f4;
  --slate: #dde2e7;
  
  /* Accent Colors */
  --accent: #2f5f8f;
  --accent-light: #4d7bb0;
  --gold: #D4AF37;
  --gold-light: #F4D03F;
  
  /* Effects */
  --grid: rgba(13, 15, 18, 0.08);
  --shadow: 0 20px 50px rgba(13, 15, 18, 0.18);
  --shadow-sm: 0 10px 24px rgba(13, 15, 18, 0.08);
}
```

**What this does:**
- Defines custom CSS variables (also called CSS custom properties) that act as reusable color and style values throughout the site
- Primary colors set the main palette: dark ink for text, lighter steel for secondary text, light mist for backgrounds, and slate for borders
- Accent colors provide the blue tones for interactive elements and gold for premium/luxury accents
- Effect variables define shadows and dot patterns that will be reused across components
- These variables make it easy to change colors globally in one place instead of hunting through all files

**Why we're doing this:**
- Creates a consistent color system across the entire landing page
- Makes future design updates faster (change one variable, updates everywhere)
- Ensures color accessibility and WCAG compliance by defining contrast ratios upfront
- Provides the foundation for all subsequent styling phases

**Testing:**
- [ ] Fonts load correctly
- [ ] CSS variables accessible
- [ ] No visual changes to site yet (foundation only)
- [ ] No console errors

---

### Phase 2: Hero Section Redesign

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Implement hero section with new content, gradient + image background, and glassmorphism panels

**Files to modify:**
1. `src/app/page.tsx` - Replace hero section
2. `src/components/ui/hero-search.tsx` - Update styling (if needed)

**Changes:**

**2.1 Hero Structure**
```jsx
<section className="hero hero-split">
  <div className="container hero-split-grid">
    {/* Hero Panel - Left */}
    <div className="hero-panel">
      <h1>Meet The Specialist</h1>
      <p className="lead">Welcome to The Specialist Realty Solutions and Servicesâ€”where elevated real estate guidance meets genuine client care.</p>
      <p className="lead">With over 10 years of expertise in developer selling, title transfers, and appraisals, we help you make confident property decisions through expert support and a refreshingly honest approach.</p>
      <p className="lead">Whether you're searching for a condominium, family home, or investment property, we make your journey smooth, informed, and truly rewarding.</p>
    </div>

    {/* Hero Actions Card - Right */}
    <div className="hero-actions-card">
      <div className="hero-actions-header">
        <span className="section-icon">âœ¦</span>
        Quick Actions
      </div>
      <p className="hero-actions-intro">Ready to explore your next home? Browse our curated listings or book a personalized tour today.</p>
      <div className="cta-row">
        <a href="/listings">View Listings</a>
        <a href="/contact">Schedule Tour</a>
      </div>
      
      <div className="hero-actions-sell">
        <div className="hero-actions-header">
          <span className="section-icon">âŒ‚</span>
          Sell Your Property
        </div>
        <p className="enlist-message">LIST YOUR PROPERTIES WITH US</p>
        <div className="cta-row">
          <a href="/contact" className="enlist-button">Enlist Now</a>
        </div>
      </div>
    </div>
  </div>

  {/* Search Bar */}
  <div className="container hero-search">
    <div className="search-header">Search our Properties</div>
    {/* HeroSearch component */}
    <HeroSearch />
  </div>
</section>
```

**2.2 Hero Styling**
```css
.hero {
  padding: 90px 0 100px;
  min-height: 100vh;
  background: linear-gradient(120deg, #f0f2f4 0%, #e7ecef 50%, #dfe5ea 100%);
  border-bottom: 1px solid var(--slate);
  position: relative;
}

.hero-split {
  background-image: url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80");
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-split::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(8, 12, 18, 0.88) 0%, rgba(10, 16, 22, 0.82) 55%, rgba(13, 19, 26, 0.78) 100%);
}

.hero-split-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: stretch;
}

.hero-panel {
  background: rgba(12, 18, 24, 0.78);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 32px 36px;
  box-shadow: var(--shadow);
  animation: fadeInUp 0.6s ease-out;
  align-self: stretch;
  height: 100%;
  color: #f5f7fa;
}

.hero-actions-card {
  background: rgba(12, 18, 24, 0.88);
  border-radius: 16px;
  border: 1px solid rgba(212, 175, 55, 0.25);
  padding: 28px 32px;
  box-shadow: 0 20px 50px rgba(13, 15, 18, 0.3), 0 0 30px rgba(212, 175, 55, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-self: stretch;
  animation: fadeInUp 0.6s ease-out 0.2s both;
  height: 100%;
}

.hero-actions-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 60px rgba(13, 15, 18, 0.4), 0 0 40px rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.4);
}
```

**What this does:**
- Creates a full-viewport height hero section with a subtle light gray gradient background
- Adds a high-quality property image that covers the entire background
- Applies a dark semi-transparent overlay on top of the image so white text is readable
- Uses CSS grid to create a two-column layout (50/50 split) for the content panels
- The left panel ("hero-panel") displays the welcome message with a dark glassmorphism effect (semi-transparent with blur)
- The right panel ("hero-actions-card") has a gold-tinted glassmorphism effect with buttons for quick actions
- Adds smooth fade-in animation when the page loads
- Creates a hover effect that lifts the card slightly up and enhances the shadow for interactivity

**Why we're doing this:**
- The hero is the first thing users see - it needs to be visually striking and immediately establish the brand's premium feel
- Glassmorphism (blur effect + transparency) creates a modern, sophisticated look that's popular in luxury real estate
- The dark panels ensure high contrast for text readability against the image background
- The two-column layout separates informational content from actionable buttons, making the user path clear
- Hover effects provide immediate visual feedback that the interface is interactive

**Testing:**
- [ ] Hero displays with gradient background
- [ ] Background image loads correctly
- [ ] Dark overlay visible on image
- [ ] Glassmorphism panels display correctly
- [ ] Text is readable on dark backgrounds
- [ ] Buttons work (View Listings, Schedule Tour, Enlist Now)
- [ ] Search bar displays and positions correctly
- [ ] Hover effects work (card elevation, shadow changes)
- [ ] Animations play (fadeInUp)

---

### Phase 3: Why Choose Us Section

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Implement 5-card grid with SVG icons and gold accents

**Files to modify:**
1. `src/app/page.tsx` - Replace Why Choose Us section

**Changes:**

**3.1 Section Structure**
```jsx
<section className="section grid-section">
  <div className="container">
    <div className="section-header-centered">
      <p className="eyebrow">Our Difference</p>
      <h2>Why Choose The Specialist Realty</h2>
      <p>Expertise You Can Trust, Service You Can Feel</p>
    </div>
    
    <div className="why-choose-grid">
      {/* Card 1: Expert Guidance */}
      <article className="card">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <h3>Expert Guidance</h3>
        <div className="card-content">
          <p>From property selection to final turnover, we guide you with clarity and confidence throughout entire process.</p>
        </div>
      </article>

      {/* Card 2: Personalized Experience */}
      <article className="card">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h3>Personalized Experience</h3>
        <div className="card-content">
          <p>No two clients are the same. We listen closely to what matters most and align you with the right property opportunities.</p>
        </div>
      </article>

      {/* Card 3: Life Transitions */}
      <article className="card">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21h5v-5"/>
          </svg>
        </div>
        <h3>Life Transitions</h3>
        <div className="card-content">
          <p>Real estate is tied to life's biggest turning points. We offer steady support through every transition.</p>
        </div>
      </article>

      {/* Card 4: Elevated Marketing */}
      <article className="card">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3>Elevated Marketing</h3>
        <div className="card-content">
          <p>Your property gets polished, high-quality presentation and strategic exposure to attract serious buyers.</p>
        </div>
      </article>

      {/* Card 5: Trust & Integrity */}
      <article className="card">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        </div>
        <h3>Trust & Integrity</h3>
        <div className="card-content">
          <p>Our approach is refreshingly honest, calm, and pressure-free, built on trust and long-term relationships.</p>
        </div>
      </article>
    </div>
  </div>
</section>
```

**3.2 Section Styling**
```css
.why-choose-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

@media (min-width: 1200px) {
  .why-choose-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.section-header-centered {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 40px auto;
}

.section-header-centered .eyebrow {
  margin-bottom: 8px;
}

.section-header-centered h2 {
  margin: 0 0 12px;
}

.section-header-centered p {
  color: var(--steel);
  font-size: 16px;
  margin: 0;
  line-height: 1.6;
}
```

**What this does:**
- Creates a responsive grid that automatically adjusts number of columns based on available space
- On large screens (1200px+), forces exactly 5 equal columns for symmetrical layout
- On smaller screens, automatically fits as many columns as will fit without horizontal scrolling
- Centers the section header and adds spacing between eyebrow label, heading, and description
- Uses "eyebrow" style label (small uppercase text) as a design element to draw attention
- Applies a subtle dot grid background pattern behind the cards for visual interest

**Why we're doing this:**
- This section establishes credibility and trust by showcasing key differentiators
- The 5-card layout makes information scannable and easy to digest
- Gold icons create visual anchors that draw eye to each benefit
- Responsive grid ensures section works beautifully on all device sizes
- Dot grid background adds professional, subtle texture without overwhelming the design

**Testing:**
- [ ] 5 cards display correctly
- [ ] SVG icons render properly
- [ ] Gold icon backgrounds display
- [ ] Dot grid background visible
- [ ] Hover effects work (gold top border appears, card elevates)
- [ ] Card content readable
- [ ] Responsive: 5 columns on desktop (â‰¥1200px), auto-fit on smaller screens
- [ ] Spacing consistent

---

### Phase 4: Our Services Section

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Implement 5 compact service cards with gold accents

**Files to modify:**
1. `src/app/page.tsx` - Replace Services section

**Changes:**

**4.1 Section Structure**
```jsx
<section className="section grid-section">
  <div className="container">
    <div className="section-header-centered">
      <p className="eyebrow">What We Do</p>
      <h2>Our Services</h2>
      <p>Comprehensive real estate solutions for all your needs</p>
    </div>
    
    <div className="cards-5">
      <article className="card">
        <h3>Buying</h3>
        <p className="text-sm">Property search, negotiation, and purchase assistance</p>
      </article>
      
      <article className="card">
        <h3>Selling</h3>
        <p className="text-sm">Marketing, pricing strategy, and buyer qualification</p>
      </article>
      
      <article className="card">
        <h3>Leasing</h3>
        <p className="text-sm">Unit showcasing, tenant screening, and lease agreements</p>
      </article>
      
      <article className="card">
        <h3>Documentation</h3>
        <p className="text-sm">Title transfer, deed preparation, and BIR coordination</p>
      </article>
      
      <article className="card">
        <h3>Valuation</h3>
        <p className="text-sm">Market-based property assessments for informed decisions</p>
      </article>
    </div>
  </div>
</section>
```

**4.2 Grid Styling**
```css
.cards-5 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}
```

**What this does:**
- Creates a responsive grid that automatically adjusts to fit available screen space
- Each card shows one service (Buying, Selling, Leasing, Documentation, Valuation)
- Cards have compact design without icons to keep this section visually different from "Why Choose Us"
- Shares the same card styling (gradient background, hover effects, gold border on hover) for consistency

**Why we're doing this:**
- Services section helps visitors quickly understand the full range of offerings
- Compact cards without icons allow for more information density while maintaining design consistency
- Responsive grid ensures services are always accessible regardless of screen size
- Using the same card design as "Why Choose Us" creates visual harmony across the page

**Testing:**
- [ ] 5 service cards display correctly
- [ ] Card titles and descriptions readable
- [ ] Hover effects work
- [ ] Dot grid background visible
- [ ] Responsive layout works

---

### Phase 5: Featured Listings Section

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Update styling of existing FeaturedListings component to match new design system

**Files to modify:**
1. `src/app/page.tsx` - Update section structure
2. `src/components/listings/ListingCard.tsx` - Update styling

**Changes:**

**5.1 Section Structure**
```jsx
<section className="section featured">
  <div className="container">
    <div className="section-header">
      <p className="eyebrow">Available Now</p>
      <h2>Featured Listings</h2>
      <a href="/listings">Browse all listings â†’</a>
    </div>
    
    <div className="listing-grid">
      <FeaturedListings />
    </div>
  </div>
</section>
```

**5.2 Listing Card Styling**
```css
.listing-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 300px));
  justify-content: center;
}

.listing-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fb 100%);
  border: 1px solid var(--slate);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.listing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 26px rgba(13, 15, 18, 0.14), 0 0 0 1px rgba(212, 175, 55, 0.25);
  border-color: rgba(212, 175, 55, 0.3);
}

.listing-card .badge.gold {
  background: rgba(212, 175, 55, 0.92);
  color: #111;
}
```

**What this does:**
- Updates the styling of existing property listing cards to match the new design system
- Applies a subtle gradient background (white to very light gray) instead of flat color
- Adds smooth hover effects that lift the card up and add a gold-tinted shadow and border
- Ensures cards have a consistent maximum width of 300px with responsive grid layout
- Property type badges (like "Condominium", "House") get a gold background treatment

**Why we're doing this:**
- Featured listings are a key conversion point - they need to look premium and trustworthy
- Consistent styling with other cards creates visual harmony across the page
- Hover effects provide immediate feedback and encourage clicking
- Gold accents reinforce luxury brand positioning
- This section already exists, so we're only updating visuals, not functionality

**Important Note:**
- This modifies `src/components/listings/ListingCard.tsx`, which is also used on the `/listings` page
- Changes here will affect both landing page and the full listings page
- Consider adding a `variant` prop if you want different styling on each page
  - Variant hook added (not enabled yet) to allow landing-only styling later without impacting `/listings`

**Testing:**
- [ ] Featured listings display correctly
- [ ] Card styling matches design system
- [ ] Gold badges display for property types
- [ ] Hover effects work
- [ ] Links to listing pages work
- [ ] Images load from database

---

### Phase 6: Stats Section (NEW)

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Add new stats section with dark background

**Files to modify:**
1. `src/app/page.tsx` - Add new section

**Changes:**

**6.1 Section Structure**
```jsx
<section className="section stats">
  <div className="container stats-row">
    <div className="stat">Trusted Property Advisor</div>
    <div className="stat">Licensed PRC Broker</div>
    <div className="stat">Metro Manila & Luzon</div>
    <div className="stat">Developer Accredited Seller</div>
  </div>
</section>
```

**6.2 Section Styling**
```css
.stats {
  background: var(--steel);
  color: #fff;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 12px;
}
```

**What this does:**
- Creates a new section with a dark steel-blue background to break up the page visually
- Displays four key statistics in a responsive grid layout
- Uses uppercase text with extra letter-spacing for a premium, professional look
- Grid automatically adjusts to fit available screen space (4 columns on desktop, fewer on mobile)

**Why we're doing this:**
- Stats section provides social proof and builds credibility quickly
- Dark background creates visual rhythm and contrast with adjacent sections
- Simple, scannable format makes information easy to process
- Shows key differentiators without requiring users to read lengthy paragraphs
- Reinforces brand's expertise and qualifications at a glance

**Testing:**
- [ ] Stats display with dark background
- [ ] Text is readable
- [ ] Responsive layout works
- [ ] Spacing is correct

---

### Phase 7: CTA Section

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Redesign CTA section with new content and styling

**Files to modify:**
1. `src/app/page.tsx` - Replace CTA section

**Changes:**

**7.1 Section Structure**
```jsx
<section className="section cta">
  <div className="container cta-inner">
    <div className="cta-text">
      <p className="eyebrow" style="color: var(--gold);">Ready to Find Your Perfect Property?</p>
      <h2>Let's find the right property for youâ€”beautifully and professionally.</h2>
      <p>With The Specialist, you're not just choosing a real estate serviceâ€”you're choosing a trusted real estate specialist who listens, understands your goals, and represents your best interest every step of the way.</p>
      <a href="/contact">Contact Us Today</a>
    </div>
    <div className="cta-media">
      <img 
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" 
        alt="Real Estate Property" 
        className="cta-image" 
      />
    </div>
  </div>
</section>
```

**7.2 Section Styling**
```css
.cta {
  background: #0d0f12;
  color: #fff;
}

.cta-inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  align-items: center;
}

.cta a {
  display: inline-block;
  margin-top: 14px;
  padding: 12px 18px;
  border-radius: 6px;
  background: var(--accent-light);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
}

.cta-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**What this does:**
- Creates a final call-to-action section with dark ink-black background
- Uses a two-column grid layout (text on left, image on right) that stacks vertically on mobile
- Displays persuasive copy encouraging users to contact the company
- Includes a high-quality property image with rounded corners and subtle border
- The action button uses a light blue accent color to stand out from the dark background

**Why we're doing this:**
- CTA section is the last opportunity to convert visitors before they leave the page
- Dark background creates visual weight and finality, closing the page experience
- Two-column layout provides balance between messaging and visual reinforcement
- The "Contact Us Today" button provides a clear next step
- Image reinforces the real estate context and adds visual interest

**Testing:**
- [ ] CTA section displays with dark background
- [ ] Text is readable
- [ ] Button works
- [ ] Image loads correctly
- [ ] Responsive layout works

---

### Phase 8: Navigation Update with Services Dropdown

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Update navbar links, add Services dropdown menu, and styling

**Files to modify:**
1. `src/components/ui/navbar.tsx` - Update navigation

**Changes:**

**8.1 Navigation Structure**
```jsx
<nav className="nav">
  <a href="/">Home</a>
  <a href="#how-we-work">How We Work</a>
  
  {/* Services Dropdown */}
  <div className="dropdown">
    <div className="dropdown-toggle">Services</div>
    <div className="dropdown-menu">
      <div className="arrow-indicator"></div>
      <a href="/listings" className="dropdown-item">Listings</a>
      <a href="#" className="dropdown-item">Investor Relations</a>
      <a href="#" className="dropdown-item">Developer Selling</a>
    </div>
  </div>
  
  <a href="/contact">Contact</a>
</nav>
```

**8.2 Navigation Styling**
```css
.nav {
  display: flex;
  gap: 18px;
  justify-content: center;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--steel);
  align-items: center;
}

.nav-link {
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: var(--accent);
}

/* Dropdown Menu */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.dropdown-toggle::after {
  content: "▼";
  font-size: 8px;
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.dropdown:hover .dropdown-toggle::after {
  transform: rotate(180deg);
}

.dropdown:hover .dropdown-toggle {
  color: var(--accent);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: white;
  min-width: 180px;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(13, 15, 18, 0.15);
  border: 1px solid var(--slate);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  padding: 8px 0;
  z-index: 100;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-item {
  display: block;
  padding: 10px 20px;
  font-size: 13px;
  text-transform: none;
  letter-spacing: normal;
  color: var(--steel);
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.dropdown-item:hover {
  background: var(--mist);
  color: var(--accent);
  border-left-color: var(--gold);
  padding-left: 24px;
}

/* Gold accent line at top of dropdown */
.dropdown-menu::before {
  content: "";
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(90deg, var(--gold) 0%, rgba(212, 175, 55, 0.3) 100%);
  border-radius: 0 0 2px 2px;
}

.arrow-indicator {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: white;
  border-left: 1px solid var(--slate);
  border-top: 1px solid var(--slate);
  transform: translateX(-50%) rotate(45deg);
}

@media (max-width: 860px) {
  .nav {
    display: none;
  }
}
```

**What this does:**
- Updates the navbar to show four links: Home, How We Work, Services (dropdown), Contact
- Services link is unclickable and shows a dropdown menu on hover
- Dropdown contains three items: Listings, Investor Relations, Developer Selling
- Removes the Blog link from navigation (completely hides it from user view)
- Centers navigation links horizontally with consistent spacing
- Uses uppercase text with extra letter-spacing for a premium, modern look
- Dropdown appears on hover with smooth fade-in animation
- Dropdown has gold accent line at top and arrow indicator
- Dropdown items show gold left border on hover
- Keeps Login button for testing (will be removed in production)
- Keeps Contact CTA button
- On mobile devices (860px and smaller), hides the entire navigation bar

**Why we're doing this:**
- Organizes services under a dropdown to keep navigation clean and scannable
- Groups related services (Listings, Investor Relations, Developer Selling) under one parent category
- Hiding blog aligns with decision to deprioritize that section while preserving the code
- Login button needed for testing - will remove before production
- Uppercase text creates visual hierarchy and consistent branding
- Mobile hiding prevents clutter on small screens and matches wireframe design
- Gold accents on dropdown reinforce luxury brand positioning

**Important Note:**
- This modifies `src/components/ui/navbar.tsx`, which is in `src/app/layout.tsx` and affects ALL pages
- Navigation changes apply globally (home, listings, blog, contact, admin, dashboard)
- If you want to keep navigation visible on other pages, consider conditional logic or scoped styling
- Login button is temporary for testing - must remove before production deployment

**Testing:**
- [ ] Navigation links display correctly
- [ ] Services dropdown appears on hover
- [ ] Dropdown items work and link correctly
- [ ] All dropdown items (Listings, Investor Relations, Developer Selling) are accessible
- [ ] Login button works (for testing)
- [ ] Contact CTA button works
- [ ] Hover states work on all navigation items
- [ ] Navigation hidden on mobile (â‰¤860px)

---

### Phase 9: Blog Section Hiding

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Hide blog from navigation without deleting code

**Files to modify:**
1. `src/components/ui/navbar.tsx` - Remove blog link from navigation

**Changes:**
- Remove any blog link from navigation
- Keep all blog-related files and code intact

**Testing:**
- [ ] Blog link not visible in navigation
- [ ] Other navigation links still work
- [ ] No errors in console

---

### Phase 10: Responsive Optimization

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Ensure all sections work correctly across breakpoints

**Files to modify:**
1. `src/app/globals.css` - Add responsive media queries
2. `src/app/page.tsx` - Ensure responsive classes applied

**Changes:**

**10.1 Responsive Breakpoints**
```css
/* Mobile (â‰¤600px) */
@media (max-width: 600px) {
  .hero {
    padding: 60px 0 40px;
  }
  .hero-panel {
    padding: 24px 20px;
  }
  .hero-actions-card {
    padding: 20px 20px;
  }
  .cta-row {
    flex-direction: column;
    gap: 10px;
  }
  .cta-row a {
    width: 100%;
    text-align: center;
  }
  .section {
    padding: 60px 0 40px;
  }
}

/* Tablet/Mobile (â‰¤860px) */
@media (max-width: 860px) {
  .header-inner {
    grid-template-columns: 1fr;
    justify-items: start;
  }
  /* Desktop nav links hidden on mobile */
  .nav {
    display: none;
  }
  /* Keep hamburger menu and mobile drawer functional */
  /* Mobile navigation (hamburger + drawer) remains active */
}
  .section-grid {
    grid-template-columns: 1fr;
  }
  .hero-split-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .hero-actions-card {
    align-self: stretch;
    margin-top: 0;
  }
  .hero-stats {
    grid-template-columns: 1fr;
  }
  .hero-split .cta-row {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Large Desktop (â‰¥1200px) */
@media (min-width: 1200px) {
  .why-choose-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

**Testing:**
- [ ] Mobile view (â‰¤600px) works correctly
- [ ] Tablet view (â‰¤860px) works correctly
- [ ] Desktop view (>860px) works correctly
- [ ] Large desktop view (â‰¥1200px) works correctly
- [ ] All sections responsive
- [ ] Navigation hidden on mobile
- [ ] No horizontal scrolling

---

### Phase 11: Testing & Refinement

**Scope note:** Landing-only classes should be scoped under .landing unless explicitly marked as global.
**Goal:** Final testing and bug fixes

**Testing Checklist:**

**Visual Testing:**
- [ ] All colors match design system
- [ ] Typography renders correctly (Space Grotesk, Space Mono)
- [ ] Gold accents display properly
- [ ] Hover effects work smoothly
- [ ] Animations trigger correctly
- [ ] Dot grid backgrounds visible
- [ ] Glassmorphism effects visible

**Functional Testing:**
- [ ] All navigation links work
- [ ] Search form submits correctly
- [ ] Listing cards link to detail pages
- [ ] Buttons have proper hover states
- [ ] Focus states visible for keyboard navigation
- [ ] No broken images

**Responsive Testing:**
- [ ] Mobile view (â‰¤600px) tested
- [ ] Tablet view (â‰¤860px) tested
- [ ] Desktop view (>860px) tested
- [ ] Large desktop view (â‰¥1200px) tested

**Accessibility Testing:**
- [ ] Color contrast ratios meet WCAG AA
- [ ] All interactive elements have focus states
- [ ] Alt text present for images
- [ ] Semantic HTML structure
- [ ] Keyboard navigation works

**Performance Testing:**
- [ ] Page loads quickly
- [ ] No console errors
- [ ] No layout shifts
- [ ] Images optimized

**Cross-Browser Testing:**
- [ ] Chrome tested
- [ ] Firefox tested
- [ ] Safari tested
- [ ] Edge tested

---

## CSS Classes Reference

**Global impact note:** These utility class names are generic. To prevent conflicts with other pages, scope them under a landing wrapper (e.g., `.landing .section`, `.landing .card`).

**Scoped example (recommended):**
```css
.landing .container { width: min(1160px, 92vw); margin: 0 auto; }
.landing .section { padding: 72px 0; }
.landing .card { /* existing card styles here */ }
```

### Utility Classes

```css
/* Layout */
.container { width: min(1160px, 92vw); margin: 0 auto; }

/* Typography */
.eyebrow { 
  font-family: "Space Mono", "Courier New", monospace;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
}

.lead { 
  font-size: 18px;
  line-height: 1.7;
  color: var(--steel);
}

/* Sections */
.section { padding: 72px 0; }

.grid-section {
  background: #fff;
  border-top: 1px solid var(--slate);
  border-bottom: 1px solid var(--slate);
  position: relative;
}

/* Dot Grid Background */
.grid-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--grid) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  pointer-events: none;
}

/* Cards */
.card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 1px solid var(--slate);
  border-radius: 12px;
  padding: 32px 28px;
  min-height: 200px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15), 0 10px 30px rgba(13, 15, 18, 0.1);
  transform: translateY(-4px);
  border-color: rgba(212, 175, 55, 0.3);
}

/* Gold Top Border on Hover */
.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold) 0%, rgba(212, 175, 55, 0.6) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover::before {
  opacity: 1;
}

/* Card Icon */
.card-icon {
  width: 52px;
  height: 52px;
  background: var(--gold);
  border-radius: 10px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  color: #111;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
  transition: all 0.3s ease;
}

.card:hover .card-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.35);
}

/* Buttons */
.cta-row a {
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--ink);
  font-weight: 600;
  transition: all 0.3s ease;
}

.cta-row a:first-child {
  background: var(--ink);
  color: #fff;
}

.cta-row a:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.enlist-button {
  background: transparent;
  border: 1px solid var(--gold);
  color: var(--gold);
  padding: 12px 20px;
  width: 100%;
  text-align: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.enlist-button:hover {
  background: var(--gold);
  color: #111;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
```

---

## Summary

This plan breaks down the landing page revamp into 11 testable phases:

1. âœ… **Phase 1: Foundation Setup** - Fonts and CSS variables
2. âœ… **Phase 2: Hero Section** - Gradient + image background, glassmorphism
3. âœ… **Phase 3: Why Choose Us** - 5 cards with SVG icons
4. âœ… **Phase 4: Services** - 5 service cards
5. âœ… **Phase 5: Featured Listings** - Style update only
6. âœ… **Phase 6: Stats** - New dark section
7. âœ… **Phase 7: CTA** - Dark section with image
8. âœ… **Phase 8: Navigation** - Link updates
9. âœ… **Phase 9: Blog Hiding** - Remove from nav
10. âœ… **Phase 10: Responsive** - Breakpoints
11. âœ… **Phase 11: Testing** - Final verification

Each phase is:
- Independent and testable
- Reviewable and approval-gated
- Documented with testing checklist
- Includes specific code changes

---

**Last Updated:** January 26, 2026  
**Status:** Ready to Implement  
**Next Step:** Phase 1 - Foundation Setup





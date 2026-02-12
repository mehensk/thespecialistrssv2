# The Specialist Realty - Frontend Design System

> Complete design specification for the landing page theme to be applied across all website sections

---

## Table of Contents
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing System](#spacing-system)
- [Component Patterns](#component-patterns)
- [Animations & Interactions](#animations--interactions)
- [Layout Patterns](#layout-patterns)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Special Effects](#special-effects)
- [Design Principles](#design-principles)
- [Implementation Guide](#implementation-guide)

---

## Color Palette

### Primary Colors

```css
--ink: #0d0f12;        /* Primary text color (almost black) */
--steel: #1e2a36;      /* Secondary text color (dark blue-gray) */
--mist: #f0f2f4;      /* Background color (light gray) */
--slate: #dde2e7;      /* Border color (medium gray) */
```

### Accent Colors

```css
--accent: #2f5f8f;           /* Primary accent (blue) */
--accent-light: #4d7bb0;      /* Lighter accent (lighter blue) */
--gold: #D4AF37;             /* Luxury accent color (gold) */
--gold-light: #F4D03F;       /* Light gold variant */
```

### Effects

```css
--grid: rgba(13, 15, 18, 0.08);           /* Dot grid pattern */
--shadow: 0 20px 50px rgba(13, 15, 18, 0.18);    /* Large shadow */
--shadow-sm: 0 10px 24px rgba(13, 15, 18, 0.08);  /* Small shadow */
```

### Color Usage Guidelines

- **Ink**: Primary headings, body text, primary buttons
- **Steel**: Secondary text, subheadings, descriptions
- **Mist**: Page backgrounds, section backgrounds
- **Slate**: Borders, dividers, subtle elements
- **Accent**: Interactive elements, links, buttons
- **Gold**: Premium features, highlights, luxury accents

---

## Typography

### Font Families

```css
/* Primary Font */
font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif;

/* Monospace Font (for labels, numbers, technical text) */
font-family: "Space Mono", "Courier New", monospace;
```

### Type Scale

| Element | Size | Weight | Letter Spacing | Line Height |
|---------|------|--------|---------------|-------------|
| Eyebrow/Labels | 12px | 400 | 2px | - |
| Body Text | 14px | 400 | normal | 1.6-1.8 |
| Lead Paragraph | 18px | 400 | normal | 1.7 |
| h3 | 20px | 600 | normal | 1.2 |
| h2 | clamp(28px, 3vw, 42px) | 600 | normal | 1.2 |
| h1 | clamp(28px, 3.5vw, 48px) | 700 | normal | 1.2 |

### Typography Rules

- **Eyebrows**: Always uppercase, use Space Mono, 2px letter-spacing, accent color
- **Headings**: Space Grotesk, tight line-height (1.2), steel color
- **Body**: 14-16px, 1.6-1.8 line-height for readability
- **Buttons**: Uppercase, 12px, 1-1.5px letter-spacing
- **Navigation**: Uppercase, 13px, 1.5px letter-spacing

---

## Spacing System

### Container

```css
.container {
  width: min(1160px, 92vw);
  margin: 0 auto;
}
```

### Section Padding

| Section Type | Top/Bottom |
|-------------|-----------|
| Standard | 72px |
| Hero | 90px top, 100px bottom |
| Mobile (≤600px) | 60px top, 40px bottom |

### Component Spacing

| Element | Spacing |
|---------|---------|
| Grid gaps | 20px-32px |
| Card padding | 32px 28px |
| Button padding | 12px 20px |
| Input padding | 12px 12px |
| Header padding | 16px 0 |
| Footer padding | 48px 0 40px |

### Margin Scale

- Extra small: 8px
- Small: 12px
- Medium: 16px
- Large: 24px
- Extra large: 32px

---

## Component Patterns

### 1. Header

**Structure:**
- Sticky positioning (top: 0)
- Three-column grid: brand | navigation | CTA
- Semi-transparent background

**CSS:**
```css
.site-header {
  position: sticky;
  top: 0;
  background: rgba(240, 242, 244, 0.95);
  border-bottom: 1px solid var(--slate);
  z-index: 10;
}

.header-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 18px;
  padding: 16px 0;
}

.nav {
  display: flex;
  gap: 18px;
  justify-content: center;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--steel);
}

.header-cta a {
  padding: 10px 16px;
  border-radius: 4px;
  border: 1px solid var(--ink);
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: var(--ink);
  color: #fff;
}
```

---

### 2. Hero Section

**Structure:**
- Split layout (50/50 grid)
- Background image with dark gradient overlay
- Glassmorphism panels
- Full viewport height

**CSS:**
```css
.hero {
  padding: 90px 0 100px;
  min-height: 100vh;
  background: linear-gradient(120deg, #f0f2f4 0%, #e7ecef 50%, #dfe5ea 100%);
  border-bottom: 1px solid var(--slate);
  position: relative;
}

.hero-split-grid {
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

---

### 3. Service/Feature Cards

**Structure:**
- Gradient background
- Gold icon container
- Subtle gold top border on hover
- Elevate on hover

**CSS:**
```css
.card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 1px solid var(--slate);
  border-radius: 12px;
  padding: 32px 28px;
  min-height: 200px;
  box-shadow: var(--shadow-sm), inset 0 1px 2px rgba(0,0,0,0.02);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15), 0 10px 30px rgba(13, 15, 18, 0.1);
  transform: translateY(-4px);
  border-color: rgba(212, 175, 55, 0.3);
}

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

.card-icon {
  width: 52px;
  height: 52px;
  background: var(--gold);
  border-radius: 10px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  color: #111;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
  transition: all 0.3s ease;
}

.card:hover .card-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.35);
}

.card h3 {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--steel);
  letter-spacing: 0.3px;
  position: relative;
}

.card h3::after {
  content: "";
  display: block;
  width: 40px;
  height: 2px;
  background: var(--gold);
  margin-top: 8px;
  opacity: 0.6;
  border-radius: 1px;
}

.card-content p {
  font-size: 14px;
  color: var(--steel);
  line-height: 1.8;
  margin: 0;
  opacity: 0.85;
}
```

---

### 4. Listing Cards

**Structure:**
- Max-width: 300px
- Image area with badges
- Content section with price and details
- Hover elevation

**CSS:**
```css
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

.listing-card .media {
  position: relative;
  height: 224px;
  background: #e6eaef;
  overflow: hidden;
}

.listing-card .badge {
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: 600;
  background: rgba(13, 15, 18, 0.85);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
}

.listing-card .badge.gold {
  background: rgba(212, 175, 55, 0.92);
  color: #111;
}

.listing-card .content {
  padding: 20px;
  display: grid;
  gap: 12px;
}

.listing-card .price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
}

.listing-card .meta-line span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--mist);
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--steel);
}
```

---

### 5. Buttons

**Primary CTA:**
```css
.cta-row a:first-child {
  background: var(--ink);
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--ink);
  font-weight: 600;
  transition: all 0.3s ease;
}

.cta-row a:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.cta-row a:focus {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
```

**Enlist Button (Gold Outline):**
```css
.enlist-button {
  background: transparent;
  border: 1px solid var(--gold);
  color: var(--gold);
  padding: 12px 20px;
  width: 100%;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.enlist-button:hover {
  background: var(--gold);
  color: #111;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.enlist-button:focus {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
```

---

### 6. Search Bar

**CSS:**
```css
.search-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  background: #fff;
  padding: 14px;
  border-radius: 6px;
  border: 1px solid var(--slate);
  box-shadow: var(--shadow);
}

.search-bar input,
.search-bar select {
  padding: 12px 12px;
  border-radius: 4px;
  border: 1px solid var(--slate);
  font-family: inherit;
}

.search-bar button {
  padding: 12px 16px;
  border-radius: 4px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}
```

---

### 7. Stats Section

**CSS:**
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

---

### 8. CTA Section

**CSS:**
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

---

### 9. Footer

**CSS:**
```css
.site-footer {
  background: #1F2937;
  border-top: 1px solid #374151;
  color: #fff;
  padding: 48px 0 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
}

.footer-brand h3 {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.footer-brand .license {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
}

.footer-links li a,
.footer-links li {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-links li a:hover {
  color: #fff;
}

.footer-contact .contact-btn {
  display: inline-block;
  background: #fff;
  color: #1F2937;
  padding: 12px 24px;
  border-radius: 6px;
  margin-top: 24px;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
}

.footer-contact .contact-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}
```

---

## Animations & Interactions

### Key Animations

**Fade In Up:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-fade-in-up-delay {
  animation: fadeInUp 0.8s ease-out 0.2s forwards;
  opacity: 0;
}
```

**Fade In:**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Hover Effects

| Element | Hover Transform | Additional Effects |
|---------|----------------|-------------------|
| Cards | translateY(-4px) | Enhanced shadow, border color change |
| Buttons | translateY(-2px) | Shadow enhancement |
| Icons (in cards) | scale(1.05) | Enhanced shadow |
| Focus states | - | 3px accent outline with 2px offset |

### Transition Timing

- Standard: `0.3s ease`
- Fast: `0.2s ease`
- Animation: `0.6s ease-out`
- Staggered delay: `0.2s`

---

## Layout Patterns

### Grid Systems

**Two-Column (50/50):**
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 32px;
align-items: stretch;
```

**Auto-Fit Cards (3-6 columns):**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 20px;
```

**Three-Column Footer:**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
gap: 32px;
```

**Five-Column (Why Choose Us - Desktop):**
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
```

### Section Types

**Standard Section:**
```css
.section {
  padding: 72px 0;
}
```

**Grid Section (with dot pattern):**
```css
.grid-section {
  background: #fff;
  border-top: 1px solid var(--slate);
  border-bottom: 1px solid var(--slate);
  position: relative;
  padding: 72px 0;
}

.grid-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--grid) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  pointer-events: none;
}
```

**Hero Section:**
```css
.hero {
  padding: 90px 0 100px;
  min-height: 100vh;
  background: linear-gradient(120deg, #f0f2f4 0%, #e7ecef 50%, #dfe5ea 100%);
  border-bottom: 1px solid var(--slate);
  position: relative;
}
```

**Featured Section (no background):**
```css
.featured {
  padding: 72px 0;
  /* Uses page background color */
}
```

---

## Responsive Breakpoints

### Mobile-First Breakpoints

| Breakpoint | Description | Layout Changes |
|------------|-------------|----------------|
| ≤ 600px | Mobile | Stacked CTAs, reduced padding (60px/40px), full-width buttons, single column |
| ≤ 720px | Small Tablet | Smaller listing card images (200px) |
| ≤ 860px | Tablet/Mobile | Single column layouts, navigation hidden, header becomes single column |
| > 860px | Desktop | Full navigation, multi-column layouts |
| ≥ 1200px | Large Desktop | Fixed 5-column grid for Why Choose Us |

### Responsive Header

```css
@media (max-width: 860px) {
  .header-inner {
    grid-template-columns: 1fr;
    justify-items: start;
  }
  .nav {
    display: none;
  }
  .header-cta {
    display: none;
  }
}
```

### Responsive Hero

```css
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
}
```

### Responsive Listing Cards

```css
@media (max-width: 720px) {
  .listing-card .media {
    height: 200px;
  }
}
```

---

## Special Effects

### 1. Dot Grid Pattern

```css
.grid-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--grid) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  pointer-events: none;
}
```

### 2. Glassmorphism Effect

```css
.glass-panel {
  background: rgba(12, 18, 24, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

### 3. Gradient Overlays

**Hero Image Overlay:**
```css
.hero-split::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(8, 12, 18, 0.88) 0%, rgba(10, 16, 22, 0.82) 55%, rgba(13, 19, 26, 0.78) 100%);
}
```

**Card Background:**
```css
.card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}
```

### 4. Gold Accents

**Border on Hover:**
```css
.card:hover::before {
  opacity: 1; /* Reveals 3px gold top border */
}
```

**Icon Container:**
```css
.card-icon {
  background: var(--gold);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
}
```

### 5. Shadow Layers

**Combined Shadows:**
```css
.card:hover {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15), 0 10px 30px rgba(13, 15, 18, 0.1);
}

.hero-actions-card {
  box-shadow: 0 20px 50px rgba(13, 15, 18, 0.3), 0 0 30px rgba(212, 175, 55, 0.08);
}
```

---

## Design Principles

### 1. Luxury Professional
- Gold accents for premium feel
- Clean, sophisticated typography (Space Grotesk)
- Elegant color palette with high contrast
- Subtle animations (no jarring effects)

### 2. Modern Sophisticated
- Space Grotesk font family
- Clean lines and minimal design
- Generous whitespace
- Grid-based layouts

### 3. Accessible
- High contrast ratios (WCAG compliant)
- Clear visual hierarchy
- Readable font sizes (14px minimum)
- Focus states for keyboard navigation

### 4. Subtle Motion
- Smooth 0.3s transitions
- Gentle transforms (translateY -2px to -4px)
- Staggered animations for sequential reveals
- No bounce or elastic effects

### 5. Grid-Based Consistency
- Consistent spacing scale (8px, 12px, 16px, 24px, 32px)
- Uniform grid systems (auto-fit, fixed columns)
- Aligned elements across sections
- Predictable component sizing

---

## Implementation Guide

### Applying to New Pages

#### Step 1: Define CSS Variables
```css
:root {
  --ink: #0d0f12;
  --steel: #1e2a36;
  --mist: #f0f2f4;
  --slate: #dde2e7;
  --accent: #2f5f8f;
  --accent-light: #4d7bb0;
  --gold: #D4AF37;
  --grid: rgba(13, 15, 18, 0.08);
  --shadow: 0 20px 50px rgba(13, 15, 18, 0.18);
  --shadow-sm: 0 10px 24px rgba(13, 15, 18, 0.08);
}
```

#### Step 2: Import Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono&display=swap" rel="stylesheet">
```

#### Step 3: Use Base Styles
```css
body {
  font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif;
  color: var(--ink);
  background: var(--mist);
  line-height: 1.6;
}
```

#### Step 4: Apply Component Classes
- Use `.card` for feature/service cards
- Use `.listing-card` for property listings
- Use `.cta-row a` for buttons
- Use `.grid-section` for content sections with dot pattern
- Use `.hero` for hero sections

#### Step 5: Responsive Breakpoints
Always include these media queries:
```css
@media (max-width: 860px) { /* Tablet/Mobile */ }
@media (max-width: 720px) { /* Small Tablet */ }
@media (max-width: 600px) { /* Mobile */ }
@media (min-width: 1200px) { /* Large Desktop */ }
```

### Component Checklist

When creating new components, ensure they include:
- [ ] Proper hover states (translateY -2px to -4px)
- [ ] Smooth transitions (0.3s ease)
- [ ] Focus states for accessibility
- [ ] Responsive breakpoints
- [ ] Correct border radius (8px for buttons, 12px for cards)
- [ ] Appropriate shadows
- [ ] Correct font family (Space Grotesk for body, Space Mono for labels)
- [ ] Proper letter spacing (uppercase elements need 1-2px)

### Color Usage Matrix

| Element | Color | Usage |
|---------|-------|-------|
| Primary headings | var(--ink) | Main titles |
| Secondary headings | var(--steel) | Subtitles |
| Body text | var(--ink) | Content text |
| Secondary text | var(--steel) | Descriptions |
| Backgrounds | var(--mist) | Page background |
| Card backgrounds | #fff to #f8f9fa | Gradient |
| Borders | var(--slate) | Dividers, card borders |
| Links | var(--accent) | Navigation, links |
| Primary buttons | var(--ink) | Main actions |
| Secondary buttons | var(--accent) | Alternative actions |
| Gold accents | var(--gold) | Premium features |
| Hero panels | rgba(12, 18, 24, 0.78-0.88) | Glassmorphism |

---

## Quick Reference

### Common Classes

```css
/* Layout */
.container { width: min(1160px, 92vw); margin: 0 auto; }

/* Typography */
.eyebrow { font-family: "Space Mono"; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); }
.lead { font-size: 18px; line-height: 1.7; color: var(--steel); }

/* Sections */
.section { padding: 72px 0; }
.grid-section { background: #fff; border-top: 1px solid var(--slate); border-bottom: 1px solid var(--slate); }

/* Cards */
.card { border-radius: 12px; padding: 32px 28px; }
.listing-card { max-width: 300px; border-radius: 12px; }

/* Buttons */
.cta-row a { padding: 12px 20px; border-radius: 8px; font-weight: 600; }

/* Animations */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
```

### Common Spacing

```css
/* Margins */
.mb-8 { margin-bottom: 8px; }
.mb-12 { margin-bottom: 12px; }
.mb-16 { margin-bottom: 16px; }
.mb-24 { margin-bottom: 24px; }
.mb-32 { margin-bottom: 32px; }

/* Paddings */
.p-16 { padding: 16px; }
.p-20 { padding: 20px; }
.p-32 { padding: 32px; }

/* Gaps */
.gap-12 { gap: 12px; }
.gap-20 { gap: 20px; }
.gap-32 { gap: 32px; }
```

---

## Conclusion

This design system provides a comprehensive foundation for implementing the landing page theme across all sections of The Specialist Realty website. By following these guidelines, you'll maintain consistency in:

- Color palette and accents
- Typography and readability
- Spacing and layout
- Component patterns
- Animations and interactions
- Responsive behavior

For questions or clarifications, refer to the original wireframe: `docs/wireframes/landing-page-new-content-option-2.html`

---

**Last Updated:** January 2026
**Based On:** landing-page-new-content-option-2.html
**Design System Version:** 1.0

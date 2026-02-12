# Our Services Page Plan
## The Specialist Realty - Services Page Implementation

**Created:** January 30, 2026  
**Reference Wireframe:** `docs/wireframes/how-we-work.html`  
**Design System:** `THEME_DESIGN_SYSTEM.md`  
**Content Reference:** `LANDING_PAGE_REVAMP_PLAN.md` (Phase 4)

---

## Overview

This document outlines the implementation plan for the 'Our Services' page, which will showcase The Specialist Realty's comprehensive real estate offerings. The page will follow the same design system and layout patterns as the 'How We Work' page.

---

## Page Structure

The page will consist of 4 main sections:

1. **Our Services** - Detailed explanation of 5 core services
2. **Listing Archive** - Property browsing and enlistment options
3. **Developer Selling** - Accreditation information with Learn More button
4. **Investor Relations** - Investment opportunities with Investments button

---

## Design System Alignment

The page will use the same design elements as `docs/wireframes/how-we-work.html`:

**Colors:**
- Primary: `--ink: #0d0f12`
- Secondary: `--steel: #1e2a36`
- Background: `--mist: #f0f2f4`
- Border: `--slate: #dde2e7`
- Accent: `--accent: #2f5f8f`, `--accent-light: #4d7bb0`
- Gold: `--gold: #D4AF37`

**Typography:**
- Headings: Space Grotesk (400, 500, 600, 700)
- Body: Space Grotesk
- Labels/Small: Space Mono

**Components:**
- Sticky header with navigation
- Page header with hero image and gradient overlay
- Card-based sections with hover effects
- Gold accent borders and backgrounds
- Responsive grid layouts
- CTA buttons with hover states

---

## Section 1: Our Services

### Purpose
Provide detailed explanations of the 5 core services offered by The Specialist Realty, expanding on the brief descriptions from the landing page.

### Content

**Header:**
- Eyebrow: "What We Do"
- Title: "Our Services"
- Intro: "Comprehensive real estate solutions for all your needs"

**Service Cards (5 cards):**

1. **Buying**
   - Brief: "Property search, negotiation, and purchase assistance"
   - Detail: "Whether you're looking for a condominium, house, or lot, we guide you through the entire buying process. From understanding your requirements and budget to property matching, site viewings, negotiation, and closing, we ensure you find the perfect property that aligns with your goals and lifestyle."

2. **Selling**
   - Brief: "Marketing, pricing strategy, and buyer qualification"
   - Detail: "Our selling process maximizes your property's exposure and value through strategic marketing. We conduct a thorough property assessment, develop a pricing strategy, implement a digital marketing system, match your property with qualified buyers, and manage all inquiries and viewings professionally."

3. **Leasing**
   - Brief: "Unit showcasing, tenant screening, and lease agreements"
   - Detail: "We help you find the right tenants for your property or the perfect rental for your needs. Our leasing services include property showcasing, comprehensive tenant screening, lease agreement preparation, and ongoing property management support to ensure a smooth landlord-tenant relationship."

4. **Documentation**
   - Brief: "Title transfer, deed preparation, and BIR coordination"
   - Detail: "Navigating real estate documentation can be complex. We handle all the paperwork for you, including title transfers, deed of sale preparation, BIR coordination, tax computation, and government document processing. Our expertise ensures all transactions are legally sound and compliant with regulations."

5. **Valuation**
   - Brief: "Market-based property assessments for informed decisions"
   - Detail: "Accurate property valuation is essential for buying, selling, or investment decisions. We provide comprehensive market-based assessments considering location, property condition, market trends, and comparable sales. Our valuations help you make informed decisions and understand the true value of your property."

### Layout
- 5-card grid layout (similar to landing page Phase 4)
- Responsive: 5 columns on large screens (≥1200px), auto-fit on smaller screens
- Each card displays service title and detailed explanation

### Styling
```css
.services-section {
  background: #fff;
  border-top: 1px solid var(--slate);
  border-bottom: 1px solid var(--slate);
  position: relative;
}

.services-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--grid) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  pointer-events: none;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

@media (min-width: 1200px) {
  .services-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.service-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border: 1px solid var(--slate);
  border-radius: 12px;
  padding: 32px 28px;
  min-height: 280px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.service-card:hover {
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15), 0 10px 30px rgba(13, 15, 18, 0.1);
  transform: translateY(-4px);
  border-color: rgba(212, 175, 55, 0.3);
}

.service-card::before {
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

.service-card:hover::before {
  opacity: 1;
}

.service-card h3 {
  margin: 0 0 16px;
  font-size: 22px;
  color: var(--ink);
  font-weight: 600;
}

.service-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--steel);
}
```

---

## Section 2: Listing Archive

### Purpose
Provide access to property listings and offer clients the opportunity to enlist their properties with The Specialist Realty.

### Content

**Header:**
- Eyebrow: "Property Marketplace"
- Title: "Listing Archive"
- Intro: "Explore our curated collection of properties for sale and rent, or partner with us to showcase your property to qualified buyers."

**Description:**
"Browse through our extensive portfolio of condominiums, houses, and lots across Metro Manila and beyond. Each listing is carefully verified and presented with professional photography and detailed information to help you make informed decisions. For property owners, we offer a comprehensive enlistment service that includes professional photography, strategic marketing, and access to our network of qualified buyers."

**CTA Buttons:**
1. **Browse our Listings** → Links to `/listings`
2. **Enlist** → Links to `/contact`

### Layout
- Full-width section with centered content
- Two CTA buttons arranged horizontally on desktop, stacked on mobile
- Clean, uncluttered design emphasizing the action buttons

### Styling
```css
.listing-archive-section {
  background: var(--mist);
  border-top: 1px solid var(--slate);
  border-bottom: 1px solid var(--slate);
}

.listing-archive-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.listing-archive-description {
  font-size: 16px;
  line-height: 1.8;
  color: var(--steel);
  margin: 24px 0 40px;
}

.listing-cta-row {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.listing-cta-row a {
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  min-width: 200px;
  text-align: center;
}

.listing-cta-row a:first-child {
  background: var(--ink);
  color: #fff;
  border: 1px solid var(--ink);
}

.listing-cta-row a:first-child:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.listing-cta-row a:nth-child(2) {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--ink);
}

.listing-cta-row a:nth-child(2):hover {
  background: var(--ink);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

@media (max-width: 600px) {
  .listing-cta-row {
    flex-direction: column;
  }
  
  .listing-cta-row a {
    width: 100%;
  }
}
```

---

## Section 3: Developer Selling

### Purpose
Showcase The Specialist Realty's accreditations with major developers and provide access to more detailed information.

### Content

**Header:**
- Eyebrow: "Official Partners"
- Title: "Developer Selling"

**Description:**
"The Specialist Realty is proud to be an accredited partner with major real estate developers across the Philippines. Our accreditations enable us to offer exclusive access to pre-selling projects, special pricing, and direct developer support. Whether you're interested in condominium projects, master-planned communities, or commercial properties, our developer partnerships provide you with trusted access to premium developments."

**Benefits List:**
- Direct access to developer inventory
- Special pricing and promotions
- Professional pre-selling guidance
- Turnover coordination support
- Developer relationship management

**CTA Button:**
- **Learn more** → Links to `/developer-selling` (page to be built in future)

### Layout
- Single-column layout centered
- Benefits list with bullet points
- CTA button prominently displayed

### Styling
```css
.developer-selling-section {
  background: #fff;
  border-top: 1px solid var(--slate);
  border-bottom: 1px solid var(--slate);
}

.developer-selling-content {
  max-width: 800px;
  margin: 0 auto;
}

.developer-selling-description {
  font-size: 16px;
  line-height: 1.8;
  color: var(--steel);
  margin-bottom: 32px;
}

.developer-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 40px;
}

.developer-benefits li {
  padding: 12px 0 12px 32px;
  font-size: 15px;
  color: var(--steel);
  position: relative;
  line-height: 1.6;
}

.developer-benefits li::before {
  content: "✓";
  position: absolute;
  left: 0;
  top: 12px;
  color: var(--gold);
  font-weight: 700;
  font-size: 18px;
}

.developer-cta {
  text-align: center;
}

.developer-cta a {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 8px;
  background: var(--accent-light);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.developer-cta a:hover {
  background: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
```

---

## Section 4: Investor Relations

### Purpose
Inform potential investors about real estate investment opportunities and development partnerships.

### Content

**Header:**
- Eyebrow: "Build Your Portfolio"
- Title: "Investor Relations"

**Description:**
"Beyond traditional buying and selling, The Specialist Realty offers avenues for strategic real estate investment and development partnerships. We work with investors looking to build their real estate portfolio, developers seeking distribution channels, and individuals interested in property development opportunities. Our team provides market analysis, investment advisory, and end-to-end support for your investment journey."

**Investment Areas:**
- Property portfolio building
- Pre-selling investment opportunities
- Joint venture partnerships
- Development consulting
- Market feasibility studies
- ROI analysis and reporting

**CTA Button:**
- **Investments** → Links to `/investor-relations` (page to be built in future)

### Layout
- Single-column layout centered
- Investment areas with bullet points
- CTA button prominently displayed
- Consistent with Developer Selling section layout

### Styling
```css
.investor-relations-section {
  background: var(--mist);
  border-top: 1px solid var(--slate);
  border-bottom: 1px solid var(--slate);
}

.investor-relations-content {
  max-width: 800px;
  margin: 0 auto;
}

.investor-relations-description {
  font-size: 16px;
  line-height: 1.8;
  color: var(--steel);
  margin-bottom: 32px;
}

.investor-areas {
  list-style: none;
  padding: 0;
  margin: 0 0 40px;
}

.investor-areas li {
  padding: 12px 0 12px 32px;
  font-size: 15px;
  color: var(--steel);
  position: relative;
  line-height: 1.6;
}

.investor-areas li::before {
  content: "◆";
  position: absolute;
  left: 0;
  top: 12px;
  color: var(--gold);
  font-size: 12px;
}

.investor-cta {
  text-align: center;
}

.investor-cta a {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 8px;
  background: var(--ink);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.investor-cta a:hover {
  background: var(--steel);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
```

---

## Page Header

### Design
- Same style as 'How We Work' wireframe
- Hero image background with dark gradient overlay
- Eye-catching title and description

### Content
- Eyebrow: "Our Expertise"
- Title: "Our Services"
- Description: "Discover comprehensive real estate solutions tailored to your needs. From buying and selling to investment opportunities, The Specialist Realty provides expert guidance for all your real estate endeavors."

### Hero Image
- Use a professional real estate/business image
- Suggested: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80` (office/meeting image)

### Styling
```css
.page-header {
  background-image: url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  border-bottom: 1px solid var(--slate);
  padding: 80px 0 60px;
}

.page-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(13, 15, 18, 0.92) 0%, rgba(13, 15, 18, 0.88) 50%, rgba(30, 42, 54, 0.85) 100%);
}

.page-header .container {
  position: relative;
  z-index: 1;
}

.page-header .eyebrow {
  color: var(--accent-light);
}

.page-header h1 {
  margin: 0 0 16px;
  color: #fff;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 700;
}

.page-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 18px;
  max-width: 700px;
  line-height: 1.7;
}
```

---

## CTA Section (Bottom)

### Purpose
Final call-to-action to encourage visitors to contact The Specialist Realty.

### Content
- Eyebrow: "Ready to Get Started?" (gold color)
- Title: "Let's Find Your Perfect Solution"
- Description: "Whether you're buying, selling, or exploring investment opportunities, our team is ready to guide you through every step of your real estate journey. Contact us today to discuss your needs."
- CTA Button: "Contact Us Today" → Links to `/contact`

### Layout
- Dark background (same as 'How We Work' CTA)
- Centered text with prominent button
- Consistent with existing CTA design

### Styling
```css
.cta {
  background: var(--steel);
  color: #fff;
}

.cta-inner {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta .eyebrow {
  color: var(--gold);
}

.cta h2 {
  color: #fff;
  margin: 0 0 16px;
  font-size: clamp(28px, 4vw, 42px);
}

.cta p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 32px;
}

.cta a {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 8px;
  background: var(--accent-light);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.cta a:hover {
  background: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
```

---

## Responsive Design

### Breakpoints

**Mobile (≤600px):**
- Services grid: 1 column
- CTA buttons: stacked vertically
- Padding: 60px per section
- Font sizes reduced

**Tablet (≤860px):**
- Services grid: 2-3 columns (auto-fit)
- Navigation: hidden
- CTA buttons: may stack depending on content

**Desktop (>860px):**
- Services grid: auto-fit (up to 5 columns)
- Navigation: visible
- Full layout

**Large Desktop (≥1200px):**
- Services grid: fixed 5 columns

---

## Testing Checklist

### Visual Testing
- [ ] Page header displays correctly with hero image and overlay
- [ ] All sections have consistent spacing (80px)
- [ ] Service cards display with proper grid layout
- [ ] Gold accents (borders, icons) display correctly
- [ ] Hover effects work on cards and buttons
- [ ] Dot grid background visible in Services section
- [ ] Text is readable on all backgrounds
- [ ] Font weights and sizes match design system

### Functional Testing
- [ ] "Browse our Listings" button links to `/listings`
- [ ] "Enlist" button links to `/contact`
- [ ] "Learn more" button links to `/developer-selling` (future page)
- [ ] "Investments" button links to `/investor-relations` (future page)
- [ ] "Contact Us Today" button links to `/contact`
- [ ] Navigation links work correctly
- [ ] No broken images

### Responsive Testing
- [ ] Mobile view (≤600px) tested
- [ ] Tablet view (≤860px) tested
- [ ] Desktop view (>860px) tested
- [ ] Large desktop view (≥1200px) tested
- [ ] Services grid adapts correctly
- [ ] CTA buttons stack properly on mobile
- [ ] No horizontal scrolling

### Accessibility Testing
- [ ] Color contrast ratios meet WCAG AA
- [ ] All interactive elements have focus states
- [ ] Alt text present for hero image
- [ ] Semantic HTML structure
- [ ] Keyboard navigation works
- [ ] Headings follow logical hierarchy

### Content Testing
- [ ] All 5 services display with detailed descriptions
- [ ] Listing Archive section has proper description
- [ ] Developer Selling section lists benefits
- [ ] Investor Relations section lists investment areas
- [ ] All CTA buttons have appropriate labels
- [ ] No spelling or grammatical errors

---

## File Structure

### New Files to Create
1. `src/app/services/page.tsx` - Main services page component

### Existing Files to Reference
- `docs/wireframes/how-we-work.html` - Design reference
- `LANDING_PAGE_REVAMP_PLAN.md` - Content reference (Phase 4)
- `THEME_DESIGN_SYSTEM.md` - Design system reference
- `src/app/globals.css` - CSS variables and global styles
- `src/components/ui/navbar.tsx` - Navigation component

---

## Implementation Phases

### Phase 1: Page Setup
- Create `src/app/services/page.tsx`
- Set up basic page structure
- Import fonts and apply layout
- Add page header with hero image

### Phase 2: Section 1 - Our Services
- Implement 5-card grid layout
- Add service cards with detailed descriptions
- Apply card styling with hover effects
- Add dot grid background

### Phase 3: Section 2 - Listing Archive
- Implement section header and description
- Add two CTA buttons
- Style buttons with proper hover states
- Test links to `/listings` and `/contact`

### Phase 4: Section 3 - Developer Selling
- Implement section with description
- Add benefits list
- Add "Learn more" button
- Link to `/developer-selling` (placeholder)

### Phase 5: Section 4 - Investor Relations
- Implement section with description
- Add investment areas list
- Add "Investments" button
- Link to `/investor-relations` (placeholder)

### Phase 6: CTA Section
- Implement bottom CTA section
- Add description and button
- Style with dark background
- Test link to `/contact`

### Phase 7: Navigation & Footer
- Update navigation to include "Services" link
- Ensure navigation highlighting works
- Keep existing footer (no changes)

### Phase 8: Responsive Optimization
- Test and adjust for all breakpoints
- Ensure proper stacking on mobile
- Verify spacing consistency
- Test navigation visibility

### Phase 9: Testing & Refinement
- Complete all testing checklist items
- Fix any visual or functional issues
- Verify cross-browser compatibility
- Performance optimization

---

## CSS Classes Reference

### Section Classes
```css
.services-section          /* Main services section with dot grid */
.listing-archive-section   /* Property marketplace section */
.developer-selling-section /* Developer partnerships section */
.investor-relations-section /* Investment opportunities section */
```

### Layout Classes
```css
.services-grid            /* 5-card grid for services */
.listing-cta-row          /* Two CTA buttons */
.developer-benefits       /* Benefits list for developer section */
.investor-areas          /* Investment areas list */
```

### Card Classes
```css
.service-card            /* Individual service card */
```

### Button Classes
```css
.cta-row                 /* Row of CTA buttons */
.cta a                   /* CTA button styling */
```

---

## Summary

This plan outlines the creation of a comprehensive 'Our Services' page that:

1. **Showcases 5 core services** with detailed explanations
2. **Provides listing access** through the Listing Archive section
3. **Highlights developer partnerships** with accreditation information
4. **Introduces investment opportunities** through Investor Relations
5. **Maintains design consistency** with the existing site theme
6. **Ensures responsive design** across all device sizes
7. **Provides clear navigation paths** to related pages
8. **Uses placeholder links** for future Developer Selling and Investor Relations pages

The page will serve as a central hub for understanding all services offered by The Specialist Realty, with clear calls-to-action directing visitors to appropriate next steps.

---

**Last Updated:** January 30, 2026  
**Status:** Ready to Implement  
**Next Step:** Phase 1 - Page Setup
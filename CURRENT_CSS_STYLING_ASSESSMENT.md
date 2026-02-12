# Current CSS & Styling Configuration Assessment

**Assessment Date:** January 27, 2026  
**Project:** The Specialist Realty - Next.js Application  
**Purpose:** Document current styling configuration before landing page revamp implementation

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Font Configuration](#2-font-configuration)
3. [CSS Variables](#3-css-variables)
4. [Global Styles](#4-global-styles)
5. [Component Styling](#5-component-styling)
6. [Color Usage Patterns](#6-color-usage-patterns)
7. [Spacing Patterns](#7-spacing-patterns)
8. [Border Radius Patterns](#8-border-radius-patterns)
9. [Shadow Patterns](#9-shadow-patterns)
10. [Typography Patterns](#10-typography-patterns)
11. [Key Observations](#11-key-observations)

---

## 1. Technology Stack

### Core Styling Technologies
- **Tailwind CSS v4** (latest version with PostCSS integration)
- **Next.js v16.0.8** (App Router architecture)
- **CSS Custom Properties** (CSS variables) for theming
- **Inline Styles** where Tailwind classes are insufficient

### Font Libraries
- **Geist** (via `geist` package)
- **Google Fonts** (via `next/font/google`)
  - Space Grotesk (400, 500, 600, 700)
  - Space Mono (400)
  - Sora (600)

### Icon Libraries
- **Lucide React** (v0.553.0) - Primary icon system
- Custom SVG icons for specific components

---

## 2. Font Configuration

### File: `src/app/lib/fonts.ts`

```typescript
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import { Sora } from 'next/font/google';

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  weight: ['400'],
});

export const sora = Sora({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-sora',
});
```

### Font Application (File: `src/app/layout.tsx`)

```typescript
<body
  className={`${spaceGrotesk.variable} ${spaceMono.variable} ${sora.variable} antialiased`}
>
```

### Font Usage Patterns

**Space Grotesk** (Variable: `--font-space-grotesk`)
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **Usage:** Main body text, headings, general typography
- **Status:** Defined but may not be actively applied in components

**Space Mono** (Variable: `--font-space-mono`)
- **Weight:** 400 (Regular only)
- **Usage:** Monospace needs (currently not visible in components)
- **Status:** Available but not used

**Sora** (Variable: `--font-sora`)
- **Weight:** 600 (Semi-Bold only)
- **Usage:** Logo/branding (`font-sora` class in navbar)
- **Application:** Applied via inline `style={{ fontFamily: 'var(--font-sora)' }}`
- **Status:** ✅ Actively used

**Geist Sans** (via `geist` package)
- **Usage:** Imported in layout but not actively used as variable
- **Status:** Default fallback font

---

## 3. CSS Variables

### File: `src/app/globals.css`

```css
:root {
  /* Existing variables */
  --background: #ffffff;
  --foreground: #111111;
  --border: #e5e7eb;
  --cta: #1f2937;
  --cta-hover: #1a232e;
  --gold: #D4AF37;
  --gold-light: #F4D03F;
  
  /* New Design System Variables - Phase 1 */
  /* Primary Colors */
  --ink: #0d0f12;
  --steel: #1e2a36;
  --mist: #f0f2f4;
  --slate: #dde2e7;
  
  /* Accent Colors */
  --accent: #2f5f8f;
  --accent-light: #4d7bb0;
  
  /* Effects */
  --grid: rgba(13, 15, 18, 0.08);
  --shadow: 0 20px 50px rgba(13, 15, 18, 0.18);
  --shadow-sm: 0 10px 24px rgba(13, 15, 18, 0.08);
}
```

### Variable Categories

#### Legacy Variables (Existing before Phase 1)

| Variable | Value | Usage |
|----------|--------|-------|
| `--background` | #ffffff | Main background color |
| `--foreground` | #111111 | Main text color |
| `--border` | #e5e7eb | Border color |
| `--cta` | #1f2937 | Call-to-action button color |
| `--cta-hover` | #1a232e | CTA hover state |
| `--gold` | #D4AF37 | Gold accent color |
| `--gold-light` | #F4D03F | Light gold variant |

**Status:** ✅ Actively used throughout components

#### Design System Variables (Phase 1 additions)

| Variable | Value | Purpose |
|----------|--------|---------|
| `--ink` | #0d0f12 | Very dark blue-gray (near black) |
| `--steel` | #1e2a36 | Dark blue-gray |
| `--mist` | #f0f2f4 | Light gray-blue |
| `--slate` | #dde2e7 | Medium gray-blue border color |
| `--accent` | #2f5f8f | Muted blue accent |
| `--accent-light` | #4d7bb0 | Lighter blue accent |
| `--grid` | rgba(13, 15, 18, 0.08) | Dot grid pattern color |
| `--shadow` | 0 20px 50px rgba(13, 15, 18, 0.18) | Large shadow |
| `--shadow-sm` | 0 10px 24px rgba(13, 15, 18, 0.08) | Small shadow |

**Status:** ⚠️ Defined but NOT YET APPLIED in components

---

## 4. Global Styles

### File: `src/app/globals.css`

#### Base Styles

```css
html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-feature-settings: "liga" 1, "calt" 1;
}
```

#### Animations

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-fade-in-up-delay {
  animation: fadeInUp 0.8s ease-out 0.2s forwards;
  opacity: 0;
}
```

**Usage:**
- `animate-fade-in-up`: Standard fade-in from below
- `animate-fade-in-up-delay`: Delayed version (0.2s delay)
- Applied in hero sections and cards

#### Blog Content Styling

```css
/* Blog content image styling - ensure consistent 16:9 aspect ratio */
.prose img {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

/* Blog image wrapper with optimized spacing */
.blog-image-wrapper {
  margin: 1rem 0;
  width: 100%;
}

.blog-image-wrapper img {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Context-aware spacing utilities */
.blog-image-wrapper:first-child,
.blog-image-wrapper.mt-0 {
  margin-top: 0;
}

.blog-image-wrapper:last-child,
.blog-image-wrapper.mb-0 {
  margin-bottom: 0;
}

.blog-image-wrapper.mt-2 {
  margin-top: 0.5rem;
}

.blog-image-wrapper.my-4 {
  margin: 1rem 0;
}

.blog-image-wrapper.before-heading {
  margin-bottom: 0.75rem;
}

/* Ensure images in blog content maintain aspect ratio when not wrapped in div */
.prose > img:not([class*="aspect"]) {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
}

/* Ensure images in aspect-video containers fill properly */
.prose div[class*="aspect-video"] img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Improved paragraph spacing for blog content */
.prose p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  font-size: 1.125rem;
}

.prose p:last-child {
  margin-bottom: 0;
}

/* Heading spacing - more space before, less after */
.prose h2,
.prose h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.prose h2:first-child,
.prose h3:first-child {
  margin-top: 0;
}

/* Image spacing relative to headings */
.prose h2 + .blog-image-wrapper,
.prose h3 + .blog-image-wrapper {
  margin-top: 0.5rem;
}

.blog-image-wrapper + .prose h2,
.blog-image-wrapper + .prose h3 {
  margin-top: 1rem;
}
```

---

## 5. Component Styling

### 5.1 Navbar Component

**File:** `src/components/ui/navbar.tsx`

#### Header Structure

```tsx
<header 
  className={`fixed top-0 w-full z-50 transition-all duration-300 ${
    shouldBeTransparent
      ? 'bg-transparent' 
      : 'bg-white/95 backdrop-blur-sm shadow-lg'
  }`}
>
```

#### Conditional Transparency Behavior

| State | Condition | Background |
|--------|------------|-------------|
| Transparent | Homepage AND scrolled < 50px | `bg-transparent` |
| Solid | Scrolled > 50px OR not homepage | `bg-white/95 backdrop-blur-sm shadow-lg` |

#### Navigation Links (Desktop)

```tsx
<nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
```

**Properties:**
- Hidden on mobile (breakpoint: `lg:` = 1024px)
- Centered layout with gap: 8
- Font: Geist Sans (`font-sans`)
- Colors:
  - Transparent state: `text-white decoration-white drop-shadow-md`
  - Solid state: `text-[#111111] decoration-[#111111]`
- Hover effect: `hover:underline underline-offset-4`

**Links:**
- Home
- Listings
- Blog
- Contact
- Dashboard (if authenticated)

#### CTA Buttons

```tsx
<Link
  href="/contact"
  className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-5 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 relative overflow-hidden group"
>
  <span className="relative z-10">Contact Us</span>
  <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
</Link>
```

**Gradient:**
- Normal: `from-[#1F2937] to-[#111111]` (dark gray to black)
- Hover: `from-[#1A232E] to-[#0F1419]` (slightly lighter)
- Accent: Gold overlay `from-[#D4AF37]/10 to-transparent` on hover

#### Logo Styling

```tsx
<Link
  href="/"
  className={`text-lg lg:text-2xl font-[600] font-sora flex-shrink-0 transition-colors ${
    shouldBeTransparent
      ? 'text-white drop-shadow-lg' 
      : 'text-[#111111]'
  }`}
  style={{ fontFamily: 'var(--font-sora)' }}
>
  The Specialist Realty
</Link>
```

**Properties:**
- Font: Sora 600 (via inline style)
- Size: `text-lg` on mobile, `lg:text-2xl` on desktop
- Color: White (transparent) or black (#111111)
- Shadow: `drop-shadow-lg` when transparent

#### Mobile Navigation

**Desktop Buttons Container:**
```tsx
<div className="hidden lg:flex items-center gap-3 flex-shrink-0 ml-12">
```

**Mobile Buttons Container:**
```tsx
<div className="lg:hidden ml-auto flex items-center gap-1.5 flex-shrink-0">
```

**Mobile Drawer:**
```tsx
{isOpen && (
  <div className="lg:hidden bg-white border-t border-[#E5E7EB] px-4 py-6 space-y-5">
    {/* Mobile links */}
  </div>
)}
```

---

### 5.2 Hero Section (Landing Page)

**File:** `src/app/page.tsx`

#### Section Structure

```tsx
<section className="relative w-full h-screen min-h-[100vh] mb-24 sm:mb-28 md:mb-32">
```

#### Background

```tsx
<div className="absolute inset-0 w-full h-full">
  <Image
    src="/images/hero-condo.jpg"
    alt="Luxury Condo Facade"
    fill
    priority
    className="object-cover"
    sizes="100vw"
  />
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
</div>
```

**Properties:**
- Image: Full viewport coverage
- Overlay: Gradient `from-black/60 via-black/50 to-black/70`
- Purpose: Better text readability

#### Content Panel

```tsx
<div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-[2px] rounded-2xl p-6 md:p-8 lg:p-12 shadow-2xl border border-white/5 text-center">
```

**Glassmorphism:**
- Background: `bg-white/5` (5% white opacity)
- Blur: `backdrop-blur-[2px]` (very subtle)
- Border: `border-white/5`
- Corner radius: `rounded-2xl`
- Shadow: `shadow-2xl`

#### Typography

```tsx
<h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-5 md:mb-6 leading-tight tracking-tight">
  Real Estate Solutions. Made Even Easier.
</h1>
```

**Properties:**
- Size: Responsive `text-4xl sm:text-5xl md:text-6xl`
- Weight: `font-semibold`
- Color: White
- Leading: `leading-tight`
- Tracking: `tracking-tight`

```tsx
<p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed mx-auto tracking-wide">
  Sales · Rentals · Documentation assistance across Metro Manila and nearby cities.
</p>
```

**Properties:**
- Size: `text-lg md:text-xl lg:text-2xl`
- Color: `text-white/90` (90% opacity white)
- Leading: `leading-relaxed`
- Tracking: `tracking-wide`

#### CTA Buttons

```tsx
<div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
  <a
    href="/listings"
    className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 md:px-8 py-3 md:py-4 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 text-center font-medium text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group"
  >
    <span className="relative z-10">View Properties</span>
    <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
  </a>
</div>
```

**Button Properties:**
- Gradient: Same as navbar CTA
- Size: Responsive padding `px-6 md:px-8 py-3 md:py-4`
- Text: `text-base md:text-lg font-medium`
- Hover: `hover:-translate-y-0.5` with larger shadow
- Gold accent overlay on hover

#### Search Bar

```tsx
<div className="pb-8 md:pb-12 px-4 md:px-6 relative z-10">
  <HeroSearch />
</div>
```

**Spacing:** Bottom padding `pb-8 md:pb-12`

---

### 5.3 Why Choose Us Section

**File:** `src/app/page.tsx`

#### Section Structure

```tsx
<section className="py-28 bg-white">
```

**Properties:**
- Padding: `py-28` (7rem = 112px)
- Background: White

#### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
```

**Breakpoints:**
- Mobile: 1 column
- Desktop (md+): 3 columns
- Gap: `gap-8`

#### Card Styling

```tsx
<div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
  <div className="relative h-64 w-full">
    <Image
      src="https://images.unsplash.com/..."
      alt="Licensed & Experienced"
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
      loading="lazy"
    />
  </div>
  <div className="p-6">
    <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">
      Licensed & Experienced
    </h3>
    <p className="text-[#111111]/80 leading-relaxed tracking-wide">
      Licensed PRC Real Estate Broker offering industry expertise and a smooth, hassle-free client experience.
    </p>
  </div>
</div>
```

**Card Properties:**
- Background: White
- Radius: `rounded-xl`
- Shadow: `shadow-lg` → `hover:shadow-2xl`
- Hover: `hover:-translate-y-1` (elevate up)
- Image height: `h-64` (16rem = 256px)
- Content padding: `p-6`

#### Typography

**Heading (H3):**
- Size: `text-2xl`
- Weight: `font-semibold`
- Color: `text-[#111111]`
- Spacing: `mb-3`
- Tracking: `tracking-tight`

**Body Text:**
- Color: `text-[#111111]/80` (80% opacity)
- Leading: `leading-relaxed`
- Tracking: `tracking-wide`

---

### 5.4 Services Section

**File:** `src/app/page.tsx`

#### Section Structure

```tsx
<section className="py-28 bg-white">
```

#### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

**Breakpoints:**
- Mobile: 1 column
- Tablet (md+): 2 columns
- Desktop (lg+): 3 columns
- Gap: `gap-6`

#### Service Card Styling

```tsx
<div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 space-y-3">
  <div className="h-10 w-10 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center shadow-md">
    <HomeIcon size={20} className="text-white" />
  </div>
  <h3 className="text-lg font-semibold text-[#111111] tracking-tight">
    Property Buying Assistance
  </h3>
  <p className="text-[#111111]/60 text-sm leading-relaxed tracking-wide">
    Guidance on choosing the right property, negotiating effectively, and completing the transaction smoothly.
  </p>
</div>
```

**Card Properties:**
- Background: White
- Radius: `rounded-xl`
- Padding: `p-6`
- Shadow: `shadow-lg` → `hover:shadow-2xl`
- Hover: `hover:-translate-y-1`
- Internal spacing: `space-y-3`

#### Icon Container

```tsx
<div className="h-10 w-10 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-lg flex items-center justify-center shadow-md">
  <HomeIcon size={20} className="text-white" />
</div>
```

**Properties:**
- Size: `h-10 w-10` (2.5rem = 40px)
- Gradient: `from-[#1F2937] to-[#111111]`
- Radius: `rounded-lg`
- Icon: Lucide, 20px, white color
- Shadow: `shadow-md`

#### Typography

**Heading (H3):**
- Size: `text-lg`
- Weight: `font-semibold`
- Color: `text-[#111111]`
- Tracking: `tracking-tight`

**Body Text:**
- Size: `text-sm`
- Color: `text-[#111111]/60` (60% opacity)
- Leading: `leading-relaxed`
- Tracking: `tracking-wide`

---

### 5.5 Featured Listings (ListingCard Component)

**File:** `src/components/listings/ListingCard.tsx`

#### Card Container

```tsx
<Link
  href={`/listings/${listing.id}`}
  className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block group border border-[#E5E7EB] ${className}`}
>
```

**Properties:**
- Background: White
- Radius: `rounded-xl`
- Border: `border border-[#E5E7EB]`
- Shadow: `shadow-md` → `hover:shadow-xl`
- Hover: `hover:-translate-y-1` + `group-hover:scale-105` on image
- Transition: `transition-all duration-300`

#### Image Section

```tsx
<div className="relative h-56 w-full overflow-hidden bg-gray-100">
  <Image
    src={listing.image}
    alt={listing.title || `Property in ${listing.city}`}
    fill
    className="object-cover transition-transform duration-500 group-hover:scale-105"
    sizes={imageSizes}
    loading="lazy"
  />
  <div className="absolute top-3 right-3">
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
        listing.listingType === 'rent' ? 'bg-[#D4AF37]/95 text-white' : 'bg-[#1F2937]/95 text-white'
      }`}
    >
      {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
    </span>
  </div>
</div>
```

**Properties:**
- Image height: `h-56` (14rem = 224px)
- Background: `bg-gray-100` (fallback)
- Image hover: `group-hover:scale-105` (5% zoom)
- Badge position: `top-3 right-3`
- Badge colors:
  - Rent: Gold `bg-[#D4AF37]/95`
  - Sale: Dark `bg-[#1F2937]/95`
- Badge styles: `text-xs font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm`

#### Content Section

```tsx
<div className="p-5">
```

**Padding:** `p-5`

#### Title

```tsx
<h3 className="text-sm font-semibold text-[#111111] line-clamp-1 leading-tight">
  {formatBedroomsForTitle(listing.bedrooms, listing.type)}
  {propertyTypeMap[listing.type || ''] || listing.type || 'Property'}
  {' for '}
  {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
</h3>
```

**Properties:**
- Size: `text-sm`
- Weight: `font-semibold`
- Color: `text-[#111111]`
- Truncation: `line-clamp-1`
- Leading: `leading-tight`

#### Price

```tsx
<p className="text-2xl md:text-3xl font-bold text-[#111111] tracking-tight w-full">
  {hasPrice ? `₱${priceValue.toLocaleString()}` : 'Price on request'}
  {hasPrice && listing.listingType === 'rent' && (
    <span className="text-base font-medium text-[#111111]/60 ml-1">/mo</span>
  )}
</p>
```

**Properties:**
- Size: `text-2xl md:text-3xl`
- Weight: `font-bold`
- Color: `text-[#111111]`
- Tracking: `tracking-tight`
- Per month: `text-base font-medium text-[#111111]/60`

#### Property Details Grid

```tsx
<div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-[#E5E7EB]">
  <div className="flex items-center gap-1.5">
    <Bed size={16} className="text-[#1F2937] flex-shrink-0" />
    <span className="text-xs font-medium text-[#111111]/80">{bedroomsText}</span>
  </div>
  <div className="flex items-center gap-1.5">
    <Bath size={16} className="text-[#1F2937] flex-shrink-0" />
    <span className="text-xs font-medium text-[#111111]/80">{listing.bathrooms}</span>
  </div>
  <div className="flex items-center gap-1.5">
    <Square size={16} className="text-[#1F2937] flex-shrink-0" />
    <span className="text-xs font-medium text-[#111111]/80">{listing.size} sqm</span>
  </div>
</div>
```

**Properties:**
- Layout: 3-column grid
- Gap: `gap-2`
- Border bottom: `border-b border-[#E5E7EB]`
- Icon size: 16px
- Icon color: `text-[#1F2937]`
- Text size: `text-xs font-medium`
- Text color: `text-[#111111]/80`

#### Additional Details

```tsx
<div className="flex flex-wrap gap-2 mb-3 text-xs text-[#111111]/60">
  <div className="flex items-center gap-1">
    <Car size={14} className="text-[#1F2937] flex-shrink-0" />
    <span>{listing.parking}</span>
  </div>
  <div className="flex items-center gap-1">
    <Layers size={14} className="text-[#1F2937] flex-shrink-0" />
    <span>Floor {listing.floor}/{listing.totalFloors}</span>
  </div>
  <div className="flex items-center gap-1">
    <Calendar size={14} className="text-[#1F2937] flex-shrink-0" />
    <span>{listing.yearBuilt}</span>
  </div>
</div>
```

**Properties:**
- Layout: Flex wrap
- Gap: `gap-2`
- Text size: `text-xs`
- Text color: `text-[#111111]/60`
- Icon size: 14px
- Icon color: `text-[#1F2937]`

#### Location

```tsx
<div className="flex items-start gap-1.5">
  <MapPin size={14} className="text-[#1F2937] flex-shrink-0 mt-0.5" />
  <span className="text-sm text-[#111111]/70 line-clamp-2 leading-snug">
    {formatLocationWithLabel(listing.city, listing.location, listing.address)}
  </span>
</div>
```

**Properties:**
- Text size: `text-sm`
- Text color: `text-[#111111]/70`
- Truncation: `line-clamp-2`
- Leading: `leading-snug`
- Icon size: 14px
- Icon offset: `mt-0.5`

#### Property Type Badge

```tsx
<div className="flex justify-start">
  <span className="inline-block bg-[#F9FAFB] text-[#1F2937] px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide border border-[#E5E7EB]">
    {propertyTypeMap[listing.type || ''] || listing.type || 'Property'}
  </span>
</div>
```

**Properties:**
- Background: `bg-[#F9FAFB]` (light gray)
- Text color: `text-[#1F2937]` (dark gray)
- Padding: `px-3 py-1.5`
- Radius: `rounded-lg`
- Size: `text-xs font-medium`
- Tracking: `tracking-wide`
- Border: `border border-[#E5E7EB]`

---

### 5.6 Hero Search Component

**File:** `src/components/ui/hero-search.tsx`

#### Container

```tsx
<form 
  onSubmit={handleSearch}
  className="w-full max-w-5xl mx-auto"
>
  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3 sm:p-4 md:p-4">
```

**Properties:**
- Max width: `max-w-5xl` (80rem = 1280px)
- Background: `bg-white/95` (95% white opacity)
- Blur: `backdrop-blur-sm`
- Radius: `rounded-xl`
- Shadow: `shadow-2xl`
- Padding: Responsive `p-3 sm:p-4 md:p-4`

#### Form Layout

```tsx
<div className="flex flex-col md:flex-row gap-3 md:gap-3">
```

**Breakpoints:**
- Mobile: Column layout
- Desktop (md+): Row layout

#### Input Field (Location)

```tsx
<div className="relative">
  <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F2937]" />
  <input
    type="text"
    id="location"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    placeholder="Location"
    aria-label="Search by location"
    className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] placeholder:text-[#111111]/50 text-sm md:text-base"
  />
</div>
```

**Properties:**
- Icon: 18px, absolute positioning `left-3 top-1/2`
- Icon color: `text-[#1F2937]`
- Padding: `pl-10 pr-4 py-2.5 md:py-3`
- Border: `border border-[#E5E7EB]`
- Radius: `rounded-lg`
- Focus: `focus:ring-2 focus:ring-[#1F2937] focus:border-transparent`
- Text color: `text-[#111111]`
- Placeholder: `placeholder:text-[#111111]/50`
- Size: `text-sm md:text-base`

#### Select Dropdowns (Property Type, Sale/Rent)

```tsx
<select
  id="propertyType"
  value={propertyType}
  onChange={(e) => setPropertyType(e.target.value)}
  aria-label="Filter by property type"
  className="w-full px-4 py-2.5 md:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white text-sm md:text-base"
>
```

**Properties:**
- Padding: `px-4 py-2.5 md:py-3`
- Border: `border border-[#E5E7EB]`
- Radius: `rounded-lg`
- Focus: Same as input
- Background: `bg-white`
- Text color: `text-[#111111]`
- Size: `text-sm md:text-base`

#### Search Button

```tsx
<button
  type="submit"
  className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium text-sm md:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group flex items-center justify-center gap-2 whitespace-nowrap"
>
  <Search size={18} className="relative z-10" />
  <span className="relative z-10 hidden sm:inline">Search</span>
  <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
</button>
```

**Properties:**
- Gradient: Same as other CTAs
- Padding: Responsive `px-6 md:px-8 py-2.5 md:py-3`
- Icon: 18px, `relative z-10`
- Text: `text-sm md:text-base font-medium`
- Hidden on mobile: `hidden sm:inline` (icon only on mobile)
- Hover: Gold overlay animation
- Transform: `hover:-translate-y-0.5`
- Shadow: `shadow-lg hover:shadow-xl`

---

### 5.7 Featured Listings Container

**File:** `src/components/featured-listings.tsx`

#### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {normalizedListings.map((listing) => (
    <ListingCard
      key={listing.id}
      listing={listing}
      imageSizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
    />
  ))}
</div>
```

**Breakpoints:**
- Mobile: 1 column
- Tablet (md+): 2 columns
- Desktop (lg+): 4 columns
- Gap: `gap-6`

#### Loading State

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {[1, 2, 3, 4].map((i) => (
    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-64 bg-gray-200"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  ))}
</div>
```

**Skeleton Properties:**
- Animation: `animate-pulse`
- Image placeholder: `h-64 bg-gray-200`
- Content lines: Various widths (`w-3/4`, `w-1/2`, `w-1/3`)

---

### 5.8 CTA Section

**File:** `src/app/page.tsx`

#### Section Structure

```tsx
<section className="py-28 bg-white relative overflow-hidden">
```

#### Grid Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

**Breakpoints:**
- Mobile: 1 column
- Desktop (lg+): 2 columns
- Gap: `gap-6`

#### Left Card (Content)

```tsx
<div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 left-0 w-96 h-96 bg-[#1F2937] rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1F2937] rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
  </div>
  
  <div className="relative z-10 px-8 md:px-12 py-12 md:py-16 h-full flex flex-col justify-center">
    <div className="mb-6 flex justify-center lg:justify-start">
      <div className="h-20 w-20 bg-gradient-to-br from-[#1F2937] to-[#111111] rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
    
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#111111] mb-6 tracking-tight">
      Ready to Find Your Perfect Property?
    </h2>
    <p className="text-lg md:text-xl text-[#111111]/80 mb-8 leading-relaxed tracking-wide">
      Let's work together to make your real estate dreams a reality. Get in touch with our expert team today.
    </p>
    
    <div className="flex justify-center lg:justify-start">
      <a
        href="/contact"
        className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-8 py-4 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group inline-block"
      >
        <span className="relative z-10">Contact Us</span>
        <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </a>
    </div>
  </div>
</div>
```

**Properties:**
- Background: White with decorative blur circles
- Radius: `rounded-2xl`
- Border: `border border-gray-200`
- Shadow: `shadow-2xl`
- Icon: Large circular container `h-20 w-20` with gradient
- Heading: `text-3xl md:text-4xl lg:text-5xl`
- Body: `text-lg md:text-xl`
- Button: Same gradient pattern as other CTAs

#### Right Card (Image)

```tsx
<div className="relative rounded-2xl overflow-hidden shadow-2xl h-full min-h-[400px] lg:min-h-[500px]">
  <Image
    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"
    alt="Real Estate Professional Consultation"
    fill
    className="object-cover"
    sizes="(max-width: 1024px) 100vw, 50vw"
    loading="lazy"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
</div>
```

**Properties:**
- Radius: `rounded-2xl`
- Shadow: `shadow-2xl`
- Min height: `min-h-[400px] lg:min-h-[500px]`
- Overlay: `from-black/20 to-transparent`

---

### 5.9 Footer Component

**File:** `src/components/ui/footer.tsx`

#### Container

```tsx
<footer className="bg-[#1F2937] border-t border-[#374151] relative z-20">
```

**Properties:**
- Background: Dark gray `bg-[#1F2937]`
- Border: `border-t border-[#374151]`
- Z-index: `z-20`

#### Main Content

```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
```

**Breakpoints:**
- Mobile: 1 column
- Tablet (md+): 2 columns
- Desktop (lg+): 4 columns
- Gap: `gap-8`

#### Column 1: Branding

```tsx
<div>
  <div className="mb-4">
    <h3 className="text-xl font-semibold text-white mb-2">
      The Specialist - Realty Solutions & Services
    </h3>
    <p className="text-sm text-white/70">REBL PRC License # 33422</p>
  </div>
  
  <div className="flex gap-4 mt-8">
    <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="Facebook">
      <Facebook size={20} />
    </a>
    <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="Twitter">
      <Twitter size={20} />
    </a>
    <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="Instagram">
      <Instagram size={20} />
    </a>
    <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="LinkedIn">
      <Linkedin size={20} />
    </a>
  </div>
</div>
```

**Properties:**
- Heading: `text-xl font-semibold text-white`
- License: `text-sm text-white/70`
- Social icons: 20px, `text-white/70` → `hover:text-white`
- Gap: `gap-4`

#### Column 2: Quick Links

```tsx
<div>
  <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
  <ul className="space-y-2">
    <li>
      <Link href="/" className="text-white/70 hover:text-white transition-colors">
        Home
      </Link>
    </li>
    {/* More links */}
  </ul>
</div>
```

**Properties:**
- Heading: `text-lg font-semibold text-white`
- Links: `text-white/70 hover:text-white transition-colors`
- List spacing: `space-y-2`

#### Column 3: Services

```tsx
<div>
  <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
  <ul className="space-y-2">
    <li>
      <span className="text-white/70">Buying Assistance</span>
    </li>
    {/* More services */}
  </ul>
</div>
```

**Properties:**
- Heading: Same as quick links
- Items: `text-white/70` (not links)

#### Column 4: Contact

```tsx
<div>
  <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
  <ul className="space-y-3">
    <li className="flex items-center gap-2 text-white/70">
      <Phone size={18} className="text-white" />
      <span>+63 921 2303011</span>
    </li>
    <li className="flex items-center gap-2 text-white/70">
      <Mail size={18} className="text-white" />
      <span>thespecialistrss@gmail.com</span>
    </li>
    <li className="flex items-start gap-2 text-white/70">
      <MapPin size={18} className="text-white mt-1" />
      <span>Las Pinas City</span>
    </li>
  </ul>
  
  <div className="mt-6">
    <Link
      href="/contact"
      className="inline-block bg-white text-[#1F2937] px-6 py-2 rounded-md hover:bg-white/90 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      Contact Us
    </Link>
  </div>
</div>
```

**Properties:**
- Icons: 18px, white color
- Text: `text-white/70`
- Gap: `gap-2` (items), `space-y-3` (list)
- Button: White background, dark text, same hover effects

#### Bottom Bar

```tsx
<div className="border-t border-[#374151]">
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
    <div className="text-center text-sm text-white/70">
      <p>© The Specialist - Realty Solutions & Services. All rights reserved 2025.</p>
    </div>
  </div>
</div>
```

**Properties:**
- Border: `border-t border-[#374151]`
- Text: `text-sm text-white/70`
- Alignment: Center

---

## 6. Color Usage Patterns

### Primary Colors

| Name | Hex | Usage | CSS Variable |
|-------|------|--------|--------------|
| Black | #111111 | Primary text, headings | `--foreground` |
| Dark Gray | #1F2937 | CTA buttons, icon containers | `--cta` |
| Light Gray | #1A232E | Hover state for dark gray | `--cta-hover` |
| Medium Gray | #E5E7EB | Borders | `--border` |
| Light Gray 2 | #F9FAFB | Badges, backgrounds | - |
| White | #ffffff | Primary background | `--background` |
| Dark Gray 2 | #374151 | Footer borders | - |

### Accent Colors

| Name | Hex | Usage | CSS Variable |
|-------|------|--------|--------------|
| Gold | #D4AF37 | Badges, hover accents | `--gold` |
| Light Gold | #F4D03F | Hover state for gold | `--gold-light` |

### Text Colors

| Name | Hex | Tailwind | Usage |
|-------|------|----------|--------|
| Primary text | #111111 | `text-[#111111]` | Headings, body text |
| Secondary text 80% | rgba(17,17,17,0.8) | `text-[#111111]/80` | Descriptions |
| Secondary text 70% | rgba(17,17,17,0.7) | `text-[#111111]/70` | Footer links |
| Secondary text 60% | rgba(17,17,17,0.6) | `text-[#111111]/60` | Labels |
| Secondary text 50% | rgba(17,17,17,0.5) | `text-[#111111]/50` | Placeholders |
| White | #ffffff | `text-white` | Hero text, badges |
| White 90% | rgba(255,255,255,0.9) | `text-white/90` | Hero descriptions |
| White 70% | rgba(255,255,255,0.7) | `text-white/70` | Footer content |

### Background Colors

| Name | Hex | Tailwind | Usage |
|-------|------|----------|--------|
| White | #ffffff | `bg-white` | Primary background |
| Light Gray | #F9FAFB | `bg-[#F9FAFB]` | Badges |
| Gray 100 | #E5E7EB | Border color | - |
| Dark Gray | #1F2937 | `bg-[#1F2937]` | Footer, buttons |
| White with opacity | rgba(255,255,255,0.95) | `bg-white/95` | Glassmorphism |

### Gradient Patterns

**Dark Gradient (Buttons):**
```
from-[#1F2937] to-[#111111]
hover:from-[#1A232E] hover:to-[#0F1419]
```

**Dark Gradient with Gold Accent (Hover):**
```
from-[#1F2937] to-[#111111]
bg-[#D4AF37]/10 to-transparent (overlay)
```

**Image Overlays:**
```
from-black/60 via-black/50 to-black/70 (hero)
from-black/20 to-transparent (cards)
```

---

## 7. Spacing Patterns

### Section Padding

| Pattern | Tailwind | Value | Usage |
|----------|----------|--------|--------|
| Standard section | `py-28` | 7rem (112px) | Most sections |
| Mobile section | `py-6` | 1.5rem (24px) | Compact sections |
| Large section | `py-32` | 8rem (128px) | Hero bottom padding |

### Container

| Pattern | Tailwind | Value | Usage |
|----------|----------|--------|--------|
| Standard container | `max-w-7xl` | 1280px | All sections |
| Narrow container | `max-w-4xl` | 896px | Hero content |
| Medium container | `max-w-5xl` | 1024px | Search bar |
| Horizontal padding | `px-4 md:px-6` | 1rem/1.5rem | Mobile/desktop |

### Card Padding

| Pattern | Tailwind | Value | Usage |
|----------|----------|--------|--------|
| Standard card | `p-6` | 1.5rem (24px) | Most cards |
| Compact card | `p-5` | 1.25rem (20px) | Listing cards |
| Large card | `p-8 md:p-12 lg:p-12` | 2rem/3rem/3rem | Hero panel |

### Grid Gaps

| Pattern | Tailwind | Value | Usage |
|----------|----------|--------|--------|
| Tight gap | `gap-2` | 0.5rem (8px) | Icon labels |
| Standard gap | `gap-3` | 0.75rem (12px) | Form inputs |
| Medium gap | `gap-6` | 1.5rem (24px) | Cards |
| Wide gap | `gap-8` | 2rem (32px) | Footer columns |

### Margin Patterns

| Pattern | Tailwind | Value | Usage |
|----------|----------|--------|--------|
| Section margin bottom | `mb-24 sm:mb-28 md:mb-32` | 6rem/7rem/8rem | Hero bottom |
| Element margin bottom | `mb-2` to `mb-8` | 0.5rem to 2rem | Various |
| Auto center | `mx-auto` | - | Centered elements |
| Horizontal spacing | `ml-12` | 3rem | Desktop buttons |

---

## 8. Border Radius Patterns

| Pattern | Tailwind | Value | Usage |
|----------|----------|--------|--------|
| Small rounded | `rounded-md` | 0.375rem (6px) | Buttons, inputs |
| Medium rounded | `rounded-lg` | 0.5rem (8px) | Icons, dropdowns |
| Large rounded | `rounded-xl` | 0.75rem (12px) | Cards |
| Extra large rounded | `rounded-2xl` | 1rem (16px) | Hero, CTA panels |
| Full rounded | `rounded-full` | 50% | User badges, circles |

---

## 9. Shadow Patterns

| Pattern | Tailwind | Usage |
|----------|----------|--------|
| Small | `shadow-sm` | Subtle elevation |
| Medium | `shadow-md` | Cards, buttons |
| Large | `shadow-lg` | Card hover, buttons |
| Extra large | `shadow-xl` | Card hover, buttons |
| Extra extra large | `shadow-2xl` | Hero search, CTA panels |

### Shadow Progression (Hover)

```
shadow-md → hover:shadow-xl
shadow-lg → hover:shadow-2xl
```

---

## 10. Typography Patterns

### Heading Sizes

| Level | Mobile | Tablet | Desktop | Weight |
|-------|--------|---------|----------|---------|
| H1 | `text-4xl` | `text-5xl` | `text-6xl` | `font-semibold` |
| H2 | `text-4xl` | - | `text-5xl` | `font-semibold` |
| H3 (cards) | - | - | `text-2xl` | `font-semibold` |
| H3 (services) | - | - | `text-lg` | `font-semibold` |

### Body Text Sizes

| Usage | Mobile | Tablet | Desktop | Weight |
|-------|--------|---------|----------|---------|
| Lead | `text-lg` | `text-xl` | `text-2xl` | - |
| Body | `text-base` | - | - | - |
| Small | `text-sm` | - | - | - |
| Extra small | `text-xs` | - | - | `font-medium` |

### Font Weights

| Weight | Usage |
|--------|--------|
| Regular (400) | Body text |
| Medium (500) | Subheadings |
| Semi-bold (600) | Headings, buttons |
| Bold (700) | Emphasis |

### Text Colors

| Usage | Color | Tailwind |
|-------|--------|----------|
| Primary text | #111111 | `text-[#111111]` |
| Secondary (80%) | rgba(17,17,17,0.8) | `text-[#111111]/80` |
| Secondary (70%) | rgba(17,17,17,0.7) | `text-[#111111]/70` |
| Secondary (60%) | rgba(17,17,17,0.6) | `text-[#111111]/60` |
| Secondary (50%) | rgba(17,17,17,0.5) | `text-[#111111]/50` |
| White | #ffffff | `text-white` |

### Text Properties

| Property | Value | Usage |
|-----------|---------|--------|
| Leading tight | `leading-tight` | Headings |
| Leading relaxed | `leading-relaxed` | Descriptions |
| Tracking tight | `tracking-tight` | Headings |
| Tracking wide | `tracking-wide` | Descriptions, badges |
| Truncation 1 line | `line-clamp-1` | Card titles |
| Truncation 2 lines | `line-clamp-2` | Locations |

---

## 11. Key Observations

### Strengths

1. ✅ **Clean Tailwind utility-first approach**
   - Consistent use of utility classes
   - Easy to maintain and modify
   - Responsive design built-in

2. ✅ **Consistent color palette**
   - Well-defined color system
   - CSS variables for easy updates
   - Good contrast ratios

3. ✅ **Responsive design throughout**
   - Mobile-first approach
   - Breakpoints at sm, md, lg
   - Proper spacing adjustments

4. ✅ **Good accessibility**
   - Aria labels on inputs
   - Focus states on interactive elements
   - Alt text for images

5. ✅ **Smooth animations and transitions**
   - Consistent transition duration
   - Hover effects provide feedback
   - Fade-in animations for content

### Areas for Improvement (for Landing Page Revamp)

1. ⚠️ **Design system variables defined but not applied**
   - New variables (--ink, --steel, --mist, --slate, --accent) exist
   - Components still use hardcoded values
   - Need to migrate to use CSS variables

2. ⚠️ **Font variables inconsistent usage**
   - Sora applied via inline style
   - Space Grotesk and Space Mono defined but not used
   - Need consistent application via CSS classes

3. ❌ **No glassmorphism effects**
   - Current design uses flat backgrounds
   - New design requires backdrop-blur effects
   - Need to implement blur and transparency

4. ⚠️ **Limited use of gradients**
   - Only used on CTA buttons
   - New design wants more gradient usage
   - Expand gradient applications

5. ❌ **No dot grid backgrounds**
   - Plain white backgrounds
   - New design wants subtle dot patterns
   - Need to implement radial gradient patterns

6. ⚠️ **Cards lack premium hover effects**
   - Basic elevation (translateY)
   - New design wants gold border accents
   - Need to add gold-tinted shadows and borders

### Potential Conflicts with LANDING_PAGE_REVAMP_PLAN

| Area | Current State | Plan Requirement | Conflict |
|-------|---------------|-------------------|-----------|
| **Navbar links** | Home, Listings, Blog, Contact, Dashboard | Home, How We Work, Listings, Contact | ⚠️ Blog link needs removal |
| **Mobile navigation** | Visible with hamburger menu | Hidden on mobile ≤860px | ⚠️ Hide completely |
| **Hero structure** | Single panel with image background | Split layout with two panels | ❌ Complete redesign |
| **Hero glassmorphism** | Subtle `bg-white/5 backdrop-blur-[2px]` | Strong glassmorphism with blur | ⚠️ Enhance blur |
| **Font application** | Sora inline, others not used | Consistent CSS variable usage | ⚠️ Need refactoring |
| **Design system variables** | Defined but unused | Replace/supplement legacy | ❌ Need migration |
| **Gradients** | Buttons only | Expanded usage (hero, cards) | ⚠️ Add more gradients |
| **Dot grid backgrounds** | None | Subtle patterns on sections | ❌ Need implementation |
| **Card hover effects** | Basic elevation | Gold accents, premium shadows | ⚠️ Enhance effects |

### Recommendations for Implementation

1. **Phase 1 (Foundation):**
   - ✅ Keep existing legacy variables
   - ✅ Add new design system variables (already done)
   - ⚠️ Apply font variables consistently
   - ⚠️ Update base typography to use new variables

2. **Phase 2-7 (Content + Styling):**
   - ⚠️ Scope new classes under `.landing` wrapper
   - ✅ Use new design system variables
   - ✅ Implement glassmorphism effects
   - ✅ Add dot grid backgrounds
   - ✅ Enhance card hover effects with gold accents

3. **Phase 8-9 (Navigation):**
   - ⚠️ Remove Blog link from navbar
   - ⚠️ Hide navigation on mobile ≤860px
   - ⚠️ Update navigation links (add How We Work)

4. **Phase 10-11 (Responsive & Testing):**
   - ✅ Test all breakpoints
   - ✅ Verify color contrast ratios
   - ✅ Check hover effects and animations

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Next Review:** After Phase 1 completion
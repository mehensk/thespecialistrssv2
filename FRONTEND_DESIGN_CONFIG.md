# Frontend Design Configuration Guide

This document outlines the current frontend design system and provides options for redesigning major UI elements.

---

## 🎨 Color Palette

### Current Configuration

```css
--background: #ffffff
--foreground: #111111
--border: #e5e7eb
--cta: #1f2937
--cta-hover: #1a232e
--gold: #D4AF37
--gold-light: #F4D03F
```

**Current Usage:**
- **Primary CTA Color**: Dark gray gradient (`#1F2937` → `#111111`)
- **Accent/Gold**: `#D4AF37` (used for hover effects and highlights)
- **Text**: `#111111` (dark gray/black)
- **Background**: `#ffffff` (white)
- **Borders**: `#e5e7eb` (light gray)

### Color Palette Options

Choose one option for each color category:

#### Primary Brand Color
- [ ] **Option A: Current Dark Gray** - `#1F2937` / `#111111` (Professional, corporate, timeless)
- [ ] **Option B: Deep Navy Blue** - `#0F172A` / `#1E293B` (Trustworthy, sophisticated, financial)
- [ ] **Option C: Rich Teal/Blue** - `#0E7490` / `#0891B2` (Modern, fresh, approachable)
- [ ] **Option D: Elegant Burgundy** - `#7F1D1D` / `#991B1B` (Luxury, premium, sophisticated)
- [ ] **Option E: Forest Green** - `#14532D` / `#166534` (Stable, growth, natural)
- [ ] **Option F: Royal Purple** - `#581C87` / `#6B21A8` (Premium, exclusive, creative)

#### Accent/Highlight Color
- [ ] **Option A: Current Gold** - `#D4AF37` / `#F4D03F` (Luxury, premium, classic)
- [ ] **Option B: Vibrant Blue** - `#3B82F6` / `#60A5FA` (Trust, technology, modern)
- [ ] **Option C: Coral/Orange** - `#F97316` / `#FB923C` (Energetic, friendly, approachable)
- [ ] **Option D: Emerald Green** - `#10B981` / `#34D399` (Success, growth, fresh)
- [ ] **Option E: Rose/Pink** - `#E11D48` / `#F43F5E` (Bold, modern, attention-grabbing)
- [ ] **Option F: Indigo** - `#6366F1` / `#818CF8` (Professional, creative, balanced)

#### Background Color Scheme
- [ ] **Option A: Pure White** - `#FFFFFF` (Clean, minimalist, classic)
- [ ] **Option B: Off-White/Cream** - `#FEFEFE` / `#F9FAFB` (Warm, soft, elegant)
- [ ] **Option C: Light Gray** - `#F3F4F6` / `#F9FAFB` (Modern, subtle, professional)
- [ ] **Option D: Warm Beige** - `#FAF9F6` / `#F5F5F0` (Sophisticated, cozy, premium)
- [ ] **Option E: Cool Gray** - `#F8F9FA` / `#E9ECEF` (Contemporary, neutral, versatile)

#### Text Color
- [ ] **Option A: Current Dark** - `#111111` (High contrast, readable, classic)
- [ ] **Option B: Softer Black** - `#1F2937` (Easier on eyes, modern)
- [ ] **Option C: Charcoal** - `#374151` (Professional, readable, contemporary)
- [ ] **Option D: Navy Text** - `#0F172A` (Sophisticated, unique, premium)

---

## 📝 Typography

### Current Configuration

**Font Stack:**
1. **Logo/Brand**: Sora (weight: 600) - Google Fonts
2. **Headings/Body**: Geist Sans - Variable font
3. **Code/Monospace**: Geist Mono - Variable font

**Current Usage:**
- Logo: Sora 600 (`font-sora`)
- Navigation links: Geist Sans
- Headings: Geist Sans (semibold/600)
- Body text: Geist Sans (regular)
- All text uses: `antialiased` for smooth rendering

### Typography Options

#### Primary Font Family (Body & Headings)
- [ ] **Option A: Current - Geist Sans** (Modern, clean, highly readable, variable font)
- [ ] **Option B: Inter** (Humanist, excellent readability, designed for screens)
- [ ] **Option C: Poppins** (Geometric, friendly, modern, great for headings)
- [ ] **Option D: Playfair Display + Source Sans Pro** (Elegant serif headings, clean sans body)
- [ ] **Option E: Lato** (Warm, friendly, professional, versatile)
- [ ] **Option F: Montserrat** (Geometric, modern, strong presence, good for luxury)
- [ ] **Option G: DM Sans** (Neutral, readable, professional, balanced)

#### Brand/Logo Font
- [ ] **Option A: Current - Sora 600** (Modern, clean, distinctive)
- [ ] **Option B: Keep Sora, change weight** - Sora 700 (bolder) or Sora 500 (lighter)
- [ ] **Option C: Playfair Display** (Elegant serif, premium feel)
- [ ] **Option D: Cinzel** (Classical serif, luxury, sophisticated)
- [ ] **Option E: Cormorant Garamond** (Elegant serif, timeless, refined)
- [ ] **Option F: Use Primary Font** (Consistent branding, unified look)
- [ ] **Option G: Raleway** (Geometric, modern, clean, professional)

#### Font Weight Strategy
- [ ] **Option A: Current** - Semibold (600) for headings, Regular (400) for body
- [ ] **Option B: Bolder** - Bold (700) for headings, Medium (500) for body (stronger hierarchy)
- [ ] **Option C: Lighter** - Medium (500) for headings, Regular (400) for body (softer, elegant)
- [ ] **Option D: Variable** - Use variable font weights dynamically (modern, flexible)

#### Letter Spacing
- [ ] **Option A: Current** - Default tracking (normal)
- [ ] **Option B: Tighter** - Negative tracking for headings (`tracking-tight`) (more compact, modern)
- [ ] **Option C: Wider** - Positive tracking for headings (`tracking-wide`) (more spacious, elegant)
- [ ] **Option D: Mixed** - Tight headings, normal body

---

## 🔘 Buttons

### Current Button Styles

**Primary CTA Buttons:**
- Background: Dark gradient (`from-[#1F2937] to-[#111111]`)
- Text: White
- Hover: Darker gradient (`from-[#1A232E] to-[#0F1419]`)
- Effects: Shadow, transform on hover, gold overlay on hover
- Border radius: `rounded-md`
- Padding: `px-6 py-3` to `px-8 py-4`

**Secondary Buttons:**
- Background: White with border
- Text: Dark gray (`#111111`)
- Hover: Light gray background (`#F9FAFB`)
- Border: `#E5E7EB`

### Button Style Options

#### Button Shape/Border Radius
- [ ] **Option A: Current - Medium** - `rounded-md` (8px) (Balanced, modern)
- [ ] **Option B: Sharp** - `rounded-sm` or `rounded` (4px) (Modern, minimal, geometric)
- [ ] **Option C: Pill** - `rounded-full` (Fully rounded, friendly, modern)
- [ ] **Option D: Square** - `rounded-none` (Bold, architectural, contemporary)
- [ ] **Option E: Large Radius** - `rounded-lg` (12px) (Softer, more approachable)

#### Primary Button Style
- [ ] **Option A: Current - Dark Gradient** - `from-[#1F2937] to-[#111111]` (Sophisticated, professional)
- [ ] **Option B: Solid Color** - Single brand color (Clean, bold, modern)
- [ ] **Option C: Light Gradient** - Light to lighter (Subtle, elegant, soft)
- [ ] **Option D: Accent Color Solid** - Use accent color as primary (Bold, vibrant, attention-grabbing)
- [ ] **Option E: Outline Style** - Transparent with border (Minimal, modern, less aggressive)
- [ ] **Option F: Ghost Style** - Transparent, color on hover (Subtle, elegant, less prominent)

#### Button Hover Effects
- [ ] **Option A: Current** - Darker gradient + lift + shadow + gold overlay (Rich, dynamic)
- [ ] **Option B: Simple Color Change** - Darker/lighter shade (Clean, minimal)
- [ ] **Option C: Scale Up** - `scale-105` (Playful, interactive)
- [ ] **Option D: Slide/Underline** - Underline animation (Elegant, subtle)
- [ ] **Option E: Glow Effect** - Shadow glow on hover (Modern, eye-catching)
- [ ] **Option F: Ripple Effect** - Click ripple animation (Material design, modern)
- [ ] **Option G: Minimal** - Only color change, no transforms (Subtle, professional)

#### Button Size Variants
- [ ] **Option A: Current** - `px-6 py-3` (md), `px-8 py-4` (lg) (Balanced)
- [ ] **Option B: Larger** - `px-8 py-4` (md), `px-10 py-5` (lg) (More prominent, touch-friendly)
- [ ] **Option C: Smaller** - `px-4 py-2` (md), `px-6 py-3` (lg) (Compact, minimal)
- [ ] **Option D: Consistent** - Same padding for all (Uniform, clean)

#### Button Shadows
- [ ] **Option A: Current** - `shadow-lg` default, `shadow-xl` hover (Depth, elevation)
- [ ] **Option B: Subtle** - `shadow-md` default, `shadow-lg` hover (Softer, elegant)
- [ ] **Option C: None** - No shadows (Flat, modern, minimal)
- [ ] **Option D: Colored Shadow** - Shadow matches button color (Bold, cohesive)

---

## ✨ Effects & Animations

### Current Effects

**Animations:**
- `fadeInUp` - Fade in with upward motion (0.8s ease-out)
- Smooth scroll behavior
- Hover transforms (`hover:-translate-y-0.5`)
- Gold overlay on hover for primary buttons

**Transitions:**
- All interactive elements: `transition-all duration-300`
- Navbar: Backdrop blur, transparency changes

### Effect Options

#### Page Load Animations
- [ ] **Option A: Current - Fade In Up** - Elements fade in and slide up (Elegant, smooth)
- [ ] **Option B: Fade In Only** - Simple fade, no movement (Subtle, professional)
- [ ] **Option C: Slide In** - Elements slide in from sides (Dynamic, engaging)
- [ ] **Option D: Scale In** - Elements scale from small to full (Playful, modern)
- [ ] **Option E: Staggered** - Sequential animation delays (Sophisticated, polished)
- [ ] **Option F: None** - No page load animations (Instant, minimal)

#### Hover Effects on Cards/Components
- [ ] **Option A: Current - Lift + Shadow** - `hover:-translate-y-1` + shadow increase (Elevation, depth)
- [ ] **Option B: Scale Up** - `hover:scale-105` (Interactive, playful)
- [ ] **Option C: Glow Border** - Border glow on hover (Modern, attention-grabbing)
- [ ] **Option D: Image Zoom** - Image scales while card stays same (Dynamic, engaging)
- [ ] **Option E: Minimal** - Only shadow change (Subtle, elegant)
- [ ] **Option F: None** - No hover effects (Clean, minimal)

#### Scroll Animations
- [ ] **Option A: Current - Scroll Animation Component** - Fade in when scrolling into view (Engaging, modern)
- [ ] **Option B: Parallax** - Background/foreground move at different speeds (Dynamic, immersive)
- [ ] **Option C: Sticky Elements** - Elements stick while scrolling (Modern, functional)
- [ ] **Option D: None** - No scroll animations (Performance-focused, minimal)

#### Navbar Scroll Behavior
- [ ] **Option A: Current - Transparency to Solid** - Transparent on top, solid when scrolled (Modern, elegant)
- [ ] **Option B: Always Solid** - Always opaque (Consistent, clear)
- [ ] **Option C: Always Transparent** - Always transparent (Minimal, integrated)
- [ ] **Option D: Shrink on Scroll** - Navbar height reduces when scrolling (Space-efficient, modern)
- [ ] **Option E: Blur on Scroll** - Increased blur when scrolling (Glass morphism, modern)

#### Transition Speed
- [ ] **Option A: Current - 300ms** - `duration-300` (Balanced, smooth)
- [ ] **Option B: Faster** - `duration-200` (Snappy, responsive)
- [ ] **Option C: Slower** - `duration-500` (Elegant, deliberate)
- [ ] **Option D: Varied** - Different speeds for different elements (Sophisticated, nuanced)

---

## 🎭 Overall Design Style

### Current Design Characteristics

- **Style**: Clean, modern, professional
- **Approach**: Minimal with subtle luxury touches (gold accents)
- **Layout**: Spacious, organized, grid-based
- **Visual Hierarchy**: Clear, bold headings, readable body text

### Design Style Direction

Choose one overall style direction:

- [ ] **Option A: Current - Modern Minimalist** - Clean lines, plenty of white space, subtle effects (Professional, timeless, versatile)
- [ ] **Option B: Luxury Premium** - Rich colors, elegant typography, sophisticated animations (High-end, exclusive, refined)
- [ ] **Option C: Bold & Vibrant** - Strong colors, high contrast, dynamic effects (Energetic, memorable, modern)
- [ ] **Option D: Soft & Elegant** - Pastels, rounded corners, gentle animations (Approachable, friendly, sophisticated)
- [ ] **Option E: Corporate Professional** - Structured, conservative colors, clear hierarchy (Trustworthy, traditional, established)
- [ ] **Option F: Modern Glassmorphism** - Frosted glass effects, blur, transparency (Contemporary, tech-forward, fresh)

---

## 📐 Spacing & Layout

### Current Spacing

- Section padding: `py-28` (7rem = 112px)
- Container max-width: `max-w-7xl` (1280px)
- Grid gaps: `gap-6`, `gap-8`
- Card padding: `p-6`

### Spacing Options

#### Section Spacing
- [ ] **Option A: Current - py-28** (112px) (Generous, spacious, premium feel)
- [ ] **Option B: Tighter - py-20** (80px) (More content visible, efficient)
- [ ] **Option C: Looser - py-32** (128px) (More breathing room, luxurious)
- [ ] **Option D: Responsive** - Varies by screen size (Optimized for all devices)

#### Container Width
- [ ] **Option A: Current - max-w-7xl** (1280px) (Standard, balanced)
- [ ] **Option B: Wider - max-w-[1400px]** (More horizontal space, modern)
- [ ] **Option C: Narrower - max-w-6xl** (1120px) (Focused, easier to read)
- [ ] **Option D: Full Width Sections** - No max-width on some sections (Bold, immersive)

---

## 🖼️ Image Styling

### Current Image Treatment

- Hero images: Full bleed with overlay
- Card images: Rounded corners (`rounded-xl`)
- Aspect ratios: Maintained (16:9 for blog images)
- Object fit: `cover`

### Image Style Options

#### Border Radius for Images
- [ ] **Option A: Current - rounded-xl** (12px) (Soft, modern)
- [ ] **Option B: Sharp** - `rounded-none` or `rounded-sm` (Geometric, architectural)
- [ ] **Option C: Pill** - `rounded-full` (For avatars/circles)
- [ ] **Option D: Large** - `rounded-2xl` (16px) (Softer, more elegant)

#### Image Overlays
- [ ] **Option A: Current - Gradient Overlay** - `from-black/60 via-black/50 to-black/70` (Text readability, depth)
- [ ] **Option B: Subtle Overlay** - Lighter gradient (Less dramatic, more image visible)
- [ ] **Option C: No Overlay** - Pure image (Bold, clean, relies on text contrast)
- [ ] **Option D: Color Overlay** - Tinted with brand color (Cohesive, branded)

---

## 📱 Responsive Breakpoints

### Current Breakpoints (Tailwind Defaults)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Breakpoint Strategy

- [ ] **Option A: Current - Standard Tailwind** - Default breakpoints (Proven, consistent)
- [ ] **Option B: Mobile-First** - More focus on mobile breakpoints (Mobile-optimized)
- [ ] **Option C: Desktop-First** - Larger default sizes (Desktop-optimized)

---

## 🎯 Implementation Priority

After selecting your options, prioritize implementation:

1. **Phase 1: Colors & Typography** (Foundation)
   - Update CSS variables
   - Update font imports and usage
   - Update text colors

2. **Phase 2: Buttons** (Key Interactions)
   - Update button styles
   - Update hover effects
   - Test across all pages

3. **Phase 3: Effects & Animations** (Polish)
   - Update animations
   - Refine transitions
   - Test performance

4. **Phase 4: Layout & Spacing** (Structure)
   - Adjust spacing
   - Update container widths
   - Refine responsive behavior

---

## 📝 Notes & Custom Options

**Current Design Strengths:**
- ✅ Clear visual hierarchy
- ✅ Good contrast and readability
- ✅ Smooth animations
- ✅ Professional appearance

**Areas for Potential Improvement:**
- Consider more distinctive brand identity through color
- Could enhance luxury feel with richer accents
- May benefit from more unique typography pairing
- Button styles could be more varied/dynamic

**Custom Options:**
If you have specific design ideas not covered above, document them here:

- [ ] **Custom Option 1**: _Describe your idea_
- [ ] **Custom Option 2**: _Describe your idea_
- [ ] **Custom Option 3**: _Describe your idea_

---

## 🔄 Design System Reference

**Files to Update:**
- `src/app/globals.css` - CSS variables and global styles
- `src/app/lib/fonts.ts` - Font imports
- `src/app/layout.tsx` - Font application
- Component files - Button styles, colors, effects

**Key Component Files:**
- `src/components/ui/navbar.tsx` - Navigation styling
- `src/components/ui/hero-search.tsx` - Hero section styling
- `src/components/ui/footer.tsx` - Footer styling
- `src/app/page.tsx` - Homepage styling

---

*Last Updated: [Current Date]*
*Use this document to plan and execute your frontend design update.*


# The Specialist Realty - File Structure Overview

This document provides a comprehensive overview of the website's file structure and organization.

---

## ROOT DIRECTORY

```
thespecialistrealty/
├── .gitignore                    # Git ignore rules
├── ecosystem.config.js            # PM2 process configuration
├── netlify.toml                  # Netlify deployment configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── postcss.config.mjs            # PostCSS configuration
├── prisma.config.ts              # Prisma client configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

---

## DOCUMENTATION FILES

```
├── AUTH_FIXES_SUMMARY.md                   # Authentication fixes summary
├── AUTH_REFACTOR_DECISIONS.md             # Auth refactoring decisions
├── BLOG_IMPLEMENTATION_PLAN.md             # Blog implementation plan
├── CLOUDFLARE_HOSTING.md                  # Cloudflare hosting guide
├── CLOUDINARY_SETUP.md                     # Cloudinary image hosting setup
├── CODE_REVIEW_REPORT.md                   # Code review findings
├── COMPREHENSIVE_CODE_REVIEW_2025.md     # Comprehensive code review
├── CRUD_REFACTOR_FINDINGS.md              # CRUD refactoring findings
├── CRUD_REFACTOR_PLAN.md                  # CRUD refactoring plan
├── CRUD_REFACTOR_PLAN_PHASE1_2.md         # CRUD refactoring phase 1-2
├── CURRENT_CSS_STYLING_ASSESSMENT.md       # CSS styling assessment
├── DATABASE_FIX.md                        # Database fixes
├── DATABASE_SETUP_SERVER.md                 # Server database setup
├── DATABASE_SETUP.md                       # Database setup guide
├── DATABASE_STATUS.md                      # Database status
├── DEPLOY_QUICK_REFERENCE.md              # Deployment quick reference
├── DEPLOYMENT_OVERVIEW.md                 # Deployment overview
├── DIGITALOCEAN_DEPLOYMENT.md            # DigitalOcean deployment guide
├── EMAILJS-TIMPLATE-PLAIN.txt            # Email template (plain text)
├── EMAILJS-TEMPLATE.HTML                   # Email template (HTML)
├── ENV_VALUES.md                          # Environment variables reference
├── ESLINT.CONFIG.MJS                      # ESLint configuration
├── FEATURE_ANALYSIS_AND_IMPROVEMENTS.md   # Feature analysis
├── FILES_CREATED_SUMMARY.md                # Summary of created files
├── FRONTEND_DESIGN_CONFIG.md               # Frontend design config
├── FRONTEND_GUIDE.md                      # Frontend development guide
├── FUNCTIONS_TO_IMPROVE.md                # Functions needing improvement
├── HOW_TO_CHECK_NETLIFY_ENV.md           # Netlify environment check
├── IMPLEMENTED_UX_IMPROVEMENTS.md         # Implemented UX improvements
├── IMPROVEMENTS_OUTSIDE_CRUD.md          # Improvements outside CRUD
├── INDEPENDENT_SERVER_GUIDE.md            # Independent server guide
├── LANDING_PAGE_REVAMP_PLAN.md             # Landing page revamp plan
├── LAYOUT_THEME_OPTIONS.md                 # Layout theme options
├── LISTING_CARD_REFACTOR_PLAN.md          # Listing card refactoring
├── LISTING_DATA_LOADING_PLAN.md            # Listing data loading plan
├── LISTING_QA_CHECKLIST.md               # Listing QA checklist
├── LISTING_URL_SEO_MIGRATION_PLAN.md     # SEO migration plan
├── LOCAL_NETLIFY_TESTING.md              # Local Netlify testing guide
├── LOGIN_PERFORMANCE_FIX.md                # Login performance fixes
├── LOGIN_PERFORMANCE_OPTIMIZATIONS.md       # Login performance optimizations
├── LOGIN_SESSION_FIX.md                   # Login session fixes
├── MEMORY_OPTIMIZATION.md                 # Memory optimization
├── MIGRATE_TO_PRODUCTION.md              # Production migration guide
├── MOBILE_DASHBOARD_QOL_PLAN.md          # Mobile dashboard QoL plan
├── NETLIFY_CLOUDINARY_SETUP.md           # Netlify + Cloudinary setup
├── NETLIFY_CUSTOM_DOMAIN_FREE_TIER.md      # Netlify custom domain guide
├── NETLIFY_FIX.md                        # Netlify fixes
├── NETLIFY_VS_LOCALHOST_COMPARISON.md     # Netlify vs localhost comparison
├── OUR_SERVICES_PAGE_PLAN.md              # Services page plan
├── PERFORMANCE_OPTIMIZATIONS.md           # Performance optimizations
├── PHASE1_COMPLETION_SUMMARY.md          # Phase 1 completion summary
├── PHASE2_SEO_PROGRAM_PLAN.md           # Phase 2 SEO program plan
├── PHASE2A_CACHE_FIX_SUMMARY.md         # Phase 2A cache fixes
├── PHASE2A_COMPLETION_SUMMARY.md        # Phase 2A completion summary
├── PRE_DEPLOYMENT_CHECKLIST_DIGITALOCEAN.md  # DigitalOcean deployment checklist
├── PRE_DEPLOYMENT_CHECKLIST.md             # Pre-deployment checklist
├── QUICK_CLOUDINARY_SETUP.md              # Quick Cloudinary setup
├── QUICK_DATABASE_SETUP.md                # Quick database setup
├── QUICK_DEV_SETUP.md                    # Quick development setup
├── QUICK_LOCAL_TEST.md                    # Quick local testing guide
├── QUICK_START.md                         # Quick start guide
├── README.md                             # Main README
├── SEO_IMPLEMENTATION_GUIDE.md            # SEO implementation guide
├── SETUP.md                              # Setup guide
├── SLUG_URL_PLAN.md                      # Slug URL plan
├── START_HERE_LOCAL_TESTING.md           # Local testing start guide
├── STORAGE_OPTIMIZATION.md                # Storage optimization
├── SYNC_DATABASE_TO_PRODUCTION.md         # Database sync to production
├── SYSTEM_FEATURES.md                     # System features documentation
├── TEST_LOGIN_LOCAL.md                   # Local login testing
├── TESTING_REPORT.md                      # Testing report
├── THEME_DESIGN_SYSTEM.md                 # Theme design system
├── THEME_ROLLOUT_SAFE_PLAN.md            # Theme rollout safe plan
├── TROUBLESHOOTING.md                   # Troubleshooting guide
├── UX_IMPROVEMENTS.md                   # UX improvements
└── TS-REFACTORING.md                    # TypeScript refactoring notes
```

---

## SOURCE CODE (`src/`)

### App Structure (`src/app/`)

```
src/app/
├── layout.tsx                    # Root layout component
├── page.tsx                      # Landing page (homepage)
├── globals.css                   # Global styles
├── not-found.tsx                 # Custom 404 page
└── [directories]
```

### Pages

```
├── 403/                          # Forbidden page
│   └── page.tsx
├── admin/                         # Admin dashboard
│   └── listings/
│       ├── listings-view.tsx           # Listings management view
│       ├── blogs/
│       │   └── blogs-view.tsx        # Blogs management view
│       └── [id]/
│           └── approve/
│               └── route.ts         # Approve listing API route
├── api/                           # API routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts             # NextAuth authentication
│   ├── listings/
│   │   ├── route.ts                # GET/POST listings
│   │   ├── [id]/
│   │   │   └── route.ts           # GET/PUT single listing
│   │   └── [id]/
│   │       └── delete/
│   │           └── route.ts       # DELETE listing
│   ├── blogs/
│   │   ├── [id]/
│   │   │   └── delete/
│   │   │       └── route.ts       # DELETE blog
│   └── admin/
│       └── [id]/
│           └── approve/
│               └── route.ts         # Admin approve listing
│   ├── blog-posts/
│   │   ├── route.ts                # GET/POST blogs
│   │   └── [id]/
│   │       └── route.ts           # GET/PUT single blog
│   └── upload/
│       └── route.ts                # Image upload to Cloudinary
├── auth/                          # Auth pages
│   └── page.tsx                  # Auth page (if needed)
├── blog/                          # Blog pages
│   ├── page.tsx                   # All blogs page
│   └── [slug]/
│       └── page.tsx               # Single blog post
├── contact/                        # Contact page
│   └── page.tsx
├── dashboard/                     # User dashboard
│   ├── listings/
│   │   ├── listing-card.tsx         # Dashboard listing card
│   │   ├── delete-button.tsx        # Delete listing button
│   │   ├── page.tsx               # User's listings
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx       # Edit listing page
│   ├── blogs/
│   │   ├── page.tsx               # User's blogs
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx       # Edit blog page
│   └── profile/
│       └── page.tsx               # User profile
├── developer-selling/              # Developer selling page
│   └── page.tsx
├── how-we-work/                  # How we work page
│   └── page.tsx
├── listings/                     # Public listings
│   ├── page.tsx                  # Browse all listings
│   └── [id]/
│       └── page.tsx              # Single listing detail
└── login/                        # Login page
    └── page.tsx
```

### Components (`src/components/`)

```
src/components/
├── providers/                     # Context providers
│   ├── SessionProvider.tsx         # NextAuth session provider
│   └── LogoutSync.tsx            # Logout sync across tabs
├── ui/                           # Reusable UI components
│   ├── navbar.tsx                 # Navigation bar
│   ├── footer.tsx                 # Footer component
│   ├── hero-search.tsx            # Hero search section
│   └── search-input.tsx           # Search input component
├── listings/                     # Listing-related components
│   ├── ListingCard.tsx            # Listing card for public view
│   └── ListingDetailContent.tsx    # Listing detail content
├── admin/                        # Admin-specific components
│   ├── CompactListingCard.tsx      # Compact card for admin
│   └── ViewToggle.tsx            # Toggle table/grid view
└── shared/                       # Shared components
    └── CollapsibleSection.tsx     # Collapsible form section
```

### Hooks (`src/hooks/`)

```
src/hooks/
├── useFileUpload.ts              # File upload hook (Cloudinary)
└── useIsMobile.ts               # Mobile detection hook
```

### Libraries (`src/lib/`)

```
src/lib/
├── auth-helpers.ts             # Authentication helper functions
├── auth.ts                    # NextAuth configuration
└── location-utils.ts           # Location and city utilities
```

### Types (`src/types/`)

```
src/types/
└── [TypeScript types]
```

### Middleware (`src/`)

```
src/
└── middleware.ts               # Next.js middleware for auth
```

---

## DATABASE (`prisma/`)

```
prisma/
├── schema.prisma               # Database schema
├── seed.ts                    # Database seeding script
└── migrations/                 # Database migrations
    └── migration_lock.toml
```

---

## PUBLIC ASSETS (`public/`)

```
public/
├── favicon.ico                 # Website favicon
├── images/                    # Static images
│   └── hero-condo.jpg
└── uploads/                   # User uploads
    └── listings/              # Listing images (if using local storage)
```

---

## SCRIPTS (`scripts/`)

```
scripts/
├── analyze-db-storage.ts                 # Database storage analysis
├── build-netlify-local.js               # Netlify local build
├── check-blog-content.js                # Check blog content
├── check-blog-status.ts                # Check blog status
├── check-cloudinary-urls.ts            # Check Cloudinary URLs
├── check-dev-branch.ts                # Check development branch
├── check-local-db.ts                 # Check local database
├── check-neon-db.ts                  # Check Neon database
├── cleanup-activities.ts               # Cleanup old activities
├── compare-databases.ts               # Compare databases
├── debug-blog-slugs.ts                # Debug blog slugs
├── debug-slug-details.ts              # Debug slug details
├── delete-external-image-blogs.ts      # Delete external image blogs
├── deploy.ps1                       # PowerShell deployment script
├── deploy.sh                        # Shell deployment script
├── dev-with-db.js                   # Dev with database script
├── export-listings.ts                # Export listings
├── fix-blog-slugs.ts                # Fix blog slugs
├── fix-malformed-slugs.ts            # Fix malformed slugs
├── listings-reflect-smoke.ps1         # Smoke test script
├── migrate-images-to-cloudinary.ts    # Migrate images to Cloudinary
├── migrate-to-dev-branch.ts           # Migrate to dev branch
├── migrate-to-neon.ts                # Migrate to Neon
├── optimize-db-storage.ts            # Optimize database storage
├── organize-cloudinary-listings.ts     # Organize Cloudinary images
├── postinstall.js                    # Post-install script
├── README_ORGANIZE.md               # Scripts README
├── setup-server.ps1                 # PowerShell server setup
├── setup-server.sh                  # Shell server setup
├── simulate-netlify-build.js         # Simulate Netlify build
├── sync-to-production.ts             # Sync to production
├── test-login-flow.js               # Test login flow
└── test-login.ts                    # Test login
```

---

## CONFIGURATION FILES

```
├── nginx/
│   └── thespecialistrealty.conf      # Nginx configuration
└── docs/
    └── [documentation]
```

---

## DOCUMENTATION (`docs/`)

```
docs/
├── auth-control-flow-diagram.md     # Authentication flow diagram
├── browse-listings-wireframe.html  # Browse listings wireframe
├── individual-listing-wireframe.html # Individual listing wireframe
├── mvp-data-hierarchy.md         # MVP data hierarchy
├── mvp-services-breakdown.md      # MVP services breakdown
├── netlify-build-simulation-summary.md # Netlify build simulation
├── PROJECT_OVERVIEW.md            # Project overview
├── sample-broker-site-wireframe.html # Sample broker wireframe
├── sitebuilder-wireframe.html     # Site builder wireframe
├── tech-stack-recommendation.md    # Tech stack recommendations
└── wireframes/                 # Wireframe designs
    ├── admin-mobile-redesign-from-scratch.html
    ├── admin-mobile-redesign-task-flows.html
    ├── blog-wireframe-1.html
    ├── blog-wireframe-2.html
    ├── blog-wireframe-3.html
    ├── browse-listings-theme-clean.html
    ├── browse-listings-themed.html
    ├── developer-selling-wireframe.html
    ├── how-we-work.html
    ├── investor-relations.html
    ├── landing-page-new-content-option-2.html
    ├── landing-page-new-content.html
    ├── listing-card-concepts.html
    ├── listing-card-designs.html
    ├── listing-card-landing-designs.html
    ├── mobile-dashboard-nav-reset-wireframe-agent.html
    ├── mobile-dashboard-nav-reset-wireframe.html
    ├── mobile-dashboard-qol-wireframe-closed.html
    ├── mobile-dashboard-qol-wireframe.html
    ├── navbar-dropdown-wireframe.html
    ├── our-services-wireframe.html
    ├── property-listing-cards.html
    ├── wireframe-boutique-local.html
    ├── wireframe-modern-architectural.html
    └── wireframe-warm-luxury.html
```

---

## TUTORIAL (`tutorial/`)

```
tutorial/
├── README.md                           # Tutorial main README
├── landing-page-explanation.md            # Landing page tutorial
├── listings-page-explanation.md          # Listings page tutorial
├── listing-detail-page-explanation.md     # Listing detail tutorial
├── login-page-explanation.md             # Login page tutorial
├── edit-listing-page-explanation.md     # Edit listing tutorial
└── admin-listings-view-explanation.md  # Admin listings tutorial
```

---

## KEY FILE CATEGORIES

### 1. **Core Application Files**
- `src/app/` - All pages and API routes
- `src/components/` - Reusable components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions

### 2. **Configuration Files**
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `prisma.config.ts` - Prisma configuration

### 3. **Database Files**
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migrations
- `prisma/seed.ts` - Database seeding

### 4. **Deployment Files**
- `netlify.toml` - Netlify configuration
- `ecosystem.config.js` - PM2 configuration
- `nginx/` - Nginx configuration
- `scripts/deploy.*` - Deployment scripts

### 5. **Documentation Files**
- `docs/` - Project documentation
- `tutorial/` - Code tutorials
- Root-level markdown files - Various documentation

### 6. **Asset Files**
- `public/` - Static assets (images, favicon)
- `public/uploads/` - User-uploaded content

### 7. **Utility Scripts**
- `scripts/` - Maintenance and utility scripts
- Database tools
- Migration scripts
- Testing scripts

---

## TECHNOLOGY STACK

### Frontend
- **Next.js 14** - React framework
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Backend endpoints
- **Prisma ORM** - Database ORM
- **NextAuth.js** - Authentication

### Database
- **PostgreSQL** - Primary database (via Neon)
- **Prisma** - Database ORM

### Infrastructure
- **Netlify** - Hosting (primary)
- **Cloudinary** - Image hosting
- **PM2** - Process management

---

## DEVELOPMENT WORKFLOW

### File Location by Purpose

| Purpose | Location |
|----------|-----------|
| **Pages** | `src/app/` |
| **Components** | `src/components/` |
| **API Routes** | `src/app/api/` |
| **Styles** | `src/app/globals.css`, Tailwind classes |
| **Database Schema** | `prisma/schema.prisma` |
| **Utility Functions** | `src/lib/` |
| **Custom Hooks** | `src/hooks/` |
| **Configuration** | Root directory (`*.config.js`, `*.json`) |
| **Documentation** | `docs/`, `tutorial/` |
| **Scripts** | `scripts/` |

---

## ROUTING STRUCTURE

### Public Routes
- `/` - Landing page
- `/listings` - Browse all listings
- `/listings/[id]` - Single listing detail
- `/blog` - Blog posts
- `/blog/[slug]` - Single blog post
- `/contact` - Contact page
- `/how-we-work` - How we work page

### Private Routes (Authenticated)
- `/dashboard` - User dashboard
- `/dashboard/listings` - User's listings
- `/dashboard/listings/[id]/edit` - Edit listing
- `/dashboard/blogs` - User's blogs
- `/dashboard/blogs/[id]/edit` - Edit blog
- `/dashboard/profile` - User profile

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/listings` - Manage all listings
- `/admin/blogs` - Manage all blogs

---

## SUMMARY

This website follows Next.js 14 App Router conventions:
- ✅ **File-based routing** in `src/app/`
- ✅ **Server and client components** for optimal performance
- ✅ **API routes** in `src/app/api/`
- ✅ **Component organization** in `src/components/`
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Prisma** for database management
- ✅ **NextAuth** for authentication

For detailed code explanations, see the [tutorial](./tutorial/) folder.
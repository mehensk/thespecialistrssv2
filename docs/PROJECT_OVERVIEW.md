# Project Overview: Real Estate Broker Website Builder SaaS

## Executive Summary

A SaaS platform that allows real estate brokers to create professional, static websites for showcasing their property listings. Each broker gets their own custom domain, drag-and-drop site builder, and automated listing page generation.

**Target Market:** Individual real estate brokers in the Philippines  
**Business Model:** Subscription-based (PHP 1,000-2,000/month per broker)  
**MVP Approach:** Constrained, template-based builder for fast setup and consistent results

---

## Core Concept

### What It Is
- **Main Platform Site:** Your marketing site + broker dashboard
- **Broker Sites:** Static websites generated for each broker with their custom domain
- **Site Builder:** Drag-and-drop interface to customize homepage (limited sections)
- **Listing Management:** CSV/JSON import → auto-generated listing pages

### What It's NOT
- ❌ Full-featured website builder (like Wix/Squarespace)
- ❌ Dynamic listing search/filtering
- ❌ CRM or lead management system
- ❌ Automatic lead generation platform
- ❌ Real-time listing updates

---

## MVP Scope & Limitations

### ✅ What Brokers CAN Do

**Site Builder:**
- Drag-and-drop to reorder sections on homepage
- Edit text content (headings, descriptions, CTAs)
- Customize theme (colors, fonts from presets)
- Upload logo and hero images
- Add/edit testimonials, FAQ items
- Configure contact information

**Listings:**
- Import listings via CSV/JSON
- Up to 200-300 listings per broker
- Auto-generated listing detail pages
- Listing grid on homepage (limited preview)
- Browse all listings page (static, no filters)

**Pages:**
- Homepage (customizable via builder)
- About page (editable content)
- Contact page (form submissions)
- Browse listings page (auto-generated)
- Individual listing pages (auto-generated per listing)

**Custom Domain:**
- Point their own domain to your platform
- Automatic SSL certificates
- Host-based routing to their site

### ❌ What Brokers CANNOT Do (MVP)

- Freeform design (no custom layouts)
- Custom CSS/JavaScript injection
- Dynamic filtering/search (static pages only)
- Real-time listing updates (must re-import)
- Advanced animations or interactions
- Custom listing templates
- Media library (images via external URLs only)
- Analytics dashboard (basic form submissions only)

---

## Architecture & Data Model

### Platform Structure

```
Main Platform Site (thespecialistrealty.com)
    │
    ├── Landing/Marketing Pages
    ├── Sign Up / Login
    ├── Pricing Page
    └── Admin Dashboard
         │
         └── Broker Accounts (Multi-tenant)
              │
              ├── Broker Account #1
              │    ├── Custom Domain: broker1realty.com
              │    ├── Site Configuration (theme, logo, layout)
              │    ├── Listings (imported data)
              │    └── Generated Static Site
              │
              ├── Broker Account #2
              │    └── (same structure)
              │
              └── Broker Account #N
```

### Database Schema

**Users Table:**
- id, email, password_hash, role (platform_admin | broker), timestamps

**Broker Accounts Table:**
- id, user_id, company_name, broker_name, custom_domain, origin_alias, subscription_status, subscription_tier, timestamps

**Site Configurations Table:**
- id, broker_account_id, theme (JSON), logo_url, contact_email, contact_phone, social_links (JSON), page_layout (JSON), meta_title, meta_description, timestamps

**Listings Table:**
- id, broker_account_id, listing_id, address, city, state, zip_code, price, bedrooms, bathrooms, square_feet, lot_size, property_type, status, description, images (JSON array), year_built, timestamps

**Domain Mappings Table:**
- id, broker_account_id, custom_domain, verification_token, verified, ssl_certificate_status, timestamps

### Domain & Routing Model

- **Shared Origin:** All broker sites deploy to one platform-controlled origin (e.g., `sites.thespecialistrealty.com`)
- **Custom Domains:** Brokers point their domain (CNAME/ALIAS) to shared origin
- **Host-based Routing:** Edge/CDN routes requests based on `Host` header to correct broker's static bundle
- **SSL Automation:** Automatic certificate issuance for custom domains

---

## Tech Stack

### Frontend
- **Next.js 14+** (App Router) - Main framework
- **React 18+** - UI components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form + Zod** - Forms & validation
- **React DnD / Dnd Kit** - Drag-and-drop
- **Shadcn/ui or Radix UI** - Component library

### Backend & Database
- **PostgreSQL** (via Supabase or Neon)
- **Prisma ORM** - Database access
- **NextAuth.js** - Authentication

### Deployment & Infrastructure
- **Vercel** (recommended) or **Netlify** - Hosting & CDN
- **Next.js Static Export** - Generate static broker sites
- **Vercel Domains API** - Custom domain management
- **AWS S3 or Cloudflare R2** - File storage (logos)

### Additional Services
- **Resend or SendGrid** - Email notifications
- **GitHub Actions** - CI/CD
- **Sentry** - Error tracking (optional)

### Estimated Monthly Platform Cost
- Vercel Pro: ~$20/month
- PostgreSQL: Free tier or ~$25/month
- S3 Storage: ~$1-5/month
- Email Service: Free tier or ~$20/month
- **Total: ~$50-100/month** (excluding broker custom domains)

---

## Pricing Model

### Cost Structure (Per Broker)
- **Light Usage:** ~PHP 20/month (5K pageviews)
- **Moderate Usage:** ~PHP 70/month (25K pageviews)
- **Heavy Usage:** ~PHP 200/month (100K pageviews)

### Suggested Pricing (PHP)
- **Monthly:** PHP 1,000-2,000/month
- **Annual:** PHP 10,000-20,000/year (2 months off)
- **Margin:** Healthy margin over even heavy usage

### Future Add-ons
- Higher listing caps
- Media hosting/optimization
- Analytics dashboard
- Lead capture upgrades
- Domain concierge service
- Priority support

---

## Wireframes & Design

### Created Wireframes

1. **Site Builder Interface** (`docs/sitebuilder-wireframe.html`)
   - Left panel: Pages list, section palette
   - Center: Canvas with drag-drop sections
   - Right panel: Section settings, theme controls

2. **Sample Broker Homepage** (`docs/sample-broker-site-wireframe.html`)
   - Hero section
   - Featured listing
   - Listing grid
   - About section
   - Testimonials
   - FAQ
   - Contact CTA
   - Map embed
   - Footer

3. **Browse Listings Page** (`docs/browse-listings-wireframe.html`)
   - Static listing grid (NO filters/search in MVP)
   - Pagination
   - Listing cards with images, specs, price

4. **Individual Listing Page** (`docs/individual-listing-wireframe.html`)
   - Image gallery (thumbnail switching)
   - Property details
   - Description
   - Features list
   - Contact sidebar
   - Map embed
   - Similar listings

### Design Principles
- **Template-based:** Pre-designed sections, not freeform
- **Professional:** Modern, clean aesthetic
- **Mobile-first:** Responsive design
- **Fast:** Static generation for performance
- **SEO-friendly:** Proper meta tags, clean URLs

---

## Key Decisions Made

### 1. Static Sites (Not Dynamic)
- **Why:** Fast, cheap, SEO-friendly, secure
- **Trade-off:** No real-time updates, must republish for changes

### 2. No Public Subdomains
- **Why:** Brokers want their own domains for branding
- **Solution:** Custom domain pointing to shared origin

### 3. Constrained Builder (Not Freeform)
- **Why:** Faster setup, consistent results, easier support
- **Trade-off:** Less design flexibility, but more reliable

### 4. CSV/JSON Import (Not CRUD UI)
- **Why:** Simpler MVP, brokers likely have data in spreadsheets
- **Trade-off:** Must re-import to update listings

### 5. No Dynamic Filtering
- **Why:** Static sites can't do server-side filtering
- **Solution:** Pre-generated pages, or accept static grid only

### 6. Limited Sections (6-10 per homepage)
- **Why:** Performance, simplicity, faster builds
- **Trade-off:** Less customization, but cleaner sites

---

## User Flows

### Broker Onboarding
1. Sign up on main platform
2. Create broker account
3. Configure site (theme, logo, contact info)
4. Import listings (CSV/JSON)
5. Customize homepage (drag-drop sections)
6. Set up custom domain (DNS instructions)
7. Publish site (static generation)
8. Site goes live on custom domain

### Listing Update Flow
1. Broker updates CSV/JSON file
2. Re-uploads to platform
3. System parses and validates
4. Updates database
5. Broker clicks "Publish"
6. Static site regenerated
7. Deployed to CDN
8. Changes go live

### Lead Capture Flow
1. Visitor views listing on broker site
2. Fills out contact form
3. Form submission → API endpoint
4. Email notification sent to broker
5. Broker follows up with lead

---

## MVP Features Checklist

### Main Platform Site
- [ ] Landing page
- [ ] Sign up / Login
- [ ] Pricing page
- [ ] Admin dashboard (basic)

### Broker Dashboard
- [ ] Login/Authentication
- [ ] Site builder interface (drag-drop)
- [ ] Listing import (CSV/JSON upload)
- [ ] Theme customization
- [ ] Logo upload
- [ ] Contact info management
- [ ] Custom domain setup (DNS instructions)
- [ ] Preview site
- [ ] Publish site (static generation)

### Generated Broker Site
- [ ] Homepage with listing cards
- [ ] Individual listing detail pages
- [ ] About page (editable)
- [ ] Contact page with form
- [ ] Browse listings page (static grid)
- [ ] SEO meta tags
- [ ] Responsive design

### Infrastructure
- [ ] Static site generator (Next.js SSG)
- [ ] CDN deployment (Vercel/Netlify)
- [ ] Custom domain support
- [ ] SSL certificate automation
- [ ] Form submission handling (serverless function)

---

## Value Proposition

### For Brokers
- ✅ Professional website in minutes (no coding)
- ✅ Custom domain for branding
- ✅ SEO-friendly structure
- ✅ Mobile-responsive design
- ✅ Lead capture forms
- ✅ Fast, reliable hosting

### Limitations (Be Transparent)
- ❌ Not a lead generation platform (brokers must drive traffic)
- ❌ No built-in marketing tools
- ❌ Limited design flexibility
- ❌ Manual listing updates required
- ❌ No analytics dashboard (MVP)

### How Brokers Get Leads
1. **SEO:** Optimize for local searches (free, takes time)
2. **Social Media:** Share listings on Facebook/Instagram (free)
3. **Paid Ads:** Google/Facebook ads pointing to site (costs money)
4. **Direct Marketing:** Share website URL, business cards, etc. (free)

**Reality:** Website is a tool, not a lead generator. Brokers must drive traffic themselves.

---

## Next Steps

### Phase 1: MVP Development
1. Set up Next.js project with TypeScript
2. Configure Prisma with PostgreSQL
3. Set up NextAuth.js authentication
4. Create database schema
5. Build broker dashboard UI
6. Implement site builder (drag-drop)
7. Build listing import functionality
8. Implement static site generation
9. Set up custom domain handling
10. Create form submission endpoint
11. Deploy to Vercel
12. Test end-to-end flow

### Phase 2: Enhancements (Post-MVP)
- Analytics dashboard (Google Analytics integration)
- Email notifications for form submissions
- WhatsApp integration
- SMS notifications
- Lead tracking
- Advanced SEO tools
- Social media auto-posting
- Google Ads integration
- Chatbot for basic questions

### Phase 3: Scale
- Media upload pipeline
- Higher listing caps
- More section templates
- Custom CSS options
- Blog functionality
- Email marketing
- CRM integration

---

## Documentation Files

All documentation is in the `/docs` folder:

1. **PROJECT_OVERVIEW.md** (this file) - Complete project summary
2. **mvp-data-hierarchy.md** - Data model and architecture details
3. **mvp-services-breakdown.md** - MVP scope and limitations
4. **cost-model-php.md** - Pricing and cost analysis
5. **tech-stack-recommendation.md** - Technology choices and rationale
6. **sitebuilder-wireframe.html** - Site builder UI wireframe
7. **sample-broker-site-wireframe.html** - Example broker homepage
8. **browse-listings-wireframe.html** - Browse listings page
9. **individual-listing-wireframe.html** - Individual listing page

---

## Important Notes

### Transparency with Users
- Be clear about MVP limitations
- Don't overpromise features
- Set realistic expectations
- Provide marketing guidance (SEO, social media basics)

### Technical Constraints
- Static sites = no real-time features
- No dynamic filtering without backend
- Build times scale with listing count
- Custom domains require DNS setup by broker

### Business Model
- Subscription-based (not usage-based)
- Healthy margins at suggested pricing
- Scale costs are predictable
- Add-ons can increase revenue

---

## Questions to Resolve

1. **Payment Processing:** Stripe/PayPal integration for subscriptions?
2. **Support Model:** Email only, or live chat?
3. **Onboarding:** Self-service or guided setup?
4. **Trial Period:** Free trial or paid from day 1?
5. **Cancellation:** What happens to broker site when they cancel?
6. **Backups:** How to handle broker data retention?

---

## Success Metrics

### Platform Metrics
- Number of active broker accounts
- Monthly recurring revenue (MRR)
- Churn rate
- Average listings per broker
- Site publish frequency

### Broker Success Metrics
- Website traffic (pageviews)
- Form submissions (leads)
- Time to first publish
- Customer satisfaction

---

## Risk Assessment

### Technical Risks
- **Build times:** May slow down with many listings
- **Custom domains:** DNS setup complexity for brokers
- **Scale:** Need to monitor CDN costs as traffic grows

### Business Risks
- **Adoption:** Brokers may not understand value
- **Competition:** Other website builders exist
- **Support:** Need to handle broker questions/issues

### Mitigation
- Start with MVP, iterate based on feedback
- Provide clear documentation and guides
- Set realistic expectations upfront
- Monitor costs and adjust pricing if needed

---

## Conclusion

This is a **constrained but powerful** MVP that gives brokers professional websites quickly. The limitations are intentional to keep it simple, fast, and maintainable. Focus on execution, gather user feedback, and iterate.

**Key Success Factors:**
1. Fast, reliable site generation
2. Easy onboarding process
3. Clear value proposition
4. Transparent about limitations
5. Good support and documentation

---

*Last Updated: [Current Date]*  
*Version: 1.0 (MVP Planning Phase)*


# MVP Data Hierarchy & Architecture

## Platform Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN PLATFORM SITE                        │
│              (thespecialistrealty.com)                       │
│                                                              │
│  - Landing/Marketing Pages                                   │
│  - Sign Up / Login                                          │
│  - Pricing Page                                             │
│  - Admin Dashboard (Platform Owner)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ manages
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BROKER ACCOUNTS                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Broker Account #1                                   │  │
│  │  - Email: broker1@example.com                        │  │
│  │  - Subscription: Active                              │  │
│  │  - Custom Domain: broker1realty.com                 │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Broker Site (Static Generated)              │  │  │
│  │  │  Domain: broker1realty.com                    │  │  │
│  │  │  - Homepage (with listing cards)              │  │  │
│  │  │  - Individual Listing Pages                   │  │  │
│  │  │  - About Page                                  │  │  │
│  │  │  - Contact Page                                │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Listing Data (JSON/CSV Import)             │  │  │
│  │  │  - Listing ID                                 │  │  │
│  │  │  - Address                                    │  │  │
│  │  │  - Price                                      │  │  │
│  │  │  - Images (URLs)                              │  │  │
│  │  │  - Description                                │  │  │
│  │  │  - Bedrooms/Bathrooms                         │  │  │
│  │  │  - Square Footage                             │  │  │
│  │  │  - Status (Active/Sold/Pending)               │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Site Configuration                          │  │  │
│  │  │  - Theme/Colors                               │  │  │
│  │  │  - Logo                                       │  │  │
│  │  │  - Contact Info                               │  │  │
│  │  │  - Social Links                               │  │  │
│  │  │  - Page Layout (drag-drop config)             │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Broker Account #2                                   │  │
│  │  - Email: broker2@example.com                        │  │
│  │  - Custom Domain: broker2realty.com                 │  │
│  │  ... (same structure)                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Broker Account #N                                   │  │
│  │  ...                                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema (MVP)

### Users Table
```sql
users
├── id (UUID)
├── email (string, unique)
├── password_hash (string)
├── role (enum: 'platform_admin' | 'broker')
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Broker Accounts Table
```sql
broker_accounts
├── id (UUID)
├── user_id (FK → users.id)
├── company_name (string)
├── broker_name (string)
├── custom_domain (string, unique) // broker-owned domain pointed to your shared origin
├── origin_alias (string, unique, internal) // optional internal host you control; not customer-facing
├── subscription_status (enum: 'active' | 'inactive' | 'trial')
├── subscription_tier (enum: 'basic' | 'pro')
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Site Configurations Table
```sql
site_configurations
├── id (UUID)
├── broker_account_id (FK → broker_accounts.id)
├── theme (JSON) // colors, fonts, etc.
├── logo_url (string, nullable)
├── contact_email (string)
├── contact_phone (string, nullable)
├── social_links (JSON) // {facebook, instagram, linkedin, etc.}
├── page_layout (JSON) // drag-drop configuration
├── meta_title (string)
├── meta_description (string)
└── updated_at (timestamp)
```

### Listings Table
```sql
listings
├── id (UUID)
├── broker_account_id (FK → broker_accounts.id)
├── listing_id (string) // external ID from broker
├── address (string)
├── city (string)
├── state (string)
├── zip_code (string)
├── price (decimal)
├── bedrooms (integer, nullable)
├── bathrooms (decimal, nullable)
├── square_feet (integer, nullable)
├── lot_size (string, nullable)
├── property_type (string) // "House", "Condo", etc.
├── status (enum: 'active' | 'sold' | 'pending' | 'off_market')
├── description (text)
├── images (JSON array) // ["url1", "url2", ...]
├── year_built (integer, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Domain Mappings Table
```sql
domain_mappings
├── id (UUID)
├── broker_account_id (FK → broker_accounts.id)
├── custom_domain (string, unique)
├── verification_token (string) // for DNS verification
├── verified (boolean, default: false)
├── ssl_certificate_status (enum: 'pending' | 'active' | 'failed')
└── updated_at (timestamp)
```

## Domain & Routing Model (No Public Subdomains)

- **Shared origin (platform-controlled):** e.g., `sites.thespecialistrealty.com` (or an internal origin_alias). All broker sites deploy to this origin/CDN bucket with tenant keys.
- **Broker custom domains only:** Brokers point `www.brokerdomain.com` (CNAME/ALIAS) to the shared origin. Apex uses ALIAS/ANAME or provider-specific apex CNAME; alternatively A/AAAA to CDN edge that honors Host-based routing.
- **Host-based routing:** Edge inspects `Host` and routes to the broker’s static bundle (segmented by `broker_account_id`).
- **Certificates:** Issue per-custom-domain after DNS verification; renew automatically.

## User Roles & Access

### 1. Platform Admin
- Access: Main platform dashboard
- Can: Manage all broker accounts, view analytics, handle billing

### 2. Broker
- Access: Their own broker dashboard
- Can: 
  - Upload/import listings (CSV/JSON)
  - Configure site (theme, logo, contact info)
  - Set up custom domain
  - Preview site
  - Publish site (triggers static build)
  - View form submissions

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
- [ ] SEO meta tags
- [ ] Responsive design

### Infrastructure
- [ ] Static site generator (Next.js SSG)
- [ ] CDN deployment (Vercel/Netlify)
- [ ] Custom domain support
- [ ] SSL certificate automation
- [ ] Form submission handling (serverless function)

## Data Flow

### Listing Import Flow
```
1. Broker uploads CSV/JSON → 
2. Parse & validate data → 
3. Store in listings table → 
4. Generate static pages → 
5. Deploy to CDN
```

### Site Publishing Flow
```
1. Broker clicks "Publish" → 
2. Fetch listings for broker → 
3. Fetch site configuration → 
4. Generate static HTML pages → 
5. Deploy to custom domain or subdomain → 
6. Update deployment status
```

### Custom Domain Setup Flow
```
1. Broker enters custom domain → 
2. Generate DNS verification token → 
3. Broker adds DNS record (CNAME/ALIAS to shared origin; apex via ALIAS/ANAME or A/AAAA to CDN) → 
4. Verify DNS (polling) → 
5. Request SSL certificate for the custom domain → 
6. Configure CDN host-based routing to broker’s static bundle → 
7. Mark as active
```

## MVP Limitations (By Design)

1. **No Real-time Updates**: Listings require manual re-import and republish
2. **No Search/Filter**: Only pre-generated listing pages
3. **No User Accounts**: All content is public
4. **Basic Forms**: Simple contact form only
5. **No Media Library**: Images must be hosted externally (URLs only)
6. **Single Domain**: One custom domain per broker account
7. **No Analytics Dashboard**: Basic form submissions only

## Next Steps for MVP

1. Set up authentication system
2. Create broker dashboard UI
3. Build listing import functionality
4. Implement static site generator
5. Set up custom domain handling
6. Create form submission endpoint
7. Deploy infrastructure


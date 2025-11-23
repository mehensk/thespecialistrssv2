# SEO Implementation Guide - Step by Step

This guide provides a comprehensive, step-by-step approach to implementing SEO improvements for The Specialist Realty website.

---

## 📋 Overview

**Priority:** ⭐ HIGH PRIORITY  
**Impact:** Search engine visibility, social media sharing, user engagement  
**Status:** ❌ Not Implemented

---

## 🎯 Goals

1. **Dynamic Meta Tags** - Each listing and blog post has unique, optimized meta tags
2. **Open Graph Tags** - Beautiful social media cards when shared
3. **Twitter Cards** - Optimized Twitter sharing
4. **Structured Data (JSON-LD)** - Help search engines understand content
5. **Sitemap** - Help search engines discover all pages
6. **robots.txt** - Control search engine crawling

---

## 📝 Step 1: Dynamic Meta Tags for Listings

### What We Need:
- Unique title for each listing
- Unique description (from listing description)
- Canonical URL
- Open Graph tags (for social sharing)
- Twitter Card tags

### Implementation:

**File:** `src/app/listings/[id]/page.tsx`

Add metadata export function:

```typescript
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch listing data
  const listing = await getListing(params.id);
  
  if (!listing) {
    return {
      title: 'Listing Not Found | The Specialist Realty',
    };
  }

  const title = `${listing.title} | The Specialist Realty`;
  const description = listing.description.substring(0, 160) || `Property in ${listing.location}`;
  const url = `${process.env.NEXTAUTH_URL}/listings/${listing.id}`;
  const image = listing.images && listing.images.length > 0 ? listing.images[0] : '/images/hero-condo.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'The Specialist Realty',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}
```

**Action Items:**
- [ ] Create `getListing()` helper function (if not exists)
- [ ] Add metadata export to listing detail page
- [ ] Test with social media debuggers

---

## 📝 Step 2: Dynamic Meta Tags for Blog Posts

### What We Need:
- Unique title for each blog post
- Unique description (from excerpt or content)
- Canonical URL
- Open Graph tags
- Twitter Card tags

### Implementation:

**File:** `src/app/blog/[slug]/page.tsx`

Add metadata export function:

```typescript
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch blog post data
  const blog = await getBlogBySlug(params.slug);
  
  if (!blog) {
    return {
      title: 'Blog Post Not Found | The Specialist Realty',
    };
  }

  const title = `${blog.title} | The Specialist Realty`;
  const description = blog.excerpt || blog.content.substring(0, 160);
  const url = `${process.env.NEXTAUTH_URL}/blog/${blog.slug}`;
  const image = blog.images && blog.images.length > 0 ? blog.images[0] : '/images/hero-condo.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'The Specialist Realty',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: blog.createdAt,
      authors: [blog.user.name],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}
```

**Action Items:**
- [ ] Create `getBlogBySlug()` helper function (if not exists)
- [ ] Add metadata export to blog detail page
- [ ] Test with social media debuggers

---

## 📝 Step 3: Homepage Meta Tags

### What We Need:
- Optimized homepage title and description
- Open Graph tags for homepage
- Keywords (optional but helpful)

### Implementation:

**File:** `src/app/layout.tsx` or `src/app/page.tsx`

Add metadata:

```typescript
export const metadata: Metadata = {
  title: {
    default: 'The Specialist Realty - Real Estate Solutions Made Easy',
    template: '%s | The Specialist Realty',
  },
  description: 'Sales, Rentals, and Documentation assistance across Metro Manila. Work with a licensed broker backed by a trusted network and decades of finance & admin expertise.',
  keywords: ['real estate', 'property', 'Metro Manila', 'condominium', 'house and lot', 'rental', 'sale'],
  openGraph: {
    title: 'The Specialist Realty - Real Estate Solutions Made Easy',
    description: 'Sales, Rentals, and Documentation assistance across Metro Manila.',
    url: process.env.NEXTAUTH_URL,
    siteName: 'The Specialist Realty',
    images: [
      {
        url: '/images/hero-condo.jpg',
        width: 1200,
        height: 630,
        alt: 'The Specialist Realty',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Specialist Realty - Real Estate Solutions Made Easy',
    description: 'Sales, Rentals, and Documentation assistance across Metro Manila.',
    images: ['/images/hero-condo.jpg'],
  },
};
```

**Action Items:**
- [ ] Add metadata to root layout
- [ ] Verify homepage meta tags

---

## 📝 Step 4: Structured Data (JSON-LD)

### What We Need:
- JSON-LD schema for listings (RealEstateAgent, Product schema)
- JSON-LD schema for blog posts (Article schema)
- Organization schema for homepage

### Implementation:

**File:** `src/components/seo/listing-schema.tsx`

Create structured data component:

```typescript
interface ListingSchemaProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number | null;
    location: string;
    city: string | null;
    images: string[];
    propertyType: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    size: number | null;
    listingType: string | null;
  };
}

export function ListingSchema({ listing }: ListingSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'PHP',
      availability: listing.listingType === 'rent' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.city || listing.location,
      addressCountry: 'PH',
    },
    numberOfRooms: listing.bedrooms,
    numberOfBathroomsTotal: listing.bathrooms,
    floorSize: listing.size ? {
      '@type': 'QuantitativeValue',
      value: listing.size,
      unitCode: 'MTK',
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**File:** `src/components/seo/blog-schema.tsx`

Create blog structured data:

```typescript
interface BlogSchemaProps {
  blog: {
    id: string;
    title: string;
    description: string;
    content: string;
    images: string[];
    createdAt: string;
    user: {
      name: string;
    };
  };
}

export function BlogSchema({ blog }: BlogSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description,
    image: blog.images,
    datePublished: blog.createdAt,
    author: {
      '@type': 'Person',
      name: blog.user.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Specialist Realty',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXTAUTH_URL}/images/hero-condo.jpg`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Action Items:**
- [ ] Create `src/components/seo/listing-schema.tsx`
- [ ] Create `src/components/seo/blog-schema.tsx`
- [ ] Create `src/components/seo/organization-schema.tsx` for homepage
- [ ] Add schema components to respective pages
- [ ] Test with Google Rich Results Test

---

## 📝 Step 5: Dynamic Sitemap

### What We Need:
- XML sitemap that includes all listings
- XML sitemap that includes all blog posts
- Auto-updates when new content is added

### Implementation:

**File:** `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yoursite.com';

  // Fetch all published listings
  const listings = await prisma.listing.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
  });

  // Fetch all published blog posts
  const blogs = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Listing pages
  const listingPages = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog pages
  const blogPages = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...listingPages, ...blogPages];
}
```

**Action Items:**
- [ ] Create `src/app/sitemap.ts`
- [ ] Test sitemap at `/sitemap.xml`
- [ ] Submit to Google Search Console

---

## 📝 Step 6: robots.txt

### What We Need:
- Allow search engines to crawl public pages
- Disallow admin/dashboard pages
- Reference sitemap location

### Implementation:

**File:** `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yoursite.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/login',
          '/_next/',
          '/uploads/', // If you don't want uploaded images indexed
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

**Action Items:**
- [ ] Create `src/app/robots.ts`
- [ ] Test robots.txt at `/robots.txt`
- [ ] Verify with Google Search Console

---

## 📝 Step 7: Image Optimization for Social Sharing

### What We Need:
- Optimized images for Open Graph (1200x630px recommended)
- Fallback image if listing/blog has no images
- Proper image URLs (absolute URLs, not relative)

### Implementation:

**Helper Function:** `src/lib/seo-utils.ts`

```typescript
export function getAbsoluteImageUrl(imagePath: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yoursite.com';
  
  // If already absolute URL (Cloudinary, etc.), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If relative path, make it absolute
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}

export function getSocialImage(listing: { images: string[] }): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yoursite.com';
  
  if (listing.images && listing.images.length > 0) {
    return getAbsoluteImageUrl(listing.images[0]);
  }
  
  // Fallback to default image
  return `${baseUrl}/images/hero-condo.jpg`;
}
```

**Action Items:**
- [ ] Create `src/lib/seo-utils.ts`
- [ ] Use helper functions in metadata exports
- [ ] Ensure all images use absolute URLs

---

## 📝 Step 8: Testing & Validation

### Tools to Use:

1. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Test: Paste your listing/blog URL
   - Verify: Open Graph tags display correctly
   - Action: Click "Scrape Again" after making changes

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Test: Paste your listing/blog URL
   - Verify: Twitter Card preview looks good

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Test: Paste your listing/blog URL
   - Verify: LinkedIn preview looks good

4. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Test: Paste your listing/blog URL
   - Verify: Structured data is valid

5. **Google Search Console**
   - Submit sitemap
   - Monitor indexing status
   - Check for errors

### Testing Checklist:

- [ ] Homepage meta tags correct
- [ ] Listing detail pages have unique meta tags
- [ ] Blog detail pages have unique meta tags
- [ ] Open Graph tags work (test on Facebook)
- [ ] Twitter Cards work (test on Twitter)
- [ ] Images display correctly in social shares
- [ ] Structured data validates (Google Rich Results)
- [ ] Sitemap generates correctly (`/sitemap.xml`)
- [ ] robots.txt works correctly (`/robots.txt`)
- [ ] All URLs use absolute paths
- [ ] Canonical URLs are correct

---

## 📝 Step 9: Implementation Order

### Phase 1: Critical (Do First)
1. ✅ **Step 1:** Dynamic meta tags for listings
2. ✅ **Step 2:** Dynamic meta tags for blog posts
3. ✅ **Step 3:** Homepage meta tags
4. ✅ **Step 7:** Image optimization helpers

### Phase 2: Important (Do Second)
5. ✅ **Step 4:** Structured data (JSON-LD)
6. ✅ **Step 5:** Dynamic sitemap
7. ✅ **Step 6:** robots.txt

### Phase 3: Validation (Do Last)
8. ✅ **Step 8:** Testing & validation

---

## 🔧 Helper Functions Needed

### 1. Get Listing Function

**File:** `src/lib/listings.ts` (or create new)

```typescript
import { prisma } from './prisma';

export async function getListing(id: string) {
  return await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      location: true,
      city: true,
      images: true,
      propertyType: true,
      bedrooms: true,
      bathrooms: true,
      size: true,
      listingType: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}
```

### 2. Get Blog by Slug Function

**File:** `src/lib/blogs.ts` (or create new)

```typescript
import { prisma } from './prisma';

export async function getBlogBySlug(slug: string) {
  return await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      slug: true,
      images: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}
```

---

## 📊 Expected Results

### Before SEO Implementation:
- ❌ Generic meta tags for all pages
- ❌ Poor social media sharing (no preview cards)
- ❌ No structured data
- ❌ Search engines can't understand content structure
- ❌ No sitemap for search engines

### After SEO Implementation:
- ✅ Unique, optimized meta tags for each listing/blog
- ✅ Beautiful social media cards when shared
- ✅ Rich snippets in search results
- ✅ Better search engine rankings
- ✅ More organic traffic
- ✅ Professional appearance when shared

---

## 🚀 Quick Start

1. **Start with Step 1** - Add metadata to listing detail page
2. **Test immediately** - Use Facebook Sharing Debugger
3. **Continue with Step 2** - Add metadata to blog detail page
4. **Add structured data** - Step 4
5. **Create sitemap** - Step 5
6. **Final testing** - Step 8

---

## 📝 Notes

- **Image Requirements:**
  - Open Graph images: 1200x630px recommended
  - Twitter Cards: 1200x630px for large image cards
  - Images should be high quality
  - Use absolute URLs (full URL, not relative)

- **URL Requirements:**
  - All URLs in meta tags must be absolute
  - Use `process.env.NEXTAUTH_URL` for base URL
  - Ensure canonical URLs are correct

- **Performance:**
  - Metadata generation should be fast
  - Consider caching if needed
  - Use `select` in Prisma queries to only fetch needed fields

---

## ✅ Implementation Checklist

### Meta Tags
- [ ] Listing detail page metadata
- [ ] Blog detail page metadata
- [ ] Homepage metadata
- [ ] Listings page metadata
- [ ] Blog listing page metadata

### Open Graph & Twitter Cards
- [ ] Open Graph tags for listings
- [ ] Open Graph tags for blogs
- [ ] Twitter Card tags for listings
- [ ] Twitter Card tags for blogs
- [ ] Test on Facebook
- [ ] Test on Twitter
- [ ] Test on LinkedIn

### Structured Data
- [ ] Listing schema (Product/RealEstateAgent)
- [ ] Blog schema (Article/BlogPosting)
- [ ] Organization schema (homepage)
- [ ] Validate with Google Rich Results Test

### Sitemap & Robots
- [ ] Dynamic sitemap generation
- [ ] robots.txt configuration
- [ ] Submit sitemap to Google Search Console

### Testing
- [ ] All pages have unique meta tags
- [ ] Social sharing works correctly
- [ ] Structured data validates
- [ ] Sitemap is accessible
- [ ] robots.txt is correct

---

**Ready to implement?** Start with Step 1 and work through each step systematically. Test after each major change to ensure everything works correctly.


# Understanding Listing Detail Page (src/app/listings/[id]/page.tsx)
## A Beginner's Guide

This document explains the individual property detail page code line by line in plain language. This page shows details for a single property.

---

## OVERVIEW

This is a **Server Component** that:
- Uses dynamic routing (URL contains listing ID)
- Fetches single listing from database
- Generates SEO metadata for each listing
- Controls access to unpublished listings
- Displays full property details

---

## IMPORTS (Lines 1-8)

### What's Happening:
These lines import necessary tools and components.

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCachedListingIds } from '@/lib/cache';
import { ListingDetailClient } from '@/components/listings/ListingDetailClient';
import { formatBedrooms } from '@/lib/location-utils';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
```

### Why These Imports:

**Line 1 (Metadata Type):**
```typescript
import { Metadata } from 'next';
```
- TypeScript type for SEO metadata
- Used for page title, description, OpenGraph tags
- Think of it as: "Get the blueprint for SEO information"

**Line 2 (notFound Function):**
```typescript
import { notFound } from 'next/navigation';
```
- Shows 404 page when content doesn't exist
- Think of it as: "Get the tool that shows 'Page Not Found' when something is missing"

**Line 3 (Link Component):**
```typescript
import Link from 'next/link';
```
- Creates navigation links without full page reload
- Think of it as: "Get the tool for clickable links that don't reload the whole page"

**Line 4 (Icon):**
```typescript
import { ArrowLeft } from 'lucide-react';
```
- Back arrow icon
- Think of it as: "Get the left arrow icon for the back button"

**Line 5 (Cache Utility):**
```typescript
import { getCachedListingIds } from '@/lib/cache';
```
- Gets cached list of listing IDs
- Used for static generation
- Think of it as: "Get the tool that fetches listing IDs from cache"

**Line 6 (Client Component):**
```typescript
import { ListingDetailClient } from '@/components/listings/ListingDetailClient';
```
- A client component that displays listing details
- Think of it as: "Get the component that actually shows the property information"

**Line 7 (Formatting Utility):**
```typescript
import { formatBedrooms } from '@/lib/location-utils';
```
- Formats bedroom text (like "Studio", "2 bedrooms")
- Think of it as: "Get the tool that makes bedroom text look nice"

**Line 8 (Auth Helper):**
```typescript
import { getAuthenticatedUser } from '@/lib/auth-helpers';
```
- Gets the currently logged-in user
- Think of it as: "Get the tool that tells us who's logged in"

**Line 9 (Prisma Client):**
```typescript
import { prisma } from '@/lib/prisma';
```
- Database client for querying data
- Think of it as: "Get the tool that talks to our database"

**Line 10 (User Role Type):**
```typescript
import { UserRole } from '@prisma/client';
```
- TypeScript type for user roles (ADMIN, AGENT, WRITER)
- Think of it as: "Get the list of possible user roles"

---

## DYNAMIC ROUTING EXPLANATION

### What's in the File Path:
Notice the file is named `[id]/page.tsx`:
- The square brackets `[id]` mean this is a **dynamic route**
- Any URL like `/listings/abc123` will match this file
- The `abc123` part becomes the `id` parameter
- Think of it as: "This page works for ANY listing ID, not just one specific one"

### Example:
- `/listings/abc123def` → `id` is `"abc123def"`
- `/listings/xyz789` → `id` is `"xyz789"`
- Each ID corresponds to a different property in the database

---

## STATIC PARAMS GENERATION (Lines 13-23)

### What's Happening:
This function generates static HTML for top 100 listings during build time.

```typescript
// ISR: Generate static params for top 100 listings
// Made more resilient to handle build-time errors
export async function generateStaticParams() {
  try {
    const listingIds = await getCachedListingIds(100);
    return listingIds.map((id) => ({ id }));
  } catch (error) {
    // Gracefully handle errors during build (e.g., database not available)
    console.error('Error generating static params for listings:', error);
    // Return empty array - routes will be generated on-demand
    return [];
  }
}
```

### Why generateStaticParams:
This is for **Incremental Static Regeneration (ISR)**:
- Pre-builds HTML for top 100 listings at build time
- Makes those pages load instantly (no database query needed)
- Other listings still work, they just generate on-demand
- Think of it as: "Build the first 100 property pages in advance, so they load super fast"

**Line 14 (Comment):**
```typescript
// ISR: Generate static params for top 100 listings
```
- Comments explain this is for ISR
- Think of it as: "Note to developers: this builds pages ahead of time"

**Line 16 (Function Definition):**
```typescript
export async function generateStaticParams() {
```
- This is a special Next.js function
- Runs at build time (when website is being built)
- `export async`: Must be exported and async
- Think of it as: "Create a special function that Next.js runs while building the site"

**Line 17-18 (Try Block):**
```typescript
try {
  const listingIds = await getCachedListingIds(100);
```
- Tries to get top 100 listing IDs from cache
- If this fails, it jumps to the catch block
- Think of it as: "Try to get the top 100 listing IDs, and if that fails, handle the error"

**Line 19 (Transform IDs):**
```typescript
return listingIds.map((id) => ({ id }));
```
- Converts array of IDs to array of objects
- Each object has an `id` property
- Example: `["abc", "def"]` becomes `[{id: "abc"}, {id: "def"}]`
- Think of it as: "Turn the list of IDs into the format Next.js expects"

**Lines 20-22 (Error Handling):**
```typescript
catch (error) {
  console.error('Error generating static params for listings:', error);
  // Return empty array - routes will be generated on-demand
  return [];
}
```
- If something goes wrong (like database not available during build)
- Logs the error
- Returns empty array (pages will generate when visited instead)
- Think of it as: "If we can't build pages ahead of time, that's okay - we'll build them when users visit"

---

## DYNAMIC ROUTE CONFIG (Lines 25-28)

### What's Happening:
Tells Next.js this route should always be dynamic (not fully static).

```typescript
// Make this route dynamic to handle unpublished listings
export const dynamic = 'force-dynamic';

// Revalidate every hour
export const revalidate = 3600;
```

### Why force-dynamic:
- Even though we generate static params, we still want to fetch fresh data
- Unpublished listings need to be accessible to owners
- Think of it as: "Always fetch fresh data from database, don't use cached static version"

**Line 26:**
```typescript
export const dynamic = 'force-dynamic';
```
- Tells Next.js to always render this route dynamically
- Not purely static HTML
- Think of it as: "Don't use pre-built HTML - always check the database"

**Line 29:**
```typescript
export const revalidate = 3600;
```
- ISR revalidation time (in seconds)
- 3600 seconds = 1 hour
- Think of it as: "Refresh the cached version every hour"

---

## METADATA GENERATION (Lines 31-86)

### What's Happening:
This function generates SEO metadata for each listing (title, description, social media tags).

```typescript
// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    // Fetch listing directly from database (no cache for simplicity)
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        // ... more fields
      },
    });
    
    if (!listing || !listing.isPublished) {
      return {
        title: 'Property Not Found | The Specialist Realty',
        description: 'The property you are looking for does not exist.',
      };
    }

    const title = `${listing.title} | The Specialist Realty`;
    // Only show bedrooms in metadata if it's > 0 or it's a condominium with 0 (Studio)
    const bedroomsText = listing.bedrooms !== null && listing.bedrooms !== undefined 
      ? (listing.bedrooms === 0 && listing.propertyType?.toLowerCase() === 'condominium' 
          ? 'Studio unit' 
          : listing.bedrooms > 0 
            ? `${listing.bedrooms} bedrooms`
            : '')
      : '';
    const description = listing.description 
      ? listing.description.substring(0, 160) + (listing.description.length > 160 ? '...' : '')
      : `View ${listing.title} in ${listing.city || listing.location}. ${bedroomsText ? `${bedroomsText} ` : ''}${listing.bathrooms ? `${listing.bathrooms} bathrooms ` : ''}${listing.price ? `₱${listing.price.toLocaleString()}` : 'Price on request'}.`;
    
    const image = listing.images && listing.images.length > 0 ? listing.images[0] : undefined;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thespecialistrealty.com';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [{ url: image, width: 1200, height: 630 }] : [],
        url: `${siteUrl}/listings/${id}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Property | The Specialist Realty',
      description: 'View property details on The Specialist Realty',
    };
  }
}
```

### Why generateMetadata:
- Search engines (Google) read the page title and description
- Social media sites (Facebook, Twitter) show preview cards
- Good SEO helps the page rank higher in search results
- Think of it as: "Create a nice summary of the page for search engines and social media"

**Line 32 (Function Signature):**
```typescript
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
```
- This is another special Next.js function
- Takes `params` (contains the `id` from URL)
- Returns a `Metadata` object
- Think of it as: "Create a function that returns SEO information"

**Line 33:**
```typescript
const { id } = await params;
```
- Extracts the `id` from params
- `await params`: params is a Promise (async), so we await it
- Think of it as: "Get the listing ID from the URL"

**Line 34-57 (Fetch Listing):**
```typescript
const listing = await prisma.listing.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    description: true,
    price: true,
    location: true,
    city: true,
    address: true,
    bedrooms: true,
    bathrooms: true,
    size: true,
    propertyType: true,
    listingType: true,
    images: true,
    yearBuilt: true,
    parking: true,
    floor: true,
    totalFloors: true,
    amenities: true,
    propertyId: true,
    available: true,
    isPublished: true,
    userId: true,
    createdAt: true,
    user: {
      select: { name: true },
    },
  },
});
```
- Fetches the listing from database
- `findUnique`: Find one specific listing by ID
- `select`: Only get specific fields (not all database columns)
- Think of it as: "Get this one listing from the database, but only these specific fields"

**Lines 59-64 (Handle Not Found/Unpublished):**
```typescript
if (!listing || !listing.isPublished) {
  return {
    title: 'Property Not Found | The Specialist Realty',
    description: 'The property you are looking for does not exist.',
  };
}
```
- If listing doesn't exist OR isn't published
- Return generic metadata (don't reveal it exists)
- Think of it as: "If the property doesn't exist or is hidden, don't show any details"

**Lines 66-68 (Create Title):**
```typescript
const title = `${listing.title} | The Specialist Realty`;
```
- Creates page title
- Combines listing title with company name
- Example: "Modern Condo in Makati | The Specialist Realty"
- Think of it as: "Make the page title show both property name and company name"

**Lines 70-75 (Create Bedrooms Text):**
```typescript
const bedroomsText = listing.bedrooms !== null && listing.bedrooms !== undefined 
  ? (listing.bedrooms === 0 && listing.propertyType?.toLowerCase() === 'condominium' 
      ? 'Studio unit' 
      : listing.bedrooms > 0 
        ? `${listing.bedrooms} bedrooms`
        : '')
  : '';
```

This creates bedroom text for metadata:
- If bedrooms is null/undefined, use empty string
- If bedrooms is 0 and it's a condo, use "Studio unit"
- If bedrooms is greater than 0, use "X bedrooms"
- Otherwise, use empty string

Think of it as: "Make nice text for bedrooms, handling the special case of studios"

**Lines 77-78 (Create Description):**
```typescript
const description = listing.description 
  ? listing.description.substring(0, 160) + (listing.description.length > 160 ? '...' : '')
  : `View ${listing.title} in ${listing.city || listing.location}. ${bedroomsText ? `${bedroomsText} ` : ''}${listing.bathrooms ? `${listing.bathrooms} bathrooms ` : ''}${listing.price ? `₱${listing.price.toLocaleString()}` : 'Price on request'}.`;
```

This is complex but here's what it does:
- If there's a description: use first 160 characters (add "..." if longer)
- If no description: create one from listing details
- Includes title, location, bedrooms, bathrooms, price
- Think of it as: "Either use the property description, or create one from the details"

**Line 80 (Get Main Image):**
```typescript
const image = listing.images && listing.images.length > 0 ? listing.images[0] : undefined;
```
- Gets the first image from the listing
- Used for OpenGraph and Twitter cards
- Think of it as: "Get the main image to show when someone shares the page"

**Line 81 (Get Site URL):**
```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thespecialistrealty.com';
```
- Gets the site URL from environment variables
- Falls back to default if not set
- Think of it as: "Get the website address, or use the default one"

**Lines 83-93 (Return Metadata Object):**
```typescript
return {
  title,
  description,
  openGraph: {
    title,
    description,
    images: image ? [{ url: image, width: 1200, height: 630 }] : [],
    url: `${siteUrl}/listings/${id}`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: image ? [image] : [],
  },
};
```

This returns all the metadata:
- `title` and `description`: Basic SEO
- `openGraph`: For Facebook, LinkedIn, etc.
- `twitter`: For Twitter/X
- Think of it as: "Return all the SEO information in the format Next.js expects"

**Lines 94-98 (Error Handling):**
```typescript
catch (error) {
  console.error('Error generating metadata:', error);
  return {
    title: 'Property | The Specialist Realty',
    description: 'View property details on The Specialist Realty',
  };
}
```
- If something goes wrong, return generic metadata
- Don't let errors break the page
- Think of it as: "If we can't create custom metadata, just use a generic one"

---

## MAIN PAGE COMPONENT (Lines 100-191)

### What's Happening:
This is the main page component that fetches and displays the listing.

```typescript
export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    // Fetch listing directly from database (no cache for simplicity and reliability)
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        // ... more fields
      },
    });

    if (!listing) {
      notFound();
    }

    // If listing is not published, check if user has access
    if (!listing.isPublished) {
      // Try to get authenticated user, but don't require it
      const user = await getAuthenticatedUser({} as any);
      
      // Allow access if:
      // 1. User is authenticated and owns the listing, OR
      // 2. User is an admin
      const hasAccess = user && (
        listing.userId === user.id || 
        user.role === UserRole.ADMIN
      );
      
      if (!hasAccess) {
        notFound();
      }
    }

    return (
      <div className="min-h-screen bg-white pt-[84px]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-[#111111]/70">
              <Link href="/" className="hover:text-[#111111] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/listings" className="hover:text-[#111111] transition-colors">Listings</Link>
              <span>/</span>
              <span className="text-[#111111]">Property Details</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Back Button */}
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Listings</span>
          </Link>

          <ListingDetailClient listing={listing as any} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching listing:', error);
    notFound();
  }
}
```

### Why Server Component:
- No 'use client' directive means it's a Server Component
- Runs on the server (not in user's browser)
- Can do async operations (database queries)
- Better for SEO (search engines can read the HTML)
- Think of it as: "This code runs on the server, not in the user's browser"

**Line 100 (Function Signature):**
```typescript
export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
```
- `async`: Can use await (for database queries)
- `export default`: This is the main component for this page
- `params`: Contains the ID from the URL
- Think of it as: "Create the main page component that receives the listing ID"

**Line 101:**
```typescript
const { id } = await params;
```
- Extracts the ID from params
- `await params`: params is a Promise
- Think of it as: "Get the listing ID from the URL"

**Line 103-127 (Fetch Listing):**
```typescript
const listing = await prisma.listing.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    description: true,
    price: true,
    location: true,
    city: true,
    address: true,
    bedrooms: true,
    bathrooms: true,
    size: true,
    propertyType: true,
    listingType: true,
    images: true,
    yearBuilt: true,
    parking: true,
    floor: true,
    totalFloors: true,
    amenities: true,
    propertyId: true,
    available: true,
    isPublished: true,
    userId: true,
    createdAt: true,
    user: {
      select: { name: true, email: true },
    },
  },
});
```
- Fetches listing from database
- Similar to metadata fetch but includes email field
- Think of it as: "Get the full listing data from the database"

**Lines 129-131 (Handle Not Found):**
```typescript
if (!listing) {
  notFound();
}
```
- If listing doesn't exist, show 404 page
- Think of it as: "If we can't find this property, show the 'Page Not Found' page"

**Lines 133-149 (Access Control for Unpublished Listings):**
```typescript
if (!listing.isPublished) {
  // Try to get authenticated user, but don't require it
  const user = await getAuthenticatedUser({} as any);
  
  // Allow access if:
  // 1. User is authenticated and owns the listing, OR
  // 2. User is an admin
  const hasAccess = user && (
    listing.userId === user.id || 
    user.role === UserRole.ADMIN
  );
  
  if (!hasAccess) {
    notFound();
  }
}
```

This is important access control:
- If listing is not published, check if user has access
- User has access if they own the listing OR they're an admin
- Otherwise, show 404 page
- Think of it as: "If this property is hidden, only let the owner or admin see it"

**Line 136 (Get Authenticated User):**
```typescript
const user = await getAuthenticatedUser({} as any);
```
- Tries to get the logged-in user
- `{} as any`: Passing empty object (typing quirk)
- Think of it as: "Check if someone is logged in"

**Lines 140-142 (Check Access):**
```typescript
const hasAccess = user && (
  listing.userId === user.id || 
  user.role === UserRole.ADMIN
);
```
- Checks if user exists AND (owns listing OR is admin)
- Uses AND (`&&`) and OR (`||`) operators
- Think of it as: "Only give access if user is the owner or an admin"

**Lines 152-159 (Breadcrumb):**
```typescript
{/* Breadcrumb */}
<div className="bg-white border-b border-[#E5E7EB]">
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
    <div className="flex items-center gap-2 text-sm text-[#111111]/70">
      <Link href="/" className="hover:text-[#111111] transition-colors">Home</Link>
      <span>/</span>
      <Link href="/listings" className="hover:text-[#111111] transition-colors">Listings</Link>
      <span>/</span>
      <span className="text-[#111111]">Property Details</span>
    </div>
  </div>
</div>
```
- Shows navigation path: Home / Listings / Property Details
- Helps users understand where they are
- Think of it as: "Show a trail showing how to get back to previous pages"

**Lines 161-169 (Back Button):**
```typescript
{/* Back Button */}
<Link
  href="/listings"
  className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] mb-6 transition-colors"
>
  <ArrowLeft size={20} />
  <span>Back to Listings</span>
</Link>
```
- Link back to listings page
- Has an arrow icon
- Think of it as: "A button to go back to the listings page"

**Line 171 (Client Component):**
```typescript
<ListingDetailClient listing={listing as any} />
```
- Passes the listing data to a client component
- The client component handles interactivity (like contact forms)
- Think of it as: "Let this other component handle showing the details, I'll just get the data"

**Lines 189-191 (Error Handling):**
```typescript
catch (error) {
  console.error('Error fetching listing:', error);
  notFound();
}
```
- If anything goes wrong, show 404 page
- Think of it as: "If there's any error, just show the 'Page Not Found' page"

---

## SUMMARY

This page demonstrates:
1. **Dynamic routing** with `[id]` in filename
2. **Server-side rendering** (no 'use client')
3. **Static generation** with `generateStaticParams`
4. **SEO optimization** with `generateMetadata`
5. **Database queries** with Prisma
6. **Access control** for unpublished content
7. **Error handling** with try-catch blocks
8. **ISR (Incremental Static Regeneration)** for performance

---

## KEY CONCEPTS FOR BEGINNERS:

1. **Dynamic Routes**: Filenames with `[param]` match any value
2. **Server Components**: Run on server, can do async operations
3. **Client Components**: Run in browser, handle interactivity
4. **generateStaticParams**: Pre-builds pages at build time
5. **generateMetadata**: Creates SEO metadata for each page
6. **ISR**: Incremental Static Regeneration (best of both worlds)
7. **Access Control**: Checking if user is allowed to see content
8. **notFound()**: Shows 404 page
9. **Prisma**: Database ORM for querying data
10. **Async/Await**: Handling operations that take time (like database queries)

---

## HOW IT WORKS:

1. User visits `/listings/abc123` → Next.js extracts `abc123` as the `id`
2. Next.js runs `generateStaticParams` to pre-build pages (if in top 100)
3. Next.js runs `generateMetadata` to create SEO tags
4. Next.js runs the main component to fetch and render the page
5. If listing is unpublished, checks if user has access
6. Fetches listing data from database
7. Passes data to client component for display
8. User sees the property details page

---

## ACCESS CONTROL FLOW:

1. User requests `/listings/abc123`
2. Server fetches listing from database
3. If listing doesn't exist → Show 404 page
4. If listing is published → Show the page
5. If listing is NOT published:
   a. Try to get logged-in user
   b. If no user logged in → Show 404 page
   c. If user logged in:
      i. If user owns the listing → Show the page
      ii. If user is admin → Show the page
      iii. Otherwise → Show 404 page

---

## SEO BENEFITS:

1. **Dynamic Metadata**: Each listing has unique title and description
2. **OpenGraph**: Nice preview cards when shared on social media
3. **Twitter Cards**: Optimized for Twitter/X sharing
4. **Server-Side Rendering**: Search engines can read the HTML
5. **Static Generation**: Fast page loads for top listings

---

## WHY SPLIT SERVER/CLIENT:

- **Server Component**: Handles data fetching, access control, SEO
- **Client Component**: Handles interactivity (forms, animations, maps)
- This separation is a best practice in Next.js
- Think of it as: "Server gets the data, Client makes it interactive"
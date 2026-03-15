import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCachedListingIds } from '@/lib/cache';
import { ListingDetailClient } from '@/components/listings/ListingDetailClient';
import { ListingSchema } from '@/components/seo/listing-schema';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Prisma, UserRole } from '@prisma/client';
import {
  buildCanonicalListingPath,
  buildCanonicalListingSegment,
  parseCanonicalListingSegment,
} from '@/lib/listing-slug';

const listingSelect = {
  id: true,
  slug: true,
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
} as const;

type ListingRecord = Prisma.ListingGetPayload<{ select: typeof listingSelect }>;

async function canAccessListing(listing: { isPublished: boolean; userId: string }) {
  if (listing.isPublished) {
    return true;
  }

  const user = await getAuthenticatedUser({} as any);
  return Boolean(user && (listing.userId === user.id || user.role === UserRole.ADMIN));
}

async function resolveListingFromSegment(segment: string) {
  const trimmedSegment = segment.trim();
  const normalizedSegment = trimmedSegment.toLowerCase();
  const canonicalParsed = parseCanonicalListingSegment(trimmedSegment);

  if (!canonicalParsed) {
    const listing = await prisma.listing.findUnique({
      where: { id: trimmedSegment },
      select: listingSelect,
    });

    if (!listing) {
      return { listing: null, isCanonicalRequest: false, shouldRedirect: false, canonicalPath: null };
    }

    return {
      listing,
      isCanonicalRequest: false,
      shouldRedirect: true,
      canonicalPath: buildCanonicalListingPath(listing.slug, listing.id),
    };
  }

  const candidates = await prisma.listing.findMany({
    where: {
      id: { endsWith: canonicalParsed.shortId },
    },
    select: listingSelect,
  });

  if (candidates.length === 0) {
    return { listing: null, isCanonicalRequest: true, shouldRedirect: false, canonicalPath: null };
  }

  let listing: ListingRecord | null = null;

  if (candidates.length === 1) {
    listing = candidates[0];
  } else {
    const slugMatches = candidates.filter((candidate) => candidate.slug === canonicalParsed.slugPart);
    if (slugMatches.length === 1) {
      listing = slugMatches[0];
    }
  }

  if (!listing) {
    return { listing: null, isCanonicalRequest: true, shouldRedirect: false, canonicalPath: null };
  }

  const canonicalSegment = buildCanonicalListingSegment(listing.slug, listing.id);
  const canonicalPath = `/listings/${canonicalSegment}`;

  return {
    listing,
    isCanonicalRequest: true,
    shouldRedirect: canonicalSegment !== normalizedSegment,
    canonicalPath,
  };
}

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

// Make this route dynamic to handle unpublished listings
export const dynamic = 'force-dynamic';

// Revalidate every hour
export const revalidate = 3600;

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: segment } = await params;

  try {
    const resolved = await resolveListingFromSegment(segment);
    if (!resolved.listing) {
      return {
        title: 'Property Not Found | The Specialist Realty',
        description: 'The property you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const listing = resolved.listing;
    const hasAccess = await canAccessListing(listing);

    if (!hasAccess) {
      return {
        title: 'Property Not Found | The Specialist Realty',
        description: 'The property you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
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
      : `View ${listing.title} in ${listing.city || listing.location}. ${bedroomsText ? `${bedroomsText} ` : ''}${listing.bathrooms ? `${listing.bathrooms} bathrooms ` : ''}${listing.price ? `PHP ${listing.price.toLocaleString()}` : 'Price on request'}.`;

    const image = listing.images && listing.images.length > 0 ? listing.images[0] : undefined;
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://thespecialistrealty.com').replace(/\/$/, '');
    const canonicalPath = resolved.canonicalPath ?? buildCanonicalListingPath(listing.slug, listing.id);
    const canonicalUrl = `${siteUrl}${canonicalPath}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      robots: listing.isPublished
        ? undefined
        : {
            index: false,
            follow: false,
          },
      openGraph: {
        title,
        description,
        images: image ? [{ url: image, width: 1200, height: 630 }] : [],
        url: canonicalUrl,
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
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: segment } = await params;

  const resolved = await resolveListingFromSegment(segment);
  const listing = resolved.listing;

  if (!listing) {
    notFound();
  }

  const hasAccess = await canAccessListing(listing);
  if (!hasAccess) {
    notFound();
  }

  if (resolved.shouldRedirect && resolved.canonicalPath) {
    permanentRedirect(resolved.canonicalPath);
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://thespecialistrealty.com').replace(/\/$/, '');
  const canonicalPath = resolved.canonicalPath ?? buildCanonicalListingPath(listing.slug, listing.id);
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  return (
    <div className="min-h-screen bg-white pt-[84px]">
      {listing.isPublished && (
        <ListingSchema
          canonicalUrl={canonicalUrl}
          listing={listing}
        />
      )}
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
}

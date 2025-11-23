import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCachedListing, getCachedListingIds } from '@/lib/cache';
import { ListingDetailClient } from '@/components/listings/ListingDetailClient';

// ISR: Generate static params for top 100 listings
export async function generateStaticParams() {
  try {
    const listingIds = await getCachedListingIds(100);
    return listingIds.map((id) => ({ id }));
  } catch (error) {
    console.error('Error generating static params for listings:', error);
    return [];
  }
}

// Revalidate every hour
export const revalidate = 3600;

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const listing = await getCachedListing(id);
    
    if (!listing || !listing.isPublished) {
      return {
        title: 'Property Not Found | The Specialist Realty',
        description: 'The property you are looking for does not exist.',
      };
    }

    const title = `${listing.title} | The Specialist Realty`;
    const description = listing.description 
      ? listing.description.substring(0, 160) + (listing.description.length > 160 ? '...' : '')
      : `View ${listing.title} in ${listing.city || listing.location}. ${listing.bedrooms ? `${listing.bedrooms} bedrooms` : ''} ${listing.bathrooms ? `${listing.bathrooms} bathrooms` : ''}. ${listing.price ? `₱${listing.price.toLocaleString()}` : 'Price on request'}.`;
    
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

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const listing = await getCachedListing(id);

    if (!listing || !listing.isPublished) {
      notFound();
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

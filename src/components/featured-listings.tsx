'use client';

import { useState, useEffect } from 'react';
import { ListingCard } from '@/components/listings/ListingCard';

interface Listing {
  id: string;
  slug: string | null;
  title: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number | null;
  city: string | null;
  propertyType: string | null;
  listingType: string;
  images: string[];
  location: string | null;
  address: string | null;
  parking: number | null;
  yearBuilt: number | null;
  floor: number | null;
  totalFloors: number | null;
  createdAt: string;
}

interface FeaturedListingsProps {
  cardVariant?: 'landing';
}

export function FeaturedListings({ cardVariant }: FeaturedListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        // Only fetch 12 listings from the API instead of all
        const response = await fetch('/api/listings?published=true&limit=12');
        const data = await response.json();

        if (response.ok && data.listings) {
          // Transform API listings to match expected format
          const transformedListings: Listing[] = data.listings.map((listing: any) => {
            // Properly handle bedrooms - preserve null/undefined, convert to number otherwise
            const bedrooms =
              listing.bedrooms === null || listing.bedrooms === undefined || listing.bedrooms === ''
                ? null
                : Number(listing.bedrooms);

            return {
              id: listing.id,
              slug: listing.slug ?? null,
              title: listing.title || '',
              price: listing.price || null,
              bedrooms,
              bathrooms:
                listing.bathrooms === null || listing.bathrooms === undefined || listing.bathrooms === ''
                  ? null
                  : Number(listing.bathrooms),
              size: listing.size === null || listing.size === undefined || listing.size === '' ? null : Number(listing.size),
              city: listing.city || listing.location || '',
              propertyType: listing.propertyType || '',
              listingType: listing.listingType || 'sale',
              images: listing.images && listing.images.length > 0 ? listing.images : ['/images/hero-condo.jpg'],
              location: listing.location || listing.address || '',
              address: listing.address || null,
              parking: listing.parking || null,
              yearBuilt: listing.yearBuilt || null,
              floor: listing.floor || null,
              totalFloors: listing.totalFloors || null,
              createdAt: listing.createdAt || '',
            };
          });
          const sortedListings = transformedListings.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setListings(sortedListings.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching featured listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="listing-grid featured-listing-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={`${cardVariant === 'landing' ? 'listing-card ' : ''}animate-pulse`}>
            <div className="h-64 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  const normalizedListings = listings.map((listing) => ({
    ...listing,
    image: listing.images[0],
    type: listing.propertyType,
  }));

  return (
    <div className="listing-grid featured-listing-grid">
      {normalizedListings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          imageSizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          variant={cardVariant}
        />
      ))}
    </div>
  );
}

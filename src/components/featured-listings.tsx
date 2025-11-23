'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Square, MapPin, Car, Calendar, Layers } from 'lucide-react';
import { formatLocationDisplay, formatLocationWithLabel } from '@/lib/location-utils';

const propertyTypeMap: { [key: string]: string } = {
  'condominium': 'Condominium',
  'house-and-lot': 'House and Lot',
  'townhouse': 'Townhouse',
  'apartment': 'Apartment',
  'penthouse': 'Penthouse',
  'lot': 'Lot',
  'building': 'Building',
  'commercial': 'Commercial Space',
};

interface Listing {
  id: string;
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

export function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        // Only fetch 4 listings from the API instead of all
        const response = await fetch('/api/listings?published=true&limit=4');
        const data = await response.json();
        
        if (response.ok && data.listings) {
          // Transform API listings to match expected format
          const transformedListings = data.listings.map((listing: any) => ({
            id: listing.id,
            title: listing.title || '',
            price: listing.price || 0,
            bedrooms: listing.bedrooms || 0,
            bathrooms: listing.bathrooms || 0,
            size: listing.size || 0,
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
          }));
          setListings(transformedListings);
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
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/listings/${listing.id}`}
          className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block group border border-[#E5E7EB]"
        >
          <div className="relative h-56 w-full overflow-hidden bg-gray-100">
            <Image
              src={listing.images[0]}
              alt={listing.title || `Property in ${listing.city}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
            {/* Rent/Sale Badge - Top Right */}
            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
                listing.listingType === 'rent'
                  ? 'bg-[#D4AF37]/95 text-white'
                  : 'bg-[#1F2937]/95 text-white'
              }`}>
                {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
              </span>
            </div>
          </div>
          <div className="p-5">
            {/* Title */}
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-[#111111] line-clamp-1 leading-tight">
                {(listing.propertyType || '').toLowerCase() === 'lot' ? (
                  <>
                    {listing.size > 0 && `${listing.size} sqm `}
                    Lot for {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
                    {listing.city && ` in ${listing.city}`}
                  </>
                ) : (
                  <>
                    {listing.bedrooms > 0 && `${listing.bedrooms} Bedroom `}
                    {propertyTypeMap[listing.propertyType || ''] || listing.propertyType || 'Property'}
                    {' for '}
                    {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
                  </>
                )}
              </h3>
            </div>
            
            {/* Price */}
            <div className="mb-3">
              <p className="text-2xl md:text-3xl font-bold text-[#111111] tracking-tight w-full">
                ₱{listing.price.toLocaleString()}
                {listing.listingType === 'rent' && <span className="text-base font-medium text-[#111111]/60 ml-1">/mo</span>}
              </p>
              {listing.size > 0 && listing.price > 0 && (
                <p className="text-xs text-[#111111]/50 mt-1">
                  ₱{Math.round(listing.price / listing.size).toLocaleString()}/sqm
                </p>
              )}
            </div>
            
            {/* Property Details - Compact Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-[#E5E7EB]">
              {listing.bedrooms > 0 && (
                <div className="flex items-center gap-1.5">
                  <Bed size={16} className="text-[#1F2937] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#111111]/80">{listing.bedrooms}</span>
                </div>
              )}
              {listing.bathrooms > 0 && (
                <div className="flex items-center gap-1.5">
                  <Bath size={16} className="text-[#1F2937] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#111111]/80">{listing.bathrooms}</span>
                </div>
              )}
              {listing.size > 0 && (
                <div className="flex items-center gap-1.5">
                  <Square size={16} className="text-[#1F2937] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#111111]/80">{listing.size}</span>
                </div>
              )}
            </div>
            
            {/* Additional Details */}
            <div className="flex flex-wrap gap-2 mb-3 text-xs text-[#111111]/60">
              {listing.parking > 0 && (
                <div className="flex items-center gap-1">
                  <Car size={14} className="text-[#1F2937] flex-shrink-0" />
                  <span>{listing.parking}</span>
                </div>
              )}
              {listing.floor && listing.totalFloors && (
                <div className="flex items-center gap-1">
                  <Layers size={14} className="text-[#1F2937] flex-shrink-0" />
                  <span>Floor {listing.floor}/{listing.totalFloors}</span>
                </div>
              )}
              {listing.yearBuilt && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="text-[#1F2937] flex-shrink-0" />
                  <span>{listing.yearBuilt}</span>
                </div>
              )}
            </div>
            
            {/* Location and Property Type */}
            <div className="space-y-2.5">
              {formatLocationDisplay(listing.city, listing.location, listing.address) !== 'Location not specified' && (
                <div className="flex items-start gap-1.5">
                  <MapPin size={14} className="text-[#1F2937] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#111111]/70 line-clamp-2 leading-snug">
                    {formatLocationWithLabel(listing.city, listing.location, listing.address)}
                  </span>
                </div>
              )}
              <div className="flex justify-start">
                <span className="inline-block bg-[#F9FAFB] text-[#1F2937] px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide border border-[#E5E7EB]">
                  {propertyTypeMap[listing.propertyType || ''] || listing.propertyType || 'Property'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}


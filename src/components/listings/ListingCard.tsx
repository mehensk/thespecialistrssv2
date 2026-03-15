import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Square, MapPin, Car, Calendar, Layers } from 'lucide-react';
import { formatLocationDisplay, formatLocationWithLabel, formatBedrooms, formatBedroomsForTitle } from '@/lib/location-utils';
import { buildCanonicalListingPath } from '@/lib/listing-slug';

const propertyTypeMap: { [key: string]: string } = {
  condominium: 'Condominium',
  'house-and-lot': 'House and Lot',
  townhouse: 'Townhouse',
  apartment: 'Apartment',
  penthouse: 'Penthouse',
  lot: 'Lot',
  building: 'Building',
  commercial: 'Commercial Space',
};

interface ListingCardProps {
  listing: {
    id: string;
    slug?: string | null;
    title: string;
    price: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    size: number | null;
    city: string | null;
    type: string | null;
    listingType: string;
    image: string;
    location: string | null;
    address: string | null;
    parking: number | null;
    yearBuilt: number | null;
    floor: number | null;
    totalFloors: number | null;
  };
  imageSizes?: string;
  className?: string;
  variant?: 'landing';
}

export function ListingCard({
  listing,
  imageSizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
  variant,
}: ListingCardProps) {
  const listingPath = listing.slug ? buildCanonicalListingPath(listing.slug, listing.id) : `/listings/${listing.id}`;

  const normalizeNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const cleaned = value.replace(/[^\d.-]/g, '');
    if (!cleaned) {
      return null;
    }
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const priceValue = normalizeNumber(listing.price);
  const hasPrice = priceValue !== null && Number.isFinite(priceValue) && priceValue > 0;

  return (
    <Link
      href={listingPath}
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block group border border-[#E5E7EB] h-full flex flex-col${variant === 'landing' ? ' listing-card' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <Image
          src={listing.image}
          alt={listing.title || `Property in ${listing.city}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={imageSizes}
          loading="lazy"
        />
        {/* Rent/Sale Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm ${
              listing.listingType === 'rent' ? 'bg-[#D4AF37]/95 text-white' : 'bg-[#1F2937]/95 text-white'
            }`}
          >
            {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-[#111111] line-clamp-1 leading-tight">
            {(listing.type || '').toLowerCase() === 'lot' ? (
              <>
                {listing.size && listing.size > 0 && `${listing.size} sqm `}
                Lot for {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
                {listing.city && ` in ${listing.city}`}
              </>
            ) : (
              <>
                {formatBedroomsForTitle(listing.bedrooms, listing.type)}
                {propertyTypeMap[listing.type || ''] || listing.type || 'Property'}
                {' for '}
                {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
              </>
            )}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl md:text-3xl font-bold text-[#111111] tracking-tight w-full">
            {hasPrice ? `₱${priceValue.toLocaleString()}` : 'Price on request'}
            {hasPrice && listing.listingType === 'rent' && (
              <span className="text-base font-medium text-[#111111]/60 ml-1">/mo</span>
            )}
          </p>
        </div>

        {/* Property Details - Compact Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-[#E5E7EB]">
          {(() => {
            const bedroomsText = formatBedrooms(listing.bedrooms, listing.type);
            return bedroomsText ? (
              <div className="flex items-center gap-1.5">
                <Bed size={16} className="text-[#1F2937] flex-shrink-0" />
                <span className="text-xs font-medium text-[#111111]/80">{bedroomsText}</span>
              </div>
            ) : null;
          })()}
          {listing.bathrooms && listing.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath size={16} className="text-[#1F2937] flex-shrink-0" />
              <span className="text-xs font-medium text-[#111111]/80">{listing.bathrooms}</span>
            </div>
          )}
          {listing.size && listing.size > 0 && (
            <div className="flex items-center gap-1.5">
              <Square size={16} className="text-[#1F2937] flex-shrink-0" />
              <span className="text-xs font-medium text-[#111111]/80">{listing.size} sqm</span>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs text-[#111111]/60">
          {listing.parking && listing.parking > 0 && (
            <div className="flex items-center gap-1">
              <Car size={14} className="text-[#1F2937] flex-shrink-0" />
              <span>{listing.parking}</span>
            </div>
          )}
          {listing.floor && listing.totalFloors && (
            <div className="flex items-center gap-1">
              <Layers size={14} className="text-[#1F2937] flex-shrink-0" />
              <span>
                Floor {listing.floor}/{listing.totalFloors}
              </span>
            </div>
          )}
          {listing.yearBuilt && (
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-[#1F2937] flex-shrink-0" />
              <span>{listing.yearBuilt}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2.5 mb-3">
          {formatLocationDisplay(listing.city, listing.location, listing.address) !== 'Location not specified' && (
            <div className="flex items-start gap-1.5">
              <MapPin size={14} className="text-[#1F2937] flex-shrink-0 mt-0.5" />
              <span className="text-sm text-[#111111]/70 line-clamp-2 leading-snug">
                {formatLocationWithLabel(listing.city, listing.location, listing.address)}
              </span>
            </div>
          )}
        </div>

        {/* Property Type - anchored to bottom-left for consistent alignment */}
        <div className="flex justify-start mt-auto">
          <span className="badge gold inline-block bg-[#F9FAFB] text-[#1F2937] px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide border border-[#E5E7EB]">
            {propertyTypeMap[listing.type || ''] || listing.type || 'Property'}
          </span>
        </div>
      </div>
    </Link>
  );
}

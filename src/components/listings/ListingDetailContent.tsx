'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, Share2, Calendar, MapPin, Bed, Bath, Square, Car, Layers, Phone, Mail,
  Wind, Sofa, Wifi, Waves, Dumbbell, Shield, ArrowUpDown, Home, ChefHat, Droplets,
  Shirt, Package, Sparkles, ShoppingBag, GraduationCap, Bus, Building2, Waves as WaterWaves,
  Camera, Flame, ConciergeBell, TreePine, Briefcase, Tv, Wrench, AlertCircle, Building
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  location: string;
  city: string | null;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number | null;
  propertyType: string | null;
  listingType: string | null;
  images: string[];
  yearBuilt: number | null;
  parking: number | null;
  floor: number | null;
  totalFloors: number | null;
  amenities: any;
  propertyId: string | null;
  available: boolean;
  user: {
    name: string;
    email: string;
  };
}

interface ListingDetailContentProps {
  listing: Listing;
  currentImageIndex: number;
  isSaved: boolean;
  onImageChange: (index: number) => void;
  onSaveToggle: () => void;
  onImageNavigation: {
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
  };
  onZoom: (index: number) => void;
  onRequestInfo: (e: React.MouseEvent) => void;
}

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

// Amenities mapping with icons (uniform styling, no category colors)
const amenitiesMap: { [key: string]: { icon: any } } = {
  'Air Conditioning': { icon: Wind },
  'Fully Furnished': { icon: Sofa },
  'Wi-Fi Included': { icon: Wifi },
  'Parking Space': { icon: Car },
  'Swimming Pool': { icon: Waves },
  'Fitness Center': { icon: Dumbbell },
  '24/7 Security': { icon: Shield },
  'Elevator': { icon: ArrowUpDown },
  'Balcony': { icon: Home },
  'Fully Equipped Kitchen': { icon: ChefHat },
  'Ensuite Bathroom': { icon: Droplets },
  'Walk-in Closet': { icon: Shirt },
  'Storage Room': { icon: Package },
  'Laundry Area': { icon: Sparkles },
  'Pet-Friendly': { icon: Heart },
  'Near Shopping Malls': { icon: ShoppingBag },
  'Near Schools': { icon: GraduationCap },
  'Near Public Transport': { icon: Bus },
  'City View': { icon: Building2 },
  'Waterfront': { icon: WaterWaves },
  'CCTV Surveillance': { icon: Camera },
  'Fire Alarm': { icon: Flame },
  'Concierge Service': { icon: ConciergeBell },
  'Rooftop Garden': { icon: TreePine },
  'Business Center': { icon: Briefcase },
  'Gated Community': { icon: Shield },
  'Near Hospitals': { icon: Building },
  'Cable TV Included': { icon: Tv },
  'Maintenance Included': { icon: Wrench },
  'Smoke Alarm': { icon: AlertCircle },
};

export function ListingDetailContent({
  listing,
  currentImageIndex,
  isSaved,
  onImageChange,
  onSaveToggle,
  onImageNavigation,
  onZoom,
  onRequestInfo,
}: ListingDetailContentProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatSize = (size: number | null) => {
    if (!size) return null;
    return `${size.toLocaleString()} sqm`;
  };

  const calculatePricePerSqm = () => {
    if (!listing.price || !listing.size || listing.listingType !== 'sale') return null;
    return Math.round(listing.price / listing.size);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Image Gallery */}
        {listing.images && listing.images.length > 0 && (
          <div className="relative">
            <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={listing.images[currentImageIndex]}
                alt={listing.title || 'Property Image'}
                fill
                className="object-cover cursor-pointer"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
                onClick={() => onZoom(currentImageIndex)}
              />
              
              {/* Navigation Arrows */}
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={onImageNavigation.prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={onImageNavigation.next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {listing.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onImageNavigation.goTo(index)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      currentImageIndex === index
                        ? 'border-[#111111] ring-2 ring-[#111111]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-2">
              {listing.title}
            </h1>
            <div className="flex items-center gap-2 text-[#111111]/70">
              <MapPin size={18} />
              <span>{listing.location}</span>
              {listing.city && <span>• {listing.city}</span>}
            </div>
          </div>

          <div className="flex items-center gap-4 text-2xl font-bold text-[#111111]">
            {formatPrice(listing.price)}
            {listing.listingType && (
              <span className={`px-3 py-1 text-sm font-semibold uppercase rounded-md ${
                listing.listingType === 'rent'
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-[#1F2937] text-white'
              }`}>
                {listing.listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200">
            {listing.bedrooms !== null && (
              <div className="flex items-center gap-2">
                <Bed className="text-[#111111]/70" size={20} />
                <div>
                  <div className="text-sm text-[#111111]/70">Bedrooms</div>
                  <div className="font-semibold text-[#111111]">{listing.bedrooms}</div>
                </div>
              </div>
            )}
            {listing.bathrooms !== null && (
              <div className="flex items-center gap-2">
                <Bath className="text-[#111111]/70" size={20} />
                <div>
                  <div className="text-sm text-[#111111]/70">Bathrooms</div>
                  <div className="font-semibold text-[#111111]">{listing.bathrooms}</div>
                </div>
              </div>
            )}
            {listing.size !== null && (
              <div className="flex items-center gap-2">
                <Square className="text-[#111111]/70" size={20} />
                <div>
                  <div className="text-sm text-[#111111]/70">Size</div>
                  <div className="font-semibold text-[#111111]">{formatSize(listing.size)}</div>
                </div>
              </div>
            )}
            {listing.parking !== null && (
              <div className="flex items-center gap-2">
                <Car className="text-[#111111]/70" size={20} />
                <div>
                  <div className="text-sm text-[#111111]/70">Parking</div>
                  <div className="font-semibold text-[#111111]">{listing.parking}</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-[#111111] mb-3">Description</h2>
            <p className="text-[#111111]/70 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Property Details */}
          {(listing.yearBuilt || listing.floor || listing.totalFloors || listing.propertyType) && (
            <div>
              <h2 className="text-xl font-semibold text-[#111111] mb-3">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listing.propertyType && (
                  <div>
                    <div className="text-sm text-[#111111]/70">Property Type</div>
                    <div className="font-semibold text-[#111111]">
                      {propertyTypeMap[listing.propertyType] || listing.propertyType}
                    </div>
                  </div>
                )}
                {listing.yearBuilt && (
                  <div>
                    <div className="text-sm text-[#111111]/70">Year Built</div>
                    <div className="font-semibold text-[#111111]">{listing.yearBuilt}</div>
                  </div>
                )}
                {listing.floor !== null && (
                  <div>
                    <div className="text-sm text-[#111111]/70">Floor</div>
                    <div className="font-semibold text-[#111111]">
                      {listing.floor}{listing.totalFloors ? ` of ${listing.totalFloors}` : ''}
                    </div>
                  </div>
                )}
                {listing.propertyId && (
                  <div>
                    <div className="text-sm text-[#111111]/70">Property ID</div>
                    <div className="font-semibold text-[#111111]">{listing.propertyId}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-[#111111]/70">Status</div>
                  <div className="font-semibold text-[#111111]">
                    {listing.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities && typeof listing.amenities === 'object' && (
            <div>
              <h2 className="text-xl font-semibold text-[#111111] mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(listing.amenities) ? (
                  listing.amenities.map((amenity: string, index: number) => {
                    // Amenities are stored as "Category:Name" format, extract just the name
                    const parts = String(amenity).split(':');
                    const amenityName = parts[1] || parts[0] || amenity;
                    const amenityData = amenitiesMap[amenityName] || null;
                    const Icon = amenityData?.icon || null;
                    
                    return (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#1F2937] text-white rounded-md text-sm font-medium flex items-center gap-2"
                      >
                        {Icon && <Icon size={16} className="text-white" />}
                        {amenityName}
                      </span>
                    );
                  })
                ) : (
                  // Handle legacy object format
                  Object.entries(listing.amenities).map(([key, value]) => {
                    const displayText = String(value).includes(':')
                      ? String(value).split(':')[1] || String(value)
                      : String(value);
                    const amenityData = amenitiesMap[displayText] || null;
                    const Icon = amenityData?.icon || null;
                    
                    return (
                      <span
                        key={key}
                        className="px-3 py-1.5 bg-[#1F2937] text-white rounded-md text-sm font-medium flex items-center gap-2"
                      >
                        {Icon && <Icon size={16} className="text-white" />}
                        {displayText}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          {/* Contact Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#111111] mb-6">Contact Us</h3>
            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm font-medium text-[#111111]/70 mb-1">Phone</div>
                <a
                  href="https://wa.me/639212303011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#111111] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                >
                  <Phone size={16} />
                  +63 921 2303011
                </a>
                <p className="text-xs text-[#111111]/60 mt-1">click to contact via WhatsApp</p>
              </div>
              <div>
                <div className="text-sm font-medium text-[#111111]/70 mb-1">Email</div>
                <a
                  href="mailto:thespecialistrss@gmail.com"
                  className="font-semibold text-[#111111] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                >
                  <Mail size={16} />
                  thespecialistrss@gmail.com
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={onRequestInfo}
                className="w-full bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
              >
                Request Information
              </button>
              <Link
                href="/contact"
                className="block w-full text-center border-2 border-[#111111] text-[#111111] px-6 py-3 rounded-md hover:bg-[#111111] hover:text-white transition-all duration-300 font-medium"
              >
                Schedule Tour
              </Link>
            </div>
          </div>

          {/* Property Status & Price Details Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111111] mb-4">Property Details</h3>
            <div className="space-y-4">
              {calculatePricePerSqm() && (
                <div className="pb-4 border-b border-gray-200">
                  <div className="text-sm font-medium text-[#111111]/70 mb-1">Price per sqm</div>
                  <div className="text-xl font-bold text-[#111111]">
                    ₱{calculatePricePerSqm()?.toLocaleString()}
                  </div>
                </div>
              )}
              <div>
                <div className={`text-lg font-semibold ${
                  listing.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {listing.available ? 'Available' : 'Unavailable'}
                </div>
                {listing.available && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-[#111111]/60">Property is currently available</span>
                  </div>
                )}
              </div>
              {listing.propertyType && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-[#111111]/70 mb-1">Property Type</div>
                  <div className="font-semibold text-[#111111]">
                    {propertyTypeMap[listing.propertyType] || listing.propertyType}
                  </div>
                </div>
              )}
              {listing.listingType && (
                <div>
                  <div className="text-sm font-medium text-[#111111]/70 mb-1">Listing Type</div>
                  <div className="font-semibold text-[#111111]">
                    {listing.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                  </div>
                </div>
              )}
              {listing.propertyId && (
                <div>
                  <div className="text-sm font-medium text-[#111111]/70 mb-1">Property ID</div>
                  <div className="font-mono font-semibold text-[#111111]">{listing.propertyId}</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onSaveToggle}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 transition-all font-medium ${
                isSaved
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Heart size={20} className={isSaved ? 'fill-current' : ''} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: listing.title,
                    text: listing.description,
                    url: typeof window !== 'undefined' ? window.location.href : '',
                  });
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all font-medium"
            >
              <Share2 size={20} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

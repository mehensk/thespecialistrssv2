'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, Square, MapPin, Share2, Heart, Calendar, Phone, Mail, ArrowLeft, ChevronLeft, ChevronRight, Hash, X, Wind, Sofa, Wifi, Car, Waves, Dumbbell, Shield, ArrowUpDown, Home, ChefHat, Droplets, Shirt, Package, Sparkles, ShoppingBag, GraduationCap, Bus, Building2, Waves as WaterWaves, Camera, Flame, ConciergeBell, TreePine, Briefcase, Tv, Wrench, AlertCircle, Building } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { formatLocationDisplay } from '@/lib/location-utils';

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

// Essential amenities with icons (30 most important) - same as upload form
const amenitiesList: { name: string; icon: any; category: string }[] = [
  { name: 'Air Conditioning', icon: Wind, category: 'Interior' },
  { name: 'Fully Furnished', icon: Sofa, category: 'Services' },
  { name: 'Wi-Fi Included', icon: Wifi, category: 'Services' },
  { name: 'Parking Space', icon: Car, category: 'Building' },
  { name: 'Swimming Pool', icon: Waves, category: 'Building' },
  { name: 'Fitness Center', icon: Dumbbell, category: 'Building' },
  { name: '24/7 Security', icon: Shield, category: 'Building' },
  { name: 'Elevator', icon: ArrowUpDown, category: 'Building' },
  { name: 'Balcony', icon: Home, category: 'Interior' },
  { name: 'Fully Equipped Kitchen', icon: ChefHat, category: 'Interior' },
  { name: 'Ensuite Bathroom', icon: Droplets, category: 'Interior' },
  { name: 'Walk-in Closet', icon: Shirt, category: 'Interior' },
  { name: 'Storage Room', icon: Package, category: 'Interior' },
  { name: 'Laundry Area', icon: Sparkles, category: 'Interior' },
  { name: 'Pet-Friendly', icon: Heart, category: 'Services' },
  { name: 'Near Shopping Malls', icon: ShoppingBag, category: 'Location' },
  { name: 'Near Schools', icon: GraduationCap, category: 'Location' },
  { name: 'Near Public Transport', icon: Bus, category: 'Location' },
  { name: 'City View', icon: Building2, category: 'Location' },
  { name: 'Waterfront', icon: WaterWaves, category: 'Location' },
  { name: 'CCTV Surveillance', icon: Camera, category: 'Security' },
  { name: 'Fire Alarm', icon: Flame, category: 'Security' },
  { name: 'Concierge Service', icon: ConciergeBell, category: 'Building' },
  { name: 'Rooftop Garden', icon: TreePine, category: 'Building' },
  { name: 'Business Center', icon: Briefcase, category: 'Building' },
  { name: 'Gated Community', icon: Shield, category: 'Building' },
  { name: 'Near Hospitals', icon: Building, category: 'Location' },
  { name: 'Cable TV Included', icon: Tv, category: 'Services' },
  { name: 'Maintenance Included', icon: Wrench, category: 'Services' },
  { name: 'Smoke Alarm', icon: AlertCircle, category: 'Security' },
];

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
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        const response = await fetch(`/api/listings/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch listing');
        }
        
        setListing(data.listing);
      } catch (err: any) {
        console.error('Error fetching listing:', err);
        setError(err.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchListing();
    }
  }, [id]);

  // Keyboard navigation for zoom modal
  useEffect(() => {
    if (!isZoomed || !listing?.images) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
        document.body.style.overflow = 'unset';
      } else if (e.key === 'ArrowLeft' && listing.images && listing.images.length > 0) {
        setZoomImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
      } else if (e.key === 'ArrowRight' && listing.images && listing.images.length > 0) {
        setZoomImageIndex((prev) => (prev + 1) % listing.images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, listing?.images]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#111111]/70">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-[#111111] mb-4">Property Not Found</h1>
          <p className="text-[#111111]/70 mb-8">{error || 'The property you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/listings"
            className="inline-block bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
          >
            Browse All Properties
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openZoom = (index: number) => {
    setZoomImageIndex(index);
    setIsZoomed(true);
    document.body.style.overflow = 'hidden';
  };

  const closeZoom = () => {
    setIsZoomed(false);
    document.body.style.overflow = 'unset';
  };

  const nextZoomImage = () => {
    if (listing.images && listing.images.length > 0) {
      setZoomImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevZoomImage = () => {
    if (listing.images && listing.images.length > 0) {
      setZoomImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const goToZoomImage = (index: number) => {
    setZoomImageIndex(index);
  };

  const handleRequestInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRequestInfoModal(true);
  };

  const handleConfirmRequestInfo = () => {
    if (!listing) return;
    
    // Build the property link
    const propertyLink = typeof window !== 'undefined' 
      ? `${window.location.origin}/listings/${listing.id}`
      : `/listings/${listing.id}`;
    
    // Build the message according to user's format
    const propertyTitle = listing.title || 'Property';
    const propertyId = listing.propertyId || listing.id;
    const inquiryText = `Inquiry: ${propertyTitle}, Property ID ${propertyId} Property Link ${propertyLink}`;
    const messageText = 'I am interested in learning more about your property. Please contact me about it';
    const fullMessage = `${inquiryText}\n\nMessage: ${messageText}`;
    
    // Determine interest value based on listing type
    const interestValue = listing.listingType === 'rent' ? 'renting' : 'buying';
    
    // Build URL with query parameters
    const params = new URLSearchParams();
    params.set('interest', interestValue);
    params.set('message', fullMessage);
    
    // Navigate to contact page
    router.push(`/contact?${params.toString()}`);
    setShowRequestInfoModal(false);
  };

  const defaultImage = listing.images && listing.images.length > 0 
    ? listing.images[currentImageIndex] 
    : '/images/hero-condo.jpg';

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div 
                className="relative h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => openZoom(currentImageIndex)}
              >
                <Image
                  src={defaultImage}
                  alt={listing.title || 'Property Image'}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                {/* Rent/Sale Badge - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wide shadow-lg ${
                    listing.listingType === 'rent'
                      ? 'bg-[#D4AF37] text-white'
                      : 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white'
                  }`}>
                    {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
                  </span>
                </div>
                {/* Navigation Arrows */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-[#111111] p-2 rounded-full shadow-lg transition-all z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-[#111111] p-2 rounded-full shadow-lg transition-all z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                {/* Image Counter */}
                {listing.images && listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-10">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {listing.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        currentImageIndex === index
                          ? 'border-[#1F2937] shadow-md'
                          : 'border-transparent hover:border-[#1F2937]/50'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 20vw, 13vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Title */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-3xl md:text-4xl font-semibold text-[#111111] tracking-tight">
                {listing.title || 
                  `${listing.bedrooms && listing.bedrooms > 0 ? `${listing.bedrooms} Bedroom ` : ''}${propertyTypeMap[listing.propertyType || ''] || listing.propertyType || 'Luxury Property'} for ${listing.listingType === 'rent' ? 'Rent' : 'Sale'}${listing.city ? ` in ${formatLocationDisplay(listing.city, listing.location, listing.address)}` : ''}`}
              </h1>
            </div>

            {/* Price and Key Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-4xl font-semibold text-[#111111]">
                      {listing.price ? `₱${listing.price.toLocaleString()}` : 'Price on Request'}
                      {listing.price && listing.listingType === 'rent' && <span className="text-xl font-normal text-[#111111]/70">/mo</span>}
                    </p>
                    <span className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide shadow-md ${
                      listing.listingType === 'rent'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white'
                    }`}>
                      {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#111111]/70">
                    <MapPin size={18} className="text-[#1F2937]" />
                    <span>{formatLocationDisplay(listing.city, listing.location, listing.address)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-3 rounded-lg transition-colors ${
                      isSaved
                        ? 'bg-[#1F2937] text-white'
                        : 'bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB]'
                    }`}
                    aria-label={isSaved ? 'Remove from saved' : 'Save property'}
                  >
                    <Heart size={20} className={isSaved ? 'fill-current' : ''} />
                  </button>
                  <button
                    className="p-3 rounded-lg bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB] transition-colors"
                    aria-label="Share property"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#E5E7EB]">
                {listing.bedrooms !== null && listing.bedrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Bed size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Bedrooms</p>
                      <p className="text-lg font-semibold text-[#111111]">{listing.bedrooms}</p>
                    </div>
                  </div>
                )}
                {listing.bathrooms !== null && listing.bathrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Bath size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Bathrooms</p>
                      <p className="text-lg font-semibold text-[#111111]">{listing.bathrooms}</p>
                    </div>
                  </div>
                )}
                {listing.size !== null && listing.size > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Square size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Size</p>
                      <p className="text-lg font-semibold text-[#111111]">{listing.size} sqm</p>
                    </div>
                  </div>
                )}
                {listing.propertyId && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Hash size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Property ID</p>
                      <p className="text-lg font-semibold text-[#111111]">{listing.propertyId}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Type Badge */}
              {listing.propertyType && (
                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <span className="inline-block bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md text-sm uppercase tracking-wide shadow-md">
                    {propertyTypeMap[listing.propertyType] || listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1).replace(/-/g, ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-[#111111] mb-4 tracking-tight">Description</h2>
                <p className="text-[#111111]/80 leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-[#111111] mb-6 tracking-tight">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {listing.yearBuilt !== null && (
                  <div>
                    <p className="text-sm text-[#111111]/70 mb-1">Year Built</p>
                    <p className="text-lg font-semibold text-[#111111]">{listing.yearBuilt}</p>
                  </div>
                )}
                {listing.floor !== null && (
                  <div>
                    <p className="text-sm text-[#111111]/70 mb-1">Floor</p>
                    <p className="text-lg font-semibold text-[#111111]">
                      {listing.floor}{listing.totalFloors ? ` of ${listing.totalFloors}` : ''}
                    </p>
                  </div>
                )}
                {listing.parking !== null && listing.parking > 0 && (
                  <div>
                    <p className="text-sm text-[#111111]/70 mb-1">Parking</p>
                    <p className="text-lg font-semibold text-[#111111]">
                      {listing.parking} space{listing.parking !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-[#111111]/70 mb-1">Status</p>
                  <p className="text-lg font-semibold text-[#111111]">
                    {listing.available ? 'Available' : 'Sold'}
                  </p>
                </div>
                {listing.propertyId && (
                  <div>
                    <p className="text-sm text-[#111111]/70 mb-1">Property ID</p>
                    <p className="text-lg font-semibold text-[#111111]">{listing.propertyId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities and Services */}
            {(() => {
              // Handle different formats of amenities data
              let amenitiesArray: string[] = [];
              if (Array.isArray(listing.amenities)) {
                amenitiesArray = listing.amenities;
              } else if (listing.amenities && typeof listing.amenities === 'object') {
                // If it's an object, try to extract values
                amenitiesArray = Object.values(listing.amenities).filter((v): v is string => typeof v === 'string');
              }
              
              if (amenitiesArray.length === 0) return null;
              
              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-[#111111] mb-6 tracking-tight">Amenities & Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {amenitiesArray.map((amenityKey: string) => {
                      // Parse the amenity key (format: "category:name")
                      const [category, name] = amenityKey.includes(':') 
                        ? amenityKey.split(':') 
                        : ['', amenityKey];
                      
                      // Find the amenity in our list
                      const amenity = amenitiesList.find(
                        (a) => a.name === name || `${a.category}:${a.name}` === amenityKey
                      );
                      
                      if (!amenity) return null;
                      
                      const IconComponent = amenity.icon;
                      return (
                        <div
                          key={amenityKey}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md"
                        >
                          <IconComponent size={16} className="flex-shrink-0 text-white" />
                          <span className="truncate">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Map Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-[#111111] mb-4 tracking-tight">Location</h2>
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-[#F9FAFB] border border-[#E5E7EB]">
                {/* Placeholder for map - can be replaced with actual map component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="text-[#1F2937] mx-auto mb-2" />
                    <p className="text-[#111111]/70">{formatLocationDisplay(listing.city, listing.location, listing.address)}</p>
                    <p className="text-sm text-[#111111]/50 mt-1">Map integration coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-[100px] space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#111111] mb-4 tracking-tight">Contact Us</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Phone size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Phone</p>
                      <a href="tel:+639212303011" className="text-[#111111] font-medium hover:text-[#1F2937] transition-colors">
                        +63 921 2303011
                      </a>
                      <p className="text-sm text-[#111111]/60 mt-1">click to contact via WhatsApp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Mail size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Email</p>
                      <a href="mailto:thespecialistrss@gmail.com" className="text-[#111111] font-medium hover:text-[#1F2937] transition-colors">
                        thespecialistrss@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/contact"
                    className="w-full bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium text-center block shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Calendar size={18} />
                      Schedule Tour
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                  <button
                    onClick={handleRequestInfoClick}
                    className="w-full border-2 border-[#1F2937] text-[#1F2937] px-6 py-3 rounded-lg hover:bg-[#1F2937] hover:text-white transition-all duration-300 font-medium text-center"
                  >
                    Request Information
                  </button>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#111111] mb-4 tracking-tight">Quick Facts</h3>
                <div className="space-y-3">
                  {listing.price && listing.size && listing.size > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                      <span className="text-[#111111]/70">Price per sqm</span>
                      <span className="font-semibold text-[#111111]">₱{Math.round(listing.price / listing.size).toLocaleString()}</span>
                    </div>
                  )}
                  {listing.propertyType && (
                    <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                      <span className="text-[#111111]/70">Property Type</span>
                      <span className="font-semibold text-[#111111] capitalize">{propertyTypeMap[listing.propertyType] || listing.propertyType.replace(/-/g, ' ')}</span>
                    </div>
                  )}
                  {listing.city && (
                    <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                      <span className="text-[#111111]/70">City</span>
                      <span className="font-semibold text-[#111111]">{listing.city}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#111111]/70">Status</span>
                    <span className={`font-semibold ${listing.available ? 'text-green-600' : 'text-red-600'}`}>
                      {listing.available ? 'Available' : 'Sold'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal with Carousel */}
      {isZoomed && listing.images && listing.images.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeZoom}
        >
          {/* Close Button */}
          <button
            onClick={closeZoom}
            className="absolute top-4 right-4 z-60 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-sm"
            aria-label="Close zoom"
          >
            <X size={24} />
          </button>

          {/* Main Zoomed Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            {listing.images.length > 1 && (
              <button
                onClick={prevZoomImage}
                className="absolute left-4 md:left-8 z-60 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Zoomed Image */}
            <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center">
              <Image
                src={listing.images[zoomImageIndex]}
                alt={`${listing.title || 'Property Image'} - Image ${zoomImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Next Button */}
            {listing.images.length > 1 && (
              <button
                onClick={nextZoomImage}
                className="absolute right-4 md:right-8 z-60 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Image Counter */}
            {listing.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full text-lg z-60 backdrop-blur-sm">
                {zoomImageIndex + 1} / {listing.images.length}
              </div>
            )}

            {/* Thumbnail Carousel at Bottom */}
            {listing.images.length > 1 && (
              <div className="absolute bottom-20 left-0 right-0 z-60 px-4 md:px-8">
                <div className="max-w-7xl mx-auto overflow-x-auto pb-4">
                  <div className="flex gap-3 justify-center">
                    {listing.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => goToZoomImage(index)}
                        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          zoomImageIndex === index
                            ? 'border-white shadow-lg scale-110'
                            : 'border-white/30 hover:border-white/60'
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Information Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRequestInfoModal}
        onClose={() => setShowRequestInfoModal(false)}
        onConfirm={handleConfirmRequestInfo}
        title="Request Information"
        message="Do you like more information for this listing?"
      />
    </div>
  );
}

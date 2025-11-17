'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Share2, 
  Heart, 
  Calendar, 
  Phone, 
  Mail, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Hash,
  X as XIcon,
  Maximize2,
  Wind,
  Sofa,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Shield,
  ArrowUpDown,
  Home,
  ChefHat,
  Droplets,
  Shirt,
  Package,
  Sparkles,
  Heart as HeartIcon,
  ShoppingBag,
  GraduationCap,
  Bus,
  Building2,
  Waves as WaterWaves,
  Camera,
  Flame,
  ConciergeBell,
  TreePine,
  Briefcase,
  Tv,
  Wrench,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Edit } from 'lucide-react';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/listings/${id}`);
        const data = await response.json();
        
        if (response.ok && data.listing) {
          // Transform API listing to match expected format
          const transformed = {
            id: data.listing.id,
            title: data.listing.title || '',
            price: data.listing.price || 0,
            bedrooms: data.listing.bedrooms || 0,
            bathrooms: data.listing.bathrooms || 0,
            size: data.listing.size || 0,
            city: data.listing.city || data.listing.location || '',
            type: data.listing.propertyType || '',
            listingType: data.listing.listingType || 'sale',
            address: data.listing.address || data.listing.location || '',
            yearBuilt: data.listing.yearBuilt,
            parking: data.listing.parking,
            floor: data.listing.floor,
            totalFloors: data.listing.totalFloors,
            images: data.listing.images && data.listing.images.length > 0 
              ? data.listing.images 
              : ['/images/hero-condo.jpg'],
            description: data.listing.description || '',
            amenities: data.listing.amenities || [],
            propertyId: data.listing.propertyId || '',
            available: data.listing.available !== undefined ? data.listing.available : true,
            userId: data.listing.userId,
          };
          setProperty(transformed);
          
          // Check if user can edit (owner or admin)
          if (session?.user) {
            const isOwner = data.listing.userId === session.user.id;
            const isAdmin = session.user.role === 'ADMIN';
            setCanEdit(isOwner || isAdmin);
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, session]);

  // All hooks must be called before any early returns
  const openGallery = useCallback((index: number) => {
    setGalleryImageIndex(index);
    setIsGalleryOpen(true);
  }, []);

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const nextGalleryImage = useCallback(() => {
    if (!property) return;
    setGalleryImageIndex((prev) => (prev + 1) % property.images.length);
  }, [property]);

  const prevGalleryImage = useCallback(() => {
    if (!property) return;
    setGalleryImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  }, [property]);

  // Handle keyboard navigation in gallery and prevent body scroll
  useEffect(() => {
    if (!isGalleryOpen) return;

    // Prevent body scroll when gallery is open
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowLeft') {
        prevGalleryImage();
      } else if (e.key === 'ArrowRight') {
        nextGalleryImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isGalleryOpen, closeGallery, prevGalleryImage, nextGalleryImage]);

  // Early returns after all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#111111]/70">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-[#111111] mb-4">Property Not Found</h1>
          <p className="text-[#111111]/70 mb-8">The property you're looking for doesn't exist.</p>
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

  // Regular functions (not hooks) can be defined after early returns
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

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
        {/* Back Button and Edit Button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Listings</span>
          </Link>
          {canEdit && (
            <Link
              href={`/dashboard/listings/${id}/edit`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
            >
              <Edit size={18} />
              <span>Edit Listing</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div 
                className="relative h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => openGallery(currentImageIndex)}
              >
                <Image
                  src={property.images[currentImageIndex]}
                  alt={`${property.city} Property - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                {/* Click to enlarge indicator */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 shadow-lg">
                    <Maximize2 size={24} className="text-[#1F2937]" />
                  </div>
                </div>
                {/* Rent/Sale Badge - Top Right */}
                <div 
                  className="absolute top-4 right-4 z-10 pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className={`px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wide shadow-lg ${
                    property.listingType === 'rent'
                      ? 'bg-[#D4AF37] text-white'
                      : 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white'
                  }`}>
                    {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                  </span>
                </div>
                {/* Navigation Arrows */}
                {property.images.length > 1 && (
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
                <div 
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-10 pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {property.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {property.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      onDoubleClick={() => openGallery(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        currentImageIndex === index
                          ? 'border-[#1F2937] shadow-md'
                          : 'border-transparent hover:border-[#1F2937]/50'
                      }`}
                      title="Click to view, double-click to enlarge"
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
                {property.title || (
                  <>
                    {property.bedrooms > 0 
                      ? `${property.bedrooms} Bedroom `
                      : ''}
                    {property.type === 'condominium' ? 'Luxury Condominium' :
                     property.type === 'house-and-lot' ? 'Luxury House' :
                     property.type === 'townhouse' ? 'Luxury Townhouse' :
                     property.type === 'apartment' ? 'Luxury Apartment' :
                     property.type === 'penthouse' ? 'Luxury Penthouse' :
                     property.type === 'lot' ? 'Prime Lot' :
                     property.type === 'building' ? 'Commercial Building' :
                     property.type === 'commercial' ? 'Commercial Space' :
                     'Luxury Property'} for {property.listingType === 'rent' ? 'Rent' : 'Sale'} in {property.city}
                  </>
                )}
              </h1>
            </div>

            {/* Price and Key Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-4xl font-semibold text-[#111111]">
                      ₱{property.price.toLocaleString()}
                      {property.listingType === 'rent' && <span className="text-xl font-normal text-[#111111]/70">/mo</span>}
                    </p>
                    <span className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide shadow-md ${
                      property.listingType === 'rent'
                        ? 'bg-[#D4AF37] text-white'
                        : 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white'
                    }`}>
                      {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#111111]/70">
                    <MapPin size={18} className="text-[#1F2937]" />
                    <span>{property.address}</span>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#E5E7EB] auto-rows-fr">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Bed size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Bedrooms</p>
                      <p className="text-lg font-semibold text-[#111111]">{property.bedrooms}</p>
                    </div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Bath size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Bathrooms</p>
                      <p className="text-lg font-semibold text-[#111111]">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.size > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Square size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Size</p>
                      <p className="text-lg font-semibold text-[#111111]">{property.size} sqm</p>
                    </div>
                  </div>
                )}
                {property.propertyId && (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#F9FAFB] rounded-lg">
                      <Hash size={20} className="text-[#1F2937]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111111]/70">Property ID</p>
                      <p className="text-lg font-semibold text-[#111111]">{property.propertyId}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Type Badge */}
              <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                <span className="inline-block bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md text-sm uppercase tracking-wide shadow-md">
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1).replace(/-/g, ' ')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-[#111111] mb-4 tracking-tight">Description</h2>
              <p className="text-[#111111]/80 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Property Details */}
            {(property.yearBuilt || property.floor || property.parking || property.propertyId) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-[#111111] mb-6 tracking-tight">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {property.yearBuilt && (
                    <div>
                      <p className="text-sm text-[#111111]/70 mb-1">Year Built</p>
                      <p className="text-lg font-semibold text-[#111111]">{property.yearBuilt}</p>
                    </div>
                  )}
                  {property.floor && (
                    <div>
                      <p className="text-sm text-[#111111]/70 mb-1">Floor</p>
                      <p className="text-lg font-semibold text-[#111111]">{property.floor}</p>
                    </div>
                  )}
                  {property.parking && property.parking > 0 && (
                    <div>
                      <p className="text-sm text-[#111111]/70 mb-1">Parking</p>
                      <p className="text-lg font-semibold text-[#111111]">{property.parking} space{property.parking !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-[#111111]/70 mb-1">Status</p>
                    <p className="text-lg font-semibold text-[#111111]">{property.available ? 'Available' : 'Sold'}</p>
                  </div>
                  {property.propertyId && (
                    <div>
                      <p className="text-sm text-[#111111]/70 mb-1">Property ID</p>
                      <p className="text-lg font-semibold text-[#111111]">{property.propertyId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities and Services */}
            {property.amenities && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-[#111111] mb-6 tracking-tight">Amenities and Services</h2>
                {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
                  <div className="space-y-6">
                    {(() => {
                      // Icon mapping for amenities
                      const iconMap: { [key: string]: any } = {
                        'Air Conditioning': Wind,
                        'Fully Furnished': Sofa,
                        'Wi-Fi Included': Wifi,
                        'Parking Space': Car,
                        'Swimming Pool': Waves,
                        'Fitness Center': Dumbbell,
                        '24/7 Security': Shield,
                        'Elevator': ArrowUpDown,
                        'Balcony': Home,
                        'Fully Equipped Kitchen': ChefHat,
                        'Ensuite Bathroom': Droplets,
                        'Walk-in Closet': Shirt,
                        'Storage Room': Package,
                        'Laundry Area': Sparkles,
                        'Pet-Friendly': HeartIcon,
                        'Near Shopping Malls': ShoppingBag,
                        'Near Schools': GraduationCap,
                        'Near Public Transport': Bus,
                        'City View': Building2,
                        'Waterfront': WaterWaves,
                        'CCTV Surveillance': Camera,
                        'Fire Alarm': Flame,
                        'Concierge Service': ConciergeBell,
                        'Rooftop Garden': TreePine,
                        'Business Center': Briefcase,
                        'Gated Community': Shield,
                        'Near Hospitals': Building,
                        'Cable TV Included': Tv,
                        'Maintenance Included': Wrench,
                        'Smoke Alarm': AlertCircle,
                      };

                      // Group amenities by category
                      const grouped: { [key: string]: string[] } = {};
                      property.amenities.forEach((amenityKey: string) => {
                        const [category, amenity] = amenityKey.split(':');
                        if (!grouped[category]) {
                          grouped[category] = [];
                        }
                        grouped[category].push(amenity);
                      });

                      return Object.entries(grouped).map(([category, amenities]) => (
                        <div key={category}>
                          <h3 className="text-lg font-semibold text-[#111111] mb-3">{category}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {amenities.map((amenity, index) => {
                              const IconComponent = iconMap[amenity] || Package;
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md hover:border-[#1F2937]/50 transition-colors"
                                >
                                  <IconComponent size={18} className="text-[#1F2937] flex-shrink-0" />
                                  <span className="text-sm text-[#111111]">{amenity}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : typeof property.amenities === 'object' && property.amenities !== null ? (
                  // Legacy format support (interior, building, nearby)
                  <div className="space-y-6">
                    {property.amenities.interior && property.amenities.interior.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-[#111111] mb-3">Interior Features</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {property.amenities.interior.map((amenity: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md"
                            >
                              <div className="w-2 h-2 bg-[#1F2937] rounded-full"></div>
                              <span className="text-sm text-[#111111]">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.amenities.building && property.amenities.building.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-[#111111] mb-3">Building & Community</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {property.amenities.building.map((amenity: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md"
                            >
                              <div className="w-2 h-2 bg-[#1F2937] rounded-full"></div>
                              <span className="text-sm text-[#111111]">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.amenities.nearby && property.amenities.nearby.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-[#111111] mb-3">Location & Nearby</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {property.amenities.nearby.map((amenity: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md"
                            >
                              <div className="w-2 h-2 bg-[#1F2937] rounded-full"></div>
                              <span className="text-sm text-[#111111]">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[#111111]/70">No amenities listed</p>
                )}
              </div>
            )}

            {/* Map Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-[#111111] mb-4 tracking-tight">Location</h2>
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-[#F9FAFB] border border-[#E5E7EB]">
                {/* Placeholder for map - can be replaced with actual map component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={48} className="text-[#1F2937] mx-auto mb-2" />
                    <p className="text-[#111111]/70">{property.address}</p>
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
                <h3 className="text-xl font-semibold text-[#111111] mb-4 tracking-tight">Contact Agent</h3>
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
                  <Link
                    href="/contact"
                    className="w-full border-2 border-[#1F2937] text-[#1F2937] px-6 py-3 rounded-lg hover:bg-[#1F2937] hover:text-white transition-all duration-300 font-medium text-center block"
                  >
                    Request Information
                  </Link>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-[#111111] mb-4 tracking-tight">Quick Facts</h3>
                <div className="space-y-3">
                  {property.listingType === 'sale' && property.size > 0 && property.price > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                      <span className="text-[#111111]/70">Price per sqm</span>
                      <span className="font-semibold text-[#111111]">₱{Math.round(property.price / property.size).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                    <span className="text-[#111111]/70">Property Type</span>
                    <span className="font-semibold text-[#111111] capitalize">{property.type.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                    <span className="text-[#111111]/70">City</span>
                    <span className="font-semibold text-[#111111]">{property.city}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#111111]/70">Status</span>
                    <span className={`font-semibold ${property.available ? 'text-green-600' : 'text-red-600'}`}>
                      {property.available ? 'Available' : 'Sold'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {isGalleryOpen && property && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeGallery}
        >
          {/* Close Button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
            aria-label="Close gallery"
          >
            <XIcon size={24} />
          </button>

          {/* Main Image Container */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={property.images[galleryImageIndex]}
                alt={`Gallery Image ${galleryImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {galleryImageIndex + 1} / {property.images.length}
              </div>
            </div>

            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevGalleryImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextGalleryImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            {property.images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 pb-2">
                {property.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryImageIndex(index);
                    }}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      galleryImageIndex === index
                        ? 'border-white shadow-lg scale-110'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


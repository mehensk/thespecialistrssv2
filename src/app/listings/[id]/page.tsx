'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Square, MapPin, Share2, Heart, Calendar, Phone, Mail, ArrowLeft, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { useState } from 'react';

// Extended property data with full details
const propertyDetails: { [key: number]: any } = {
  1: {
    id: 1,
    price: 12500000,
    bedrooms: 3,
    bathrooms: 2,
    size: 120,
    city: 'Makati',
    type: 'condominium',
    listingType: 'sale' as const,
    address: '123 Ayala Avenue, Makati City',
    yearBuilt: 2018,
    parking: 1,
    floor: 15,
    totalFloors: 30,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop',
    ],
    description: `Experience luxury living in the heart of Makati with this stunning 3-bedroom condominium unit. Located in one of the city's most prestigious developments, this property offers modern elegance and unparalleled convenience.

The unit features a spacious open-plan living and dining area with floor-to-ceiling windows that flood the space with natural light. The modern kitchen is fully equipped with premium appliances and ample storage. The master bedroom includes an ensuite bathroom and walk-in closet, while the two additional bedrooms share a well-appointed bathroom.

This property is perfect for professionals, families, or investors seeking a prime location with excellent amenities and strong rental potential.`,
    amenities: {
      interior: [
        'Fully furnished',
        'Air conditioning',
        'Hardwood floors',
        'Modern kitchen with appliances',
        'Walk-in closet',
        'Floor-to-ceiling windows',
        'Balcony',
        'Storage room',
      ],
      building: [
        '24/7 Security',
        'Swimming pool',
        'Fitness center',
        'Function room',
        'Rooftop garden',
        'Parking space',
        'Elevator',
        'Concierge service',
      ],
      nearby: [
        'Ayala Malls (5 min walk)',
        'Greenbelt (10 min walk)',
        'Makati CBD (5 min drive)',
        'Schools nearby',
        'Hospitals (10 min drive)',
        'Public transport accessible',
      ],
    },
    propertyId: 'TSR-2024-001',
    available: true,
  },
};

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const propertyId = parseInt(id);
  const property = propertyDetails[propertyId];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

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
              <div className="relative h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={property.images[currentImageIndex]}
                  alt={`${property.city} Property - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                {/* Rent/Sale Badge - Top Right */}
                <div className="absolute top-4 right-4 z-10">
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
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-[#111111] p-2 rounded-full shadow-lg transition-all z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-[#111111] p-2 rounded-full shadow-lg transition-all z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-10">
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
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#F9FAFB] rounded-lg">
                    <Bed size={20} className="text-[#1F2937]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#111111]/70">Bedrooms</p>
                    <p className="text-lg font-semibold text-[#111111]">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#F9FAFB] rounded-lg">
                    <Bath size={20} className="text-[#1F2937]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#111111]/70">Bathrooms</p>
                    <p className="text-lg font-semibold text-[#111111]">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#F9FAFB] rounded-lg">
                    <Square size={20} className="text-[#1F2937]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#111111]/70">Size</p>
                    <p className="text-lg font-semibold text-[#111111]">{property.size} sqm</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#F9FAFB] rounded-lg">
                    <Hash size={20} className="text-[#1F2937]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#111111]/70">Property ID</p>
                    <p className="text-lg font-semibold text-[#111111]">{property.propertyId}</p>
                  </div>
                </div>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-[#111111] mb-6 tracking-tight">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-[#111111]/70 mb-1">Year Built</p>
                  <p className="text-lg font-semibold text-[#111111]">{property.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-sm text-[#111111]/70 mb-1">Floor</p>
                  <p className="text-lg font-semibold text-[#111111]">{property.floor} of {property.totalFloors}</p>
                </div>
                <div>
                  <p className="text-sm text-[#111111]/70 mb-1">Parking</p>
                  <p className="text-lg font-semibold text-[#111111]">{property.parking} space{property.parking !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-[#111111]/70 mb-1">Status</p>
                  <p className="text-lg font-semibold text-[#111111]">{property.available ? 'Available' : 'Sold'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#111111]/70 mb-1">Property ID</p>
                  <p className="text-lg font-semibold text-[#111111]">{property.propertyId}</p>
                </div>
              </div>
            </div>

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
                  <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                    <span className="text-[#111111]/70">Price per sqm</span>
                    <span className="font-semibold text-[#111111]">₱{Math.round(property.price / property.size).toLocaleString()}</span>
                  </div>
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
    </div>
  );
}


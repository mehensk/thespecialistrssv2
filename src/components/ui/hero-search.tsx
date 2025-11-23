'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

export function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    params.set('listingType', listingType);
    if (location) params.set('location', location);
    if (propertyType) params.set('type', propertyType);

    // Navigate to listings page with search params
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3 sm:p-4 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-3">
          {/* Location Input */}
          <div className="relative flex-1">
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F2937]" />
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                aria-label="Search by location"
                className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] placeholder:text-[#111111]/50 text-sm md:text-base"
              />
            </div>
          </div>

          {/* Property Type Dropdown */}
          <div className="flex-1 md:flex-initial md:w-48">
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              aria-label="Filter by property type"
              className="w-full px-4 py-2.5 md:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white text-sm md:text-base"
            >
              <option value="">All Property Types</option>
              <option value="condominium">Condominium</option>
              <option value="house-and-lot">House and Lot</option>
              <option value="townhouse">Townhouse</option>
              <option value="apartment">Apartment</option>
              <option value="penthouse">Penthouse</option>
              <option value="lot">Lot</option>
              <option value="building">Building</option>
              <option value="commercial">Commercial Space</option>
            </select>
          </div>

          {/* Sale/Rent Dropdown */}
          <div className="flex-1 md:flex-initial md:w-32">
            <select
              id="listingType"
              value={listingType}
              onChange={(e) => setListingType(e.target.value as 'sale' | 'rent')}
              aria-label="Filter by listing type"
              className="w-full px-4 py-2.5 md:py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white text-sm md:text-base"
            >
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium text-sm md:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Search size={18} className="relative z-10" />
            <span className="relative z-10 hidden sm:inline">Search</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      </div>
    </form>
  );
}


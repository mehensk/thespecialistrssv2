'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';

export function HeroSearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    params.set('listingType', listingType);
    if (location) params.set('location', location);
    if (budget) params.set('budget', budget);
    if (propertyType) params.set('type', propertyType);

    // Navigate to listings page with search params
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3 sm:p-4 md:p-6">
        {/* Rent/Sale Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setListingType('sale')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              listingType === 'sale'
                ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                : 'bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB]'
            }`}
          >
            Sale
          </button>
          <button
            type="button"
            onClick={() => setListingType('rent')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              listingType === 'rent'
                ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                : 'bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB]'
            }`}
          >
            Rent
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Input */}
          <div className="relative">
            <label htmlFor="location" className="block text-sm font-medium text-[#111111] mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F2937]" />
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city or area"
                className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] placeholder:text-[#111111]/50"
              />
            </div>
          </div>

          {/* Preferred Budget Input */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-[#111111] mb-2">
              Preferred Budget
            </label>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={listingType === 'rent' ? '₱0 per month' : '₱0'}
              min="0"
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] placeholder:text-[#111111]/50"
            />
          </div>

          {/* Property Type Dropdown */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-[#111111] mb-2">
              Property Type
            </label>
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
            >
              <option value="">All Types</option>
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
        </div>

        {/* Search Button */}
        <div className="mt-4 md:mt-6">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-8 py-4 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 relative overflow-hidden group flex items-center justify-center gap-2"
          >
            <Search size={20} className="relative z-10" />
            <span className="relative z-10">Search Properties</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      </div>
    </form>
  );
}


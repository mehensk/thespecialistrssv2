'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Square, MapPin, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Property type mapping
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

// Mock property data
const mockProperties = [
  {
    id: 1,
    price: 12500000,
    bedrooms: 3,
    bathrooms: 2,
    size: 120,
    city: 'Makati',
    type: 'condominium',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
  },
  {
    id: 2,
    price: 8900000,
    bedrooms: 2,
    bathrooms: 2,
    size: 85,
    city: 'Quezon City',
    type: 'house-and-lot',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
  },
  {
    id: 3,
    price: 15800000,
    bedrooms: 4,
    bathrooms: 3,
    size: 150,
    city: 'BGC',
    type: 'lot',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 4,
    price: 6500000,
    bedrooms: 2,
    bathrooms: 1,
    size: 65,
    city: 'Manila',
    type: 'building',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 5,
    price: 11200000,
    bedrooms: 3,
    bathrooms: 2,
    size: 110,
    city: 'Makati',
    type: 'townhouse',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 6,
    price: 7500000,
    bedrooms: 2,
    bathrooms: 1,
    size: 75,
    city: 'Quezon City',
    type: 'apartment',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 7,
    price: 18500000,
    bedrooms: 4,
    bathrooms: 3,
    size: 180,
    city: 'BGC',
    type: 'penthouse',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 8,
    price: 9500000,
    bedrooms: 3,
    bathrooms: 2,
    size: 95,
    city: 'Makati',
    type: 'condominium',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 9,
    price: 22000000,
    bedrooms: 5,
    bathrooms: 4,
    size: 250,
    city: 'BGC',
    type: 'house-and-lot',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 10,
    price: 4500000,
    bedrooms: 1,
    bathrooms: 1,
    size: 45,
    city: 'Manila',
    type: 'apartment',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 11,
    price: 13500000,
    bedrooms: 3,
    bathrooms: 2,
    size: 130,
    city: 'Quezon City',
    type: 'townhouse',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 12,
    price: 28000000,
    bedrooms: 5,
    bathrooms: 5,
    size: 300,
    city: 'Makati',
    type: 'penthouse',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 13,
    price: 3200000,
    bedrooms: 0,
    bathrooms: 0,
    size: 200,
    city: 'Quezon City',
    type: 'lot',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 14,
    price: 15000000,
    bedrooms: 0,
    bathrooms: 0,
    size: 500,
    city: 'Makati',
    type: 'commercial',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
  },
  {
    id: 15,
    price: 9800000,
    bedrooms: 3,
    bathrooms: 2,
    size: 100,
    city: 'BGC',
    type: 'condominium',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
  },
  {
    id: 16,
    price: 7200000,
    bedrooms: 2,
    bathrooms: 2,
    size: 80,
    city: 'Manila',
    type: 'apartment',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 17,
    price: 16800000,
    bedrooms: 4,
    bathrooms: 3,
    size: 160,
    city: 'Makati',
    type: 'house-and-lot',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
  },
  {
    id: 18,
    price: 11000000,
    bedrooms: 3,
    bathrooms: 2,
    size: 115,
    city: 'Quezon City',
    type: 'townhouse',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 19,
    price: 4200000,
    bedrooms: 1,
    bathrooms: 1,
    size: 50,
    city: 'Manila',
    type: 'apartment',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 20,
    price: 19500000,
    bedrooms: 4,
    bathrooms: 4,
    size: 200,
    city: 'BGC',
    type: 'penthouse',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 21,
    price: 8500000,
    bedrooms: 2,
    bathrooms: 2,
    size: 90,
    city: 'Makati',
    type: 'condominium',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 22,
    price: 25000000,
    bedrooms: 5,
    bathrooms: 5,
    size: 280,
    city: 'Makati',
    type: 'house-and-lot',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
  },
  {
    id: 23,
    price: 5500000,
    bedrooms: 2,
    bathrooms: 1,
    size: 70,
    city: 'Quezon City',
    type: 'apartment',
    listingType: 'rent' as const,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 24,
    price: 12800000,
    bedrooms: 3,
    bathrooms: 3,
    size: 140,
    city: 'BGC',
    type: 'townhouse',
    listingType: 'sale' as const,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2070&auto=format&fit=crop',
  },
];

// Get unique cities from properties
const cities = Array.from(new Set(mockProperties.map(p => p.city))).sort();

function ListingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Filter states
  const listingTypeParam = searchParams.get('listingType');
  const [listingType, setListingType] = useState<'sale' | 'rent' | ''>(
    (listingTypeParam === 'sale' || listingTypeParam === 'rent') ? listingTypeParam : ''
  );
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [minSize, setMinSize] = useState(searchParams.get('minSize') || '');
  const [maxSize, setMaxSize] = useState(searchParams.get('maxSize') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const propertiesPerPage = 12;

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...mockProperties];

    // Apply filters
    if (listingType) {
      filtered = filtered.filter(p => p.listingType === listingType);
    }
    if (selectedCity) {
      filtered = filtered.filter(p => p.city.toLowerCase().includes(selectedCity.toLowerCase()));
    }
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
    }
    if (propertyType) {
      filtered = filtered.filter(p => p.type === propertyType);
    }
    if (bedrooms) {
      const bedCount = parseInt(bedrooms);
      filtered = filtered.filter(p => p.bedrooms >= bedCount);
    }
    if (bathrooms) {
      const bathCount = parseInt(bathrooms);
      filtered = filtered.filter(p => p.bathrooms >= bathCount);
    }
    if (minSize) {
      filtered = filtered.filter(p => p.size >= parseInt(minSize));
    }
    if (maxSize) {
      filtered = filtered.filter(p => p.size <= parseInt(maxSize));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Keep original order (newest first)
        break;
      case 'size-small':
        filtered.sort((a, b) => a.size - b.size);
        break;
      case 'size-large':
        filtered.sort((a, b) => b.size - a.size);
        break;
    }

    return filtered;
  }, [listingType, selectedCity, minPrice, maxPrice, propertyType, bedrooms, bathrooms, minSize, maxSize, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const paginatedProperties = filteredAndSortedProperties.slice(startIndex, startIndex + propertiesPerPage);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (listingType) params.set('listingType', listingType);
    if (selectedCity) params.set('location', selectedCity);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (propertyType) params.set('type', propertyType);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (minSize) params.set('minSize', minSize);
    if (maxSize) params.set('maxSize', maxSize);
    
    const newUrl = params.toString() ? `/listings?${params.toString()}` : '/listings';
    router.replace(newUrl, { scroll: false });
  }, [listingType, selectedCity, minPrice, maxPrice, propertyType, bedrooms, bathrooms, minSize, maxSize, router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [listingType, selectedCity, minPrice, maxPrice, propertyType, bedrooms, bathrooms, minSize, maxSize, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCity(searchLocation);
  };

  const clearFilters = () => {
    setListingType('');
    setSearchLocation('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setPropertyType('');
    setBedrooms('');
    setBathrooms('');
    setMinSize('');
    setMaxSize('');
    setCurrentPage(1);
  };

  const hasActiveFilters = listingType || selectedCity || minPrice || maxPrice || propertyType || bedrooms || bathrooms || minSize || maxSize;

  return (
    <div className="min-h-screen bg-white pt-[84px]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-16">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] mb-4 tracking-tight">
            Browse Properties
          </h1>
          <p className="text-lg text-[#111111]/70">
            {filteredAndSortedProperties.length} {filteredAndSortedProperties.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>

        {/* Top Search Bar */}
        <div className="mb-6">
          {/* Rent/Sale Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setListingType(listingType === 'sale' ? '' : 'sale')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                listingType === 'sale'
                  ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                  : 'bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB]'
              }`}
            >
              Sale
            </button>
            <button
              type="button"
              onClick={() => setListingType(listingType === 'rent' ? '' : 'rent')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                listingType === 'rent'
                  ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                  : 'bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB]'
              }`}
            >
              Rent
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F2937]" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search by location..."
                className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] placeholder:text-[#111111]/50 shadow-sm"
              />
            </div>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white shadow-sm"
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
            <button
              type="submit"
              className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-6 lg:sticky lg:top-[100px] lg:self-start lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:z-10 lg:shadow-lg lg:mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#111111] tracking-tight">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden text-[#111111]/70 hover:text-[#111111]"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mb-4 text-sm text-[#1F2937] hover:underline"
                >
                  Clear all filters
                </button>
              )}

              <div className="space-y-6">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
                  >
                    <option value="">All Locations</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      min="0"
                      className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] text-sm"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      min="0"
                      className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] text-sm"
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Size Range */}
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Size (sqm)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minSize}
                      onChange={(e) => setMinSize(e.target.value)}
                      placeholder="Min"
                      min="0"
                      className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] text-sm"
                    />
                    <input
                      type="number"
                      value={maxSize}
                      onChange={(e) => setMaxSize(e.target.value)}
                      placeholder="Max"
                      min="0"
                      className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Filter Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                <Filter size={18} className="text-[#1F2937]" />
                <span className="text-[#111111] font-medium">Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm text-[#111111]/70">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="size-small">Size: Smallest to Largest</option>
                  <option value="size-large">Size: Largest to Smallest</option>
                </select>
              </div>
            </div>

            {/* Properties Grid */}
            {paginatedProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedProperties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/listings/${property.id}`}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={property.image}
                          alt={`Property in ${property.city}`}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Rent/Sale Badge - Top Right */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide shadow-md ${
                            property.listingType === 'rent'
                              ? 'bg-[#D4AF37] text-white'
                              : 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white'
                          }`}>
                            {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-3">
                          <p className="text-2xl font-semibold text-[#111111]">
                            ₱{property.price.toLocaleString()}
                            {property.listingType === 'rent' && <span className="text-base font-normal text-[#111111]/70">/mo</span>}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-[#111111]/70 mb-4">
                          {property.bedrooms > 0 && (
                            <div className="flex items-center gap-2">
                              <Bed size={18} className="text-[#1F2937]" />
                              <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                            </div>
                          )}
                          {property.bathrooms > 0 && (
                            <div className="flex items-center gap-2">
                              <Bath size={18} className="text-[#1F2937]" />
                              <span>{property.bathrooms} {property.bathrooms === 1 ? 'Toilet' : 'Toilets'}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Square size={18} className="text-[#1F2937]" />
                            <span>{property.size} sqm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-[#1F2937]" />
                            <span>{property.city}</span>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <span className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md text-sm uppercase tracking-wide shadow-md">
                            {propertyTypeMap[property.type] || property.type}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20} className="text-[#1F2937]" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white'
                            : 'border border-[#E5E7EB] text-[#111111] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={20} className="text-[#1F2937]" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-[#111111]/70 mb-4">No properties found</p>
                <p className="text-[#111111]/50 mb-6">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#111111]/70">Loading properties...</p>
        </div>
      </div>
    }>
      <ListingsPageContent />
    </Suspense>
  );
}

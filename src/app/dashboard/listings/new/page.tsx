'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useIsMobile } from '@/hooks/useIsMobile';
import { isMetroManilaCity, METRO_MANILA_CITIES } from '@/lib/location-utils';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { ListingImagesSection } from '@/components/listings/ListingImagesSection';
import { 
  ArrowLeft, 
  CheckCircle, 
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
  Heart,
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
import type { LucideIcon } from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOutsideMetroManila, setIsOutsideMetroManila] = useState(false);
  const isMobile = useIsMobile();
  
  // Initialize formData first before using it in useFileUpload
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    location: '',
    city: '',
    address: '',
    
    // Property Details
    price: '',
    listingType: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    size: '',
    yearBuilt: '',
    parking: '',
    floor: '',
    totalFloors: '',
    available: false,
    
    // Images
    images: [] as string[],
    coverPhotoIndex: 0, // Index of the cover photo
    
    // Amenities - array of selected amenity keys
    amenities: [] as string[],
  });
  
  const {
    handleImageUpload,
    handleDrop,
    handleDragOver,
    uploadingImages,
    error,
    setError,
    fileInputRef,
  } = useFileUpload({
    onUploadSuccess: (url) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    },
    listingTitle: formData.title, // Pass title for folder organization
  });

  const propertyTypes = [
    'condominium',
    'house-and-lot',
    'townhouse',
    'apartment',
    'penthouse',
    'lot',
    'building',
    'commercial',
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleImageUpload(e, formData.images.length);
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    await handleDrop(e, formData.images.length);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone (not just a child element)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    // Adjust cover photo index if needed
    let newCoverPhotoIndex = formData.coverPhotoIndex;
    if (index < formData.coverPhotoIndex) {
      newCoverPhotoIndex = Math.max(0, formData.coverPhotoIndex - 1);
    } else if (index === formData.coverPhotoIndex && newImages.length > 0) {
      newCoverPhotoIndex = 0; // Reset to first image if cover photo was removed
    } else if (newImages.length === 0) {
      newCoverPhotoIndex = 0;
    }
    
    setFormData({
      ...formData,
      images: newImages,
      coverPhotoIndex: newCoverPhotoIndex,
    });
  };

  const setCoverPhoto = (index: number) => {
    setFormData({
      ...formData,
      coverPhotoIndex: index,
    });
  };

  const toggleAmenity = (amenityKey: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityKey)
        ? prev.amenities.filter((a) => a !== amenityKey)
        : [...prev.amenities, amenityKey],
    }));
  };

  // Essential amenities with icons (30 most important)
  const amenitiesList: { name: string; icon: LucideIcon; category: string }[] = [
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent (important for Netlify)
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location || '',
          city: formData.city || null,
          address: formData.address || null,
          price: formData.price || null,
          listingType: formData.listingType || null,
          propertyType: formData.propertyType || null,
          bedrooms: formData.bedrooms || null,
          bathrooms: formData.bathrooms || null,
          size: formData.size || null,
          yearBuilt: formData.yearBuilt || null,
          parking: formData.parking || null,
          floor: formData.floor || null,
          totalFloors: formData.totalFloors || null,
          available: formData.available,
          images: (() => {
            // Reorder images so cover photo is first
            if (formData.images.length === 0) return [];
            const coverPhoto = formData.images[formData.coverPhotoIndex];
            const otherImages = formData.images.filter((_, i) => i !== formData.coverPhotoIndex);
            return [coverPhoto, ...otherImages];
          })(),
          amenities: formData.amenities, // Array of amenity keys
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create listing');
        setLoading(false);
        return;
      }

      // Show success message
      setSuccess(true);
      setError('');

      // Redirect to listings list after showing success message
      setTimeout(() => {
        router.push('/dashboard/listings');
        router.refresh();
      }, 2000);
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] mb-3"
        >
          <ArrowLeft size={18} />
          Back to Listings
        </Link>
        <h1 className="text-2xl font-semibold text-[#111111]">Create New Listing</h1>
      </div>

      <div className="w-full md:max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-8 flex flex-col">
          {/* Mobile Sticky Actions */}
          <div className="lg:hidden sticky top-[148px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur border-b border-[#E5E7EB]">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-4 py-2 rounded-md transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
              <Link
                href="/dashboard/listings"
                className="bg-white border-2 border-[#1F2937] text-[#1F2937] px-4 py-2 rounded-md transition-all text-sm font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Basic Information Section */}
          <CollapsibleSection
            title="Basic Information"
            isMobile={isMobile}
            defaultOpenMobile={true}
            className="order-2 lg:order-1"
          >

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#111111] mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                placeholder="e.g., Luxury 3-Bedroom Condominium in Makati"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#111111] mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={10}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                placeholder="Describe the property in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-[#111111] mb-2">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder={isMetroManilaCity(formData.city) ? "e.g., Makati City" : "e.g., Cavite (for outside Metro Manila)"}
                />
                <p className="mt-1 text-xs text-[#111111]/60">
                  {isOutsideMetroManila 
                    ? "If outside Metro Manila: 'City, Region' ex. Lipa, Batangas" 
                    : isMetroManilaCity(formData.city) 
                      ? "For Metro Manila: City name" 
                      : "City name (Metro Manila) or 'City, Region' if outside (ex. Lipa, Batangas)"}
                </p>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-[#111111] mb-2">
                  City
                </label>
                <select
                  id="city"
                  value={isOutsideMetroManila ? 'outside' : formData.city}
                  onChange={(e) => {
                    if (e.target.value === 'outside') {
                      setIsOutsideMetroManila(true);
                      setFormData({ ...formData, city: '' });
                    } else {
                      setIsOutsideMetroManila(false);
                      setFormData({ ...formData, city: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent bg-white"
                >
                  <option value="">Select City</option>
                  <optgroup label="Metro Manila">
                    {METRO_MANILA_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </optgroup>
                  <option value="outside">Outside Metro Manila</option>
                </select>
                <p className="mt-1 text-xs text-[#111111]/60">
                  {isOutsideMetroManila 
                    ? "✓ Outside Metro Manila - enter 'City, Region' in Location field (ex. Lipa, Batangas)" 
                    : isMetroManilaCity(formData.city) 
                      ? "✓ Metro Manila city selected" 
                      : formData.city 
                        ? "Enter province/region in Location field" 
                        : "Select a city from the dropdown"}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[#111111] mb-2">
                Full Address
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                placeholder="e.g., 123 Ayala Avenue, Makati City"
              />
            </div>
          </CollapsibleSection>

          {/* Property Details Section */}
          <CollapsibleSection title="Property Details" isMobile={isMobile} className="order-3 lg:order-2">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-[#111111] mb-2">
                  Price (₱)
                </label>
                <input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="12500000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="listingType" className="block text-sm font-medium text-[#111111] mb-2">
                  Listing Type
                </label>
                <select
                  id="listingType"
                  value={formData.listingType}
                  onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                >
                  <option value="">Select listing type</option>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-[#111111] mb-2">
                Property Type
              </label>
              <select
                id="propertyType"
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
              >
                <option value="">Select property type</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-[#111111] mb-2">
                  Bedrooms
                </label>
                <input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="3"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-[#111111] mb-2">
                  Bathrooms
                </label>
                <input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="2"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-[#111111] mb-2">
                  Size (sqm)
                </label>
                <input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="120"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="parking" className="block text-sm font-medium text-[#111111] mb-2">
                  Parking Spaces
                </label>
                <input
                  id="parking"
                  type="number"
                  value={formData.parking}
                  onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="1"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="yearBuilt" className="block text-sm font-medium text-[#111111] mb-2">
                  Year Built
                </label>
                <input
                  id="yearBuilt"
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="2018"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-[#111111] mb-2">
                  Floor
                </label>
                <input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="15"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="totalFloors" className="block text-sm font-medium text-[#111111] mb-2">
                  Total Floors
                </label>
                <input
                  id="totalFloors"
                  type="number"
                  value={formData.totalFloors}
                  onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="30"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="available"
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-4 h-4 text-[#1F2937] border-[#E5E7EB] rounded focus:ring-[#1F2937]"
              />
              <label htmlFor="available" className="text-sm font-medium text-[#111111]">
                Property is available
              </label>
            </div>
          </CollapsibleSection>

          {/* Images Section */}
          <div className="order-1 lg:order-3">
            <ListingImagesSection
              images={formData.images}
              coverPhotoIndex={formData.coverPhotoIndex}
              uploadingImages={uploadingImages}
              isDragging={isDragging}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onSetCoverPhoto={setCoverPhoto}
              onRemoveImage={removeImage}
            />
          </div>

          {/* Amenities and Services Section */}
          <CollapsibleSection
            title="Amenities and Services"
            isMobile={isMobile}
            className="order-4"
          >
            <p className="text-xs text-[#111111]/70 mb-3">
              Select all amenities and services available in this property
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
              {amenitiesList.map((amenity) => {
                const amenityKey = `${amenity.category}:${amenity.name}`;
                const isSelected = formData.amenities.includes(amenityKey);
                const IconComponent = amenity.icon;
                return (
                  <button
                    key={amenityKey}
                    type="button"
                    onClick={() => toggleAmenity(amenityKey)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                        : 'bg-white border border-[#E5E7EB] text-[#111111] hover:border-[#1F2937] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <IconComponent size={14} className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-[#1F2937]'}`} />
                    <span className="truncate">{amenity.name}</span>
                  </button>
                );
              })}
            </div>
          </CollapsibleSection>

          {/* Error notification */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="hidden lg:flex lg:items-center gap-3 pt-3 border-t border-[#E5E7EB]">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-5 py-2 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
            <Link
              href="/dashboard/listings"
              className="bg-white border-2 border-[#1F2937] text-[#1F2937] px-5 py-2 rounded-md hover:bg-[#1F2937] hover:text-white transition-all duration-300 text-sm font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Success message - positioned at bottom */}
      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm">
          <CheckCircle size={18} />
          <span>Listing created successfully! Redirecting to your listings...</span>
        </div>
      )}

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Your listing will be created but marked as &quot;Pending Approval&quot;.
          An admin will need to approve it before it&apos;s published and visible to the public.
        </p>
      </div>
    </div>
  );
}

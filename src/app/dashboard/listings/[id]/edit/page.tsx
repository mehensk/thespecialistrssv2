'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useFileUpload } from '@/hooks/useFileUpload';
import { isMetroManilaCity, METRO_MANILA_CITIES } from '@/lib/location-utils';
import { 
  ArrowLeft, 
  CheckCircle, 
  X, 
  Upload, 
  Loader2,
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

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOutsideMetroManila, setIsOutsideMetroManila] = useState(false);
  
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
    processFiles,
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

  // Essential amenities with icons (30 most important)
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

  // Fetch existing listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setFetching(true);
        const response = await fetch(`/api/listings/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Failed to load listing');
          return;
        }

        const listing = data.listing;
        
        // Transform amenities from array or object to array format
        let amenitiesArray: string[] = [];
        if (Array.isArray(listing.amenities)) {
          amenitiesArray = listing.amenities;
        } else if (listing.amenities && typeof listing.amenities === 'object') {
          // Convert old format to new format
          const oldAmenities = listing.amenities as any;
          if (oldAmenities.interior) {
            oldAmenities.interior.forEach((amenity: string) => {
              amenitiesArray.push(`Interior:${amenity}`);
            });
          }
          if (oldAmenities.building) {
            oldAmenities.building.forEach((amenity: string) => {
              amenitiesArray.push(`Building:${amenity}`);
            });
          }
          if (oldAmenities.nearby) {
            oldAmenities.nearby.forEach((amenity: string) => {
              amenitiesArray.push(`Location:${amenity}`);
            });
          }
        }

        // Set form data with existing listing data
        const cityValue = listing.city || '';
        const isOutside = cityValue && !isMetroManilaCity(cityValue);
        
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          location: listing.location || '',
          city: cityValue,
          address: listing.address || '',
          price: listing.price ? listing.price.toString() : '',
          listingType: listing.listingType || '',
          propertyType: listing.propertyType || '',
          bedrooms: listing.bedrooms ? listing.bedrooms.toString() : '',
          bathrooms: listing.bathrooms ? listing.bathrooms.toString() : '',
          size: listing.size ? listing.size.toString() : '',
          yearBuilt: listing.yearBuilt ? listing.yearBuilt.toString() : '',
          parking: listing.parking ? listing.parking.toString() : '',
          floor: listing.floor ? listing.floor.toString() : '',
          totalFloors: listing.totalFloors ? listing.totalFloors.toString() : '',
          available: listing.available !== undefined ? listing.available : true,
          images: listing.images && listing.images.length > 0 ? listing.images : [],
          coverPhotoIndex: 0, // First image is cover photo by default
          amenities: amenitiesArray,
        });
        
        // Set outside Metro Manila state
        setIsOutsideMetroManila(isOutside);
      } catch (err) {
        setError('Failed to load listing data');
        console.error('Error fetching listing:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchListing();
  }, [id]);

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
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
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
        setError(data.error || 'Failed to update listing');
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
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div>
        <div className="mb-8">
          <Link
            href="/dashboard/listings"
            className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] mb-4"
          >
            <ArrowLeft size={20} />
            Back to Listings
          </Link>
          <h1 className="text-3xl font-semibold text-[#111111]">Edit Listing</h1>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#1F2937]" />
            <span className="ml-3 text-[#111111]/70">Loading listing data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] mb-4"
        >
          <ArrowLeft size={20} />
          Back to Listings
        </Link>
        <h1 className="text-3xl font-semibold text-[#111111]">Edit Listing</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#111111] border-b border-[#E5E7EB] pb-2">
              Basic Information
            </h2>

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
                rows={6}
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
          </div>

          {/* Property Details Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#111111] border-b border-[#E5E7EB] pb-2">
              Property Details
            </h2>

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
          </div>

          {/* Images Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#111111] border-b border-[#E5E7EB] pb-2">
              Images
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="imageUpload"
                  className="block text-sm font-medium text-[#111111] mb-2"
                >
                  Upload Images
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-[#1F2937] bg-[#F3F4F6]'
                      : 'border-[#E5E7EB] hover:border-[#1F2937]'
                  }`}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2 text-[#111111]/70 hover:text-[#111111] transition-colors">
                    <Upload size={32} className="text-[#1F2937]" />
                    <span className="font-medium">Click to upload images</span>
                    <span className="text-sm">or drag and drop</span>
                    <span className="text-xs text-[#111111]/50">
                      Recommended: 2000 x 1500px (4:3 ratio), Max 20MB per image
                    </span>
                    <span className="text-xs text-[#111111]/50 mt-1">
                      Images will be automatically resized to meet industry standards
                    </span>
                  </div>
                </div>
              </div>

              {uploadingImages.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-[#111111]/70">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading {uploadingImages.length} image(s)...</span>
                </div>
              )}

              {formData.images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#111111]">
                      Uploaded Images ({formData.images.length})
                    </p>
                    <p className="text-xs text-[#111111]/70">
                      Click on an image to set it as the cover photo
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`relative group cursor-pointer ${
                          formData.coverPhotoIndex === index 
                            ? 'ring-2 ring-[#1F2937] ring-offset-2' 
                            : ''
                        }`}
                        onClick={() => setCoverPhoto(index)}
                      >
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border border-[#E5E7EB]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                        <div className={`absolute bottom-0 left-0 right-0 text-white text-xs p-1 text-center ${
                          formData.coverPhotoIndex === index 
                            ? 'bg-[#1F2937] font-semibold' 
                            : 'bg-black/50'
                        }`}>
                          {formData.coverPhotoIndex === index ? '✓ Cover Photo' : `Image ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities and Services Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#111111] border-b border-[#E5E7EB] pb-2">
              Amenities and Services
            </h2>
            <p className="text-sm text-[#111111]/70 mb-4">
              Select all amenities and services available in this property
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {amenitiesList.map((amenity) => {
                const amenityKey = `${amenity.category}:${amenity.name}`;
                const isSelected = formData.amenities.includes(amenityKey);
                const IconComponent = amenity.icon;
                return (
                  <button
                    key={amenityKey}
                    type="button"
                    onClick={() => toggleAmenity(amenityKey)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                        : 'bg-white border border-[#E5E7EB] text-[#111111] hover:border-[#1F2937] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <IconComponent size={16} className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-[#1F2937]'}`} />
                    <span className="truncate">{amenity.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-[#E5E7EB]">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Listing'}
            </button>
            <Link
              href="/dashboard/listings"
              className="bg-white border-2 border-[#1F2937] text-[#1F2937] px-6 py-3 rounded-md hover:bg-[#1F2937] hover:text-white transition-all duration-300 font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mt-6 flex items-center gap-2">
            <CheckCircle size={20} />
            <span>Listing updated successfully! Redirecting to your listings...</span>
          </div>
        )}
      </div>
    </div>
  );
}


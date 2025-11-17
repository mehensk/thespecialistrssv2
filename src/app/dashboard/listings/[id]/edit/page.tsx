'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          location: listing.location || '',
          city: listing.city || '',
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
      } catch (err) {
        setError('Failed to load listing data');
        console.error('Error fetching listing:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchListing();
  }, [id]);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not an image. Please select an image file.`);
        continue;
      }

      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 20MB limit. Please select a smaller image.`);
        continue;
      }

      const tempId = `${Date.now()}-${Math.random()}`;
      setUploadingImages((prev) => [...prev, tempId]);

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
        setError(''); // Clear any previous errors on success
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image');
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== tempId));
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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

    if (!formData.title || !formData.description || !formData.location) {
      setError('Title, description, and location are required');
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
          location: formData.location,
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
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
            <CheckCircle size={20} />
            <span>Listing updated successfully! Redirecting to your listings...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

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
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="e.g., Makati City"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-[#111111] mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
                  placeholder="e.g., Makati"
                />
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
                  className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center hover:border-[#1F2937] transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
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
      </div>
    </div>
  );
}


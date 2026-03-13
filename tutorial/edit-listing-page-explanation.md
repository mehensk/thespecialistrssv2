# Understanding Edit Listing Page (src/app/dashboard/listings/[id]/edit/page.tsx)
## A Beginner's Guide

This document explains the edit listing page code line by line in plain language. This page lets agents edit their property listings.

---

## OVERVIEW

This is a **Client Component** that:
- Fetches existing listing data from database
- Pre-fills form with current listing data
- Allows users to update all listing details
- Handles image uploads (drag & drop, file selection)
- Manages amenities selection
- Submits updated data to API

---

## DIRECTIVE AND IMPORTS (Lines 1-27)

### What's Happening:
The first line makes this a client component, and imports necessary tools.

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useIsMobile } from '@/hooks/useIsMobile';
import { isMetroManilaCity, METRO_MANILA_CITIES } from '@/lib/location-utils';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { ListingImagesSection } from '@/components/listings/ListingImagesSection';
import { 
  ArrowLeft, CheckCircle, Loader2, Wind, Sofa, Wifi, Car, Waves, Dumbbell, Shield, ArrowUpDown, Home, ChefHat, Droplets, Shirt, Package, Sparkles, Heart, ShoppingBag, GraduationCap, Bus, Building2, Waves as WaterWaves, Camera, Flame, ConciergeBell, TreePine, Briefcase, Tv, Wrench, AlertCircle, Building, 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
```

### Why 'use client':
This MUST be first line:
- This component handles form submissions and file uploads
- Form handling requires client-side interactivity
- Without this, the form wouldn't work
- Think of it as: "This code runs in user's browser to handle forms and images"

### Why These Imports:

**Line 2 (React Hooks):**
```typescript
import { useState, useEffect } from 'react';
```
- `useState`: Stores form data and UI state
- `useEffect`: Fetches data when page loads
- Think of it as: "Get tools for managing data and side effects"

**Line 3 (use hook):**
```typescript
import { use } from 'react';
```
- Special React hook for reading params
- Think of it as: "Get tool to read URL parameters"

**Line 4 (useRouter):**
```typescript
import { useRouter } from 'next/navigation';
```
- Allows navigating to different pages after submission
- Think of it as: "Get tool to navigate to other pages"

**Lines 5-6 (Custom Hooks):**
```typescript
import { useFileUpload } from '@/hooks/useFileUpload';
import { useIsMobile } from '@/hooks/useIsMobile';
```
- `useFileUpload`: Handles image uploads to Cloudinary
- `useIsMobile`: Checks if user is on mobile device
- Think of it as: "Get custom tools for uploading images and detecting mobile"

**Line 7 (Location Utils):**
```typescript
import { isMetroManilaCity, METRO_MANILA_CITIES } from '@/lib/location-utils';
```
- Utilities for working with city names
- Think of it as: "Get tools for checking and listing Metro Manila cities"

**Lines 8-9 (Components):**
```typescript
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import { ListingImagesSection } from '@/components/listings/ListingImagesSection';
```
- Reusable components for form sections
- Think of it as: "Get pre-built form sections to use"

**Lines 10-27 (Icons):**
```typescript
import { ArrowLeft, CheckCircle, Loader2, Wind, Sofa, /* ... many more */ } from 'lucide-react';
```
- Many icons for amenities and UI elements
- Think of it as: "Get all the icons we need for the form"

---

## MAIN COMPONENT (Lines 30-80)

### What's Happening:
This is the main component that manages the edit form.

```typescript
export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOutsideMetroManila, setIsOutsideMetroManila] = useState(false);
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    address: '',
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
    images: [] as string[],
    coverPhotoIndex: 0,
    amenities: [] as string[],
  });
```

### Why This Structure:
- Extracts listing ID from URL
- Sets up state for form data and UI
- Initializes formData with empty/default values
- Think of it as: "Create all the boxes to store data and UI state"

**Line 30 (Component Signature):**
```typescript
export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
```
- Receives params (contains listing ID)
- `params` is a Promise (async)
- Think of it as: "Create the main component that receives the listing ID"

**Line 31 (Extract ID):**
```typescript
const { id } = use(params);
```
- Extracts `id` from params
- Uses the special `use` hook
- Think of it as: "Get the listing ID from the URL"

**Line 32 (Router):**
```typescript
const router = useRouter();
```
- Gets router for navigation
- Think of it as: "Get the tool for navigating to other pages"

**Lines 33-36 (UI State):**
```typescript
const [loading, setLoading] = useState(false);
const [fetching, setFetching] = useState(true);
const [success, setSuccess] = useState(false);
const [isDragging, setIsDragging] = useState(false);
const [isOutsideMetroManila, setIsOutsideMetroManila] = useState(false);
```
- `loading`: Shows "Updating..." while saving
- `fetching`: Shows loading while fetching initial data
- `success`: Shows success message after saving
- `isDragging`: Shows drag-over state for image upload
- `isOutsideMetroManila`: Tracks if city is outside Metro Manila
- Think of it as: "Create boxes to remember various UI states"

**Line 37 (Mobile Detection):**
```typescript
const isMobile = useIsMobile();
```
- Checks if user is on mobile device
- Think of it as: "Check if user is on phone or computer"

**Lines 39-66 (Form Data State):**
```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  location: '',
  city: '',
  address: '',
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
  images: [] as string[],
  coverPhotoIndex: 0,
  amenities: [] as string[],
});
```
- Stores all form data
- Initialized with empty/default values
- Will be filled with actual data when page loads
- Think of it as: "Create a box with all the form fields, starting with empty values"

---

## FILE UPLOAD HOOK (Lines 68-80)

### What's Happening:
Uses a custom hook to handle image uploads.

```typescript
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
  listingTitle: formData.title,
});
```

### Why useFileUpload Hook:
- Handles complex image upload logic
- Uploads to Cloudinary (image hosting service)
- Manages drag & drop functionality
- Think of it as: "Get a pre-built tool that handles all the complicated image upload stuff"

**Lines 69-75 (Destructuring):**
```typescript
const {
  handleImageUpload,
  handleDrop,
  handleDragOver,
  uploadingImages,
  error,
  setError,
  fileInputRef,
} = useFileUpload({...});
```
- Extracts functions and state from the hook
- These handle different aspects of file upload
- Think of it as: "Get all the tools we need for uploading images"

**Lines 76-79 (Upload Success Handler):**
```typescript
onUploadSuccess: (url) => {
  setFormData((prev) => ({
    ...prev,
    images: [...prev.images, url],
  }));
},
```
- When image uploads successfully, add URL to images array
- Uses spread operator to add new image without losing old ones
- Think of it as: "When an image uploads, add its URL to our list of images"

**Line 80 (Listing Title):**
```typescript
listingTitle: formData.title,
```
- Passes listing title for folder organization on Cloudinary
- Think of it as: "Tell Cloudinary to organize images by this listing's title"

---

## DATA FETCHING (Lines 116-195)

### What's Happening:
Fetches existing listing data when page loads.

```typescript
useEffect(() => {
  const fetchListing = async () => {
    try {
      setFetching(true);
      const response = await fetch(`/api/listings/${id}`, {
        cache: 'no-store',
        headers: {
          'x-dashboard-edit': '1',
        },
      });
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
        const oldAmenities = listing.amenities as LegacyAmenities;
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
        coverPhotoIndex: 0,
        amenities: amenitiesArray,
      });
      
      setIsOutsideMetroManila(isOutside);
    } catch (_error) {
      setError('Failed to load listing data');
      console.error('Error fetching listing:', _error);
    } finally {
      setFetching(false);
    }
  };

  fetchListing();
}, [id, setError]);
```

### Why Fetch Data:
- User is editing an existing listing
- Need to populate form with current data
- Must handle different data formats (old vs new)
- Think of it as: "Get the existing listing data and put it into the form so user can edit it"

**Line 116 (useEffect):**
```typescript
useEffect(() => {
```
- Runs when component mounts
- Think of it as: "When the page loads, do this stuff"

**Lines 117-119 (Fetch Function):**
```typescript
const fetchListing = async () => {
  try {
    setFetching(true);
```
- Creates async function to fetch data
- Sets fetching state to true (show loading)
- Think of it as: "Create a function that gets the listing data"

**Lines 120-126 (API Call):**
```typescript
const response = await fetch(`/api/listings/${id}`, {
  cache: 'no-store',
  headers: {
    'x-dashboard-edit': '1',
  },
});
const data = await response.json();
```
- Fetches listing from API
- `cache: 'no-store'`: Don't cache (always get fresh data)
- Custom header identifies request as from edit page
- Think of it as: "Ask the API for this listing's data, don't use cached version"

**Lines 128-133 (Error Handling):**
```typescript
if (!response.ok) {
  setError(data.error || 'Failed to load listing');
  return;
}
```
- If request failed, show error
- Stop processing
- Think of it as: "If something went wrong, show error and stop"

**Lines 135-173 (Amenities Transformation):**
```typescript
const listing = data.listing;

let amenitiesArray: string[] = [];
if (Array.isArray(listing.amenities)) {
  amenitiesArray = listing.amenities;
} else if (listing.amenities && typeof listing.amenities === 'object') {
  const oldAmenities = listing.amenities as LegacyAmenities;
  if (oldAmenities.interior) {
    oldAmenities.interior.forEach((amenity: string) => {
      amenitiesArray.push(`Interior:${amenity}`);
    });
  }
  // ... similar for building and nearby
}
```

This transforms old amenity format to new:
- Old format: `{ interior: [...], building: [...], nearby: [...] }`
- New format: `['Interior:AC', 'Building:Elevator', 'Location:Malls']`
- Maintains backward compatibility
- Think of it as: "Convert old-style amenity data to new-style format"

**Lines 175-199 (Set Form Data):**
```typescript
const cityValue = listing.city || '';
const isOutside = cityValue && !isMetroManilaCity(cityValue);

setFormData({
  title: listing.title || '',
  description: listing.description || '',
  location: listing.location || '',
  city: cityValue,
  address: listing.address || '',
  price: listing.price ? listing.price.toString() : '',
  // ... more fields
  amenities: amenitiesArray,
});

setIsOutsideMetroManila(isOutside);
```
- Populates form with listing data
- Converts numbers to strings for form inputs
- Sets outside Metro Manila flag
- Think of it as: "Fill in all the form fields with the listing's current data"

---

## FORM SUBMISSION (Lines 293-357)

### What's Happening:
Handles form submission and updates listing.

```typescript
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
          if (formData.images.length === 0) return [];
          const coverPhoto = formData.images[formData.coverPhotoIndex];
          const otherImages = formData.images.filter((_, i) => i !== formData.coverPhotoIndex);
          return [coverPhoto, ...otherImages];
        })(),
        amenities: formData.amenities,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to update listing');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setError('');

    setTimeout(() => {
      router.push('/dashboard/listings');
      router.refresh();
    }, 2000);
  } catch {
    setError('An error occurred. Please try again.');
    setLoading(false);
  }
};
```

### Why This Structure:
- Validates form before submitting
- Sends PUT request to update listing
- Shows success message before redirecting
- Think of it as: "When user clicks save, validate data, send to server, show success, then redirect"

**Lines 293-297 (Setup):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
```
- Prevents default form submission
- Clears old errors
- Shows loading state
- Think of it as: "Don't refresh page, clear errors, show we're working"

**Lines 298-303 (Validation):**
```typescript
if (!formData.title || !formData.description) {
  setError('Title and description are required');
  setLoading(false);
  return;
}
```
- Checks if required fields are filled
- Shows error if not
- Think of it as: "Make sure title and description are filled in"

**Lines 305-332 (API Call):**
```typescript
const response = await fetch(`/api/listings/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: formData.title,
    description: formData.description,
    // ... all form fields
  }),
});
```
- Sends PUT request to update listing
- Converts form data to JSON
- Think of it as: "Send the form data to the API to update this listing"

**Lines 334-351 (Image Reordering):**
```typescript
images: (() => {
  if (formData.images.length === 0) return [];
  const coverPhoto = formData.images[formData.coverPhotoIndex];
  const otherImages = formData.images.filter((_, i) => i !== formData.coverPhotoIndex);
  return [coverPhoto, ...otherImages];
})(),
```
- Reorders images so cover photo is first
- Important for display order
- Think of it as: "Put the cover photo first, then all the other images"

**Lines 353-358 (Success):**
```typescript
if (!response.ok) {
  setError(data.error || 'Failed to update listing');
  setLoading(false);
  return;
}

setSuccess(true);
setError('');
```
- If request failed, show error
- If succeeded, show success message
- Think of it as: "If it worked, show success. If not, show error."

**Lines 359-363 (Redirect):**
```typescript
setTimeout(() => {
  router.push('/dashboard/listings');
  router.refresh();
}, 2000);
```
- Waits 2 seconds showing success message
- Redirects to listings page
- Refreshes to show updated data
- Think of it as: "Show success for 2 seconds, then go back to listings page"

---

## KEY CONCEPTS FOR BEGINNERS:

1. **Form State Management**: Using useState to track all form data
2. **Data Fetching**: useEffect to load existing data
3. **Form Validation**: Checking required fields before submission
4. **API Updates**: PUT request to update existing data
5. **File Uploads**: Using custom hooks for image uploads
6. **Data Transformation**: Converting between data formats
7. **Success/Error Handling**: Showing appropriate messages
8. **Redirecting**: Navigation after successful submission
9. **Drag & Drop**: Handling image uploads via drag and drop
10. **Cover Photo**: Managing which image is the main one

---

## HOW IT WORKS:

1. User visits `/dashboard/listings/abc123/edit`
2. Page loads → useEffect fetches existing data
3. Data arrives → Form is pre-filled with current values
4. User edits fields, adds/removes images, toggles amenities
5. User clicks "Update Listing"
6. Form validates → Required fields checked
7. Data sent to API → PUT request updates database
8. Success message shown for 2 seconds
9. Redirected to listings page
10. Updated listing visible in list

---

## WHY PRE-FILL FORM:

- User is editing existing listing, not creating new one
- Don't want user to re-type everything
- Shows current values so user can see what to change
- Think of it as: "Show what's already there so user only needs to change what they want to change"

---

## IMAGE MANAGEMENT:

1. **Upload**: Via file picker or drag & drop
2. **Remove**: Click X button on image
3. **Set Cover**: Click "Set as Cover" on image
4. **Reorder**: Cover photo always appears first in final array
5. **Display**: Images shown in grid with actions

---

## FORM STRUCTURE:

The form is organized into collapsible sections:
1. **Basic Information**: Title, description, location, address
2. **Property Details**: Price, type, bedrooms, bathrooms, size, etc.
3. **Images**: Upload, manage, set cover photo
4. **Amenities**: Select available amenities with icons

This makes the long form more manageable, especially on mobile.
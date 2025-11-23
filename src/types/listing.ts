/**
 * Type definitions for listings
 */

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  location: string;
  city: string | null;
  address: string | null;
  propertyType: string | null;
  listingType: 'sale' | 'rent';
  bedrooms: number | null;
  bathrooms: number | null;
  size: number | null;
  images: string[];
  parking: number | null;
  yearBuilt: number | null;
  floor: number | null;
  totalFloors: number | null;
  createdAt: string;
  updatedAt?: string;
  amenities?: string[] | Record<string, unknown>;
}

export interface TransformedListing extends Listing {
  // Additional fields that might be used in frontend
}


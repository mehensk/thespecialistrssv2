# Listing Card Refactoring Plan

## Overview

Extract duplicate listing card implementations into a single, reusable `ListingCard` component to eliminate code duplication and improve maintainability.

## Current State Analysis

### Duplicate Implementations Found

1. **Featured Listings Card**
   - Location: `src/components/featured-listings.tsx`
   - Grid: 4 columns (responsive: 1 → 2 → 4)
   - Items: Fixed at 4 listings
   - Image sizes: `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw`

2. **Browse Listings Card**
   - Location: `src/app/listings/page.tsx`
   - Grid: 3 columns (responsive: 1 → 2 → 3)
   - Items: Paginated (12 per page)
   - Image sizes: `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw`

### Shared Features (Identical in Both)

#### Data Fields Displayed
- Property image with hover zoom effect
- Rent/Sale badge (gold for rent, dark gray for sale)
- Title (smart formatting based on property type)
- Price with "/mo" suffix for rentals
- Price per sqm for sales (when applicable)
- 3-column grid: Bedrooms, Bathrooms, Size
- Additional details: Parking, Floor/Total Floors, Year Built
- Location with smart formatting
- Property Type Badge

#### Visual Effects
- Hover: Shadow increases, lifts by 1px
- Smooth transitions (300-500ms)
- Image zoom on hover (scale-105)
- Link to individual listing page

#### Data Formatting
- Same `formatBedrooms()` and `formatBedroomsForTitle()` functions
- Same `formatLocationDisplay()` and `formatLocationWithLabel()` functions
- Same property type mapping
- Same price formatting (₱ locale)

### Problem Statement

**Code Duplication:** ~70 lines of identical card code exists in two separate files.

**Maintenance Burden:** Any design change requires updating both implementations separately.

**Inconsistency Risk:** Updates may be applied to one but not the other, causing visual drift.

## Proposed Solution

### Create Shared Component

**New File:** `src/components/listings/ListingCard.tsx`

This component will:
- Contain the single source of truth for listing card design
- Accept props for listing data
- Accept optional props for customization
- Be imported and used by both featured and browse listings

**Normalization choice (Option 1):**
- Normalize listing data in the parent components so `ListingCard` receives a single, consistent shape.
- This avoids branching inside `ListingCard` for `image` vs `images` and `type` vs `propertyType`.

## Component Structure

### Props Interface

```typescript
interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    size: number | null;
    city: string | null;
    type: string | null; // propertyType
    listingType: string;
    image: string;
    location: string | null;
    address: string | null;
    parking: number | null;
    yearBuilt: number | null;
    floor: number | null;
    totalFloors: number | null;
  };
  imageSizes?: string; // Optional: for different grid layouts
  className?: string; // Optional: for custom styling
}
```

### Component Signature

```typescript
export function ListingCard({ 
  listing, 
  imageSizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = ""
}: ListingCardProps)
```

## Implementation Plan

### Phase 1: Create Shared Component

**File:** `src/components/listings/ListingCard.tsx`

**Steps:**
1. Create new file: `src/components/listings/ListingCard.tsx`
2. Extract card JSX from either implementation (both are identical)
3. Define TypeScript interface for props
4. Replace hardcoded values with props
5. Export the component

**Dependencies to Import:**
```typescript
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Square, MapPin, Car, Calendar, Layers } from 'lucide-react';
import { formatLocationDisplay, formatLocationWithLabel, formatBedrooms, formatBedroomsForTitle } from '@/lib/location-utils';
```

**Property Type Map to Include:**
```typescript
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
```

### Phase 2: Refactor Featured Listings

**File:** `src/components/featured-listings.tsx`

**Changes:**
1. Import new `ListingCard` component
2. Normalize listings to the shared shape:
   - `image: listing.images[0]`
   - `type: listing.propertyType`
3. Remove duplicate card JSX (~70 lines)
4. Replace with `<ListingCard listing={listing} imageSizes="..." />`
5. Remove imports that are no longer needed (Bed, Bath, Square, MapPin, Car, Calendar, Layers)
6. Keep imports needed for other parts of the component (useState, useEffect, etc.)
7. Ensure `key` is preserved on `<ListingCard />` in the map.

**Before:**
```typescript
// Lines ~150-220: Duplicate card JSX
<Link
  key={listing.id}
  href={`/listings/${listing.id}`}
  className="bg-white rounded-xl overflow-hidden..."
>
  {/* ~70 lines of card code */}
</Link>
```

**After:**
```typescript
<ListingCard 
  listing={listing} 
  imageSizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
/>
```

### Phase 3: Refactor Browse Listings

**File:** `src/app/listings/page.tsx`

**Changes:**
1. Import new `ListingCard` component
2. Verify listings already match the shared shape (`image` and `type`)
3. Remove duplicate card JSX (~70 lines)
4. Replace with `<ListingCard listing={property} />`
5. Remove imports that are no longer needed (Bed, Bath, Square, MapPin, Car, Calendar, Layers)
6. Keep imports needed for other parts of the page (filter logic, pagination, etc.)
7. Ensure `key` is preserved on `<ListingCard />` in the map.

**Before:**
```typescript
// Lines ~400-470: Duplicate card JSX
<Link
  key={property.id}
  href={`/listings/${property.id}`}
  className="bg-white rounded-xl overflow-hidden..."
>
  {/* ~70 lines of card code */}
</Link>
```

**After:**
```typescript
<ListingCard 
  listing={property}
  imageSizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

## Files to be Created/Modified

### New Files
1. `src/components/listings/ListingCard.tsx` (~120 lines)

### Modified Files
1. `src/components/featured-listings.tsx` 
   - Remove: ~70 lines (card JSX)
   - Add: ~5 lines (imports + component usage)
   - Net: -65 lines

2. `src/app/listings/page.tsx`
   - Remove: ~70 lines (card JSX)
   - Add: ~5 lines (imports + component usage)
   - Net: -65 lines

### Unchanged Files
- `src/lib/location-utils.ts` (helper functions remain)
- `src/app/dashboard/listings/listing-card.tsx` (different card for dashboard)
- `src/components/admin/CompactListingCard.tsx` (different card for admin)

## Testing Checklist

### Visual Verification
- [ ] Featured listings page: Cards render correctly
- [ ] Browse listings page: Cards render correctly
- [ ] Card layout matches previous design exactly
- [ ] Hover effects work (shadow, lift, image zoom)
- [ ] Rent/Sale badges display correctly with proper colors
- [ ] All icons (Bed, Bath, Square, MapPin, Car, Calendar, Layers) display

### Functional Verification
- [ ] Card links navigate to correct listing detail page
- [ ] Images load and display properly
- [ ] Price formatting is correct (₱ with locale)
- [ ] "/mo" suffix appears for rentals
- [ ] Price per sqm appears for sales (when applicable)
- [ ] Bedroom formatting handles "Studio" for 0-bedroom condos
- [ ] Location formatting displays correctly (Metro Manila vs outside)
- [ ] Property type badges display correctly

### Responsive Verification
- [ ] Featured listings: 1 column on mobile, 2 on tablet, 4 on desktop
- [ ] Browse listings: 1 column on mobile, 2 on tablet, 3 on desktop
- [ ] Card images load with correct sizes for each breakpoint
- [ ] No layout breaks on different screen sizes

### Data Verification
- [ ] All data fields display correctly (bedrooms, bathrooms, size, parking, floor, yearBuilt)
- [ ] Null/undefined values handled gracefully (fields hidden when appropriate)
- [ ] Empty images fallback to default image
- [ ] Price display matches current behavior on both pages (featured shows "Price on request" when missing, browse keeps existing behavior)

## Risk Assessment

### Low Risk
- No changes to visual design
- No changes to functionality
- No changes to data flow
- Straightforward code extraction

### Mitigation Strategy
- Test thoroughly on both pages
- Verify responsive behavior
- Check all data edge cases (null, undefined, empty values)

## Benefits

### Immediate Benefits
1. **Single Source of Truth:** One place to maintain card design
2. **Reduced Duplication:** Eliminate ~140 lines of duplicate code
3. **Easier Maintenance:** Updates only need to be made once
4. **Better Organization:** Clear separation of concerns

### Long-term Benefits
1. **Reusability:** Component can be easily used in other parts of the app
2. **Consistency:** Ensures cards always look the same everywhere
3. **Scalability:** Easy to add new features or variations
4. **Code Quality:** Follows DRY (Don't Repeat Yourself) principle

## Future Enhancement Opportunities

Once the shared component is in place, future enhancements become easier:

1. **Card Variants:** Add prop to switch between different card styles (compact, detailed, minimal)
2. **Additional Features:** Add save/favorite button, compare button, quick view
3. **Animation Options:** Add entrance animations, hover effects variants
4. **Badges:** Add "New Listing", "Price Reduced", "Featured" badges
5. **Lazy Loading:** Optimize image loading with better intersection observer

## Implementation Order

1. ✅ Create `src/components/listings/ListingCard.tsx`
2. ✅ Update `src/components/featured-listings.tsx`
3. ✅ Update `src/app/listings/page.tsx`
4. ✅ Test featured listings page
5. ✅ Test browse listings page
6. ✅ Verify responsive behavior
7. ✅ Verify all data displays correctly

## Rollback Plan

If issues arise, rollback is simple:
1. Delete `src/components/listings/ListingCard.tsx`
2. Restore original files from git
3. Both pages will work as before

## Summary

This refactoring is a low-risk, high-reward improvement that:
- Eliminates code duplication
- Improves maintainability
- Has zero visual impact
- Makes future enhancements easier
- Follows best practices for component architecture

**Estimated Time:** 30-45 minutes
**Difficulty:** Low
**Risk:** Low
**Benefits:** High

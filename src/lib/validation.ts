/**
 * Utility functions for safe input parsing and validation
 */

/**
 * Safely parse an integer with optional min/max validation
 * @param value - The value to parse
 * @param min - Optional minimum value
 * @param max - Optional maximum value
 * @returns Parsed integer or null if invalid
 */
export function safeParseInt(
  value: string | number | undefined | null,
  min?: number,
  max?: number
): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // If already a number, validate it
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return null;
    if (min !== undefined && value < min) return null;
    if (max !== undefined && value > max) return null;
    return Math.floor(value);
  }

  // Parse string
  const parsed = parseInt(String(value), 10);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }

  if (min !== undefined && parsed < min) {
    return null;
  }
  if (max !== undefined && parsed > max) {
    return null;
  }

  return parsed;
}

/**
 * Safely parse a float with optional min/max validation
 * @param value - The value to parse
 * @param min - Optional minimum value
 * @param max - Optional maximum value
 * @returns Parsed float or null if invalid
 */
export function safeParseFloat(
  value: string | number | undefined | null,
  min?: number,
  max?: number
): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // If already a number, validate it
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return null;
    if (min !== undefined && value < min) return null;
    if (max !== undefined && value > max) return null;
    return value;
  }

  // Parse string
  const parsed = parseFloat(String(value));
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }

  if (min !== undefined && parsed < min) {
    return null;
  }
  if (max !== undefined && parsed > max) {
    return null;
  }

  return parsed;
}

/**
 * Validate listing input data
 */
export interface ListingValidationResult {
  valid: boolean;
  error?: string;
}

export function validateListingInput(body: any): ListingValidationResult {
  // Title validation
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    return { valid: false, error: 'Title is required and must be a non-empty string' };
  }
  if (body.title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }

  // Description validation
  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    return { valid: false, error: 'Description is required and must be a non-empty string' };
  }
  if (body.description.length > 10000) {
    return { valid: false, error: 'Description must be less than 10000 characters' };
  }

  // Location validation (optional)
  if (body.location !== undefined && body.location !== null) {
    if (typeof body.location !== 'string') {
      return { valid: false, error: 'Location must be a string' };
    }
    if (body.location.trim().length === 0) {
      return { valid: false, error: 'Location cannot be an empty string' };
    }
    if (body.location.length > 200) {
      return { valid: false, error: 'Location must be less than 200 characters' };
    }
  }

  // City validation (optional but if provided, must be valid)
  if (body.city !== undefined && body.city !== null) {
    if (typeof body.city !== 'string' || body.city.length > 100) {
      return { valid: false, error: 'City must be a string less than 100 characters' };
    }
  }

  // Address validation (optional but if provided, must be valid)
  if (body.address !== undefined && body.address !== null) {
    if (typeof body.address !== 'string' || body.address.length > 500) {
      return { valid: false, error: 'Address must be a string less than 500 characters' };
    }
  }

  // Property type validation
  const validPropertyTypes = [
    'condominium',
    'house-and-lot',
    'townhouse',
    'apartment',
    'penthouse',
    'lot',
    'building',
    'commercial',
  ];
  if (body.propertyType && !validPropertyTypes.includes(body.propertyType)) {
    return { valid: false, error: 'Invalid property type' };
  }

  // Listing type validation
  const validListingTypes = ['sale', 'rent'];
  if (body.listingType && !validListingTypes.includes(body.listingType)) {
    return { valid: false, error: 'Invalid listing type. Must be "sale" or "rent"' };
  }

  // Numeric field validations
  if (body.bedrooms !== undefined && body.bedrooms !== null) {
    const bedrooms = safeParseInt(body.bedrooms, 0, 50);
    if (bedrooms === null && body.bedrooms !== '') {
      return { valid: false, error: 'Bedrooms must be a number between 0 and 50' };
    }
  }

  if (body.bathrooms !== undefined && body.bathrooms !== null) {
    const bathrooms = safeParseFloat(body.bathrooms, 0, 50);
    if (bathrooms === null && body.bathrooms !== '') {
      return { valid: false, error: 'Bathrooms must be a number between 0 and 50' };
    }
  }

  if (body.size !== undefined && body.size !== null) {
    const size = safeParseFloat(body.size, 0, 1000000);
    if (size === null && body.size !== '') {
      return { valid: false, error: 'Size must be a number between 0 and 1,000,000' };
    }
  }

  if (body.price !== undefined && body.price !== null) {
    const price = safeParseFloat(body.price, 0, 999999999999);
    if (price === null && body.price !== '') {
      return { valid: false, error: 'Price must be a valid positive number' };
    }
  }

  if (body.yearBuilt !== undefined && body.yearBuilt !== null) {
    const yearBuilt = safeParseInt(body.yearBuilt, 1800, new Date().getFullYear() + 10);
    if (yearBuilt === null && body.yearBuilt !== '') {
      return { valid: false, error: `Year built must be a number between 1800 and ${new Date().getFullYear() + 10}` };
    }
  }

  if (body.parking !== undefined && body.parking !== null) {
    const parking = safeParseInt(body.parking, 0, 100);
    if (parking === null && body.parking !== '') {
      return { valid: false, error: 'Parking spaces must be a number between 0 and 100' };
    }
  }

  if (body.floor !== undefined && body.floor !== null) {
    const floor = safeParseInt(body.floor, 0, 200);
    if (floor === null && body.floor !== '') {
      return { valid: false, error: 'Floor must be a number between 0 and 200' };
    }
  }

  if (body.totalFloors !== undefined && body.totalFloors !== null) {
    const totalFloors = safeParseInt(body.totalFloors, 1, 200);
    if (totalFloors === null && body.totalFloors !== '') {
      return { valid: false, error: 'Total floors must be a number between 1 and 200' };
    }
  }

  // Images validation
  if (body.images !== undefined && !Array.isArray(body.images)) {
    return { valid: false, error: 'Images must be an array' };
  }

  // Amenities validation
  if (body.amenities !== undefined && body.amenities !== null) {
    if (!Array.isArray(body.amenities) && typeof body.amenities !== 'object') {
      return { valid: false, error: 'Amenities must be an array or object' };
    }
  }

  return { valid: true };
}

/**
 * Validate blog post input data
 */
export interface BlogPostValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBlogPostInput(body: any): BlogPostValidationResult {
  // Title validation
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    return { valid: false, error: 'Title is required and must be a non-empty string' };
  }
  if (body.title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }

  // Content validation
  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    return { valid: false, error: 'Content is required and must be a non-empty string' };
  }
  if (body.content.length > 100000) {
    return { valid: false, error: 'Content must be less than 100,000 characters' };
  }

  // Slug validation
  if (!body.slug || typeof body.slug !== 'string' || body.slug.trim().length === 0) {
    return { valid: false, error: 'Slug is required and must be a non-empty string' };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
    return { valid: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }
  if (body.slug.length > 200) {
    return { valid: false, error: 'Slug must be less than 200 characters' };
  }

  // Excerpt validation (optional)
  if (body.excerpt !== undefined && body.excerpt !== null) {
    if (typeof body.excerpt !== 'string' || body.excerpt.length > 500) {
      return { valid: false, error: 'Excerpt must be a string less than 500 characters' };
    }
  }

  // Images validation
  if (body.images !== undefined && !Array.isArray(body.images)) {
    return { valid: false, error: 'Images must be an array' };
  }
  if (Array.isArray(body.images) && body.images.length > 10) {
    return { valid: false, error: 'Maximum 10 images allowed per blog post' };
  }

  return { valid: true };
}


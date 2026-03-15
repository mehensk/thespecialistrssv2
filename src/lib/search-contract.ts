export const VALID_PROPERTY_TYPES = [
  'condominium',
  'house-and-lot',
  'townhouse',
  'apartment',
  'penthouse',
  'lot',
  'building',
  'commercial',
] as const;

export type PropertyType = (typeof VALID_PROPERTY_TYPES)[number];
export type ListingType = 'sale' | 'rent';

export interface SearchContractParams {
  location: string | null;
  type: PropertyType | null;
  listingType: ListingType | null;
  minPrice: number | null;
  maxPrice: number | null;
  minSize: number | null;
  maxSize: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  page: number | null;
  limit: number | null;
}

export interface SearchParamError {
  field: keyof SearchContractParams;
  code: 'invalid_value' | 'out_of_range';
  message: string;
  value: string;
}

export interface SearchParseResult {
  params: SearchContractParams;
  errors: SearchParamError[];
}

type SearchParamReader = {
  get: (key: string) => string | null;
};

type SearchParamInput =
  | SearchParamReader
  | URLSearchParams
  | Record<string, string | number | null | undefined>;

type QueryValue = string | number | null | undefined;

function toReader(input: SearchParamInput): SearchParamReader {
  if (typeof (input as SearchParamReader).get === 'function') {
    return input as SearchParamReader;
  }

  const map = input as Record<string, string | number | null | undefined>;
  return {
    get: (key: string) => {
      const value = map[key];
      if (value === undefined || value === null) return null;
      return String(value);
    },
  };
}

export function normalizeText(value: string | null | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function canonicalizeListingType(value: string | null | undefined): ListingType | null {
  const normalized = normalizeText(value);
  if (normalized === 'sale' || normalized === 'rent') {
    return normalized;
  }
  return null;
}

export function canonicalizePropertyType(value: string | null | undefined): PropertyType | null {
  const normalized = normalizeText(value);
  return (VALID_PROPERTY_TYPES as readonly string[]).includes(normalized)
    ? (normalized as PropertyType)
    : null;
}

function parseNonNegativeNumber(
  field: keyof SearchContractParams,
  value: string | null,
  errors: SearchParamError[],
  min: number,
  max?: number
): number | null {
  if (!value) return null;

  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    errors.push({
      field,
      code: 'invalid_value',
      message: `${field} must be a valid number`,
      value: value,
    });
    return null;
  }

  if (parsed < min || (max !== undefined && parsed > max)) {
    errors.push({
      field,
      code: 'out_of_range',
      message:
        max !== undefined
          ? `${field} must be between ${min} and ${max}`
          : `${field} must be at least ${min}`,
      value: value,
    });
    return null;
  }

  return parsed;
}

function parsePositiveInt(
  field: keyof SearchContractParams,
  value: string | null,
  errors: SearchParamError[],
  min: number,
  max?: number
): number | null {
  const parsed = parseNonNegativeNumber(field, value, errors, min, max);
  if (parsed === null) return null;

  if (!Number.isInteger(parsed)) {
    errors.push({
      field,
      code: 'invalid_value',
      message: `${field} must be an integer`,
      value: String(value),
    });
    return null;
  }

  return parsed;
}

export function parseSearchParams(input: SearchParamInput): SearchParseResult {
  const reader = toReader(input);
  const errors: SearchParamError[] = [];

  const rawLocation = reader.get('location');
  const rawType = reader.get('type');
  const rawListingType = reader.get('listingType');

  const type = rawType ? canonicalizePropertyType(rawType) : null;
  if (rawType && !type) {
    errors.push({
      field: 'type',
      code: 'invalid_value',
      message: 'type must be one of the supported property types',
      value: rawType,
    });
  }

  const listingType = rawListingType ? canonicalizeListingType(rawListingType) : null;
  if (rawListingType && !listingType) {
    errors.push({
      field: 'listingType',
      code: 'invalid_value',
      message: 'listingType must be "sale" or "rent"',
      value: rawListingType,
    });
  }

  const params: SearchContractParams = {
    location: rawLocation ? normalizeWhitespace(rawLocation) : null,
    type,
    listingType,
    minPrice: parseNonNegativeNumber('minPrice', reader.get('minPrice'), errors, 0),
    maxPrice: parseNonNegativeNumber('maxPrice', reader.get('maxPrice'), errors, 0),
    minSize: parseNonNegativeNumber('minSize', reader.get('minSize'), errors, 0),
    maxSize: parseNonNegativeNumber('maxSize', reader.get('maxSize'), errors, 0),
    bedrooms: parsePositiveInt('bedrooms', reader.get('bedrooms'), errors, 0),
    bathrooms: parsePositiveInt('bathrooms', reader.get('bathrooms'), errors, 0),
    page: parsePositiveInt('page', reader.get('page'), errors, 1),
    limit: parsePositiveInt('limit', reader.get('limit'), errors, 1, 100),
  };

  return { params, errors };
}

export function toCanonicalQuery(input: Partial<Record<keyof SearchContractParams, QueryValue>>): URLSearchParams {
  const params = new URLSearchParams();

  const location = typeof input.location === 'string' ? normalizeWhitespace(input.location) : '';
  if (location) params.set('location', location);

  const listingType = canonicalizeListingType(input.listingType != null ? String(input.listingType) : null);
  if (listingType) params.set('listingType', listingType);

  const propertyType = canonicalizePropertyType(input.type != null ? String(input.type) : null);
  if (propertyType) params.set('type', propertyType);

  const numericFields: Array<keyof SearchContractParams> = [
    'minPrice',
    'maxPrice',
    'minSize',
    'maxSize',
    'bedrooms',
    'bathrooms',
    'page',
    'limit',
  ];

  numericFields.forEach((field) => {
    const value = input[field];
    if (value === undefined || value === null || value === '') return;

    const asNumber = Number(value);
    if (!Number.isFinite(asNumber)) return;

    if (
      (field === 'page' && asNumber < 1) ||
      (field === 'limit' && (asNumber < 1 || asNumber > 100)) ||
      (field !== 'page' && field !== 'limit' && asNumber < 0)
    ) {
      return;
    }

    if (field === 'page' || field === 'limit' || field === 'bedrooms' || field === 'bathrooms') {
      if (!Number.isInteger(asNumber)) return;
      params.set(field, String(asNumber));
      return;
    }

    params.set(field, String(asNumber));
  });

  return params;
}

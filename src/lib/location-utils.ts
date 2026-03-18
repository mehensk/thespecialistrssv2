// Metro Manila cities list (exported for dashboard dropdown use)
export const METRO_MANILA_CITIES = [
  'Manila',
  'Quezon City',
  'Caloocan',
  'Las Pi\u00f1as',
  'Makati',
  'Malabon',
  'Mandaluyong',
  'Marikina',
  'Muntinlupa',
  'Navotas',
  'Para\u00f1aque',
  'Pasay',
  'Pasig',
  'Pateros',
  'San Juan',
  'Taguig',
  'Valenzuela',
] as const;

export type MetroManilaCity = (typeof METRO_MANILA_CITIES)[number];

export const METRO_MANILA_FILTER_VALUE = '__metro_manila__';
export const OUTSIDE_METRO_MANILA_FILTER_VALUE = '__outside_metro_manila__';
export const NCR_CITY_FILTER_PREFIX = '__ncr_city__:';

export type ParsedLocationFilter =
  | { kind: 'all'; raw: string }
  | { kind: 'metro'; raw: string }
  | { kind: 'outside'; raw: string }
  | { kind: 'ncr-city'; raw: string; city: MetroManilaCity }
  | { kind: 'text'; raw: string; text: string };

function normalizeForComparison(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripMunicipalityAndCitySuffix(value: string): string {
  return normalizeForComparison(value)
    .replace(/^city of\s+/, '')
    .replace(/^municipality of\s+/, '')
    .replace(/\s+city$/, '')
    .replace(/\s+municipality$/, '')
    .trim();
}

const METRO_CANONICAL_BY_NORMALIZED = new Map<string, MetroManilaCity>(
  METRO_MANILA_CITIES.map((city) => [stripMunicipalityAndCitySuffix(city), city])
);

const MANILA_LABEL = 'City of Manila';
const PATEROS_LABEL = 'Municipality of Pateros';

/**
 * Normalize Metro Manila city variants to canonical values.
 * Example: "Muntinlupa City" => "Muntinlupa".
 */
export function canonicalizeMetroManilaCity(city: string | null | undefined): MetroManilaCity | null {
  if (!city) return null;
  const normalized = stripMunicipalityAndCitySuffix(city);
  if (!normalized) return null;
  return METRO_CANONICAL_BY_NORMALIZED.get(normalized) ?? null;
}

/**
 * Check if a city is in Metro Manila.
 */
export function isMetroManilaCity(city: string | null | undefined): boolean {
  return canonicalizeMetroManilaCity(city) !== null;
}

/**
 * UI display label used in browse/create/edit dropdowns.
 * Rule:
 * - City of Manila on top
 * - Municipality of Pateros at bottom
 * - Middle NCR labels in ____ City format
 */
export function getMetroManilaCityDisplayLabel(city: MetroManilaCity): string {
  if (city === 'Manila') return MANILA_LABEL;
  if (city === 'Pateros') return PATEROS_LABEL;
  if (city.endsWith('City')) return city;
  return `${city} City`;
}

/**
 * City label formatter for listing cards/details.
 */
export function formatCityDisplayLabel(city: string | null | undefined): string {
  if (!city) return '';
  const trimmed = city.trim();
  if (!trimmed) return '';
  const canonicalCity = canonicalizeMetroManilaCity(trimmed);
  if (!canonicalCity) return trimmed;
  return getMetroManilaCityDisplayLabel(canonicalCity);
}

export function createMetroManilaCityFilterValue(city: MetroManilaCity): string {
  return `${NCR_CITY_FILTER_PREFIX}${city}`;
}

export function parseLocationFilterValue(value: string | null | undefined): ParsedLocationFilter {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return { kind: 'all', raw: '' };
  if (raw === METRO_MANILA_FILTER_VALUE) return { kind: 'metro', raw };
  if (raw === OUTSIDE_METRO_MANILA_FILTER_VALUE) return { kind: 'outside', raw };

  if (raw.startsWith(NCR_CITY_FILTER_PREFIX)) {
    const cityPart = raw.slice(NCR_CITY_FILTER_PREFIX.length);
    const city = canonicalizeMetroManilaCity(cityPart);
    if (city) return { kind: 'ncr-city', raw, city };
  }

  return { kind: 'text', raw, text: raw };
}

/**
 * Search terms used for matching historical DB variants.
 */
export function getMetroManilaSearchTerms(city: MetroManilaCity): string[] {
  const values: string[] = [city];

  if (!city.endsWith('City') && city !== 'Pateros' && city !== 'Manila') {
    values.push(`${city} City`);
  }
  if (city === 'Manila') {
    values.push(MANILA_LABEL);
  }
  if (city === 'Pateros') {
    values.push(PATEROS_LABEL, 'Pateros Municipality');
  }
  if (city === 'Las Pi\u00f1as') {
    values.push('Las Pinas', 'Las Pi\u00f1as');
  }
  if (city === 'Para\u00f1aque') {
    values.push('Paranaque', 'Para\u00f1aque');
  }

  return Array.from(
    new Map(values.map((entry) => [entry.trim().toLowerCase(), entry.trim()])).values()
  ).filter(Boolean);
}

/**
 * Build NCR city options from listing-backed city values.
 * Ordering: Manila first, middle alphabetical, Pateros last.
 */
export function getMetroManilaDropdownOptions(cities: string[]): Array<{ value: string; label: string }> {
  const uniqueCities = new Set<MetroManilaCity>();
  cities.forEach((city) => {
    const canonical = canonicalizeMetroManilaCity(city);
    if (canonical) uniqueCities.add(canonical);
  });

  const middle = Array.from(uniqueCities).filter((city) => city !== 'Manila' && city !== 'Pateros');
  middle.sort((a, b) => getMetroManilaCityDisplayLabel(a).localeCompare(getMetroManilaCityDisplayLabel(b)));

  const ordered: MetroManilaCity[] = [];
  if (uniqueCities.has('Manila')) ordered.push('Manila');
  ordered.push(...middle);
  if (uniqueCities.has('Pateros')) ordered.push('Pateros');

  return ordered.map((city) => ({
    value: createMetroManilaCityFilterValue(city),
    label: getMetroManilaCityDisplayLabel(city),
  }));
}

/**
 * Format location for display on listing cards.
 */
export function formatLocationDisplay(
  city: string | null | undefined,
  location: string | null | undefined,
  address: string | null | undefined
): string {
  if (address) {
    return address;
  }

  if (city) {
    const canonicalCity = canonicalizeMetroManilaCity(city);
    if (canonicalCity) {
      return getMetroManilaCityDisplayLabel(canonicalCity);
    }

    if (location && location.toLowerCase() !== city.toLowerCase()) {
      return `${city}, ${location}`;
    }
    return city;
  }

  return location || 'Location not specified';
}

/**
 * Format location with label for listing cards/details.
 */
export function formatLocationWithLabel(
  city: string | null | undefined,
  location: string | null | undefined,
  address: string | null | undefined
): string {
  const canonicalCity = canonicalizeMetroManilaCity(city);
  const cityLabel = canonicalCity ? getMetroManilaCityDisplayLabel(canonicalCity) : null;

  if (address) {
    if (canonicalCity && cityLabel) {
      const parts = address
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        const canonicalFromLastPart = canonicalizeMetroManilaCity(lastPart);
        if (canonicalFromLastPart === canonicalCity) {
          parts[parts.length - 1] = cityLabel;
          return parts.join(', ');
        }
      }
    }

    return address;
  }

  if (city) {
    if (canonicalCity) {
      const resolvedCityLabel = cityLabel || getMetroManilaCityDisplayLabel(canonicalCity);
      if (location) {
        const normalizedLocation = normalizeForComparison(location);
        const normalizedCity = normalizeForComparison(canonicalCity);
        const normalizedCityLabel = normalizeForComparison(resolvedCityLabel);
        if (normalizedLocation.includes(normalizedCity) || normalizedLocation.includes(normalizedCityLabel)) {
          return location;
        }
        return `${location}, ${resolvedCityLabel}`;
      }
      return resolvedCityLabel;
    }

    if (location) {
      return location;
    }
    return city || 'Location not specified';
  }

  if (location) {
    return location;
  }

  return 'Location not specified';
}

/**
 * Group cities for filter dropdown (legacy helper retained).
 */
export function groupCitiesForFilter(cities: string[]): {
  metroManila: string[];
  outside: string[];
} {
  const metroManila = new Set<string>();
  const outside = new Set<string>();

  cities.forEach((city) => {
    const canonical = canonicalizeMetroManilaCity(city);
    if (canonical) {
      metroManila.add(canonical);
      return;
    }
    const normalized = city.trim();
    if (normalized) {
      outside.add(normalized);
    }
  });

  return {
    metroManila: Array.from(metroManila).sort(),
    outside: Array.from(outside).sort(),
  };
}

/**
 * Format bedrooms for display.
 */
export function formatBedrooms(
  bedrooms: number | null | undefined,
  propertyType: string | null | undefined
): string {
  if (bedrooms === null || bedrooms === undefined) {
    return '';
  }

  if (bedrooms === 0 && propertyType?.toLowerCase() === 'condominium') {
    return 'Studio';
  }

  if (bedrooms === 0) {
    return '';
  }

  return bedrooms.toString();
}

/**
 * Format bedrooms for display in titles/cards.
 */
export function formatBedroomsForTitle(
  bedrooms: number | null | undefined,
  propertyType: string | null | undefined
): string {
  if (bedrooms === null || bedrooms === undefined) {
    return '';
  }

  if (bedrooms === 0 && propertyType?.toLowerCase() === 'condominium') {
    return 'Studio ';
  }

  if (bedrooms === 0) {
    return '';
  }

  if (bedrooms > 0) {
    return `${bedrooms} Bedroom `;
  }

  return '';
}

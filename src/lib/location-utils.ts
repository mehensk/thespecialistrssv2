// Metro Manila cities list (exported for dropdown use)
export const METRO_MANILA_CITIES = [
  'Manila',
  'Quezon City',
  'Caloocan',
  'Las Piñas',
  'Makati',
  'Malabon',
  'Mandaluyong',
  'Marikina',
  'Muntinlupa',
  'Navotas',
  'Parañaque',
  'Pasay',
  'Pasig',
  'Pateros',
  'San Juan',
  'Taguig',
  'Valenzuela',
];

/**
 * Check if a city is in Metro Manila
 */
export function isMetroManilaCity(city: string | null | undefined): boolean {
  if (!city) return false;
  const normalizedCity = city.trim();
  return METRO_MANILA_CITIES.some(
    mmCity => normalizedCity.toLowerCase() === mmCity.toLowerCase()
  );
}

/**
 * Format location for display on listing cards
 * Returns: "City" for Metro Manila, "City, Province/Region" for outside
 */
export function formatLocationDisplay(
  city: string | null | undefined,
  location: string | null | undefined,
  address: string | null | undefined
): string {
  // Priority: address > formatted city+location > city > location
  if (address) {
    return address;
  }

  if (city) {
    const isMM = isMetroManilaCity(city);
    if (isMM) {
      // Metro Manila: just show city
      return city;
    } else {
      // Outside Metro Manila: show "City, Location" if location exists and is different
      if (location && location.toLowerCase() !== city.toLowerCase()) {
        return `${city}, ${location}`;
      }
      return city;
    }
  }

  // Fallback to location if city is not available
  return location || 'Location not specified';
}

/**
 * Format location with label for listing cards
 * Returns: location, city format (no "Location:" prefix)
 */
export function formatLocationWithLabel(
  city: string | null | undefined,
  location: string | null | undefined,
  address: string | null | undefined
): string {
  // Priority: address > formatted location > city
  if (address) {
    return address;
  }

  if (city) {
    const isMM = isMetroManilaCity(city);
    
    if (isMM) {
      // Metro Manila: "location, city" if location exists, otherwise just "city"
      if (location) {
        return `${location}, ${city}`;
      }
      return city;
    } else {
      // Outside Metro Manila: just "location"
      if (location) {
        return location;
      }
      // Fallback to city if no location
      return city || 'Location not specified';
    }
  }
  
  // No city - use location if available
  if (location) {
    return location;
  }
  
  return 'Location not specified';
}

/**
 * Group cities for filter dropdown
 */
export function groupCitiesForFilter(cities: string[]): {
  metroManila: string[];
  outside: string[];
} {
  const metroManila: string[] = [];
  const outside: string[] = [];

  cities.forEach(city => {
    if (isMetroManilaCity(city)) {
      metroManila.push(city);
    } else {
      outside.push(city);
    }
  });

  return {
    metroManila: metroManila.sort(),
    outside: outside.sort(),
  };
}


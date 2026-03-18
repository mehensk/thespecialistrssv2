'use client';

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { groupCitiesForFilter } from '@/lib/location-utils';
import { ListingCard } from '@/components/listings/ListingCard';
import { parseSearchParams, toCanonicalQuery } from '@/lib/search-contract';

type ListingTypeValue = 'sale' | 'rent' | 'unknown';
type SortByValue = 'newest' | 'price-low' | 'price-high' | 'size-small' | 'size-large';

interface ListingViewModel {
  id: string;
  slug: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number | null;
  city: string;
  type: string;
  listingType: ListingTypeValue;
  image: string;
  location: string;
  title: string;
  address: string;
  parking: number | null;
  yearBuilt: number | null;
  floor: number | null;
  totalFloors: number | null;
  createdAt: string;
}

interface ListingsPagination {
  page: number;
  limit: number | null;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const MAX_FETCH_ATTEMPTS = 3;
const FETCH_TIMEOUT_MS = 8000;
const FALLBACK_LISTING_IMAGE = '/images/hero-condo.jpg';
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const SORT_OPTIONS: SortByValue[] = ['newest', 'price-low', 'price-high', 'size-small', 'size-large'];
const PROPERTIES_PER_PAGE = 12;

interface ListingsApiResponse {
  listings?: unknown[];
  pagination?: {
    page?: unknown;
    limit?: unknown;
    total?: unknown;
    totalPages?: unknown;
    hasNextPage?: unknown;
    hasPrevPage?: unknown;
  };
  error?: string;
}

interface ListingsFacetsResponse {
  cities?: unknown[];
  error?: string;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeInteger(value: unknown, fallback: number): number {
  const numeric = normalizeNumber(value);
  if (numeric === null) return fallback;
  const integer = Math.floor(numeric);
  return integer >= 0 ? integer : fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function normalizeListingType(value: unknown): ListingTypeValue {
  if (value === 'sale' || value === 'rent') {
    return value;
  }
  return 'unknown';
}

function normalizeSortBy(value: string | null): SortByValue {
  if (value && SORT_OPTIONS.includes(value as SortByValue)) {
    return value as SortByValue;
  }
  return 'newest';
}

function normalizePage(value: string | null): number {
  if (!value) return 1;
  const parsedValue = Number.parseInt(value, 10);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }
  return parsedValue;
}

function toFilterInput(value: number | null): string {
  return value === null ? '' : String(value);
}

function normalizeLocationInput(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeCityList(values: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  values.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push(trimmed);
  });

  return normalized.sort((a, b) => a.localeCompare(b));
}

function normalizeListing(listing: Record<string, unknown>): ListingViewModel {
  const rawImages = Array.isArray(listing.images) ? listing.images : [];
  const primaryImage = rawImages.find((image): image is string => typeof image === 'string' && image.trim().length > 0);

  const normalizedLocation = normalizeString(listing.location);
  const normalizedCity = normalizeString(listing.city) || normalizedLocation;

  return {
    id: normalizeString(listing.id),
    slug: normalizeString(listing.slug) || null,
    price: normalizeNumber(listing.price) ?? 0,
    bedrooms: normalizeNumber(listing.bedrooms),
    bathrooms: normalizeNumber(listing.bathrooms),
    size: normalizeNumber(listing.size),
    city: normalizedCity,
    type: normalizeString(listing.propertyType),
    listingType: normalizeListingType(listing.listingType),
    image: primaryImage ?? FALLBACK_LISTING_IMAGE,
    location: normalizedLocation,
    title: normalizeString(listing.title),
    address: normalizeString(listing.address),
    parking: normalizeNumber(listing.parking),
    yearBuilt: normalizeNumber(listing.yearBuilt),
    floor: normalizeNumber(listing.floor),
    totalFloors: normalizeNumber(listing.totalFloors),
    createdAt: normalizeString(listing.createdAt),
  };
}

function getRetryDelayMs(attempt: number): number {
  return 300 * Math.pow(2, attempt - 1);
}

function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUS_CODES.has(status);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePagination(
  pagination: ListingsApiResponse['pagination'] | undefined,
  fallbackPage: number,
  fallbackCount: number
): ListingsPagination {
  const page = Math.max(1, normalizeInteger(pagination?.page, fallbackPage));
  const limit = normalizeNumber(pagination?.limit);
  const total = Math.max(0, normalizeInteger(pagination?.total, fallbackCount));
  const totalPages = Math.max(0, normalizeInteger(pagination?.totalPages, total > 0 ? 1 : 0));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: normalizeBoolean(pagination?.hasNextPage, page < totalPages),
    hasPrevPage: normalizeBoolean(pagination?.hasPrevPage, page > 1),
  };
}

function ListingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { params: initialParams } = parseSearchParams(searchParams);
  const initialSortBy = normalizeSortBy(searchParams.get('sortBy'));
  const initialPage = initialParams.page ?? normalizePage(searchParams.get('page'));

  const [listings, setListings] = useState<ListingViewModel[]>([]);
  const [pagination, setPagination] = useState<ListingsPagination>({
    page: initialPage,
    limit: PROPERTIES_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [searchRequestToken, setSearchRequestToken] = useState(0);
  const [searchSubmitting, setSearchSubmitting] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [cityFacetOptions, setCityFacetOptions] = useState<string[]>([]);

  const [listingType, setListingType] = useState<'sale' | 'rent' | ''>(
    initialParams.listingType ?? ''
  );
  const [searchLocation, setSearchLocation] = useState(initialParams.location ?? '');
  const [selectedCity, setSelectedCity] = useState(initialParams.location ?? '');
  const [minPrice, setMinPrice] = useState(toFilterInput(initialParams.minPrice));
  const [maxPrice, setMaxPrice] = useState(toFilterInput(initialParams.maxPrice));
  const [propertyType, setPropertyType] = useState(initialParams.type ?? '');
  const [bedrooms, setBedrooms] = useState(toFilterInput(initialParams.bedrooms));
  const [bathrooms, setBathrooms] = useState(toFilterInput(initialParams.bathrooms));
  const [minSize, setMinSize] = useState(toFilterInput(initialParams.minSize));
  const [maxSize, setMaxSize] = useState(toFilterInput(initialParams.maxSize));
  const [sortBy, setSortBy] = useState<SortByValue>(initialSortBy);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const activeListingsRequestIdRef = useRef(0);
  const listingsAbortControllerRef = useRef<AbortController | null>(null);
  const activeFacetsRequestIdRef = useRef(0);
  const facetsAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const requestId = activeListingsRequestIdRef.current + 1;
    activeListingsRequestIdRef.current = requestId;
    listingsAbortControllerRef.current?.abort();

    const fetchListings = async () => {
      setLoading(true);
      setLoadingError(null);

      const queryParams = toCanonicalQuery({
        location: selectedCity,
        type: propertyType,
        listingType,
        minPrice,
        maxPrice,
        minSize,
        maxSize,
        bedrooms,
        bathrooms,
        page: currentPage,
        limit: PROPERTIES_PER_PAGE,
      });
      queryParams.set('published', 'true');
      queryParams.set('sortBy', sortBy);

      let lastErrorMessage = 'Unable to load properties right now. Please try again.';

      for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
        if (isCancelled || requestId !== activeListingsRequestIdRef.current) {
          return;
        }

        const controller = new AbortController();
        listingsAbortControllerRef.current = controller;
        let didTimeout = false;
        const timeoutId = window.setTimeout(() => {
          didTimeout = true;
          controller.abort();
        }, FETCH_TIMEOUT_MS);

        try {
          const response = await fetch(`/api/listings?${queryParams.toString()}`, { signal: controller.signal });
          let data: ListingsApiResponse | null = null;

          try {
            const parsed = await response.json();
            data = parsed && typeof parsed === 'object' ? (parsed as ListingsApiResponse) : null;
          } catch {
            data = null;
          }

          if (!response.ok) {
            const apiMessage = typeof data?.error === 'string' ? data.error : 'Failed to load properties.';
            const retryableHttpError = isRetryableStatus(response.status);
            lastErrorMessage = apiMessage;

            if (retryableHttpError && attempt < MAX_FETCH_ATTEMPTS) {
              if (isCancelled || requestId !== activeListingsRequestIdRef.current) {
                return;
              }
              await delay(getRetryDelayMs(attempt));
              continue;
            }

            if (!isCancelled && requestId === activeListingsRequestIdRef.current) {
              setListings([]);
              setPagination({
                page: currentPage,
                limit: PROPERTIES_PER_PAGE,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: currentPage > 1,
              });
              setLoadingError(apiMessage);
            }

            return;
          }

          const listingsPayload = Array.isArray(data?.listings) ? data.listings : [];
          const transformedListings = listingsPayload.map((listing: unknown) =>
            normalizeListing((listing as Record<string, unknown>) ?? {})
          );
          const normalizedPagination = normalizePagination(data?.pagination, currentPage, transformedListings.length);

          if (!isCancelled && requestId === activeListingsRequestIdRef.current) {
            setListings(transformedListings);
            setPagination(normalizedPagination);
            setLoadingError(null);
          }

          return;
        } catch (error) {
          const isAbortError = error instanceof DOMException && error.name === 'AbortError';
          if (isAbortError && !didTimeout) {
            return;
          }
          const isRetryableFailure = isAbortError || error instanceof TypeError;

          if (isAbortError) {
            lastErrorMessage = 'Request timed out while loading properties. Please try again.';
          } else if (error instanceof Error && error.message) {
            lastErrorMessage = error.message;
          }

          if (isRetryableFailure && attempt < MAX_FETCH_ATTEMPTS) {
            if (isCancelled || requestId !== activeListingsRequestIdRef.current) {
              return;
            }
            await delay(getRetryDelayMs(attempt));
            continue;
          }

          if (!isCancelled && requestId === activeListingsRequestIdRef.current) {
            setListings([]);
            setPagination({
              page: currentPage,
              limit: PROPERTIES_PER_PAGE,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: currentPage > 1,
            });
            setLoadingError(lastErrorMessage);
          }

          return;
        } finally {
          window.clearTimeout(timeoutId);
          if (listingsAbortControllerRef.current === controller) {
            listingsAbortControllerRef.current = null;
          }
        }
      }

      if (!isCancelled && requestId === activeListingsRequestIdRef.current) {
        setListings([]);
        setPagination({
          page: currentPage,
          limit: PROPERTIES_PER_PAGE,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: currentPage > 1,
        });
        setLoadingError(lastErrorMessage);
      }
    };

    void fetchListings().finally(() => {
      if (!isCancelled && requestId === activeListingsRequestIdRef.current) {
        setLoading(false);
        setHasLoadedOnce(true);
        setSearchSubmitting(false);
      }
    });

    return () => {
      isCancelled = true;
      if (activeListingsRequestIdRef.current === requestId) {
        listingsAbortControllerRef.current?.abort();
      }
    };
  }, [
    retryNonce,
    searchRequestToken,
    listingType,
    selectedCity,
    minPrice,
    maxPrice,
    propertyType,
    bedrooms,
    bathrooms,
    minSize,
    maxSize,
    sortBy,
    currentPage,
  ]);

  const retryFetch = () => {
    setRetryNonce((current) => current + 1);
  };

  useEffect(() => {
    let isCancelled = false;
    const requestId = activeFacetsRequestIdRef.current + 1;
    activeFacetsRequestIdRef.current = requestId;
    facetsAbortControllerRef.current?.abort();

    const fetchCityFacets = async () => {
      let controller: AbortController | null = null;
      try {
        controller = new AbortController();
        facetsAbortControllerRef.current = controller;
        const queryParams = toCanonicalQuery({
          listingType,
          type: propertyType,
          minPrice,
          maxPrice,
          minSize,
          maxSize,
          bedrooms,
          bathrooms,
        });
        queryParams.set('published', 'true');

        const response = await fetch(`/api/listings/facets?${queryParams.toString()}`, { signal: controller.signal });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ListingsFacetsResponse;
        const rawCities = Array.isArray(data?.cities)
          ? data.cities.filter((city): city is string => typeof city === 'string')
          : [];
        const normalizedCities = normalizeCityList(rawCities);

        if (!isCancelled && requestId === activeFacetsRequestIdRef.current) {
          setCityFacetOptions(normalizedCities);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        // Keep current options on transient failures.
      } finally {
        if (controller && facetsAbortControllerRef.current === controller) {
          facetsAbortControllerRef.current = null;
        }
      }
    };

    void fetchCityFacets();

    return () => {
      isCancelled = true;
      if (activeFacetsRequestIdRef.current === requestId) {
        facetsAbortControllerRef.current?.abort();
      }
    };
  }, [listingType, propertyType, minPrice, maxPrice, bedrooms, bathrooms, minSize, maxSize]);

  const { metroManilaCities, outsideCities } = useMemo(() => {
    const fallbackCities = listings.map((listing) => listing.city).filter(Boolean);
    const mergedCities = normalizeCityList([...cityFacetOptions, ...fallbackCities]);
    const cityValue = selectedCity.trim();
    const cityAlreadyListed = cityValue
      && mergedCities.some((city) => city.toLowerCase() === cityValue.toLowerCase());
    const cityPool = cityAlreadyListed || !cityValue ? mergedCities : [cityValue, ...mergedCities];
    const grouped = groupCitiesForFilter(cityPool);
    return {
      metroManilaCities: grouped.metroManila,
      outsideCities: grouped.outside,
    };
  }, [cityFacetOptions, listings, selectedCity]);

  useEffect(() => {
    const params = toCanonicalQuery({
      listingType,
      location: selectedCity,
      minPrice,
      maxPrice,
      type: propertyType,
      bedrooms,
      bathrooms,
      minSize,
      maxSize,
      page: currentPage > 1 ? currentPage : null,
    });
    if (sortBy !== 'newest') params.set('sortBy', sortBy);

    const newUrl = params.toString() ? `/listings?${params.toString()}` : '/listings';
    const currentUrl = window.location.pathname + window.location.search;

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [
    router,
    listingType,
    selectedCity,
    minPrice,
    maxPrice,
    propertyType,
    bedrooms,
    bathrooms,
    minSize,
    maxSize,
    sortBy,
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listingType, selectedCity, minPrice, maxPrice, propertyType, bedrooms, bathrooms, minSize, maxSize, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedLocation = normalizeLocationInput(searchLocation);
    setSearchLocation(normalizedLocation);
    setSelectedCity(normalizedLocation);
    setCurrentPage(1);
    setSearchSubmitting(true);
    setSearchRequestToken((current) => current + 1);
  };

  const clearFilters = () => {
    setListingType('');
    setSearchLocation('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setPropertyType('');
    setBedrooms('');
    setBathrooms('');
    setMinSize('');
    setMaxSize('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const totalPages = pagination.totalPages;
  const hasActiveFilters = listingType || selectedCity || minPrice || maxPrice || propertyType || bedrooms || bathrooms || minSize || maxSize;

  if (loading && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-white pt-[84px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-16">
          <div className="text-center py-16">
            <p className="text-lg text-[#111111]/70">Loading properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[84px]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] mb-4 tracking-tight">
            Browse Properties
          </h1>
          <p className="text-lg text-[#111111]/70">
            {pagination.total} {pagination.total === 1 ? 'property' : 'properties'} found
          </p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setListingType('')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                !listingType
                  ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                  : 'bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setListingType('sale')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                listingType === 'sale'
                  ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                  : 'bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB]'
              }`}
            >
              Sale
            </button>
            <button
              type="button"
              onClick={() => setListingType('rent')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                listingType === 'rent'
                  ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white shadow-md'
                  : 'bg-[#F9FAFB] text-[#111111] hover:bg-[#E5E7EB]'
              }`}
            >
              Rent
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F2937]" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search by location..."
                className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] placeholder:text-[#111111]/50 shadow-sm"
              />
            </div>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white shadow-sm"
            >
              <option value="">All Types</option>
              <option value="condominium">Condominium</option>
              <option value="house-and-lot">House and Lot</option>
              <option value="townhouse">Townhouse</option>
              <option value="apartment">Apartment</option>
              <option value="penthouse">Penthouse</option>
              <option value="lot">Lot</option>
              <option value="building">Building</option>
              <option value="commercial">Commercial Space</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              aria-busy={searchSubmitting && loading}
              className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
            >
              {searchSubmitting && loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {loading && hasLoadedOnce && (
            <p className="mt-3 text-sm text-[#111111]/60">Updating results...</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className={`lg:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-6 lg:sticky lg:top-[100px] lg:self-start lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:z-10 lg:shadow-lg lg:mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#111111] tracking-tight">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="lg:hidden text-[#111111]/70 hover:text-[#111111]"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mb-4 text-sm text-[#1F2937] hover:underline"
                >
                  Clear all filters
                </button>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      const nextCity = e.target.value;
                      setSelectedCity(nextCity);
                      setSearchLocation(nextCity);
                    }}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
                  >
                    <option value="">All Locations</option>
                    {metroManilaCities.length > 0 && (
                      <optgroup label="Metro Manila">
                        {metroManilaCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </optgroup>
                    )}
                    {outsideCities.length > 0 && (
                      <optgroup label="Outside Metro Manila">
                        {outsideCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      min="0"
                      className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] text-sm"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      min="0"
                      className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Size (sqm)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={minSize}
                      onChange={(e) => setMinSize(e.target.value)}
                      placeholder="Min"
                      min="0"
                      className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] text-sm"
                    />
                    <input
                      type="number"
                      value={maxSize}
                      onChange={(e) => setMaxSize(e.target.value)}
                      placeholder="Max"
                      min="0"
                      className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                <Filter size={18} className="text-[#1F2937]" />
                <span className="text-[#111111] font-medium">Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm text-[#111111]/70">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(normalizeSortBy(e.target.value))}
                  className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent text-[#111111] bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="size-small">Size: Smallest to Largest</option>
                  <option value="size-large">Size: Largest to Smallest</option>
                </select>
              </div>
            </div>

            {loadingError ? (
              <div className="text-center py-16">
                <p className="text-xl text-[#111111]/70 mb-4">We couldn&apos;t load listings</p>
                <p className="text-[#111111]/50 mb-6">Please try again.</p>
                <button
                  onClick={retryFetch}
                  className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
                >
                  Retry
                </button>
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {listings.map((property) => (
                    <ListingCard
                      key={property.id}
                      listing={property}
                      imageSizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      variant="landing"
                      className="browse-card"
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20} className="text-[#1F2937]" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-[#1F2937] to-[#111111] text-white'
                            : 'border border-[#E5E7EB] text-[#111111] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={!pagination.hasNextPage}
                      className="p-2 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={20} className="text-[#1F2937]" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-[#111111]/70 mb-4">No properties found</p>
                <p className="text-[#111111]/50 mb-6">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-lg hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white pt-[84px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-[#111111]/70">Loading properties...</p>
          </div>
        </div>
      }
    >
      <ListingsPageContent />
    </Suspense>
  );
}

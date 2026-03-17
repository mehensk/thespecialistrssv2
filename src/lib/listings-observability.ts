type ListingsRouteMode = 'public_fast_path' | 'public_fallback_unauth' | 'authenticated_non_public';

interface ListingsTelemetryInput {
  mode: ListingsRouteMode;
  publishedParam: string | null;
  sortBy: string;
  page: number;
  limit: number | null;
  offset?: number;
  hasLocationFilter: boolean;
  hasTypeFilter: boolean;
  hasListingTypeFilter: boolean;
  hasPriceFilter: boolean;
  hasSizeFilter: boolean;
  hasBedroomsFilter: boolean;
  hasBathroomsFilter: boolean;
  usedDefaultCachedPath: boolean;
  cacheHeaderApplied: boolean;
  durationMs: number;
  resultCount: number;
  totalCount: number;
  statusCode: number;
  errorCategory?: string;
}

function isEnabled(): boolean {
  return process.env.LISTINGS_METRICS_ENABLED === 'true';
}

export function emitListingsTelemetry(input: ListingsTelemetryInput): void {
  if (!isEnabled()) {
    return;
  }

  const payload = {
    event: 'listings_api_request',
    route: '/api/listings',
    ...input,
    timestamp: new Date().toISOString(),
  };

  console.info('[LISTINGS_METRICS]', JSON.stringify(payload));
}

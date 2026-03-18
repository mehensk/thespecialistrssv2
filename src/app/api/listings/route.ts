import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActivityAction, Prisma, UserRole } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';
import { safeParseInt, safeParseFloat, validateListingInput } from '@/lib/validation';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logger';
import { getAuthenticatedUser, hasRequiredRole } from '@/lib/auth-helpers';
import { revalidateListingCaches } from '@/lib/listing-revalidation';
import { listingSlugWithSuffix, slugifyListingTitle } from '@/lib/listing-slug';
import { parseSearchParams } from '@/lib/search-contract';
import { emitListingsTelemetry } from '@/lib/listings-observability';
import {
  canonicalizeMetroManilaCity,
  parseLocationFilterValue,
  METRO_MANILA_CITIES,
  getMetroManilaSearchTerms,
} from '@/lib/location-utils';

const CREATE_LISTING_SLUG_MAX_RETRIES = 3;
const DEFAULT_LISTINGS_PAGE = 1;
const DEFAULT_PUBLIC_SORT = 'newest';

type ListingSortBy = 'newest' | 'price-low' | 'price-high' | 'size-small' | 'size-large';

interface ListingsPaginationMetadata {
  page: number;
  limit: number | null;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function parseSortBy(value: string | null): ListingSortBy {
  switch (value) {
    case 'price-low':
    case 'price-high':
    case 'size-small':
    case 'size-large':
    case 'newest':
      return value;
    default:
      return DEFAULT_PUBLIC_SORT;
  }
}

function getListingOrderBy(sortBy: ListingSortBy): Prisma.ListingOrderByWithRelationInput[] {
  switch (sortBy) {
    case 'price-low':
      return [{ price: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }];
    case 'price-high':
      return [{ price: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }];
    case 'size-small':
      return [{ size: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }];
    case 'size-large':
      return [{ size: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }];
  }
}

function getPaginationMetadata(
  page: number,
  limit: number | null,
  total: number
): ListingsPaginationMetadata {
  if (!limit) {
    return {
      page: DEFAULT_LISTINGS_PAGE,
      limit: null,
      total,
      totalPages: total > 0 ? 1 : 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

function normalizePersistedCity(city: unknown): string | null {
  if (typeof city !== 'string') return null;
  const trimmed = city.trim();
  if (!trimmed) return null;
  const canonical = canonicalizeMetroManilaCity(trimmed);
  return canonical ?? trimmed;
}

function buildMetroManilaSearchTerms(): string[] {
  const terms = new Set<string>();
  METRO_MANILA_CITIES.forEach((city) => {
    getMetroManilaSearchTerms(city).forEach((term) => {
      terms.add(term);
    });
  });
  return Array.from(terms);
}

function buildFieldMetroMatch(field: 'city' | 'location', terms: string[]): Prisma.ListingWhereInput {
  return {
    OR: terms.map((term) => ({
      [field]: { contains: term, mode: 'insensitive' },
    })),
  };
}

function buildOutsideCityClause(terms: string[]): Prisma.ListingWhereInput {
  return {
    OR: [
      { city: null },
      { city: { equals: '' } },
      { NOT: buildFieldMetroMatch('city', terms) },
    ],
  };
}

function buildOutsideLocationClause(terms: string[]): Prisma.ListingWhereInput {
  return {
    OR: [
      { location: { equals: '' } },
      { NOT: buildFieldMetroMatch('location', terms) },
    ],
  };
}

function buildLocationFilter(location: string | null): Prisma.ListingWhereInput {
  if (!location) return {};

  const parsed = parseLocationFilterValue(location);
  const metroTerms = buildMetroManilaSearchTerms();
  const metroCityMatch = buildFieldMetroMatch('city', metroTerms);
  const metroLocationMatch = buildFieldMetroMatch('location', metroTerms);

  if (parsed.kind === 'metro') {
    return { OR: [metroCityMatch, metroLocationMatch] };
  }

  if (parsed.kind === 'outside') {
    return {
      AND: [
        buildOutsideCityClause(metroTerms),
        buildOutsideLocationClause(metroTerms),
      ],
    };
  }

  if (parsed.kind === 'ncr-city') {
    const terms = getMetroManilaSearchTerms(parsed.city);
    return {
      OR: terms.flatMap((term) => [
        { city: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
      ]),
    };
  }

  if (parsed.kind === 'text') {
    return {
      OR: [
        { city: { contains: parsed.text, mode: 'insensitive' } },
        { location: { contains: parsed.text, mode: 'insensitive' } },
      ],
    };
  }

  return {};
}

// Generate a unique property ID using timestamp and UUID
function generatePropertyId(): string {
  const prefix = 'TSR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const uuid = randomUUID().substring(0, 8).toUpperCase();
  return `${prefix}-${timestamp}-${uuid}`;
}

function isUniqueConstraintError(error: unknown, targetField?: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false;
  }

  if (!targetField) {
    return true;
  }

  const target = (error.meta as { target?: string[] | string } | undefined)?.target;
  if (Array.isArray(target)) {
    return target.includes(targetField);
  }

  return target === targetField;
}

export async function GET(request: NextRequest) {
  const requestStartedAt = Date.now();
  let telemetryMode: 'public_fast_path' | 'public_fallback_unauth' | 'authenticated_non_public' = 'public_fallback_unauth';
  let telemetryPublishedParam: string | null = null;
  let telemetrySortBy: ListingSortBy = DEFAULT_PUBLIC_SORT;
  let telemetryPage = DEFAULT_LISTINGS_PAGE;
  let telemetryLimit: number | null = null;
  let telemetryOffset: number | undefined;
  let telemetryHasLocationFilter = false;
  let telemetryHasTypeFilter = false;
  let telemetryHasListingTypeFilter = false;
  let telemetryHasPriceFilter = false;
  let telemetryHasSizeFilter = false;
  let telemetryHasBedroomsFilter = false;
  let telemetryHasBathroomsFilter = false;

  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    telemetryPublishedParam = published;
    const offset = searchParams.get('offset');
    const legacyOffset = offset ? safeParseInt(offset, 0) ?? undefined : undefined;
    const { params } = parseSearchParams(searchParams);
    const sortBy = parseSortBy(searchParams.get('sortBy'));
    telemetrySortBy = sortBy;
    const limit = params.limit ?? null;
    telemetryLimit = limit;
    const page = limit
      ? legacyOffset !== undefined
        ? Math.floor(legacyOffset / limit) + 1
        : params.page ?? DEFAULT_LISTINGS_PAGE
      : DEFAULT_LISTINGS_PAGE;
    telemetryPage = page;
    const skip = limit ? legacyOffset ?? (page - 1) * limit : undefined;
    telemetryOffset = skip;
    const take = limit ?? undefined;
    const orderBy = getListingOrderBy(sortBy);
    telemetryHasLocationFilter = !!params.location;
    telemetryHasTypeFilter = !!params.type;
    telemetryHasListingTypeFilter = !!params.listingType;
    telemetryHasPriceFilter = params.minPrice !== null || params.maxPrice !== null;
    telemetryHasSizeFilter = params.minSize !== null || params.maxSize !== null;
    telemetryHasBedroomsFilter = params.bedrooms !== null;
    telemetryHasBathroomsFilter = params.bathrooms !== null;

    const filterWhere: Prisma.ListingWhereInput = {
      ...(params.listingType ? { listingType: params.listingType } : {}),
      ...(params.type ? { propertyType: params.type } : {}),
      ...(params.bedrooms !== null ? { bedrooms: { gte: params.bedrooms } } : {}),
      ...(params.bathrooms !== null ? { bathrooms: { gte: params.bathrooms } } : {}),
      ...(params.minPrice !== null || params.maxPrice !== null
        ? {
            price: {
              ...(params.minPrice !== null ? { gte: params.minPrice } : {}),
              ...(params.maxPrice !== null ? { lte: params.maxPrice } : {}),
            },
          }
        : {}),
      ...(params.minSize !== null || params.maxSize !== null
        ? {
            size: {
              ...(params.minSize !== null ? { gte: params.minSize } : {}),
              ...(params.maxSize !== null ? { lte: params.maxSize } : {}),
            },
          }
        : {}),
      ...buildLocationFilter(params.location),
    };

    const publicSelectFields = {
      id: true,
      slug: true,
      title: true,
      price: true,
      location: true,
      city: true,
      address: true,
      bedrooms: true,
      bathrooms: true,
      size: true,
      propertyType: true,
      listingType: true,
      images: true,
      parking: true,
      yearBuilt: true,
      floor: true,
      totalFloors: true,
      createdAt: true,
    };

    const getPublicListingsResponse = async (mode: 'public_fast_path' | 'public_fallback_unauth') => {
      const where: Prisma.ListingWhereInput = {
        AND: [{ isPublished: true }, filterWhere],
      };

      const shouldCachePublicResponse = false;

      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          select: publicSelectFields,
          orderBy,
          take,
          skip,
        }),
        prisma.listing.count({ where }),
      ]);

      const pagination = getPaginationMetadata(page, limit, total);
      const headers = new Headers();
      headers.set('Cache-Control', 'no-store');
      emitListingsTelemetry({
        mode,
        publishedParam: published,
        sortBy,
        page,
        limit,
        offset: skip,
        hasLocationFilter: !!params.location,
        hasTypeFilter: !!params.type,
        hasListingTypeFilter: !!params.listingType,
        hasPriceFilter: params.minPrice !== null || params.maxPrice !== null,
        hasSizeFilter: params.minSize !== null || params.maxSize !== null,
        hasBedroomsFilter: params.bedrooms !== null,
        hasBathroomsFilter: params.bathrooms !== null,
        usedDefaultCachedPath: shouldCachePublicResponse,
        cacheHeaderApplied: true,
        durationMs: Date.now() - requestStartedAt,
        resultCount: listings.length,
        totalCount: total,
        statusCode: 200,
      });
      return NextResponse.json({ listings, pagination }, { headers });
    };

    // Public fast path should not depend on auth lookups.
    if (published === 'true') {
      telemetryMode = 'public_fast_path';
      return getPublicListingsResponse('public_fast_path');
    }

    // Try to get authenticated user, but don't fail if not present.
    const user = await getAuthenticatedUser(request);

    if (!user) {
      telemetryMode = 'public_fallback_unauth';
      return getPublicListingsResponse('public_fallback_unauth');
    }
    telemetryMode = 'authenticated_non_public';

    // For authenticated users, show all published listings plus their own unpublished ones
    const where: Prisma.ListingWhereInput = {
      AND: [
        {
          OR: [
            { isPublished: true },
            { userId: user.id },
          ],
        },
        filterWhere,
      ],
    };

    const selectFields = {
      id: true,
      slug: true,
      title: true,
      price: true,
      location: true,
      city: true,
      address: true,
      bedrooms: true,
      bathrooms: true,
      size: true,
      propertyType: true,
      listingType: true,
      images: true,
      parking: true,
      yearBuilt: true,
      floor: true,
      totalFloors: true,
      createdAt: true,
      user: {
        select: { name: true, email: true },
      },
    };

    const listings = await prisma.listing.findMany({
      where,
      select: selectFields,
      orderBy,
      take,
      skip,
    });

    const total = await prisma.listing.count({ where });
    const pagination = getPaginationMetadata(page, limit, total);
    emitListingsTelemetry({
      mode: 'authenticated_non_public',
      publishedParam: published,
      sortBy,
      page,
      limit,
      offset: skip,
      hasLocationFilter: !!params.location,
      hasTypeFilter: !!params.type,
      hasListingTypeFilter: !!params.listingType,
      hasPriceFilter: params.minPrice !== null || params.maxPrice !== null,
      hasSizeFilter: params.minSize !== null || params.maxSize !== null,
      hasBedroomsFilter: params.bedrooms !== null,
      hasBathroomsFilter: params.bathrooms !== null,
      usedDefaultCachedPath: false,
      cacheHeaderApplied: false,
      durationMs: Date.now() - requestStartedAt,
      resultCount: listings.length,
      totalCount: total,
      statusCode: 200,
    });

    return NextResponse.json({ listings, pagination });
  } catch (error) {
    emitListingsTelemetry({
      mode: telemetryMode,
      publishedParam: telemetryPublishedParam,
      sortBy: telemetrySortBy,
      page: telemetryPage,
      limit: telemetryLimit,
      offset: telemetryOffset,
      hasLocationFilter: telemetryHasLocationFilter,
      hasTypeFilter: telemetryHasTypeFilter,
      hasListingTypeFilter: telemetryHasListingTypeFilter,
      hasPriceFilter: telemetryHasPriceFilter,
      hasSizeFilter: telemetryHasSizeFilter,
      hasBedroomsFilter: telemetryHasBedroomsFilter,
      hasBathroomsFilter: telemetryHasBathroomsFilter,
      usedDefaultCachedPath: false,
      cacheHeaderApplied: false,
      durationMs: Date.now() - requestStartedAt,
      resultCount: 0,
      totalCount: 0,
      statusCode: 500,
      errorCategory: error instanceof Error ? error.name : 'UnknownError',
    });
    logger.error('Error fetching listings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user using centralized helper
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      logger.debug('Listing creation unauthorized: No valid authentication found');
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: process.env.NODE_ENV === 'development' 
          ? 'Authentication required. Please ensure you are logged in.' 
          : undefined
      }, { status: 401 });
    }
    
    // Check if user has permission to create listings
    const allowedRoles = [UserRole.ADMIN, UserRole.AGENT];
    if (!hasRequiredRole(user, allowedRoles)) {
      logger.debug('Listing creation unauthorized - insufficient permissions', {
        userId: user.id,
        userRole: user.role,
        allowedRoles,
      });
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'You do not have permission to create listings.',
      }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validation = validateListingInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const {
      title,
      description,
      price,
      location,
      city,
      bedrooms,
      bathrooms,
      size,
      propertyType,
      listingType,
      images,
      address,
      yearBuilt,
      parking,
      floor,
      totalFloors,
      amenities,
      available,
    } = body;

    const createPayload = {
      title: title.trim(),
      description: description.trim(),
      price: safeParseFloat(price, 0),
      location: location.trim(),
      city: normalizePersistedCity(city),
      bedrooms: safeParseInt(bedrooms, 0, 50),
      bathrooms: safeParseFloat(bathrooms, 0, 50),
      size: safeParseFloat(size, 0, 1000000),
      propertyType: propertyType || null,
      listingType: listingType || null,
      images: Array.isArray(images) ? images : [],
      address: address ? address.trim() : null,
      yearBuilt: safeParseInt(yearBuilt, 1800, new Date().getFullYear() + 10),
      parking: safeParseInt(parking, 0, 100),
      floor: safeParseInt(floor, 0, 200),
      totalFloors: safeParseInt(totalFloors, 1, 200),
      amenities: Array.isArray(amenities) ? amenities : amenities || {},
      available: available !== undefined ? available : true,
      userId: user.id,
      isPublished: false as const, // Requires admin approval
    };

    let listingWithSlug: Awaited<ReturnType<typeof prisma.listing.create>> | null = null;
    let createError: unknown = null;

    for (let attempt = 1; attempt <= CREATE_LISTING_SLUG_MAX_RETRIES; attempt++) {
      try {
        listingWithSlug = await prisma.$transaction(async (tx) => {
          // Generate a unique property ID
          let propertyId = generatePropertyId();

          // Ensure uniqueness (very unlikely collision with timestamp + UUID, but check anyway)
          let propertyAttempts = 0;
          while (propertyAttempts < 10) {
            const existingProperty = await tx.listing.findFirst({
              where: { propertyId },
              select: { id: true },
            });

            if (!existingProperty) break;
            propertyId = generatePropertyId();
            propertyAttempts++;
          }

          const placeholderSlug = `pending-${Date.now().toString(36)}-${randomUUID().slice(0, 8).toLowerCase()}`;

          const listing = await tx.listing.create({
            data: {
              ...createPayload,
              propertyId,
              slug: placeholderSlug,
            },
          });

          const baseSlug = slugifyListingTitle(listing.title);
          const existingBaseSlug = await tx.listing.findFirst({
            where: {
              id: { not: listing.id },
              slug: baseSlug,
            },
            select: { id: true },
          });

          const preferredSlug = existingBaseSlug ? listingSlugWithSuffix(baseSlug, listing.id) : baseSlug;

          try {
            return await tx.listing.update({
              where: { id: listing.id },
              data: { slug: preferredSlug },
            });
          } catch (slugError) {
            // Handle race where base slug became occupied between check and update.
            if (!existingBaseSlug && isUniqueConstraintError(slugError, 'slug')) {
              return tx.listing.update({
                where: { id: listing.id },
                data: { slug: listingSlugWithSuffix(baseSlug, listing.id) },
              });
            }

            throw slugError;
          }
        });

        createError = null;
        break;
      } catch (error) {
        createError = error;

        const isRetryable = isUniqueConstraintError(error, 'slug') || isUniqueConstraintError(error, 'propertyId');
        if (!isRetryable || attempt === CREATE_LISTING_SLUG_MAX_RETRIES) {
          break;
        }
      }
    }

    if (!listingWithSlug) {
      const createErrorMessage = createError instanceof Error ? createError.message : String(createError);
      const createErrorDetails = createError instanceof Error ? createError.stack : String(createError);
      logger.error('Listing creation failed after retry attempts:', createError);
      return NextResponse.json(
        {
          error: 'Internal server error',
          details: createErrorMessage,
          stack: process.env.NODE_ENV === 'development' ? createErrorDetails : undefined,
        },
        { status: 500 }
      );
    }

    // Get user details for logging
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    });

    // Log activity - don't let this break the response
    try {
      await logListingActivity(user.id, ActivityAction.CREATE, listingWithSlug.id, {
        title: listingWithSlug.title,
        uploadedBy: user.id,
        uploadedByName: dbUser?.name || dbUser?.email || 'Unknown',
      });
    } catch (activityError) {
      logger.error('Failed to log activity (non-critical):', activityError);
    }

    // Non-blocking cache revalidation for listing views
    revalidateListingCaches(listingWithSlug.id, listingWithSlug.slug);
    return NextResponse.json({ success: true, listing: listingWithSlug }, { status: 201 });
  } catch (error) {
    logger.error('Error creating listing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
}

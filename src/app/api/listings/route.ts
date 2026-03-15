import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActivityAction, Prisma, UserRole } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';
import { safeParseInt, safeParseFloat, validateListingInput } from '@/lib/validation';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logger';
import { getCachedListings } from '@/lib/cache';
import { getAuthenticatedUser, hasRequiredRole } from '@/lib/auth-helpers';
import { revalidateListingCaches } from '@/lib/listing-revalidation';
import { listingSlugWithSuffix, slugifyListingTitle } from '@/lib/listing-slug';

const CREATE_LISTING_SLUG_MAX_RETRIES = 3;

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
  try {
    // Try to get authenticated user, but don't fail if not present
    // This endpoint is public - no authentication required
    const user = await getAuthenticatedUser(request);
    
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Use cached data for published listings or unauthenticated users
    if (published === 'true' || !user) {
      const take = limit ? safeParseInt(limit, 1, 100) ?? undefined : undefined;
      const skip = offset ? safeParseInt(offset, 0) ?? undefined : undefined;
      
      const listings = await getCachedListings({ limit: take, offset: skip });

      // Add cache headers for public listings
      const headers = new Headers();
      headers.set('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');

      return NextResponse.json({ listings }, { headers });
    }

    // For authenticated users, show all published listings plus their own unpublished ones
    const where: Prisma.ListingWhereInput = {
      OR: [
        { isPublished: true },
        { userId: user.id },
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

    const take = limit ? safeParseInt(limit, 1, 100) ?? undefined : undefined;
    const skip = offset ? safeParseInt(offset, 0) ?? undefined : undefined;

    const listings = await prisma.listing.findMany({
      where,
      select: selectFields,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    return NextResponse.json({ listings });
  } catch (error) {
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
      city: city ? city.trim() : null,
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

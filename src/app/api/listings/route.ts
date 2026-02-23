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

// Generate a unique property ID using timestamp and UUID
function generatePropertyId(): string {
  const prefix = 'TSR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const uuid = randomUUID().substring(0, 8).toUpperCase();
  return `${prefix}-${timestamp}-${uuid}`;
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

    // Generate a unique property ID
    let propertyId = generatePropertyId();
    
    // Ensure uniqueness (very unlikely collision with timestamp + UUID, but check anyway)
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.listing.findFirst({
        where: { propertyId },
      });
      if (!existing) break;
      propertyId = generatePropertyId();
      attempts++;
    }

    const listing = await prisma.listing.create({
      data: {
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
        propertyId,
        available: available !== undefined ? available : true,
        userId: user.id,
        isPublished: false, // Requires admin approval
      },
    });

    // Get user details for logging
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    });

    // Log activity - don't let this break the response
    try {
      await logListingActivity(user.id, ActivityAction.CREATE, listing.id, {
        title: listing.title,
        uploadedBy: user.id,
        uploadedByName: dbUser?.name || dbUser?.email || 'Unknown',
      });
    } catch (activityError) {
      logger.error('Failed to log activity (non-critical):', activityError);
    }

    // Non-blocking cache revalidation for listing views
    revalidateListingCaches(listing.id);
    return NextResponse.json({ success: true, listing }, { status: 201 });
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

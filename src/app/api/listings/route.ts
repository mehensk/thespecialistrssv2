import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/get-user-from-token';
import { prisma } from '@/lib/prisma';
import { ActivityAction, Prisma } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';
import { safeParseInt, safeParseFloat, validateListingInput } from '@/lib/validation';
import { randomUUID } from 'crypto';
import { logger } from '@/lib/logger';

// Generate a unique property ID using timestamp and UUID
function generatePropertyId(): string {
  const prefix = 'TSR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const uuid = randomUUID().substring(0, 8).toUpperCase();
  return `${prefix}-${timestamp}-${uuid}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: Prisma.ListingWhereInput = {};
    if (published === 'true') {
      where.isPublished = true;
    } else if (user && user.id) {
      // Authenticated users can see their own unpublished listings
      where.OR = [
        { isPublished: true },
        { userId: user.id },
      ];
    } else {
      // Public users only see published listings
      where.isPublished = true;
    }

    // Optimize query - only select needed fields
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

    // Add pagination if limit is provided
    const take = limit ? safeParseInt(limit, 1, 100) ?? undefined : undefined;
    const skip = offset ? safeParseInt(offset, 0) ?? undefined : undefined;

    const listings = await prisma.listing.findMany({
      where,
      select: selectFields,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    // Add cache headers for public listings
    const headers = new Headers();
    if (published === 'true') {
      // Cache published listings for 60 seconds, revalidate in background
      headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }

    return NextResponse.json({ listings }, { headers });
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
    const user = await getUserFromToken();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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


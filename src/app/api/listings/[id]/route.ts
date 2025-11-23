import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/get-user-from-token';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';
import { safeParseInt, safeParseFloat } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS, getCachedListing } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken();
    const { id } = await params;
    
    // Try to get from cache if published
    let listing = await getCachedListing(id);
    
    // If not in cache or not published, fetch directly
    if (!listing) {
      listing = await prisma.listing.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
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
          yearBuilt: true,
          parking: true,
          floor: true,
          totalFloors: true,
          amenities: true,
          propertyId: true,
          available: true,
          isPublished: true,
          userId: true,
          createdAt: true,
          user: {
            select: { name: true, email: true },
          },
        },
      });
    }

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if listing is published or user has access
    if (!listing.isPublished) {
      // If not published, only allow access if:
      // 1. User is authenticated and owns the listing, OR
      // 2. User is an admin
      if (!user || (listing.userId !== user.id && user.role !== UserRole.ADMIN)) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
    }

    // Add cache headers for published listings
    const headers = new Headers();
    if (listing.isPublished) {
      // Cache published listings for 5 minutes, revalidate in background
      headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    }

    return NextResponse.json({ listing }, { headers });
  } catch (error) {
    logger.error('Error fetching listing:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Users can only edit their own listings, unless they're admin
    if (listing.userId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
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
      propertyId,
      available,
    } = body;

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : listing.title,
        description: description !== undefined ? description.trim() : listing.description,
        price: price !== undefined ? safeParseFloat(price, 0) : listing.price,
        location: location !== undefined ? location.trim() : listing.location,
        city: city !== undefined ? (city ? city.trim() : null) : listing.city,
        bedrooms: bedrooms !== undefined ? safeParseInt(bedrooms, 0, 50) : listing.bedrooms,
        bathrooms: bathrooms !== undefined ? safeParseFloat(bathrooms, 0, 50) : listing.bathrooms,
        size: size !== undefined ? safeParseFloat(size, 0, 1000000) : listing.size,
        propertyType: propertyType !== undefined ? propertyType : listing.propertyType,
        listingType: listingType !== undefined ? listingType : listing.listingType,
        images: images !== undefined ? (Array.isArray(images) ? images : []) : listing.images,
        address: address !== undefined ? (address ? address.trim() : null) : listing.address,
        yearBuilt: yearBuilt !== undefined ? safeParseInt(yearBuilt, 1800, new Date().getFullYear() + 10) : listing.yearBuilt,
        parking: parking !== undefined ? safeParseInt(parking, 0, 100) : listing.parking,
        floor: floor !== undefined ? safeParseInt(floor, 0, 200) : listing.floor,
        totalFloors: totalFloors !== undefined ? safeParseInt(totalFloors, 1, 200) : listing.totalFloors,
        amenities: amenities !== undefined ? (Array.isArray(amenities) ? amenities : amenities || {}) : listing.amenities,
        propertyId: propertyId !== undefined ? propertyId : listing.propertyId,
        available: available !== undefined ? available : listing.available,
        // If admin edits, they can approve it
        ...(user.role === UserRole.ADMIN && {
          isPublished: body.isPublished !== undefined ? body.isPublished : listing.isPublished,
          approvedBy: body.isPublished ? user.id : listing.approvedBy,
          approvedAt: body.isPublished ? new Date() : listing.approvedAt,
        }),
      },
    });

    // Log activity - don't let this break the response
    try {
      await logListingActivity(user.id, ActivityAction.UPDATE, id, {
        title: updated.title,
        uploadedBy: listing.userId,
      });
    } catch (activityError) {
      logger.error('Failed to log activity (non-critical):', activityError);
    }

    // Revalidate cache when listing is updated
    revalidateTag(CACHE_TAGS.LISTING(id), '');
    revalidateTag(CACHE_TAGS.LISTINGS, '');

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    logger.error('Error updating listing:', error);
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


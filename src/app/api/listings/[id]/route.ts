import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';
import { safeParseInt, safeParseFloat } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { getCachedListing } from '@/lib/cache';
import { revalidateListingCaches } from '@/lib/listing-revalidation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Try to get authenticated user, but don't require it for published content
    // Anonymous users can view published listings
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    const isDashboardEditRequest = request.headers.get('x-dashboard-edit') === '1';
    
    // For authenticated dashboard edit flow, always fetch fresh listing data.
    // For all other flows, keep current cache behavior.
    let listing = null;
    if (!(user && isDashboardEditRequest)) {
      listing = await getCachedListing(id);
    }

    if (!listing) {
      listing = await prisma.listing.findUnique({
        where: { id },
        select: {
          id: true,
          slug: true,
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

    // Published content is publicly accessible
    // Unpublished content requires authentication + ownership or admin role
    if (!listing.isPublished) {
      // Not published - check if user is authorized to view
      if (!user) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      // User must own the listing or be admin
      if (listing.userId !== user.id && user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
    }

    // Add cache headers for published listings
    const headers = new Headers();
    if (user && isDashboardEditRequest) {
      headers.set('Cache-Control', 'no-store');
    } else if (listing.isPublished) {
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
    const user = await getAuthenticatedUser(request);

    if (!user) {
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

    // Non-blocking cache revalidation for listing views
    revalidateListingCaches(id, updated.slug);
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

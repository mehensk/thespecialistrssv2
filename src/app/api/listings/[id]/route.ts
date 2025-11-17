import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Users can only edit their own listings, unless they're admin
    if (listing.userId !== session.user.id && session.user.role !== UserRole.ADMIN) {
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
        title,
        description,
        price: price ? parseFloat(price) : null,
        location,
        city,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        size: size ? parseFloat(size) : null,
        propertyType,
        listingType,
        images: images || [],
        address,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        parking: parking ? parseInt(parking) : null,
        floor: floor ? parseInt(floor) : null,
        totalFloors: totalFloors ? parseInt(totalFloors) : null,
        amenities: Array.isArray(amenities) ? amenities : amenities || {},
        propertyId,
        available: available !== undefined ? available : true,
        // If admin edits, they can approve it
        ...(session.user.role === UserRole.ADMIN && {
          isPublished: body.isPublished !== undefined ? body.isPublished : listing.isPublished,
          approvedBy: body.isPublished ? session.user.id : listing.approvedBy,
          approvedAt: body.isPublished ? new Date() : listing.approvedAt,
        }),
      },
    });

    await logListingActivity(session.user.id, ActivityAction.UPDATE, id, {
      title: updated.title,
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


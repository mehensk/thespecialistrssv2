import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActivityAction } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';

// Generate a random-looking property ID
function generatePropertyId(): string {
  const prefix = 'TSR';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0, O, I, 1
  let randomPart = '';
  
  // Generate 6 random alphanumeric characters
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${randomPart}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');

    const where: any = {};
    if (published === 'true') {
      where.isPublished = true;
    } else if (session) {
      // Authenticated users can see their own unpublished listings
      where.OR = [
        { isPublished: true },
        { userId: session.user.id },
      ];
    } else {
      // Public users only see published listings
      where.isPublished = true;
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      available,
    } = body;

    // Generate a random property ID
    let propertyId = generatePropertyId();
    
    // Ensure uniqueness (very unlikely collision, but check anyway)
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
        userId: session.user.id,
        isPublished: false, // Requires admin approval
      },
    });

    await logListingActivity(session.user.id, ActivityAction.CREATE, listing.id, {
      title: listing.title,
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


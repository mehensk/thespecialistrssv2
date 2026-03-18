import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { parseSearchParams } from '@/lib/search-contract';
import { logger } from '@/lib/logger';

function normalizeCities(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const cities: string[] = [];

  values.forEach((value) => {
    if (!value) return;
    const normalized = value.trim();
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    cities.push(normalized);
  });

  return cities.sort((a, b) => a.localeCompare(b));
}

export async function GET(request: NextRequest) {
  try {
    const { params } = parseSearchParams(request.nextUrl.searchParams);
    const where: Prisma.ListingWhereInput = {
      isPublished: true,
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
    };

    const records = await prisma.listing.findMany({
      where,
      select: {
        city: true,
        location: true,
      },
      distinct: ['city', 'location'],
    });

    const cities = normalizeCities(records.map((record) => record.city || record.location));
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store');

    return NextResponse.json({ cities }, { headers });
  } catch (error) {
    logger.error('Error fetching listing facets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

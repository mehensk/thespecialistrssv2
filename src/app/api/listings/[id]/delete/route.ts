import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { ActivityAction } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

export async function POST(
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

    // Users can only delete their own listings
    if (listing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await logListingActivity(user.id, ActivityAction.DELETE, id, {
      title: listing.title,
    });

    await prisma.listing.delete({ where: { id } });

    // Revalidate cache when listing is deleted
    revalidateTag(CACHE_TAGS.LISTING(id), 'max');
    revalidateTag(CACHE_TAGS.LISTINGS, 'max');
    revalidatePath('/listings');
    revalidatePath(`/listings/${id}`, 'page');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

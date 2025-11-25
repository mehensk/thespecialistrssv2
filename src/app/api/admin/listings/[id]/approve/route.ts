import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRole } from '@/lib/verify-admin-role';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin role - pass request for API route compatibility
    const { isAdmin, userId } = await verifyAdminRole(request);

    if (!isAdmin || !userId) {
      logger.error('Admin listing approval unauthorized', {
        hasUserId: !!userId,
        isAdmin,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        isPublished: true,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    await logListingActivity(userId, ActivityAction.APPROVE, id, {
      title: listing.title,
    });

    // Revalidate cache when listing is approved
    // TODO: Fix TypeScript error with revalidateTag - temporarily commented out
    // revalidateTag(CACHE_TAGS.LISTING(id));
    // revalidateTag(CACHE_TAGS.LISTINGS);

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Error approving listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRole } from '@/lib/verify-admin-role';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin role using reliable method (getToken instead of auth)
    const { isAdmin, userId } = await verifyAdminRole();

    if (!isAdmin || !userId) {
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

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Error approving listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


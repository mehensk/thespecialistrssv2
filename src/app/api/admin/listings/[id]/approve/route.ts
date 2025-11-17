import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logListingActivity } from '@/lib/activity-logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== UserRole.ADMIN) {
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
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
    });

    await logListingActivity(session.user.id, ActivityAction.APPROVE, id, {
      title: listing.title,
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Error approving listing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


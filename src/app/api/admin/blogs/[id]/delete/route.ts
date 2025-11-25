import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRole } from '@/lib/verify-admin-role';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logBlogActivity } from '@/lib/activity-logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin role - pass request for API route compatibility
    const { isAdmin, userId } = await verifyAdminRole(request);

    if (!isAdmin || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const blog = await prisma.blogPost.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    await logBlogActivity(userId, ActivityAction.DELETE, id, {
      title: blog.title,
    });

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


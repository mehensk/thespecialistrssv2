import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRole } from '@/lib/verify-admin-role';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logBlogActivity } from '@/lib/activity-logger';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

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
    const blog = await prisma.blogPost.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        isPublished: true,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    await logBlogActivity(userId, ActivityAction.APPROVE, id, {
      title: blog.title,
    });

    // Revalidate cache when blog post is approved
    // TODO: Fix TypeScript error with revalidateTag - temporarily commented out
    // revalidateTag(CACHE_TAGS.BLOG_POST(updated.slug));
    // revalidateTag(CACHE_TAGS.BLOG_POSTS);

    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    console.error('Error approving blog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


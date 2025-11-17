import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logBlogActivity } from '@/lib/activity-logger';

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
    const blog = await prisma.blogPost.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        isPublished: true,
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
    });

    await logBlogActivity(session.user.id, ActivityAction.APPROVE, id, {
      title: blog.title,
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    console.error('Error approving blog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


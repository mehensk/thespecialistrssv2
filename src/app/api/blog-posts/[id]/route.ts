import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logBlogActivity } from '@/lib/activity-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Error fetching blog post:', error);
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
    const blog = await prisma.blogPost.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Users can only edit their own blog posts, unless they're admin
    if (blog.userId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, slug, excerpt, featuredImage } = body;

    // Check if slug is being changed and if it already exists
    if (slug && slug !== blog.slug) {
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title || blog.title,
        content: content || blog.content,
        slug: slug || blog.slug,
        excerpt: excerpt !== undefined ? excerpt : blog.excerpt,
        featuredImage: featuredImage !== undefined ? featuredImage : blog.featuredImage,
        // If admin edits, they can approve it
        ...(session.user.role === UserRole.ADMIN && {
          isPublished: body.isPublished !== undefined ? body.isPublished : blog.isPublished,
          approvedBy: body.isPublished ? session.user.id : blog.approvedBy,
          approvedAt: body.isPublished ? new Date() : blog.approvedAt,
        }),
      },
    });

    await logBlogActivity(session.user.id, ActivityAction.UPDATE, id, {
      title: updated.title,
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


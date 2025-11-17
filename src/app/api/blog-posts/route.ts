import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActivityAction } from '@prisma/client';
import { logBlogActivity } from '@/lib/activity-logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');

    const where: any = {};
    if (published === 'true') {
      where.isPublished = true;
    } else if (session) {
      // Authenticated users can see their own unpublished blog posts
      where.OR = [
        { isPublished: true },
        { userId: session.user.id },
      ];
    } else {
      // Public users only see published blog posts
      where.isPublished = true;
    }

    const blogs = await prisma.blogPost.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
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
    const { title, content, slug, excerpt, featuredImage } = body;

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const blog = await prisma.blogPost.create({
      data: {
        title,
        content,
        slug,
        excerpt,
        featuredImage,
        userId: session.user.id,
        isPublished: false, // Requires admin approval
      },
    });

    await logBlogActivity(session.user.id, ActivityAction.CREATE, blog.id, {
      title: blog.title,
    });

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


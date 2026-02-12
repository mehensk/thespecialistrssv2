import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { getCachedBlogPost } from '@/lib/cache';
import { UserRole } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const user = await getAuthenticatedUser(request);

    if (user) {
      const blog = await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      });

      if (!blog) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }

      if (!blog.isPublished) {
        if (blog.userId !== user.id && user.role !== UserRole.ADMIN) {
          return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }
      }

      return NextResponse.json({ blog });
    }

    // Use cached data for published blog posts (public access only)
    const blog = await getCachedBlogPost(slug);

    if (!blog || !blog.isPublished) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Add cache headers for published blog posts
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return NextResponse.json({ blog }, { headers });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


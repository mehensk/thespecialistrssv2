import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedBlogPost } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Use cached data for published blog posts
    const blog = await getCachedBlogPost(slug);

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Only return published blogs for public access
    if (!blog.isPublished) {
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


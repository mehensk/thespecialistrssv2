import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/get-user-from-token';
import { prisma } from '@/lib/prisma';
import { ActivityAction, Prisma } from '@prisma/client';
import { logBlogActivity } from '@/lib/activity-logger';
import { safeParseInt, validateBlogPostInput } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: Prisma.BlogPostWhereInput = {};
    if (published === 'true') {
      where.isPublished = true;
    } else if (user && user.id) {
      // Authenticated users can see their own unpublished blog posts
      where.OR = [
        { isPublished: true },
        { userId: user.id },
      ];
    } else {
      // Public users only see published blog posts
      where.isPublished = true;
    }

    // Optimize query - only select needed fields
    const selectFields = {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      images: true,
      createdAt: true,
      user: {
        select: { name: true, email: true },
      },
    };

    // Add pagination if limit is provided
    const take = limit ? safeParseInt(limit, 1, 100) : undefined;
    const skip = offset ? safeParseInt(offset, 0) : undefined;

    const blogs = await prisma.blogPost.findMany({
      where,
      select: selectFields,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    // Add cache headers for public blog posts
    const headers = new Headers();
    if (published === 'true') {
      // Cache published blogs for 60 seconds, revalidate in background
      headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }

    return NextResponse.json({ blogs }, { headers });
  } catch (error) {
    logger.error('Error fetching blog posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let title: string | undefined;
  let slug: string | undefined;
  let excerpt: string | undefined;
  let imagesArray: string[] = [];

  try {
    const user = await getUserFromToken();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    title = body.title;
    const content = body.content;
    slug = body.slug;
    excerpt = body.excerpt;
    const images = body.images;

    // Validate input
    const validation = validateBlogPostInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Process images: first image is cover, rest are inserted evenly into content
    let processedContent = content;
    imagesArray = Array.isArray(images) ? images : [];
    
    if (imagesArray.length > 0) {
      // Get images to insert into content (skip first one as it's the cover)
      const contentImages = imagesArray.slice(1);
      
      if (contentImages.length > 0) {
        // Split content into paragraphs (by double newlines or single newlines)
        const paragraphs = content.split(/\n\s*\n|\n/).filter(p => p.trim().length > 0);
        
        if (paragraphs.length > 0) {
          // Calculate spacing: distribute images evenly across paragraphs
          const spacing = Math.max(1, Math.floor(paragraphs.length / (contentImages.length + 1)));
          
          // Insert images evenly throughout the content
          const result: string[] = [];
          let imageIndex = 0;
          
          for (let i = 0; i < paragraphs.length; i++) {
            result.push(paragraphs[i]);
            
            // Insert image after every 'spacing' paragraphs, but not after the last paragraph
            if ((i + 1) % spacing === 0 && imageIndex < contentImages.length && i < paragraphs.length - 1) {
              result.push(`\n\n<div class="flex justify-center my-8"><img src="${contentImages[imageIndex]}" alt="${title}" class="max-w-full h-auto rounded-lg object-contain" style="max-height: 600px;" /></div>\n\n`);
              imageIndex++;
            }
          }
          
          // If there are remaining images, append them at the end
          while (imageIndex < contentImages.length) {
            result.push(`\n\n<div class="flex justify-center my-8"><img src="${contentImages[imageIndex]}" alt="${title}" class="max-w-full h-auto rounded-lg object-contain" style="max-height: 600px;" /></div>\n\n`);
            imageIndex++;
          }
          
          processedContent = result.join('\n\n');
        } else {
          // If no paragraphs, just append images at the end
          processedContent = content + '\n\n' + contentImages.map(img => 
            `<div class="flex justify-center my-8"><img src="${img}" alt="${title}" class="max-w-full h-auto rounded-lg object-contain" style="max-height: 600px;" /></div>`
          ).join('\n\n');
        }
      }
    }

    // Ensure images is always an array (even if empty)
    const imagesToSave = Array.isArray(imagesArray) ? imagesArray : [];

    // Get user details for logging
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    });

    logger.debug('Creating blog post with data:', {
      title,
      slug,
      excerpt: excerpt || null,
      imagesCount: imagesToSave.length,
      contentLength: processedContent.length,
      userId: user.id,
    });

    const blog = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        content: processedContent,
        slug: slug.trim(),
        excerpt: excerpt ? excerpt.trim() : null,
        images: imagesToSave,
        userId: user.id,
        isPublished: false, // Requires admin approval
      },
    });

    logger.debug('Blog post created successfully:', blog.id);

    // Log activity - don't let this break the response
    try {
      await logBlogActivity(user.id, ActivityAction.CREATE, blog.id, {
        title: blog.title,
        uploadedBy: user.id,
        uploadedByName: dbUser?.name || dbUser?.email || 'Unknown',
      });
    } catch (activityError) {
      logger.error('Failed to log activity (non-critical):', activityError);
    }

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error) {
    logger.error('Error creating blog post:', error);
    logger.debug('Error type:', error?.constructor?.name);
    logger.debug('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    logger.debug('Request body:', { title, slug, excerpt, imagesCount: imagesArray.length });
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    // Ensure we always return a valid JSON response
    try {
      return NextResponse.json(
        { 
          error: 'Internal server error', 
          details: errorMessage,
          stack: process.env.NODE_ENV === 'development' ? errorDetails : undefined
        },
        { status: 500 }
      );
    } catch (jsonError) {
      // If even JSON creation fails, return a simple text response
      logger.error('Failed to create error response:', jsonError);
      return new NextResponse('Internal server error', { status: 500 });
    }
  }
}


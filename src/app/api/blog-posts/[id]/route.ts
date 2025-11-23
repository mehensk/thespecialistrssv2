import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/get-user-from-token';
import { prisma } from '@/lib/prisma';
import { UserRole, ActivityAction } from '@prisma/client';
import { logBlogActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - users should be able to fetch their own blog posts
    const user = await getUserFromToken();
    
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 });
    }

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

    // Users can only view their own blog posts unless they're admin
    if (blog.userId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    logger.error('Error fetching blog post:', error);
    logger.debug('Error type:', error?.constructor?.name);
    logger.debug('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    // Ensure we always return JSON, never HTML
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
      // If JSON creation fails, return plain text
      logger.error('Failed to create error response:', jsonError);
      return new NextResponse('Internal server error', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const blog = await prisma.blogPost.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Users can only edit their own blog posts, unless they're admin
    if (blog.userId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, slug, excerpt, images } = body;

    // Check if slug is being changed and if it already exists
    if (slug && slug !== blog.slug) {
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    // Process images: first image is cover, rest are inserted evenly into content
    let processedContent = content !== undefined ? content : blog.content;
    const imagesArray = images !== undefined ? (Array.isArray(images) ? images : []) : blog.images;
    
    // If images are provided, process them into content
    // If content is also provided, use it; otherwise use existing content
    if (imagesArray.length > 0) {
      // Get images to insert into content (skip first one as it's the cover)
      const contentImages = imagesArray.slice(1);
      
      if (contentImages.length > 0) {
        // Remove existing img tags from content first
        processedContent = processedContent.replace(/<img[^>]+>/gi, '').trim();
        
        // Split content into paragraphs (by double newlines or single newlines)
        const paragraphs = processedContent.split(/\n\s*\n|\n/).filter(p => p.trim().length > 0);
        
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
              result.push(`\n\n<div class="flex justify-center my-8"><img src="${contentImages[imageIndex]}" alt="${title || blog.title}" class="max-w-full h-auto rounded-lg object-contain" style="max-height: 600px;" /></div>\n\n`);
              imageIndex++;
            }
          }
          
          // If there are remaining images, append them at the end
          while (imageIndex < contentImages.length) {
            result.push(`\n\n<div class="flex justify-center my-8"><img src="${contentImages[imageIndex]}" alt="${title || blog.title}" class="max-w-full h-auto rounded-lg object-contain" style="max-height: 600px;" /></div>\n\n`);
            imageIndex++;
          }
          
          processedContent = result.join('\n\n');
        } else {
          // If no paragraphs, just append images at the end
          processedContent = processedContent + '\n\n' + contentImages.map(img => 
            `<div class="flex justify-center my-8"><img src="${img}" alt="${title || blog.title}" class="max-w-full h-auto rounded-lg object-contain" style="max-height: 600px;" /></div>`
          ).join('\n\n');
        }
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title !== undefined ? title : blog.title,
        content: processedContent,
        slug: slug !== undefined ? slug : blog.slug,
        excerpt: excerpt !== undefined ? excerpt : blog.excerpt,
        images: imagesArray,
        // If admin edits, they can approve it
        ...(user.role === UserRole.ADMIN && {
          isPublished: body.isPublished !== undefined ? body.isPublished : blog.isPublished,
          approvedBy: body.isPublished ? user.id : blog.approvedBy,
          approvedAt: body.isPublished ? new Date() : blog.approvedAt,
        }),
      },
    });

    await logBlogActivity(user.id, ActivityAction.UPDATE, id, {
      title: updated.title,
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error) {
    logger.error('Error updating blog post:', error);
    logger.debug('Error type:', error?.constructor?.name);
    logger.debug('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}


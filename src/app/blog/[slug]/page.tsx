import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { getCachedBlogSlugs } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { getAbsoluteUrl, getBlogSocialImage, cleanDescription } from '@/lib/seo-utils';
import { BlogSchema } from '@/components/seo/blog-schema';

// ISR: Generate static params for top 100 blog posts
export async function generateStaticParams() {
  try {
    const blogSlugs = await getCachedBlogSlugs(100);
    return blogSlugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params for blog posts:', error);
    return [];
  }
}

// Disable caching for development - forces rebuild on every request
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // Fetch blog post directly from database (no cache for simplicity)
    const blog = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    
    if (!blog || !blog.isPublished) {
      return {
        title: 'Blog Post Not Found | The Specialist Realty',
        description: 'The blog post you are looking for does not exist.',
      };
    }

    const title = `${blog.title} | The Specialist Realty`;
    
    // Generate description - prefer excerpt, fallback to cleaned content
    const description = blog.excerpt 
      ? blog.excerpt.substring(0, 160)
      : cleanDescription(blog.content, 160);
    
    // Get absolute image URL using our utility function
    const image = getBlogSocialImage(blog.images);
    
    // Get absolute URL for this blog post page
    const url = getAbsoluteUrl(`/blog/${slug}`);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'The Specialist Realty',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: new Date(blog.createdAt).toISOString(),
        authors: [blog.user.name],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post | The Specialist Realty',
      description: 'Read blog posts on The Specialist Realty',
    };
  }
}



// Helper function to parse blog content with proper HTML structure
function parseBlogContent(content: string): string {
  if (!content) return '';
  
  try {
    let result = '';
    
    // Split content by existing <img> tags to handle them separately
    const segments = content.split(/(<img[^>]+>)/gi);
    
    segments.forEach(segment => {
      // Check if this segment is an <img> tag
      if (segment.match(/<img[^>]+>/i)) {
        // Wrap image with tight spacing (1rem)
        result += `<div class="blog-image-wrapper">${segment}</div>`;
      } else if (segment.trim()) {
        // Parse the text segment
        // Split into paragraphs based on double newlines
        const paragraphs = segment.split(/\n\s*\n/).filter(p => p.trim());
        
        // Convert each paragraph to HTML <p> tags with proper Tailwind classes
        const parsedParagraphs = paragraphs
          .map(p => {
            const trimmed = p.trim();
            // Check if it's a heading (starts with #)
            if (trimmed.startsWith('# ')) {
              return `<h2 class="text-3xl font-semibold text-[#111111] mt-8 mb-4">${trimmed.substring(2)}</h2>`;
            }
            // Check if it's a subheading (starts with ##)
            if (trimmed.startsWith('## ')) {
              return `<h3 class="text-2xl font-semibold text-[#111111] mt-6 mb-3">${trimmed.substring(3)}</h3>`;
            }
            // Regular paragraph
            return `<p class="mb-6 leading-relaxed text-[#111111]/90">${trimmed.replace(/\n/g, ' ')}</p>`;
          })
          .join('');
        
        result += parsedParagraphs;
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error parsing blog content:', error);
    return `<p>${content}</p>`;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    // Fetch blog post directly from database (no cache for simplicity and reliability)
    const blog = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!blog || !blog.isPublished) {
      // Log for debugging
      if (!blog) {
        console.error(`Blog post not found for slug: ${slug}`);
      } else if (!blog.isPublished) {
        console.error(`Blog post not published for slug: ${slug}, isPublished: ${blog.isPublished}`);
      }
      notFound();
    }

    return (
      <>
        <BlogSchema blog={blog} />
        <div className="min-h-screen bg-white pt-[84px]">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>

          <article>
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] mb-6">
                {blog.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-[#111111]/60 mb-6">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{blog.user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>

              {blog.images && blog.images.length > 0 && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-8">
                  <Image
                    src={blog.images[0]}
                    alt={blog.title}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                    priority
                  />
                </div>
              )}

              {blog.excerpt && (
                <p className="text-xl text-[#111111]/80 italic mb-8 border-l-4 border-[#1F2937] pl-4">
                  {blog.excerpt}
                </p>
              )}
            </header>

            <div 
              className="prose prose-lg max-w-none text-[#111111]/90 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: parseBlogContent(blog.content)
              }}
            />
          </article>

          <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}

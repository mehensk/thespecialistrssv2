import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { getCachedBlogPost, getCachedBlogSlugs } from '@/lib/cache';
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

// Revalidate every hour
export const revalidate = 3600;

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const blog = await getCachedBlogPost(slug);
    
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const blog = await getCachedBlogPost(slug);

    if (!blog || !blog.isPublished) {
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
              className="prose prose-lg max-w-none text-[#111111]/90 leading-relaxed [&_img]:mx-auto [&_img]:block"
              dangerouslySetInnerHTML={{ 
                __html: blog.content
                  .split(/\n\s*\n/)
                  .map(paragraph => {
                    // If paragraph contains an img tag, return it as-is (it's already HTML)
                    if (paragraph.trim().startsWith('<img') || paragraph.includes('<img')) {
                      return paragraph.trim();
                    }
                    // Otherwise, treat as text and convert single newlines to breaks
                    return paragraph.split('\n').map(line => line || '<br />').join('');
                  })
                  .join('<br /><br />')
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

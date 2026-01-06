import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { getCachedBlogPost, getCachedBlogSlugs } from '@/lib/cache';
import { getAbsoluteUrl, getBlogSocialImage, cleanDescription } from '@/lib/seo-utils';
import { BlogSchema } from '@/components/seo/blog-schema';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

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

// Helper function to distribute images smartly throughout HTML content based on word count
function distributeImagesSmartly(content: string, images: string[]): string {
  if (!content || images.length <= 1) {
    return content; // No distribution needed if only featured image exists
  }
  
  try {
    // Extract plain text from HTML content for word counting
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const totalWords = plainText.split(/\s+/).filter(word => word.length > 0).length;
    
    // Adaptive thresholds based on article length
    let targetWordsPerImage: number;
    let minWordsBetweenImages: number;
    
    if (totalWords < 600) {
      // Short articles: distribute more frequently
      targetWordsPerImage = 225; // ~200-250 words per image
      minWordsBetweenImages = 150; // Minimum 150 words between images
    } else if (totalWords < 1200) {
      // Medium articles: standard distribution
      targetWordsPerImage = 375; // ~350-400 words per image
      minWordsBetweenImages = 250; // Minimum 250 words between images
    } else {
      // Long articles: ideal distribution for readability
      targetWordsPerImage = 475; // ~450-500 words per image
      minWordsBetweenImages = 350; // Minimum 350 words between images
    }
    
    const imagesToDistribute = images.slice(1); // Skip featured image
    
    // Calculate how many images we can reasonably distribute
    const maxImagesPossible = Math.floor(totalWords / targetWordsPerImage);
    const numImagesToDistribute = Math.min(imagesToDistribute.length, maxImagesPossible);
    
    if (numImagesToDistribute === 0) {
      return content; // Not enough content for distribution
    }
    
    // Calculate distribution points based on word count milestones
    const distributionPoints: number[] = [];
    const wordsPerInterval = Math.floor(totalWords / (numImagesToDistribute + 1));
    
    for (let i = 1; i <= numImagesToDistribute; i++) {
      distributionPoints.push(i * wordsPerInterval);
    }
    
    // Rebuild content, tracking word count and inserting images at milestones
    let result = '';
    let imageIndex = 0;
    let currentWordCount = 0;
    let distributionPointIndex = 0;
    let lastInsertionWordCount = 0;
    
    // Split content by paragraph and heading tags to maintain structure
    const segments = content.split(/(<p[^>]*>.*?<\/p>|<h[2-3][^>]*>.*?<\/h[2-3]>)/gi).filter(s => s.trim());
    
    for (const segment of segments) {
      // Check if segment is a paragraph or heading
      if (segment.startsWith('<p') || segment.startsWith('<h2') || segment.startsWith('<h3')) {
        // Extract text from element and count words
        const elementText = segment.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const elementWords = elementText.split(/\s+/).filter(word => word.length > 0).length;
        
        // Add element to result
        result += segment;
        currentWordCount += elementWords;
        
        // Check if we should insert an image after this paragraph (not after headings)
        if (segment.startsWith('<p')) {
          while (
            distributionPointIndex < distributionPoints.length &&
            currentWordCount >= distributionPoints[distributionPointIndex] &&
            imageIndex < imagesToDistribute.length
          ) {
            // Calculate words since last insertion
            const wordsSinceLastInsertion = currentWordCount - lastInsertionWordCount;
            
            // Only insert if we have enough words (minimum threshold)
            if (wordsSinceLastInsertion >= minWordsBetweenImages) {
              result += `<div class="blog-image-wrapper"><img src="${imagesToDistribute[imageIndex]}" alt="Blog image" loading="lazy" /></div>`;
              imageIndex++;
              lastInsertionWordCount = currentWordCount;
            }
            
            distributionPointIndex++;
          }
        }
      } else {
        // Non-paragraph content (like existing images)
        result += segment;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error distributing images:', error);
    return content;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    // Clear cache for this specific blog before fetching
    revalidateTag(CACHE_TAGS.BLOG_POST(slug), '');
    
    const blog = await getCachedBlogPost(slug);

    if (!blog) {
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
                __html: distributeImagesSmartly(
                  parseBlogContent(blog.content),
                  blog.images || []
                )
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

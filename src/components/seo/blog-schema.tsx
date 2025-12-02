import { getAbsoluteImageUrl, getAbsoluteUrl } from '@/lib/seo-utils';

interface BlogSchemaProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    images: string[];
    createdAt: Date | string;
    updatedAt: Date | string;
    user: {
      name: string;
      email: string;
    };
  };
}

// Helper function to convert date to ISO string (handles both Date objects and strings)
function toISOString(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'string') {
    // If it's already an ISO string, return it
    if (date.includes('T') && date.includes('Z')) {
      return date;
    }
    // Otherwise, try to parse it
    return new Date(date).toISOString();
  }
  // Fallback
  return new Date().toISOString();
}

export function BlogSchema({ blog }: BlogSchemaProps) {
  const baseUrl = getAbsoluteUrl(`/blog/${blog.slug}`);
  
  // Get absolute image URLs
  const imageUrls = blog.images && blog.images.length > 0
    ? blog.images.map(img => getAbsoluteImageUrl(img))
    : [getAbsoluteImageUrl('/images/hero-condo.jpg')];

  // Extract description - prefer excerpt, fallback to first 160 chars of content
  const description = blog.excerpt 
    ? blog.excerpt.substring(0, 160)
    : blog.content.replace(/<[^>]*>/g, '').substring(0, 160).trim();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: description,
    image: imageUrls,
    url: baseUrl,
    datePublished: toISOString(blog.createdAt),
    dateModified: toISOString(blog.updatedAt || blog.createdAt),
    author: {
      '@type': 'Person',
      name: blog.user.name,
      email: blog.user.email,
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Specialist Realty',
      logo: {
        '@type': 'ImageObject',
        url: getAbsoluteImageUrl('/images/hero-condo.jpg'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': baseUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  );
}


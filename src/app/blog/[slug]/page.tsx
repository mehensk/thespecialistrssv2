'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBlog() {
      try {
        const response = await fetch(`/api/blog-posts/slug/${slug}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch blog post');
        }
        
        setBlog(data.blog);
      } catch (err: any) {
        console.error('Error fetching blog:', err);
        setError(err.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-[84px]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
          <div className="text-center">
            <p className="text-[#111111]/70">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white pt-[84px]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-[#111111] mb-4">Blog Post Not Found</h1>
            <p className="text-[#111111]/70 mb-8">{error || 'The blog post you\'re looking for doesn\'t exist or hasn\'t been published yet.'}</p>
            <Link
              href="/blog"
              className="inline-block bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
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

            {blog.featuredImage && (
              <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8">
                <Image
                  src={blog.featuredImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
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
            dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
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
  );
}


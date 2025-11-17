'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch('/api/blog-posts?published=true');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch blogs');
        }
        
        setBlogs(data.blogs || []);
      } catch (err: any) {
        console.error('Error fetching blogs:', err);
        setError(err.message || 'Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-[84px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
          <div className="text-center">
            <p className="text-[#111111]/70">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-[84px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[84px]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] mb-4 text-center">
            Our Blog
          </h1>
          <p className="text-xl text-[#111111]/70 text-center max-w-2xl mx-auto">
            Insights, tips, and updates about real estate in Metro Manila
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#111111]/70 text-lg">No blog posts available yet.</p>
            <p className="text-[#111111]/50 mt-2">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#E5E7EB] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block group"
              >
                {blog.featuredImage && (
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={blog.featuredImage}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-[#111111] mb-3 line-clamp-2 group-hover:text-[#1F2937] transition-colors">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-[#111111]/70 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-[#111111]/60">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{blog.user.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


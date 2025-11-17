import { getUserFromToken } from '@/lib/get-user-from-token';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, CheckCircle, Clock } from 'lucide-react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

// Fast user ID retrieval from JWT token (much faster than auth())
async function getBlogs(userId: string) {
  return prisma.blogPost.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      isPublished: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

async function BlogsContent() {
  const user = await getUserFromToken();
  
  if (!user?.id) {
    return null;
  }

  const blogs = await getBlogs(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-[#111111]">My Blog Posts</h1>
        <Link
          href="/dashboard/blogs/new"
          className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          New Blog Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#111111]/70 mb-6">You haven't created any blog posts yet.</p>
          <Link
            href="/dashboard/blogs/new"
            className="inline-block bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
          >
            Create Your First Blog Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#111111] flex-1">{blog.title}</h3>
                  {blog.isPublished ? (
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 ml-2" />
                  ) : (
                    <Clock size={20} className="text-yellow-600 flex-shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-sm text-[#111111]/70 mb-2">{blog.slug}</p>
                {blog.excerpt && (
                  <p className="text-sm text-[#111111]/70 mb-4 line-clamp-2">{blog.excerpt}</p>
                )}
                <div className="flex items-center gap-2 mb-4">
                  {blog.isPublished ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Approval
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="p-2 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
                    target="_blank"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/dashboard/blogs/${blog.id}/edit`}
                    className="p-2 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                  <form action={`/api/blogs/${blog.id}/delete`} method="POST">
                    <button
                      type="submit"
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function DashboardBlogsPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 bg-gray-200 rounded w-48"></div>
          <div className="h-12 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <BlogsContent />
    </Suspense>
  );
}


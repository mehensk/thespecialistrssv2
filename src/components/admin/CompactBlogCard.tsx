import Link from 'next/link';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ApproveButton } from '@/app/admin/blogs/approve-button';

interface Blog {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date | string;
  user: {
    name: string | null;
    email: string;
  };
}

interface CompactBlogCardProps {
  blog: Blog;
}

export function CompactBlogCard({ blog }: CompactBlogCardProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-2.5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {blog.isPublished ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                Pub
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">
                Pend
              </span>
            )}
          </div>
          <h3 className="text-xs font-semibold text-[#111111] truncate mb-0.5 leading-tight">
            {blog.title}
          </h3>
          <p className="text-[10px] text-[#111111]/60 truncate mb-1 font-mono">
            {blog.slug}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#111111]/60 flex-wrap">
            <span className="truncate">{blog.user.name || blog.user.email}</span>
            <span>•</span>
            <span>{new Date(blog.createdAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Link
            href={`/blog/${blog.slug}`}
            className="p-1 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded transition-colors"
            target="_blank"
            title="View"
          >
            <Eye size={12} />
          </Link>
          <Link
            href={`/dashboard/blogs/${blog.id}/edit`}
            className="p-1 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded transition-colors"
            title="Edit"
          >
            <Edit size={12} />
          </Link>
          {!blog.isPublished && (
            <div className="[&_button]:p-1 [&_button_svg]:w-3 [&_button_svg]:h-3 [&_div_button]:p-1 [&_div_button_svg]:w-3 [&_div_button_svg]:h-3">
              <ApproveButton blogId={blog.id} />
            </div>
          )}
          <form action={`/api/admin/blogs/${blog.id}/delete`} method="POST">
            <button
              type="submit"
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


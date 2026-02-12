'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ApproveButton } from './approve-button';
import { ViewToggle } from '@/components/admin/ViewToggle';
import { CompactBlogCard } from '@/components/admin/CompactBlogCard';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/toast';

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

interface AdminBlogsViewProps {
  blogs: Blog[];
}

export function AdminBlogsView({ blogs }: AdminBlogsViewProps) {
  const [view, setView] = useState<'grid' | 'compact'>('compact');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const router = useRouter();
  const { success, error } = useToast();

  const handleDeleteClick = (blog: Blog) => {
    setBlogToDelete(blog);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    
    setIsDeleting(blogToDelete.id);
    setShowConfirm(false);
    
    try {
      const response = await fetch(`/api/admin/blogs/${blogToDelete.id}/delete`, {
        method: 'POST',
      });

      if (response.ok) {
        success('Blog deleted successfully');
        router.refresh();
      } else {
        const data = await response.json();
        error(data.error || 'Failed to delete blog');
      }
    } catch (err) {
      error('Failed to delete blog. Please try again.');
    } finally {
      setIsDeleting(null);
      setBlogToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 z-10 relative">
        <div className="text-sm text-[#111111]/60">View: {view === 'compact' ? 'Table' : 'Grid'}</div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {view === 'compact' ? (
        <>
          <div className="md:hidden grid grid-cols-1 gap-3">
            {blogs.map((blog) => (
              <CompactBlogCard key={blog.id} blog={blog} />
            ))}
          </div>
          <div className="hidden md:block bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Author</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Slug</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-2 text-xs text-[#111111] font-medium max-w-xs truncate">{blog.title}</td>
                    <td className="px-4 py-2 text-xs text-[#111111]">{blog.user.name || blog.user.email}</td>
                    <td className="px-4 py-2 text-xs text-[#111111]/70 max-w-xs truncate font-mono">{blog.slug}</td>
                    <td className="px-4 py-2 text-xs">
                      {blog.isPublished ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-[#111111]/70">
                      {new Date(blog.createdAt as string).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="p-1.5 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
                          target="_blank"
                          title="View"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/dashboard/blogs/${blog.id}/edit`}
                          className="p-1.5 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </Link>
                        {!blog.isPublished && (
                          <div className="[&_button]:p-1.5 [&_button_svg]:w-3.5 [&_button_svg]:h-3.5 [&_div_button]:p-1.5 [&_div_button_svg]:w-3.5 [&_div_button_svg]:h-3.5">
                            <ApproveButton blogId={blog.id} />
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteClick(blog)}
                          disabled={isDeleting === blog.id}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {blogs.map((blog) => (
            <CompactBlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white rounded-lg"
        loading={isDeleting !== null}
      />
    </div>
  );
}

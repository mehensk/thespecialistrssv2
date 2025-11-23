import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ResetPasswordButton } from '@/components/admin/ResetPasswordButton';
import { getUserFromToken } from '@/lib/get-user-from-token';

export default async function AdminUsersPage() {
  // Layout already verifies admin access - no need to check again
  // Get current user ID for preventing self-deletion
  // getUserFromToken() is fast (just reads JWT token, no DB query)
  const currentUser = await getUserFromToken();
  const currentUserId = currentUser?.id || null;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          listings: true,
          blogPosts: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-[#111111]">User Management</h1>
        <Link
          href="/admin/users/new"
          className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Listings</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Blogs</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 text-sm text-[#111111]">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#111111]">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === UserRole.ADMIN
                          ? 'bg-red-100 text-red-800'
                          : user.role === UserRole.AGENT
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111111]">{user._count.listings}</td>
                  <td className="px-6 py-4 text-sm text-[#111111]">{user._count.blogPosts}</td>
                  <td className="px-6 py-4 text-sm text-[#111111]/70">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="p-2 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </Link>
                      <ResetPasswordButton
                        userId={user.id}
                        userName={user.name}
                        userEmail={user.email}
                      />
                      {currentUserId && user.id !== currentUserId && (
                        <form action={`/api/admin/users/${user.id}/delete`} method="POST">
                          <button
                            type="submit"
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


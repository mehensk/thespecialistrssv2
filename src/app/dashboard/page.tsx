import { getUserFromToken } from '@/lib/get-user-from-token';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Home, FileText, CheckCircle, Clock, Activity } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Fast user ID retrieval from JWT token (much faster than auth())
async function getDashboardStats(userId: string) {
  const [listings, blogs, activities] = await Promise.all([
    prisma.listing.findMany({
      where: { userId },
      select: { id: true, isPublished: true },
    }),
    prisma.blogPost.findMany({
      where: { userId },
      select: { id: true, isPublished: true },
    }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  return { listings, blogs, activities };
}

async function DashboardContent() {
  const user = await getUserFromToken();
  
  if (!user?.id) {
    redirect('/');
  }

  // If user is admin, redirect to unified admin panel
  // Admins should use /admin/dashboard instead of /dashboard
  if (user.role === UserRole.ADMIN) {
    redirect('/admin/dashboard');
  }

  // Note: We don't need to call auth() here - user info is already available
  // If we need the user's name, we can fetch it from the database if needed
  // For now, we'll use a generic name or fetch it separately if required
  
  const { listings, blogs, activities } = await getDashboardStats(user.id);

  const myListings = listings.length;
  const myBlogs = blogs.length;
  const publishedListings = listings.filter(l => l.isPublished).length;
  const publishedBlogs = blogs.filter(b => b.isPublished).length;
  const pendingListings = listings.filter(l => !l.isPublished).length;
  const pendingBlogs = blogs.filter(b => !b.isPublished).length;

  const stats = [
    { 
      label: 'My Listings', 
      value: myListings, 
      icon: Home, 
      color: 'bg-blue-500',
      href: '/dashboard/listings'
    },
    { 
      label: 'My Blogs', 
      value: myBlogs, 
      icon: FileText, 
      color: 'bg-purple-500',
      href: '/dashboard/blogs'
    },
    { 
      label: 'Published', 
      value: publishedListings + publishedBlogs, 
      icon: CheckCircle, 
      color: 'bg-green-500',
      href: '#'
    },
    { 
      label: 'Pending Approval', 
      value: pendingListings + pendingBlogs, 
      icon: Clock, 
      color: 'bg-yellow-500',
      href: '#'
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#111111] mb-2">Welcome back!</h1>
      <p className="text-[#111111]/70 mb-8">Manage your listings and blog posts</p>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#E5E7EB] hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#111111]/70 mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold text-[#111111]">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );

          if (stat.href === '#') {
            return <div key={stat.label}>{content}</div>;
          }

          return (
            <Link key={stat.label} href={stat.href} prefetch={true}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-6">
          <h2 className="text-xl font-semibold text-[#111111] mb-4">Listings</h2>
          <p className="text-[#111111]/70 mb-4">
            Create and manage your property listings. They will be reviewed by an admin before being published.
          </p>
          <Link
            href="/dashboard/listings"
            prefetch={true}
            className="inline-block bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
          >
            Manage Listings
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-6">
          <h2 className="text-xl font-semibold text-[#111111] mb-4">Blog Posts</h2>
          <p className="text-[#111111]/70 mb-4">
            Write and manage your blog posts. They will be reviewed by an admin before being published.
          </p>
          <Link
            href="/dashboard/blogs"
            prefetch={true}
            className="inline-block bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
          >
            Manage Blogs
          </Link>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-8 bg-white rounded-xl shadow-lg border border-[#E5E7EB]">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#111111] flex items-center gap-2">
              <Activity size={24} />
              Recent Activity
            </h2>
          </div>
        </div>
        <div className="p-6">
          {activities.length === 0 ? (
            <p className="text-[#111111]/70">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const getActionColor = (action: string) => {
                  switch (action) {
                    case 'LOGIN':
                      return 'bg-blue-100 text-blue-800';
                    case 'LOGOUT':
                      return 'bg-gray-100 text-gray-800';
                    case 'CREATE':
                      return 'bg-green-100 text-green-800';
                    case 'UPDATE':
                      return 'bg-yellow-100 text-yellow-800';
                    case 'DELETE':
                      return 'bg-red-100 text-red-800';
                    case 'APPROVE':
                      return 'bg-purple-100 text-purple-800';
                    default:
                      return 'bg-gray-100 text-gray-800';
                  }
                };

                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                            activity.action
                          )}`}
                        >
                          {activity.action}
                        </span>
                        <span className="text-sm text-[#111111]/70">{activity.itemType}</span>
                        {activity.itemId && (
                          <span className="text-sm text-[#111111]/50">ID: {activity.itemId}</span>
                        )}
                      </div>
                      {activity.metadata && 
                       typeof activity.metadata === 'object' && 
                       !Array.isArray(activity.metadata) &&
                       'title' in activity.metadata && (
                        <p className="text-sm text-[#111111] font-medium mt-1">
                          {activity.metadata.title as string}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-[#111111]/70 whitespace-nowrap ml-4">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse">
        <div className="h-9 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-96 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-[#E5E7EB]">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}


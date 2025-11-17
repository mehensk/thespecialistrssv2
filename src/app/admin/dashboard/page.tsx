import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { Home, FileText, Users, Activity } from 'lucide-react';

export default async function AdminDashboardPage() {
    const session = await auth();

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/403');
  }

  // Get statistics
  const [totalUsers, totalListings, totalBlogs, pendingListings, pendingBlogs, recentActivities] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.blogPost.count(),
    prisma.listing.count({ where: { isPublished: false } }),
    prisma.blogPost.count({ where: { isPublished: false } }),
    prisma.activity.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Listings', value: totalListings, icon: Home, color: 'bg-green-500' },
    { label: 'Total Blogs', value: totalBlogs, icon: FileText, color: 'bg-purple-500' },
    { label: 'Pending Approvals', value: pendingListings + pendingBlogs, icon: Activity, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#111111] mb-8">Admin Dashboard</h1>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-lg p-6 border border-[#E5E7EB]"
            >
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
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB]">
        <div className="p-6 border-b border-[#E5E7EB]">
          <h2 className="text-xl font-semibold text-[#111111]">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivities.length === 0 ? (
            <p className="text-[#111111]/70">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0"
                >
                  <div>
                    <p className="text-[#111111] font-medium">
                      {activity.user.name} ({activity.user.email})
                    </p>
                    <p className="text-sm text-[#111111]/70">
                      {activity.action} - {activity.itemType}
                      {activity.itemId && ` (ID: ${activity.itemId})`}
                    </p>
                  </div>
                  <p className="text-sm text-[#111111]/70">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


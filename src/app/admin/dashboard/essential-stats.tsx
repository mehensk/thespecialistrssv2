import { Home, FileText, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import { getCachedSystemStats } from '@/lib/dashboard-cache';

export default async function EssentialStats() {
  // Use cached system stats - cached for 30 seconds for optimal performance
  // This eliminates duplicate queries and improves load time significantly
  const { totalUsers, totalListings, totalBlogs, pendingListings, pendingBlogs } = await getCachedSystemStats();

  const systemStats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-blue-500', href: '/admin/users' },
    { label: 'Total Listings', value: totalListings, icon: Home, color: 'bg-green-500', href: '/admin/listings' },
    { label: 'Total Blogs', value: totalBlogs, icon: FileText, color: 'bg-purple-500', href: '/admin/blogs' },
    { label: 'Pending Approvals', value: pendingListings + pendingBlogs, icon: Activity, color: 'bg-yellow-500', href: '/admin/listings' },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-[#111111] mb-4">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat) => {
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
          
          return (
            <Link key={stat.label} href={stat.href} prefetch={true}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}


import { Home, FileText, Users, Activity, CheckCircle, Clock } from 'lucide-react';
import { getUserFromToken } from '@/lib/get-user-from-token';
import { getCachedPersonalStats } from '@/lib/dashboard-cache';
import Link from 'next/link';

export default async function StatsContent() {
  // Layout already verified user is admin, but we need userId for personal stats
  // getUserFromToken() is fast (just reads JWT token, no DB query)
  const user = await getUserFromToken();
  
  if (!user?.id) {
    return <div>Loading...</div>;
  }

  // OPTIMIZED: Use cached personal stats (cached for 30 seconds)
  // System stats are already loaded by EssentialStats component
  // This eliminates duplicate system stats queries
  const { myListings, myBlogs, myPendingListings, myPendingBlogs } = await getCachedPersonalStats(user.id);

  // Calculate published counts (no additional queries needed)
  const myPublishedListings = myListings - myPendingListings;
  const myPublishedBlogs = myBlogs - myPendingBlogs;

  const personalStats = [
    { label: 'My Listings', value: myListings, icon: Home, color: 'bg-blue-500', href: '/dashboard/listings' },
    { label: 'My Blogs', value: myBlogs, icon: FileText, color: 'bg-purple-500', href: '/dashboard/blogs' },
    { label: 'Published', value: myPublishedListings + myPublishedBlogs, icon: CheckCircle, color: 'bg-green-500', href: '#' },
    { label: 'Pending', value: myPendingListings + myPendingBlogs, icon: Clock, color: 'bg-yellow-500', href: '#' },
  ];

  return (
    <>
      {/* Personal Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#111111] mb-4">My Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personalStats.map((stat) => {
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
      </div>
    </>
  );
}


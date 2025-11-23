import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/get-user-from-token';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';

// Cache activity queries - less critical data, can be stale for longer
const getCachedActivities = unstable_cache(
  async (userId: string) => {
    const [recentActivities, myActivities] = await Promise.all([
      prisma.activity.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          action: true,
          itemType: true,
          itemId: true,
          timestamp: true,
          metadata: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.activity.findMany({
        where: { userId },
        take: 5,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          action: true,
          itemType: true,
          itemId: true,
          timestamp: true,
          metadata: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);
    return { recentActivities, myActivities };
  },
  ['dashboard-activities'],
  {
    revalidate: 60, // Cache for 60 seconds - activity is less critical
    tags: ['dashboard-activities'],
  }
);

export default async function ActivityContent() {
  // Get user info
  const user = await getUserFromToken();
  
  if (!user?.id) {
    return null;
  }

  // Load activity data with caching (slower queries with joins, but cached)
  // This loads after the stats so the page feels faster
  const { recentActivities, myActivities } = await getCachedActivities(user.id);

  return (
    <>
      {/* Recent Activity - System Wide */}
      <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] mb-8">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#111111]">System Activity</h2>
            <Link
              href="/admin/logs"
              className="text-sm text-[#1F2937] hover:text-[#111111] font-medium"
            >
              View All →
            </Link>
          </div>
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

      {/* My Recent Activity */}
      {myActivities.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB]">
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#111111]">My Recent Activity</h2>
              <Link
                href="/dashboard/activity"
                className="text-sm text-[#1F2937] hover:text-[#111111] font-medium"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {myActivities.map((activity) => {
                const getActionColor = (action: string) => {
                  switch (action) {
                    case 'LOGIN': return 'bg-blue-100 text-blue-800';
                    case 'LOGOUT': return 'bg-gray-100 text-gray-800';
                    case 'CREATE': return 'bg-green-100 text-green-800';
                    case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
                    case 'DELETE': return 'bg-red-100 text-red-800';
                    case 'APPROVE': return 'bg-purple-100 text-purple-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
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
          </div>
        </div>
      )}
    </>
  );
}


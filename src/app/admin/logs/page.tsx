import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';

export default async function AdminLogsPage() {
    const session = await auth();

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/403');
  }

  const activities = await prisma.activity.findMany({
    orderBy: { timestamp: 'desc' },
    take: 100,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

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
    <div>
      <h1 className="text-3xl font-semibold text-[#111111] mb-8">Activity Logs</h1>

      <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Item Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Item ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 text-sm text-[#111111]/70">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111111]">
                    {activity.user.name} ({activity.user.email})
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                        activity.action
                      )}`}
                    >
                      {activity.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111111]">{activity.itemType}</td>
                  <td className="px-6 py-4 text-sm text-[#111111]/70">
                    {activity.itemId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111111]/70">
                    {activity.ipAddress || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {activities.length === 0 && (
          <div className="p-12 text-center text-[#111111]/70">
            No activity logs found
          </div>
        )}
      </div>
    </div>
  );
}


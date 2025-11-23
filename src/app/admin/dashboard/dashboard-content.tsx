import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import EssentialStats from './essential-stats';
import StatsContent from './stats-content';
import ActivityContent from './activity-content';

// Deferred activity content component - loads after critical stats
// This is a server component that wraps ActivityContent for deferred loading
async function ActivityContentDeferred() {
  return <ActivityContent />;
}

export default function DashboardContent() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-[#111111] mb-2">Admin Dashboard</h1>
      <p className="text-[#111111]/70 mb-8">Complete control panel for system management and personal content</p>

      {/* Load essential system stats first (fastest - 5 queries) */}
      <Suspense fallback={
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-[#E5E7EB]">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      }>
        <EssentialStats />
      </Suspense>

      {/* Load personal stats separately (cached, 4 queries) */}
      <Suspense fallback={
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-[#E5E7EB]">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      }>
        <StatsContent />
      </Suspense>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-6">
          <h2 className="text-xl font-semibold text-[#111111] mb-4">Create Listing</h2>
          <p className="text-[#111111]/70 mb-4">
            Add a new property listing to the system. It will be reviewed before being published.
          </p>
          <Link
            href="/dashboard/listings/new"
            prefetch={true}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
          >
            <Plus size={20} />
            New Listing
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-6">
          <h2 className="text-xl font-semibold text-[#111111] mb-4">Create Blog Post</h2>
          <p className="text-[#111111]/70 mb-4">
            Write a new blog post. It will be reviewed before being published.
          </p>
          <Link
            href="/dashboard/blogs/new"
            prefetch={true}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
          >
            <Plus size={20} />
            New Blog Post
          </Link>
        </div>
      </div>

      {/* Activity - Deferred loading (cached, but loads after critical content) */}
      <Suspense fallback={
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-6 mb-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#E5E7EB]">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <ActivityContentDeferred />
      </Suspense>
    </>
  );
}

